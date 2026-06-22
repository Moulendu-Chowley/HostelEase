import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const DEEPFACE_URL = process.env.DEEPFACE_API_URL ?? "http://localhost:8000";

interface DeepFaceResult {
  matched: boolean;
  student_id?: string;
  confidence: number;
  message?: string;
}

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase not configured" },
      { status: 500 },
    );
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { frame_b64: string };

  let dfRes: Response;
  try {
    dfRes = await fetch(`${DEEPFACE_URL}/recognize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ frame_b64: body.frame_b64 }),
    });
  } catch {
    return NextResponse.json(
      {
        matched: false,
        message:
          "DeepFace service not running. Start it with: cd backend && python main.py",
      },
      { status: 503 },
    );
  }

  const result = (await dfRes.json()) as DeepFaceResult;

  console.log("[recognize] DeepFace response:", {
    status: dfRes.status,
    matched: result.matched,
    student_id: result.student_id,
    confidence: result.confidence,
    message: result.message,
  });

  if (!result.matched || !result.student_id) {
    return NextResponse.json({
      matched: false,
      confidence: 0,
      message: result.message ?? "No match",
    });
  }

  // Enrich with student name from Supabase
  const adminClient = createSupabaseAdminClient();
  if (!adminClient) {
    return NextResponse.json(
      { error: "Admin client not configured" },
      { status: 500 },
    );
  }

  const { data: profile } = await adminClient
    .from("profiles")
    .select("id, full_name, roll_no")
    .eq("id", result.student_id)
    .single();

  return NextResponse.json({
    matched: true,
    studentId: result.student_id,
    studentName: profile?.full_name ?? "Unknown",
    rollNo: profile?.roll_no ?? "",
    confidence: result.confidence,
  });
}
