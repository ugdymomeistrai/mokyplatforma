"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    subject: "",
    class_level: "",
  });

  const subjects = [
    "Lietuvių kalba ir literatūra", "Matematika", "Anglų kalba",
    "Istorija", "Geografija", "Biologija", "Chemija", "Fizika",
    "Informatika", "Dailė", "Muzika", "Kūno kultūra", "Kita",
  ];

  const classLevels = [
    "1–4 klasė", "5–8 klasė", "9–10 klasė", "11–12 klasė", "Visos klasės",
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      await supabase
        .from("profiles")
        .update({ name: form.name, subject: form.subject, class_level: form.class_level })
        .eq("id", data.user.id);
    }

    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mokyplatforma</h1>
          <p className="text-gray-500 mt-2">Sukurkite nemokamą paskyrą</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Vardas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vardas Pavardė
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Jonas Jonaitis"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            {/* El. paštas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                El. paštas
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="mokytojas@mokykla.lt"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            {/* Slaptažodis */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Slaptažodis
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Mažiausiai 6 simboliai"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            {/* Dalykas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Koks dalykas?
              </label>
              <select
                required
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
              >
                <option value="">Pasirinkite dalyką</option>
                {subjects.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Klasė */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kokias klases mokote?
              </label>
              <select
                required
                value={form.class_level}
                onChange={(e) => setForm({ ...form, class_level: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
              >
                <option value="">Pasirinkite klasę</option>
                {classLevels.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-600 text-white py-3 rounded-lg font-medium hover:bg-brand-700 transition disabled:opacity-50"
            >
              {loading ? "Kuriama paskyra..." : "Registruotis nemokamai"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Jau turite paskyrą?{" "}
            <Link href="/auth/login" className="text-brand-600 font-medium hover:underline">
              Prisijungti
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
