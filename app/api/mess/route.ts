import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const adminClient = createSupabaseAdminClient();
  if (!adminClient) {
    return NextResponse.json({ error: "Admin client not configured" }, { status: 500 });
  }

  // Fetch mess menu and committee members
  const [menuRes, committeeRes] = await Promise.all([
    adminClient.from("mess_menu").select("*").order("created_at"),
    adminClient.from("mess_committee").select("role, profiles(id, full_name, roll_no, email, photo_url)"),
  ]);

  if (menuRes.error || committeeRes.error) {
    return NextResponse.json(
      { error: menuRes.error?.message || committeeRes.error?.message },
      { status: 500 },
    );
  }

  // Fetch all students to count
  const { count: totalStudents } = await adminClient
    .from("profiles")
    .select("*", { count: 'exact', head: true })
    .eq("role", "student");

  // Format mess committee
  const committee = (committeeRes.data || []).map((member) => {
    const profile = Array.isArray(member.profiles) ? member.profiles[0] : member.profiles;
    return {
      id: profile?.id || Math.random().toString(),
      name: profile?.full_name || "Unknown",
      role: member.role,
      year: profile?.roll_no ? `${profile.roll_no.match(/\d{4}/)?.[0] || ""} Year` : "N/A",
      rollNo: profile?.roll_no || "N/A",
      room: "TBD", // can be joined, but set simple hint
      contact: "+91-9876543210",
    };
  });

  // Default menu structure if database is empty
  const defaultMenu = [
    { day: "Monday", breakfast: "Idli, Sambar", lunch: "Rice, Dal, Sabzi", dinner: "Chapati, Paneer", duty: "Team A" },
    { day: "Tuesday", breakfast: "Poha, Chai", lunch: "Chole, Rice, Roti", dinner: "Dal Fry, Rice", duty: "Team B" },
    { day: "Wednesday", breakfast: "Upma, Coffee", lunch: "Rajma, Rice", dinner: "Chicken Curry", duty: "Team A" },
    { day: "Thursday", breakfast: "Dosa, Chutney", lunch: "Kadhi, Rice, Roti", dinner: "Mixed Veg, Roti", duty: "Team B" },
    { day: "Friday", breakfast: "Paratha, Curd", lunch: "Biryani, Raita", dinner: "Dal Makhani, Roti", duty: "Team A" },
    { day: "Saturday", breakfast: "Sandwich, Tea", lunch: "Pulao, Curry", dinner: "Pizza, Salad", duty: "Team B" },
    { day: "Sunday", breakfast: "Puri Bhaji", lunch: "Special Thali", dinner: "Noodles, Manchurian", duty: "Team A" },
  ];

  const menu = menuRes.data && menuRes.data.length > 0
    ? menuRes.data.map((m) => ({
        week: 1,
        day: m.day,
        breakfast: m.breakfast,
        lunch: m.lunch,
        dinner: m.dinner,
        duty: m.duty_roster,
      }))
    : defaultMenu;

  return NextResponse.json({
    schedule: menu,
    members: committee,
    stats: {
      totalStudents: totalStudents || 160,
      activeCommittee: committee.length,
      weeksRotated: 12,
      avgResponseTime: "2.5h",
    },
  });
}

export async function POST() {
  const adminClient = createSupabaseAdminClient();
  if (!adminClient) {
    return NextResponse.json({ error: "Admin client not configured" }, { status: 500 });
  }

  // Auto-generate new committee of 5 students
  const { data: students, error: studentErr } = await adminClient
    .from("profiles")
    .select("id")
    .eq("role", "student");

  if (studentErr || !students || students.length < 5) {
    return NextResponse.json(
      { error: "Insufficient student profiles to generate a 5-member committee." },
      { status: 400 },
    );
  }

  // Shuffle and pick 5 unique students
  const shuffled = [...students].sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, 5);

  const committeeRoles = [
    { profile_id: selected[0].id, role: "Head" },
    { profile_id: selected[1].id, role: "Deputy" },
    { profile_id: selected[2].id, role: "Member" },
    { profile_id: selected[3].id, role: "Member" },
    { profile_id: selected[4].id, role: "Member" },
  ];

  // Clear previous committee
  const { error: clearErr } = await adminClient.from("mess_committee").delete().neq("id", "00000000-0000-0000-0000-000000000000");

  if (clearErr) {
    return NextResponse.json({ error: clearErr.message }, { status: 500 });
  }

  // Insert new committee members
  const { error: insertErr } = await adminClient.from("mess_committee").insert(committeeRoles);

  if (insertErr) {
    return NextResponse.json({ error: insertErr.message }, { status: 500 });
  }

  return NextResponse.json({ message: "New mess committee generated successfully!" });
}
