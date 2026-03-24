"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type ContentItem = {
  id: string;
  title: string;
  type: string;
  subject: string | null;
  class_level: string | null;
};

const typeIcon: Record<string, string> = {
  slides: "🖼️",
  questions: "❓",
  activity: "✏️",
};

export default function NewLessonPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [classLevel, setClassLevel] = useState("");
  const [library, setLibrary] = useState<ContentItem[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLibrary() {
      const supabase = createClient();
      const { data } = await supabase
        .from("content_items")
        .select("id, title, type, subject, class_level")
        .order("created_at", { ascending: false });
      setLibrary(data || []);
      setLoading(false);
    }
    loadLibrary();
  }, []);

  function toggleItem(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function moveUp(idx: number) {
    if (idx === 0) return;
    const next = [...selected];
    [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
    setSelected(next);
  }

  function moveDown(idx: number) {
    if (idx === selected.length - 1) return;
    const next = [...selected];
    [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
    setSelected(next);
  }

  async function handleSave() {
    if (!title.trim()) {
      setError("Įveskite pamokos pavadinimą");
      return;
    }
    if (selected.length === 0) {
      setError("Pasirinkite bent vieną turinio elementą");
      return;
    }

    setSaving(true);
    setError("");
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push("/auth/login");
      return;
    }

    const contentSequence = selected.map((id, idx) => ({ id, order: idx }));

    const { data: lesson, error: saveError } = await supabase
      .from("lessons")
      .insert({
        teacher_id: user.id,
        title,
        subject,
        class_level: classLevel,
        content_sequence: contentSequence,
      })
      .select()
      .single();

    if (saveError) {
      setError("Klaida išsaugant pamoką. Bandykite dar kartą.");
      setSaving(false);
      return;
    }

    router.push(`/session/${lesson.id}`);
  }

  const selectedItems = selected
    .map((id) => library.find((x) => x.id === id))
    .filter(Boolean) as ContentItem[];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="font-bold text-lg text-brand-700">
          ← Mokyplatforma
        </Link>
        <span className="text-sm text-gray-500">Nauja pamoka</span>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Kurti naują pamoką</h2>
          <p className="text-gray-500 text-sm">Surinkite turinį iš bibliotekos ir vedkite pamoką gyvai</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Kairė — forma */}
          <div className="space-y-5">
            <div className="bg-white rounded-xl border p-6 space-y-4">
              <h3 className="font-semibold text-gray-800">Pamokos informacija</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pavadinimas
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="pvz. Lietuvos gamta — 6 klasė"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dalykas
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Geografija"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Klasė
                </label>
                <input
                  type="text"
                  value={classLevel}
                  onChange={(e) => setClassLevel(e.target.value)}
                  placeholder="5–8 klasė"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            {/* Pasirinkti elementai */}
            <div className="bg-white rounded-xl border p-6">
              <h3 className="font-semibold text-gray-800 mb-3">
                Pamokos seka{" "}
                <span className="text-gray-400 font-normal text-sm">({selected.length} elementai)</span>
              </h3>

              {selectedItems.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">
                  Pasirinkite turinį iš bibliotekos →
                </p>
              ) : (
                <div className="space-y-2">
                  {selectedItems.map((item, idx) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-2 bg-brand-50 border border-brand-100 rounded-lg px-3 py-2"
                    >
                      <span className="text-gray-400 text-xs w-4">{idx + 1}</span>
                      <span>{typeIcon[item.type] || "📄"}</span>
                      <span className="text-sm flex-1 truncate">{item.title}</span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => moveUp(idx)}
                          disabled={idx === 0}
                          className="text-gray-400 hover:text-gray-600 disabled:opacity-30 text-xs px-1"
                        >▲</button>
                        <button
                          onClick={() => moveDown(idx)}
                          disabled={idx === selectedItems.length - 1}
                          className="text-gray-400 hover:text-gray-600 disabled:opacity-30 text-xs px-1"
                        >▼</button>
                        <button
                          onClick={() => toggleItem(item.id)}
                          className="text-red-400 hover:text-red-600 text-xs px-1"
                        >✕</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">{error}</p>
            )}

            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-brand-600 text-white py-3 rounded-lg font-medium hover:bg-brand-700 transition disabled:opacity-50"
            >
              {saving ? "Išsaugoma..." : "Išsaugoti ir pradėti pamoką →"}
            </button>
          </div>

          {/* Dešinė — biblioteka */}
          <div className="bg-white rounded-xl border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">Turinio biblioteka</h3>
              <Link
                href="/content/new"
                className="text-sm text-brand-600 hover:underline"
              >
                + Naujas turinys
              </Link>
            </div>

            {loading ? (
              <p className="text-sm text-gray-400 text-center py-10">Kraunama...</p>
            ) : library.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-sm text-gray-400 mb-3">Biblioteka tuščia</p>
                <Link
                  href="/content/new"
                  className="text-sm bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700 transition"
                >
                  Sukurti pirmą turinį
                </Link>
              </div>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {library.map((item) => {
                  const isSelected = selected.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      onClick={() => toggleItem(item.id)}
                      className={`w-full text-left border rounded-lg px-4 py-3 transition ${
                        isSelected
                          ? "border-brand-400 bg-brand-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{typeIcon[item.type] || "📄"}</span>
                        <span className="text-sm font-medium flex-1 truncate">{item.title}</span>
                        {isSelected && (
                          <span className="text-brand-600 text-xs font-medium">✓ Pridėta</span>
                        )}
                      </div>
                      {(item.subject || item.class_level) && (
                        <p className="text-xs text-gray-400 mt-0.5 ml-6">
                          {[item.subject, item.class_level].filter(Boolean).join(" · ")}
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
