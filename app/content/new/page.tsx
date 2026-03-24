"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type ContentType = "slides" | "questions" | "activity";

const contentTypes: { value: ContentType; label: string; icon: string; desc: string }[] = [
  { value: "slides", label: "Skaidrės", icon: "🖼️", desc: "Pristatymas pamokai" },
  { value: "questions", label: "Klausimai", icon: "❓", desc: "Viktorina arba testas" },
  { value: "activity", label: "Veikla", icon: "✏️", desc: "Praktinė užduotis" },
];

const subjects = [
  "Lietuvių kalba ir literatūra", "Matematika", "Anglų kalba",
  "Istorija", "Geografija", "Biologija", "Chemija", "Fizika",
  "Informatika", "Dailė", "Muzika", "Kūno kultūra", "Kita",
];

const classLevels = [
  "1–4 klasė", "5–8 klasė", "9–10 klasė", "11–12 klasė",
];

export default function NewContentPage() {
  const router = useRouter();
  const [step, setStep] = useState<"form" | "generating" | "preview">("form");
  const [form, setForm] = useState({
    type: "slides" as ContentType,
    topic: "",
    subject: "",
    classLevel: "",
    instruction: "",
    title: "",
  });
  const [generated, setGenerated] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setStep("generating");
    setError("");

    try {
      const res = await fetch("/api/content/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: form.type,
          topic: form.topic,
          subject: form.subject,
          classLevel: form.classLevel,
          instruction: form.instruction,
        }),
      });

      if (!res.ok) throw new Error("Klaida generuojant turinį");
      const data = await res.json();
      setGenerated(data);
      setStep("preview");
    } catch {
      setError("Nepavyko sugeneruoti turinio. Bandykite dar kartą.");
      setStep("form");
    }
  }

  async function handleSave() {
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push("/auth/login");
      return;
    }

    const { error: saveError } = await supabase.from("content_items").insert({
      teacher_id: user.id,
      type: form.type,
      title: form.title || form.topic,
      content: generated,
      subject: form.subject,
      class_level: form.classLevel,
      tags: [],
      is_public: true,
    });

    if (saveError) {
      setError("Klaida išsaugant. Bandykite dar kartą.");
      setSaving(false);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <nav className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="font-bold text-lg text-brand-700">
          ← Mokyplatforma
        </Link>
        <span className="text-sm text-gray-500">Naujas turinys</span>
      </nav>

      <main className="max-w-2xl mx-auto px-4 py-10">
        {step === "form" && (
          <form onSubmit={handleGenerate} className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Kurti naują turinį</h2>
              <p className="text-gray-500 text-sm">Claude sugeneruos turinį pagal jūsų poreikius</p>
            </div>

            {/* Turinio tipas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Turinio tipas
              </label>
              <div className="grid grid-cols-3 gap-3">
                {contentTypes.map((ct) => (
                  <button
                    key={ct.value}
                    type="button"
                    onClick={() => setForm({ ...form, type: ct.value })}
                    className={`border-2 rounded-xl p-4 text-center transition ${
                      form.type === ct.value
                        ? "border-brand-500 bg-brand-50"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                  >
                    <div className="text-2xl mb-1">{ct.icon}</div>
                    <div className="text-sm font-medium text-gray-900">{ct.label}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{ct.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Tema */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tema
              </label>
              <input
                type="text"
                required
                value={form.topic}
                onChange={(e) => setForm({ ...form, topic: e.target.value })}
                placeholder="pvz. Lietuvos valstybingumo atkūrimas 1990 m."
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            {/* Dalykas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dalykas
              </label>
              <select
                required
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
              >
                <option value="">Pasirinkite dalyką</option>
                {subjects.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {/* Klasė */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Klasė
              </label>
              <select
                required
                value={form.classLevel}
                onChange={(e) => setForm({ ...form, classLevel: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
              >
                <option value="">Pasirinkite klasę</option>
                {classLevels.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Papildoma instrukcija */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Papildoma instrukcija <span className="text-gray-400">(nebūtina)</span>
              </label>
              <textarea
                value={form.instruction}
                onChange={(e) => setForm({ ...form, instruction: e.target.value })}
                placeholder="pvz. Akcentuokite taikius protestus ir Baltijos kelią"
                rows={2}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">{error}</p>
            )}

            <button
              type="submit"
              className="w-full bg-brand-600 text-white py-3 rounded-lg font-medium hover:bg-brand-700 transition"
            >
              Generuoti su Claude ✨
            </button>
          </form>
        )}

        {step === "generating" && (
          <div className="text-center py-20">
            <div className="text-5xl mb-6 animate-pulse">✨</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Claude kuria turinį...</h2>
            <p className="text-gray-500 text-sm">Tai užtruks kelias sekundes</p>
          </div>
        )}

        {step === "preview" && generated && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Peržiūra</h2>
              <button
                onClick={() => setStep("form")}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                ← Kurti iš naujo
              </button>
            </div>

            {/* Pavadinimas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Turinio pavadinimas
              </label>
              <input
                type="text"
                value={form.title || form.topic}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            {/* Sugeneruotas turinys — JSON peržiūra */}
            <div className="bg-gray-900 rounded-xl p-5 overflow-auto max-h-96">
              <pre className="text-green-400 text-xs whitespace-pre-wrap">
                {JSON.stringify(generated, null, 2)}
              </pre>
            </div>

            <p className="text-xs text-gray-400">
              Turinio peržiūra tiksliau atrodys live pamokos metu
            </p>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">{error}</p>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-brand-600 text-white py-3 rounded-lg font-medium hover:bg-brand-700 transition disabled:opacity-50"
              >
                {saving ? "Išsaugoma..." : "Išsaugoti bibliotekoj"}
              </button>
              <button
                onClick={() => setStep("form")}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                Atšaukti
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
