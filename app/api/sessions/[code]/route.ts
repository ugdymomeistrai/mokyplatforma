import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _req: Request,
  { params }: { params: { code: string } }
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("sessions")
    .select("id, code, status, current_index, lesson_id")
    .eq("code", params.code)
    .neq("status", "ended")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Sesija nerasta" }, { status: 404 });
  }

  return NextResponse.json(data);
}

export async function PATCH(
  req: Request,
  { params }: { params: { code: string } }
) {
  const supabase = await createClient();
  const body = await req.json();

  const { data, error } = await supabase
    .from("sessions")
    .update(body)
    .eq("code", params.code)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
