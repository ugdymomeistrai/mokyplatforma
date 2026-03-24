# Mokyplatforma 🎓

Nemokama, atviro kodo platforma Lietuvos mokytojams kurti interaktyvias pamokas su AI pagalba.

## Greitas startas

```bash
# 1. Klonuoti
git clone https://github.com/jusu-vartotojas/mokyplatforma
cd mokyplatforma

# 2. Įdiegti priklausomybes
npm install

# 3. Konfigūruoti aplinkos kintamuosius
cp .env.local.example .env.local
# Užpildyti .env.local su savo Supabase ir Anthropic raktais

# 4. Sukurti DB schemą
# Eiti į Supabase Dashboard -> SQL Editor
# Nukopijuoti ir paleisti: supabase/schema.sql

# 5. Paleisti
npm run dev
```

Atidaryti [http://localhost:3000](http://localhost:3000)

## Reikalavimai

- [Supabase](https://supabase.com) paskyra (nemokama)
- [Anthropic API](https://console.anthropic.com) raktas

## Struktūra

```
app/
  dashboard/      ← mokytojo pagrindinis puslapis
  content/new/    ← turinio kūrimas su Claude
  lessons/new/    ← pamokos kūrimas
  session/[code]/ ← live pamoka (mokytojas)
  s/[code]/       ← live pamoka (mokinys)
  join/           ← mokinių prisijungimas
components/
  live/           ← realaus laiko komponentai
  content/        ← turinio kūrimo komponentai
lib/
  claude/         ← AI turinio generavimas
  supabase/       ← DB klientai
hooks/
  useRealtimeSession.ts  ← Supabase Realtime
supabase/
  schema.sql      ← DB schema + RLS politikos
```

## Technologijos

- **Next.js 14** — frontend + API routes
- **Supabase** — DB, Auth, Realtime
- **Claude API** — turinio generavimas
- **Tailwind CSS** — stiliai
- **Vercel** — hosting

## Licencija

MIT — laisvas naudojimui, modifikavimui ir platinimui.
