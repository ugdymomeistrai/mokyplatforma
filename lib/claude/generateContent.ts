import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT, buildContentPrompt, buildOnboardingPrompt } from "./prompts";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function generateContent(params: {
  type: "slides" | "questions" | "activity";
  topic: string;
  subject: string;
  classLevel: string;
  instruction?: string;
}) {
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 2048,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: buildContentPrompt(params),
      },
    ],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "";

  try {
    // Ištraukiame JSON iš atsakymo
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("JSON nerastas atsakyme");
    return JSON.parse(jsonMatch[0]);
  } catch {
    throw new Error("Nepavyko išanalizuoti Claude atsakymo");
  }
}

export async function generateOnboardingLesson(params: {
  subject: string;
  classLevel: string;
  topic: string;
}) {
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 3000,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: buildOnboardingPrompt(params),
      },
    ],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "";

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("JSON nerastas atsakyme");
    return JSON.parse(jsonMatch[0]);
  } catch {
    throw new Error("Nepavyko išanalizuoti Claude atsakymo");
  }
}
