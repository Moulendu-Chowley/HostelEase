import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// Helper to extract academic year from roll number (e.g. HS2021001 -> '2021', HS2023023 -> '2023')
function extractYear(rollNo?: string | null): string {
  if (!rollNo) return "Unknown";
  const match = rollNo.match(/\d{4}/);
  return match ? match[0] : "Unknown";
}

export async function GET() {
  const adminClient = createSupabaseAdminClient();
  if (!adminClient) {
    return NextResponse.json({ error: "Admin client not configured" }, { status: 500 });
  }

  // Fetch rooms, profiles, allotments
  const [roomsRes, profilesRes, allotmentsRes] = await Promise.all([
    adminClient.from("rooms").select("*").order("number"),
    adminClient.from("profiles").select("*").eq("role", "student").order("full_name"),
    adminClient.from("room_allotments").select("*"),
  ]);

  if (roomsRes.error || profilesRes.error || allotmentsRes.error) {
    return NextResponse.json(
      {
        error:
          roomsRes.error?.message ||
          profilesRes.error?.message ||
          allotmentsRes.error?.message,
      },
      { status: 500 },
    );
  }

  const rooms = roomsRes.data || [];
  const profiles = profilesRes.data || [];
  const allotments = allotmentsRes.data || [];

  // Map profile id to profile details
  const profileMap = new Map(profiles.map((p) => [p.id, p]));

  // Map room id to lists of occupants
  const roomOccupantsMap: Record<string, typeof profiles> = {};
  allotments.forEach((allot) => {
    const profile = profileMap.get(allot.profile_id);
    if (profile) {
      if (!roomOccupantsMap[allot.room_id]) {
        roomOccupantsMap[allot.room_id] = [];
      }
      roomOccupantsMap[allot.room_id].push(profile);
    }
  });

  const formattedRooms = rooms.map((room) => {
    const occupants = roomOccupantsMap[room.id] || [];
    const yearSet = new Set(occupants.map((o) => extractYear(o.roll_no)));
    const yearString = yearSet.size > 0 ? Array.from(yearSet).map(y => `${y} Year`).join(" / ") : "-";

    let computedStatus = room.status;
    if (room.status !== "maintenance") {
      computedStatus = occupants.length >= room.capacity ? "full" : "available";
    }

    return {
      id: room.id,
      number: room.number,
      floor: room.floor,
      capacity: room.capacity,
      students: occupants.map((o) => o.full_name),
      year: yearString,
      status: computedStatus,
    };
  });

  const stats = {
    total: rooms.length,
    occupied: allotments.length,
    available: rooms.filter((r) => {
      const occCount = (roomOccupantsMap[r.id] || []).length;
      return r.status !== "maintenance" && occCount < r.capacity;
    }).length,
    pending: Math.max(0, profiles.length - allotments.length),
  };

  return NextResponse.json({ rooms: formattedRooms, stats });
}

export async function POST(request: Request) {
  const adminClient = createSupabaseAdminClient();
  if (!adminClient) {
    return NextResponse.json({ error: "Admin client not configured" }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { action, roomId, studentId } = body;

    // 1. Manual Allocation
    if (action === "manual") {
      if (!roomId || !studentId) {
        return NextResponse.json({ error: "Room ID and Student ID are required." }, { status: 400 });
      }

      // Check room capacity
      const { data: room, error: roomErr } = await adminClient
        .from("rooms")
        .select("*")
        .eq("id", roomId)
        .single();

      if (roomErr || !room) {
        return NextResponse.json({ error: "Room not found." }, { status: 404 });
      }

      const { data: currentAllotments } = await adminClient
        .from("room_allotments")
        .select("id")
        .eq("room_id", roomId);

      const occupantCount = currentAllotments?.length || 0;
      if (occupantCount >= room.capacity) {
        return NextResponse.json({ error: "Room is already at full capacity." }, { status: 400 });
      }

      // Insert allotment
      const { error: allotErr } = await adminClient
        .from("room_allotments")
        .insert({ room_id: roomId, profile_id: studentId });

      if (allotErr) {
        return NextResponse.json({ error: allotErr.message }, { status: 400 });
      }

      return NextResponse.json({ message: "Student allocated successfully." });
    }

    // 2. Auto Allocation Algorithm (AI Year Compatibility matching)
    if (action === "auto") {
      const [roomsRes, profilesRes, allotmentsRes] = await Promise.all([
        adminClient.from("rooms").select("*").eq("status", "available"),
        adminClient.from("profiles").select("*").eq("role", "student"),
        adminClient.from("room_allotments").select("*"),
      ]);

      if (roomsRes.error || profilesRes.error || allotmentsRes.error) {
        return NextResponse.json({ error: "Failed to load database state." }, { status: 500 });
      }

      const rooms = roomsRes.data || [];
      const profiles = profilesRes.data || [];
      const allotments = allotmentsRes.data || [];

      // Find unallocated students
      const allocatedStudentIds = new Set(allotments.map((a) => a.profile_id));
      const unallocatedStudents = profiles.filter((p) => !allocatedStudentIds.has(p.id));

      if (unallocatedStudents.length === 0) {
        return NextResponse.json({ message: "No pending students to allocate." });
      }

      // Map room id to current occupants list
      const roomOccupantsMap: Record<string, typeof profiles> = {};
      allotments.forEach((allot) => {
        const p = profiles.find((prof) => prof.id === allot.profile_id);
        if (p) {
          if (!roomOccupantsMap[allot.room_id]) {
            roomOccupantsMap[allot.room_id] = [];
          }
          roomOccupantsMap[allot.room_id].push(p);
        }
      });

      // Group rooms with free capacity
      const availableRooms = rooms.filter((r) => {
        const count = (roomOccupantsMap[r.id] || []).length;
        return count < r.capacity;
      });

      if (availableRooms.length === 0) {
        return NextResponse.json({ error: "No available rooms with free capacity." }, { status: 400 });
      }

      // Group unallocated students by academic year
      const studentsByYear: Record<string, typeof profiles> = {};
      unallocatedStudents.forEach((student) => {
        const year = extractYear(student.roll_no);
        if (!studentsByYear[year]) {
          studentsByYear[year] = [];
        }
        studentsByYear[year].push(student);
      });

      const newAllotments: { room_id: string; profile_id: string }[] = [];

      // Pass 1: Try to place students into rooms that already have a student from the SAME academic year
      for (const year of Object.keys(studentsByYear)) {
        const yearStudents = studentsByYear[year];

        for (const room of availableRooms) {
          const occupants = roomOccupantsMap[room.id] || [];
          if (occupants.length === 1 && extractYear(occupants[0].roll_no) === year) {
            // Room has exactly 1 occupant, and they belong to the same year! Place a student here.
            const student = yearStudents.shift();
            if (student) {
              newAllotments.push({ room_id: room.id, profile_id: student.id });
              occupants.push(student); // update local state
            }
          }
          if (yearStudents.length === 0) break;
        }
      }

      // Re-filter rooms to find those that are still not full
      const emptyOrPartialRooms = availableRooms.filter((r) => {
        const count = (roomOccupantsMap[r.id] || []).length + newAllotments.filter(na => na.room_id === r.id).length;
        return count < r.capacity;
      });

      // Pass 2: Place same-year students together in empty rooms
      for (const year of Object.keys(studentsByYear)) {
        const yearStudents = studentsByYear[year];
        if (yearStudents.length === 0) continue;

        for (const room of emptyOrPartialRooms) {
          const currentOccupantsCount = (roomOccupantsMap[room.id] || []).length + newAllotments.filter(na => na.room_id === room.id).length;
          const spotsLeft = room.capacity - currentOccupantsCount;

          for (let i = 0; i < spotsLeft; i++) {
            if (yearStudents.length === 0) break;
            const student = yearStudents.shift();
            if (student) {
              newAllotments.push({ room_id: room.id, profile_id: student.id });
            }
          }
          if (yearStudents.length === 0) break;
        }
      }

      // Pass 3: Place any leftover students into any remaining rooms (fallback matching)
      const allLeftoverStudents = Object.values(studentsByYear).flat();
      if (allLeftoverStudents.length > 0) {
        for (const room of availableRooms) {
          const currentOccupantsCount = (roomOccupantsMap[room.id] || []).length + newAllotments.filter(na => na.room_id === room.id).length;
          const spotsLeft = room.capacity - currentOccupantsCount;

          for (let i = 0; i < spotsLeft; i++) {
            if (allLeftoverStudents.length === 0) break;
            const student = allLeftoverStudents.shift();
            if (student) {
              newAllotments.push({ room_id: room.id, profile_id: student.id });
            }
          }
          if (allLeftoverStudents.length === 0) break;
        }
      }

      if (newAllotments.length === 0) {
        return NextResponse.json({ message: "No compatible rooms/allotments could be made." });
      }

      // Insert new allotments
      const { error: insertErr } = await adminClient
        .from("room_allotments")
        .insert(newAllotments);

      if (insertErr) {
        return NextResponse.json({ error: insertErr.message }, { status: 500 });
      }

      return NextResponse.json({
        message: `Auto-allocation completed! Allocated ${newAllotments.length} students.`,
        allocatedCount: newAllotments.length,
      });
    }

    return NextResponse.json({ error: "Action not recognized." }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Invalid request." }, { status: 400 });
  }
}
