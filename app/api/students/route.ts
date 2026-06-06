import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const adminClient = createSupabaseAdminClient();
  if (!adminClient) {
    return NextResponse.json(
      { error: "Admin client not configured" },
      { status: 500 },
    );
  }
  try {
    const { full_name, email, roll_no } = await req.json();
    if (!full_name || !email) {
      return NextResponse.json(
        { error: "Full name and email are required." },
        { status: 400 },
      );
    }
    // Insert new student profile (role: student)
    const { data, error } = await adminClient
      .from("profiles")
      .insert([
        {
          full_name,
          email,
          roll_no: roll_no || null,
          role: "student",
          user_id: null,
        },
      ])
      .select("id");
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ id: data?.[0]?.id });
  } catch (e) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}

export async function GET() {
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

  const adminClient = createSupabaseAdminClient();
  if (!adminClient) {
    return NextResponse.json(
      { error: "Admin client not configured" },
      { status: 500 },
    );
  }

  const { data, error: dbError } = await adminClient
    .from("profiles")
    .select("id, full_name, roll_no, email, photo_url, created_at")
    .eq("role", "student")
    .order("full_name");

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json({ students: data ?? [] });
}
