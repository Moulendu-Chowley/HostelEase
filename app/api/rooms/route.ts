import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

async function requireAdmin() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { error: "Supabase not configured", status: 500 as const };
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { error: "Unauthorized", status: 401 as const };
  }

  const role = String(user.user_metadata?.role || "student").toLowerCase();
  if (role !== "admin") {
    return { error: "Forbidden", status: 403 as const };
  }

  return { user };
}

export async function GET() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  const adminClient = createSupabaseAdminClient();
  if (!adminClient) {
    return NextResponse.json({ error: "Admin client not configured" }, { status: 500 });
  }

  // Fetch rooms
  const { data: rooms, error: roomsError } = await adminClient
    .from("rooms")
    .select("*")
    .order("number");

  if (roomsError) {
    return NextResponse.json({ error: roomsError.message }, { status: 500 });
  }

  // Fetch allotments to compute occupancy and students list
  const { data: allotments, error: allotmentsError } = await adminClient
    .from("room_allotments")
    .select("room_id, profiles(full_name, roll_no)");

  if (allotmentsError) {
    return NextResponse.json({ error: allotmentsError.message }, { status: 500 });
  }

  // Group student names by room_id
  const roomOccupantsMap: Record<string, string[]> = {};
  allotments?.forEach((allotment) => {
    const roomId = allotment.room_id;
    const profile = Array.isArray(allotment.profiles) ? allotment.profiles[0] : allotment.profiles;
    if (profile) {
      const studentName = profile.full_name;
      const rollNo = profile.roll_no ? profile.roll_no.slice(-4) : ""; // short year hint
      const yearHint = rollNo ? ` (${rollNo})` : "";
      if (!roomOccupantsMap[roomId]) {
        roomOccupantsMap[roomId] = [];
      }
      roomOccupantsMap[roomId].push(`${studentName}${yearHint}`);
    }
  });

  const formattedRooms = (rooms || []).map((room) => {
    const occupants = roomOccupantsMap[room.id] || [];
    let computedStatus = room.status;
    if (room.status !== "maintenance") {
      computedStatus = occupants.length >= room.capacity ? "full" : "available";
    }

    return {
      id: room.id,
      number: room.number,
      floor: room.floor,
      capacity: room.capacity,
      occupied: occupants.length,
      status: computedStatus,
      type: room.type,
      students: occupants,
    };
  });

  return NextResponse.json({ rooms: formattedRooms });
}

export async function POST(request: Request) {
  const adminCheck = await requireAdmin();
  if ("error" in adminCheck) {
    return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
  }

  const adminClient = createSupabaseAdminClient();
  if (!adminClient) {
    return NextResponse.json({ error: "Admin client not configured" }, { status: 500 });
  }

  try {
    const { number, floor, capacity, type, status } = await request.json();

    if (!number || !floor) {
      return NextResponse.json({ error: "Room number and floor are required." }, { status: 400 });
    }

    const { data: newRoom, error } = await adminClient
      .from("rooms")
      .insert([
        {
          number: String(number),
          floor: Number(floor),
          capacity: Number(capacity || 2),
          type: String(type || "Double"),
          status: String(status || "available"),
        },
      ])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ room: newRoom });
  } catch {
    return NextResponse.json({ error: "Invalid request payload." }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  const adminCheck = await requireAdmin();
  if ("error" in adminCheck) {
    return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
  }

  const adminClient = createSupabaseAdminClient();
  if (!adminClient) {
    return NextResponse.json({ error: "Admin client not configured" }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const roomId = searchParams.get("id");

  if (!roomId) {
    return NextResponse.json({ error: "Room ID parameter is required." }, { status: 400 });
  }

  const { error } = await adminClient.from("rooms").delete().eq("id", roomId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: "Room deleted successfully." });
}
