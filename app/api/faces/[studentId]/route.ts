import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const DEEPFACE_URL = process.env.DEEPFACE_API_URL ?? "http://localhost:8000";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ studentId: string }> },
) {
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

  const role = user.user_metadata?.role as string | undefined;
  if (role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { studentId } = await params;
  const body = (await request.json()) as { image_b64: string };

  const adminClient = createSupabaseAdminClient();
  if (!adminClient) {
    return NextResponse.json(
      { error: "Admin client not configured" },
      { status: 500 },
    );
  }

  // 1. Upload photo to Supabase Storage
  const base64Data = body.image_b64.includes(",")
    ? body.image_b64.split(",")[1]
    : body.image_b64;

  const imageBuffer = Buffer.from(base64Data, "base64");

  let photoUrl: string | null = null;
  const { error: uploadError } = await adminClient.storage
    .from("student-photos")
    .upload(`${studentId}.jpg`, imageBuffer, {
      contentType: "image/jpeg",
      upsert: true,
    });

  if (!uploadError) {
    const { data: urlData } = adminClient.storage
      .from("student-photos")
      .getPublicUrl(`${studentId}.jpg`);
    photoUrl = urlData.publicUrl;

    await adminClient
      .from("profiles")
      .update({ photo_url: photoUrl })
      .eq("id", studentId);
  }

  // 2. Register face with DeepFace service
  try {
    const dfRes = await fetch(`${DEEPFACE_URL}/faces/${studentId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image_b64: body.image_b64 }),
    });

    if (!dfRes.ok) {
      const errBody = (await dfRes.json()) as { detail?: string };
      return NextResponse.json(
        { error: `DeepFace error: ${errBody.detail ?? "Unknown error"}` },
        { status: 400 },
      );
    }
  } catch {
    // Photo saved to storage but DeepFace service is not running
    return NextResponse.json({
      message:
        "Photo saved to storage. Start deepface-service and click Sync Faces to activate recognition.",
      photoUrl,
      warning: "DeepFace service not reachable",
    });
  }

  return NextResponse.json({
    message: "Face registered and recognition enabled",
    photoUrl,
  });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ studentId: string }> },
) {
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

  const role = user.user_metadata?.role as string | undefined;
  if (role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { studentId } = await params;

  const adminClient = createSupabaseAdminClient();
  if (!adminClient) {
    return NextResponse.json(
      { error: "Admin client not configured" },
      { status: 500 },
    );
  }

  // Remove from Supabase Storage
  await adminClient.storage.from("student-photos").remove([`${studentId}.jpg`]);

  // Clear photo_url in profile
  await adminClient
    .from("profiles")
    .update({ photo_url: null })
    .eq("id", studentId);

  // Remove from DeepFace service
  try {
    await fetch(`${DEEPFACE_URL}/faces/${studentId}`, { method: "DELETE" });
  } catch {
    // DeepFace service not running — ignore
  }

  return NextResponse.json({ message: "Face removed" });
}
