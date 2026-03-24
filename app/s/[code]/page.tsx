"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type StudentStatus = "waiting" | "slide" | "question" | "answered" | "ended";

export default function StudentSessionPage() {
  const { code } = useParams<{ code: string }>();
  const [name, setName] = useState<string>("");
  const [status, setStatus] = useState<StudentStatus>("waiting");
  const [selected, setSelected] = useState<number | null>(null);

  useEffect(() => {
    const savedName = sessionStorage.getItem("participant_name");
    if (!savedName) {
      window.location.href = "/join";
      return;
    }
    setName(savedName);
  }, []);

  // DEMO: hardcoded klausimas
  const demoQuestion = {
    text: "Koks yra ½ + ¼?",
    options: ["¾", "½", "1", "⅔"],
  };

  function handleAnswer(i: number) {
    setSelected(i);
    setStatus("answered");
    // TODO: išsaugoti į Supabase
  }

  if (status === "waiting") {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <div className="text-4xl animate-pulse">⏳</div>
          <h1 className="text-xl font-bold text-gray-800">Laukiame mokytojo...</h1>
          <p className="text-gray-500 text-sm">Pamoka prasidės netrukus</p>
          <p className="text-gray-400 text-xs">Sveiki, {name}!</p>
          {/* Demo mygtukas */}
          <button
            onClick={() => setStatus("question")}
            className="text-xs text-gray-300 underline mt-4"
          >
            (demo: pradėti klausimą)
          </button>
        </div>
      </div>
    );
  }

  if (status === "question") {
    return (
      <div className="min-h-screen bg-white px-4 py-8">
        <div className="max-w-sm mx-auto space-y-6">
          <p className="text-gray-500 text-sm text-center">{name}</p>
          <h2 className="text-2xl font-bold text-gray-900 text-center">
            {demoQuestion.text}
          </h2>
          <div className="space-y-3">
            {demoQuestion.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleAnswer(i)}
                className="w-full border-2 border-gray-200 hover:border-brand-500 rounded-xl px-5 py-4 text-left font-medium text-lg transition active:scale-95"
              >
                <span className="text-gray-400 mr-3">
                  {String.fromCharCode(65 + i)})
                </span>
                {opt}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (status === "answered") {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <div className="text-5xl">✅</div>
          <h2 className="text-xl font-bold text-gray-800">Atsakyta!</h2>
          <p className="text-gray-500">
            Pasirinkote: <strong>{demoQuestion.options[selected!]}</strong>
          </p>
          <p className="text-gray-400 text-sm">Laukiame kito klausimo...</p>
        </div>
      </div>
    );
  }

  return null;
}
