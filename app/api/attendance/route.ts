import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

function parseDateRange(selectedDate?: string | null) {
  const date = selectedDate ? new Date(selectedDate) : new Date();
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);

  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

function formatTime(date: Date) {
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

async function requireUser() {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return {
      error: "Supabase environment is not configured.",
      status: 500 as const,
    };
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { error: "Unauthorized", status: 401 as const };
  }

  return { user };
}

export async function GET(request: Request) {
  const authResult = await requireUser();

  if ("error" in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const { searchParams } = new URL(request.url);
  const selectedDate = searchParams.get("date");
  const { start, end } = parseDateRange(selectedDate);

  const adminClient = createSupabaseAdminClient();

  if (!adminClient) {
    return NextResponse.json(
      { error: "Supabase admin client is not configured." },
      { status: 500 },
    );
  }

  const [studentsResult, logsResult] = await Promise.all([
    adminClient
      .from("profiles")
      .select("id, full_name, roll_no")
      .eq("role", "student")
      .order("full_name", { ascending: true }),
    adminClient
      .from("attendance_events")
      .select(
        "id, profile_id, type, captured_at, camera_label, confidence, profiles(id, full_name, roll_no)",
      )
      .gte("captured_at", start.toISOString())
      .lte("captured_at", end.toISOString())
      .order("captured_at", { ascending: false }),
  ]);

  if (studentsResult.error) {
    return NextResponse.json(
      { error: studentsResult.error.message },
      { status: 500 },
    );
  }

  if (logsResult.error) {
    return NextResponse.json(
      { error: logsResult.error.message },
      { status: 500 },
    );
  }

  const students = studentsResult.data || [];
  const logs = (logsResult.data || []).map((entry) => ({
    ...entry,
    profiles: Array.isArray(entry.profiles)
      ? entry.profiles[0]
      : entry.profiles,
  }));

  const studentIdsWithEntry = new Set(
    logs
      .filter((log) => String(log.type).toLowerCase() === "entry")
      .map((log) => log.profile_id),
  );

  const present = studentIdsWithEntry.size;
  const absent = Math.max(students.length - present, 0);

  return NextResponse.json({
    data: logs.map((log) => ({
      id: log.id,
      name: log.profiles?.full_name || "Unknown",
      rollNo: log.profiles?.roll_no ?? "N/A",
      time: formatTime(new Date(log.captured_at)),
      date: new Date(log.captured_at).toISOString().split("T")[0],
      type: String(log.type).toLowerCase(),
      image: "🙂",
      cameraLabel: log.camera_label ?? "Main Camera",
      confidence: log.confidence,
      capturedAt: log.captured_at,
      studentId: log.profiles?.id || log.profile_id,
    })),
    students: students.map((student) => ({
      id: student.id,
      name: student.full_name,
      rollNo: student.roll_no ?? "N/A",
    })),
    stats: {
      present,
      absent,
      onLeave: 0,
      lateEntry: logs.filter((log) => {
        if (String(log.type).toLowerCase() !== "entry") return false;
        const hour = new Date(log.captured_at).getHours();
        return hour >= 9;
      }).length,
    },
  });
}

export async function POST(request: Request) {
  const authResult = await requireUser();

  if ("error" in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const role = String(
    authResult.user.user_metadata?.role || "student",
  ).toLowerCase();

  if (role !== "admin") {
    return NextResponse.json(
      { error: "Only admin users can capture attendance." },
      { status: 403 },
    );
  }

  const body = await request.json();
  const mode = String(body.mode || "entry").toLowerCase();
  const studentId = body.studentId ? String(body.studentId) : "";
  const cameraLabel = body.cameraLabel
    ? String(body.cameraLabel)
    : "Main Gate Cam";
  const confidence = Number(body.confidence || 0.9);

  const adminClient = createSupabaseAdminClient();

  if (!adminClient) {
    return NextResponse.json(
      { error: "Supabase admin client is not configured." },
      { status: 500 },
    );
  }

  if (!studentId) {
    return NextResponse.json(
      { error: "studentId is required." },
      { status: 400 },
    );
  }

  if (mode !== "entry" && mode !== "exit") {
    return NextResponse.json(
      { error: "mode must be entry or exit." },
      { status: 400 },
    );
  }

  const { data: student, error: studentError } = await adminClient
    .from("profiles")
    .select("id, full_name, roll_no")
    .eq("id", studentId)
    .single();

  if (studentError) {
    return NextResponse.json({ error: studentError.message }, { status: 500 });
  }

  if (!student) {
    return NextResponse.json({ error: "Student not found." }, { status: 404 });
  }

  const capturedAt = new Date();
  const { data: created, error: createError } = await adminClient
    .from("attendance_events")
    .insert({
      profile_id: student.id,
      type: mode,
      camera_label: cameraLabel,
      confidence: Math.max(0, Math.min(confidence, 0.99)),
      captured_at: capturedAt.toISOString(),
    })
    .select("id, camera_label, confidence, captured_at")
    .single();

  if (createError || !created) {
    return NextResponse.json(
      { error: createError?.message || "Failed to insert attendance event." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    message: `${mode === "entry" ? "Entry" : "Exit"} captured for ${student.full_name}.`,
    log: {
      id: created.id,
      name: student.full_name,
      rollNo: student.roll_no ?? "N/A",
      time: formatTime(new Date(created.captured_at)),
      date: new Date(created.captured_at).toISOString().split("T")[0],
      type: mode,
      image: "🙂",
      cameraLabel: created.camera_label ?? "Main Camera",
      confidence: created.confidence,
      capturedAt: created.captured_at,
      studentId: student.id,
    },
  });
}
