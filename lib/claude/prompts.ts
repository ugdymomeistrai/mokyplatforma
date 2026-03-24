export const SYSTEM_PROMPT = `Esi patyręs lietuvių kalbos mokytojas ir turinio kūrėjas.
Visada atsakyk lietuvių kalba.
Kurk tikslų, amžiui tinkamą edukacinį turinį.
Visada atsakyk validu JSON formatu pagal nurodytą schemą.`;

export function buildContentPrompt(params: {
  type: "slides" | "questions" | "activity";
  topic: string;
  subject: string;
  classLevel: string;
  instruction?: string;
}): string {
  const { type, topic, subject, classLevel, instruction } = params;

  const schemas: Record<string, string> = {
    slides: `{
  "slides": [
    { "id": "s1", "type": "title", "title": "string", "subtitle": "string" },
    { "id": "s2", "type": "content", "title": "string", "body": "string" }
  ]
}`,
    questions: `{
  "questions": [
    {
      "id": "q1",
      "type": "multiple_choice",
      "text": "string",
      "options": ["A", "B", "C", "D"],
      "correct": 0
    }
  ]
}`,
    activity: `{
  "activity": {
    "title": "string",
    "description": "string",
    "steps": ["string"]
  }
}`,
  };

  return `Dalykas: ${subject}
Klasė: ${classLevel}
Tema: ${topic}
Turinio tipas: ${type}
${instruction ? `Papildoma instrukcija: ${instruction}` : ""}

Sukurk ${type === "slides" ? "3-5 skaidres" : type === "questions" ? "4-6 klausimus su 4 variantais" : "veiklą"} tema "${topic}".

Atsakyk TIK JSON formatu:
${schemas[type]}`;
}

export function buildOnboardingPrompt(params: {
  subject: string;
  classLevel: string;
  topic: string;
}): string {
  return `Dalykas: ${params.subject}
Klasė: ${params.classLevel}
Tema: ${params.topic}

Sukurk trumpą įvadinę pamoką su:
- 3 skaidrėmis (title + 2 content)
- 3 klausimais su 4 atsakymų variantais

Atsakyk JSON formatu:
{
  "slides": [
    { "id": "s1", "type": "title", "title": "string", "subtitle": "string" },
    { "id": "s2", "type": "content", "title": "string", "body": "string" },
    { "id": "s3", "type": "content", "title": "string", "body": "string" }
  ],
  "questions": [
    { "id": "q1", "type": "multiple_choice", "text": "string", "options": ["A","B","C","D"], "correct": 0 },
    { "id": "q2", "type": "multiple_choice", "text": "string", "options": ["A","B","C","D"], "correct": 1 },
    { "id": "q3", "type": "multiple_choice", "text": "string", "options": ["A","B","C","D"], "correct": 2 }
  ]
}`;
}
