"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ResultsChart from "@/components/live/ResultsChart";

// Tipai
type SessionStatus = "waiting" | "active" | "ended";

interface QuestionResults {
  question: string;
  options: string[];
  correct: number;
  answers: Record<string, number>; // option -> count
  total: number;
}

export default function TeacherSessionPage() {
  const { code } = useParams<{ code: string }>();
  const [status, setStatus] = useState<SessionStatus>("waiting");
  const [participantCount, setParticipantCount] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<QuestionResults | null>(null);

  // TODO: prijungti Supabase Realtime
  // Kol kas — demo režimas su hardcoded duomenimis

  function startLesson() {
    setStatus("active");
  }

  function nextSlide() {
    setCurrentIndex((i) => i + 1);
  }

  function endLesson() {
    setStatus("ended");
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 px-6 py-4 flex items-center justify-between">
        <span className="font-bold">Mokyplatforma</span>
        <span className="text-gray-400 text-sm">Mokytojas</span>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {status === "waiting" && (
          <WaitingScreen
            code={code}
            participantCount={participantCount}
            onStart={startLesson}
          />
        )}

        {status === "active" && (
          <ActiveScreen
            currentIndex={currentIndex}
            results={results}
            onNext={nextSlide}
            onEnd={endLesson}
          />
        )}

        {status === "ended" && (
          <SummaryScreen code={code} />
        )}
      </main>
    </div>
  );
}

function WaitingScreen({
  code,
  participantCount,
  onStart,
}: {
  code: string;
  participantCount: number;
  onStart: () => void;
}) {
  return (
    <div className="text-center space-y-8 py-12">
      <h1 className="text-2xl font-bold text-gray-200">Laukiame mokinių...</h1>

      <div className="bg-gray-800 rounded-2xl p-10 inline-block">
        <p className="text-gray-400 text-sm mb-3 uppercase tracking-wider">
          Prisijungimo kodas
        </p>
        <div className="text-6xl font-mono font-bold tracking-widest text-white">
          {code}
        </div>
        <p className="text-gray-400 text-sm mt-4">
          ugdymas.lt/join
        </p>
      </div>

      <div className="text-gray-300">
        Prisijungę mokiniai:{" "}
        <span className="font-bold text-white text-xl">{participantCount}</span>
      </div>

      <button
        onClick={onStart}
        disabled={participantCount === 0}
        className="bg-green-600 hover:bg-green-700 text-white px-10 py-4 rounded-xl text-lg font-medium transition disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Pradėti pamoką →
      </button>
      <p className="text-gray-500 text-xs">
        (demo režime galima pradėti be mokinių)
      </p>
      <button onClick={onStart} className="text-gray-500 underline text-sm">
        Pradėti demo
      </button>
    </div>
  );
}

function ActiveScreen({
  currentIndex,
  results,
  onNext,
  onEnd,
}: {
  currentIndex: number;
  results: QuestionResults | null;
  onNext: () => void;
  onEnd: () => void;
}) {
  // DEMO: hardcoded pamoka
  const demoSlides = [
    { type: "slide", title: "Trupmenų sudėtis", body: "Šiandien mokysimės sudėti trupmenas su skirtingais vardikliais." },
    { type: "question", text: "Koks yra ½ + ¼?", options: ["¾", "½", "1", "⅔"], correct: 0 },
    { type: "question", text: "Koks yra ⅓ + ⅙?", options: ["½", "⅔", "¼", "⅙"], correct: 0 },
  ];

  const current = demoSlides[currentIndex] ?? null;
  const isLast = currentIndex >= demoSlides.length - 1;

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex items-center justify-between text-gray-400 text-sm">
        <span>{currentIndex + 1} / {demoSlides.length}</span>
        <button onClick={onEnd} className="text-red-400 hover:text-red-300 text-xs">
          Baigti pamoką
        </button>
      </div>

      {/* Dabartinis elementas */}
      <div className="bg-gray-800 rounded-2xl p-8 min-h-64">
        {current?.type === "slide" && (
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">{current.title}</h2>
            <p className="text-gray-300 text-lg">{current.body}</p>
          </div>
        )}
        {current?.type === "question" && (
          <div>
            <h2 className="text-2xl font-bold mb-6">{current.text}</h2>
            <div className="grid grid-cols-2 gap-3">
              {current.options.map((opt: string, i: number) => (
                <div key={i} className="bg-gray-700 rounded-lg px-4 py-3 font-medium">
                  {String.fromCharCode(65 + i)}) {opt}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Rezultatai (jei klausimas) */}
      {current?.type === "question" && (
        <ResultsChart
          options={current.options}
          answers={{}}
          correct={current.correct}
        />
      )}

      {/* Navigacija */}
      <div className="flex justify-end">
        {!isLast ? (
          <button
            onClick={onNext}
            className="bg-brand-600 hover:bg-brand-700 text-white px-8 py-3 rounded-xl font-medium transition"
          >
            Toliau →
          </button>
        ) : (
          <button
            onClick={onEnd}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-medium transition"
          >
            Baigti pamoką ✓
          </button>
        )}
      </div>
    </div>
  );
}

function SummaryScreen({ code }: { code: string }) {
  return (
    <div className="text-center space-y-6 py-12">
      <div className="text-5xl">🎉</div>
      <h1 className="text-2xl font-bold">Pamoka baigta!</h1>
      <p className="text-gray-400">Kodas: {code}</p>
      <div className="bg-gray-800 rounded-xl p-6 text-left max-w-md mx-auto">
        <p className="text-gray-400 text-sm">Rezultatų apibendrinimas bus čia po Supabase integracijos.</p>
      </div>
    </div>
  );
}
