import { NextResponse } from "next/server";
import { generateContent } from "@/lib/claude/generateContent";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, topic, subject, classLevel, instruction } = body;

    if (!type || !topic || !subject || !classLevel) {
      return NextResponse.json({ error: "Trūksta parametrų" }, { status: 400 });
    }

    const content = await generateContent({ type, topic, subject, classLevel, instruction });
    return NextResponse.json({ content });
  } catch (error) {
    console.error("Content generation error:", error);
    return NextResponse.json(
      { error: "Turinio generavimas nepavyko" },
      { status: 500 }
    );
  }
}
