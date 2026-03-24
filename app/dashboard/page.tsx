"use client";

import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <span className="font-bold text-lg text-brand-700">Mokyplatforma</span>
        <span className="text-sm text-gray-500">Sveiki atvykę!</span>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Pagrindiniai du keliai */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
          <Link
            href="/content/new"
            className="bg-white rounded-2xl border-2 border-gray-200 hover:border-brand-500 p-8 text-center transition group"
          >
            <div className="text-4xl mb-4">📝</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Kurti turinį</h2>
            <p className="text-gray-500 text-sm">
              Skaidrės, klausimai, užduotys — su Claude pagalba
            </p>
          </Link>

          <Link
            href="/lessons/new"
            className="bg-white rounded-2xl border-2 border-gray-200 hover:border-brand-500 p-8 text-center transition group"
          >
            <div className="text-4xl mb-4">📚</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Kurti pamoką</h2>
            <p className="text-gray-500 text-sm">
              Surinkti turinį į pamoką ir vesti ją gyvai
            </p>
          </Link>
        </div>

        {/* Mano pamokos */}
        <section>
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Mano pamokos</h3>
          <div className="bg-white rounded-xl border divide-y">
            {/* TODO: gauti iš Supabase */}
            <div className="px-6 py-4 text-gray-400 text-sm text-center">
              Dar nėra pamokų. Sukurkite pirmąją! ↑
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
