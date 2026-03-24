"use client";

interface ResultsChartProps {
  options: string[];
  answers: Record<string, number>; // option index -> count
  correct: number;
  total?: number;
}

export default function ResultsChart({
  options,
  answers,
  correct,
  total,
}: ResultsChartProps) {
  const totalAnswers = total ?? Object.values(answers).reduce((a, b) => a + b, 0);
  const maxCount = Math.max(...Object.values(answers), 1);

  return (
    <div className="bg-gray-800 rounded-xl p-6 space-y-3">
      <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
        <span>Atsakymai</span>
        <span>{totalAnswers} mokinių atsakė</span>
      </div>

      {options.map((opt, i) => {
        const count = answers[i] ?? 0;
        const pct = totalAnswers > 0 ? Math.round((count / totalAnswers) * 100) : 0;
        const isCorrect = i === correct;
        const width = totalAnswers > 0 ? (count / maxCount) * 100 : 0;

        return (
          <div key={i} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className={isCorrect ? "text-green-400 font-medium" : "text-gray-300"}>
                {String.fromCharCode(65 + i)}) {opt}
                {isCorrect && " ✓"}
              </span>
              <span className="text-gray-400">
                {count} ({pct}%)
              </span>
            </div>
            <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isCorrect ? "bg-green-500" : "bg-brand-500"
                }`}
                style={{ width: `${width}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
