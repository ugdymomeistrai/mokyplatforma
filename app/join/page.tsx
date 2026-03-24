"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function JoinPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!code.trim() || !name.trim()) {
      setError("Įveskite ir kodą, ir savo vardą.");
      return;
    }

    setLoading(true);
    // Patikriname ar sesija egzistuoja
    const res = await fetch(`/api/sessions/${code.toUpperCase().trim()}`);
    if (!res.ok) {
      setError("Toks kodas nerastas. Patikrinkite ir bandykite dar kartą.");
      setLoading(false);
      return;
    }

    // Išsaugome vardą sesijoje
    sessionStorage.setItem("participant_name", name.trim());
    router.push(`/s/${code.toUpperCase().trim()}`);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border p-8 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">
          Prisijungti prie pamokos
        </h1>
        <p className="text-center text-gray-500 text-sm mb-8">
          Įveskite mokytojo duotą kodą
        </p>

        <form onSubmit={handleJoin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pamokos kodas
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="pvz. K4R9M2"
              maxLength={6}
              className="w-full border rounded-lg px-4 py-3 text-center text-2xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-brand-500"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tavo vardas
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="pvz. Tomas"
              maxLength={32}
              className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-600 text-white py-3 rounded-lg font-medium hover:bg-brand-700 transition disabled:opacity-50"
          >
            {loading ? "Jungiamasi..." : "Prisijungti →"}
          </button>
        </form>
      </div>
    </div>
  );
}
