import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
      <div className="max-w-2xl text-center space-y-6">
        <h1 className="text-4xl font-bold text-gray-900">
          Mokyplatforma
        </h1>
        <p className="text-xl text-gray-500">
          Nemokama platforma mokytojams kurti interaktyvias pamokas su AI pagalba
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/auth/register"
            className="bg-brand-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-brand-700 transition"
          >
            Pradėti nemokamai
          </Link>
          <Link
            href="/join"
            className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition"
          >
            Esu mokinys — prisijungti prie pamokos
          </Link>
        </div>
      </div>
    </main>
  );
}
