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
    .from("complaints")
    .select("*, profiles(id, full_name, roll_no, room_allotments(rooms(number)))");

  if (role === "student") {
    const { data: profile } = await adminClient
      .from("profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (profile) {
      query = query.eq("profile_id", profile.id);
    } else {
      return NextResponse.json({ complaints: [] });
    }
  }

  const { data: complaints, error } = await query.order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const formattedComplaints = (complaints || []).map((c) => {
    const profile = Array.isArray(c.profiles) ? c.profiles[0] : c.profiles;
    
    // Extract room number
    let roomNo = "TBD";
    const allotment = profile?.room_allotments;
    const room = Array.isArray(allotment) 
      ? allotment[0]?.rooms 
      : (allotment as any)?.rooms;
    
    if (room) {
      roomNo = Array.isArray(room) ? room[0]?.number : room?.number || "TBD";
    }

    return {
      id: c.id,
      title: c.title,
      description: c.description,
      student: profile?.full_name || "Unknown",
      room: roomNo,
      category: c.category,
      priority: c.priority,
      status: c.status,
      date: new Date(c.created_at).toISOString().split("T")[0],
      time: new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  });

  return NextResponse.json({ complaints: formattedComplaints });
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
    const { title, description, category, priority } = await request.json();

    if (!title || !description || !category) {
      return NextResponse.json({ error: "Title, description, and category are required." }, { status: 400 });
    }

    const { data: created, error } = await adminClient
      .from("complaints")
      .insert({
        profile_id: profile.id,
        title,
        description,
        category,
        priority: priority || "medium",
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ complaint: created });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Invalid payload." }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adminClient = createSupabaseAdminClient();
  if (!adminClient) {
    return NextResponse.json({ error: "Admin client not configured" }, { status: 500 });
  }

  try {
    const { id, status } = await request.json();

    if (!id || !status) {
      return NextResponse.json({ error: "ID and status are required." }, { status: 400 });
    }

    const { data: updated, error } = await adminClient
      .from("complaints")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ complaint: updated });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Invalid payload." }, { status: 400 });
  }
}
