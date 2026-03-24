import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const supabase = await createClient();
  const body = await req.json();

  const { session_id, participant_name, content_item_id, question_index, answer } = body;

  if (!session_id || !participant_name || !answer) {
    return NextResponse.json({ error: "Trūksta duomenų" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("responses")
    .insert({ session_id, participant_name, content_item_id, question_index, answer })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function GET(req: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(req.url);
  const session_id = searchParams.get("session_id");

  if (!session_id) {
    return NextResponse.json({ error: "session_id būtinas" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("responses")
    .select("*")
    .eq("session_id", session_id)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
