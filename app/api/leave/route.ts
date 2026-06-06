import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

async function getAuthenticatedUser() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adminClient = createSupabaseAdminClient();
  if (!adminClient) {
    return NextResponse.json({ error: "Admin client not configured" }, { status: 500 });
  }

  const role = String(user.user_metadata?.role || "student").toLowerCase();

  let query = adminClient
    .from("leave_requests")
    .select("*, profiles(full_name, roll_no)");

  // If student, filter by their own profile
  if (role === "student") {
    const { data: profile } = await adminClient
      .from("profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (profile) {
      query = query.eq("profile_id", profile.id);
    } else {
      return NextResponse.json({ requests: [], stats: { pending: 0, approved: 0, rejected: 0, total: 0 } });
    }
  }

  const { data: leaves, error } = await query.order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const formattedLeaves = (leaves || []).map((leave) => {
    const profile = Array.isArray(leave.profiles) ? leave.profiles[0] : leave.profiles;
    return {
      id: leave.id,
      studentName: profile?.full_name || "Unknown",
      rollNo: profile?.roll_no || "N/A",
      reason: leave.reason,
      fromDate: leave.from_date,
      toDate: leave.to_date,
      status: leave.status,
      appliedOn: new Date(leave.created_at).toISOString().split("T")[0],
    };
  });

  const stats = {
    pending: formattedLeaves.filter((l) => l.status === "pending").length,
    approved: formattedLeaves.filter((l) => l.status === "approved").length,
    rejected: formattedLeaves.filter((l) => l.status === "rejected").length,
    total: formattedLeaves.length,
  };

  return NextResponse.json({ requests: formattedLeaves, stats });
}

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adminClient = createSupabaseAdminClient();
  if (!adminClient) {
    return NextResponse.json({ error: "Admin client not configured" }, { status: 500 });
  }

  const { data: profile } = await adminClient
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: "Student profile not found." }, { status: 404 });
  }

  try {
    const { fromDate, toDate, reason } = await request.json();

    if (!fromDate || !toDate || !reason) {
      return NextResponse.json({ error: "From date, to date, and reason are required." }, { status: 400 });
    }

    const { data: created, error } = await adminClient
      .from("leave_requests")
      .insert({
        profile_id: profile.id,
        from_date: fromDate,
        to_date: toDate,
        reason: reason,
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ request: created });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Invalid payload." }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = String(user.user_metadata?.role || "student").toLowerCase();
  if (role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const adminClient = createSupabaseAdminClient();
  if (!adminClient) {
    return NextResponse.json({ error: "Admin client not configured" }, { status: 500 });
  }

  try {
    const { id, status, rejectedReason } = await request.json();

    if (!id || !status) {
      return NextResponse.json({ error: "ID and status are required." }, { status: 400 });
    }

    if (status !== "approved" && status !== "rejected") {
      return NextResponse.json({ error: "Status must be approved or rejected." }, { status: 400 });
    }

    const { data: updated, error } = await adminClient
      .from("leave_requests")
      .update({
        status,
        rejected_reason: rejectedReason || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ request: updated });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Invalid payload." }, { status: 400 });
  }
}
