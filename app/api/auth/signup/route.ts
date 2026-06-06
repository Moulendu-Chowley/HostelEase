import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseSecretKey, getSupabaseUrl } from "@/lib/supabase/env";
import { NextResponse } from "next/server";

function parseRole(input: string) {
  return input.toLowerCase() === "admin" ? "admin" : "student";
}

export async function POST(request: Request) {
  const body = await request.json();

  const fullName = String(body.fullName || "").trim();
  const email = String(body.email || "")
    .trim()
    .toLowerCase();
  const password = String(body.password || "");
  const role = parseRole(String(body.role || "student"));
  const rollNo = body.rollNo ? String(body.rollNo).trim().toUpperCase() : null;

  if (!fullName || !email || !password) {
    return NextResponse.json(
      { error: "fullName, email and password are required." },
      { status: 400 },
    );
  }

  if (role === "student" && !rollNo) {
    return NextResponse.json(
      { error: "rollNo is required for student sign up." },
      { status: 400 },
    );
  }

  if (password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters." },
      { status: 400 },
    );
  }

  const supabaseUrl = getSupabaseUrl();
  const supabaseSecretKey = getSupabaseSecretKey();

  if (!supabaseUrl || !supabaseSecretKey) {
    return NextResponse.json(
      { error: "Supabase admin credentials are missing in environment." },
      { status: 500 },
    );
  }

  const adminClient = createSupabaseAdminClient();

  if (!adminClient) {
    return NextResponse.json(
      { error: "Supabase admin client is not configured." },
      { status: 500 },
    );
  }

  const { data: created, error: createError } =
    await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        role: role.toLowerCase(),
        name: fullName,
      },
    });

  if (createError || !created.user) {
    return NextResponse.json(
      { error: createError?.message || "Unable to create auth user." },
      { status: 400 },
    );
  }

  try {
    const { error: profileError } = await adminClient.from("profiles").insert({
      user_id: created.user.id,
      email,
      full_name: fullName,
      role,
      roll_no: rollNo,
    });

    if (profileError) {
      throw new Error(profileError.message);
    }
  } catch (error) {
    await adminClient.auth.admin.deleteUser(created.user.id);
    const message =
      error instanceof Error ? error.message : "Profile create failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  return NextResponse.json({
    message: "Account created successfully.",
  });
}
