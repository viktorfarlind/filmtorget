_Filmtorget_

En nischad C2C-marknadsplats för fysisk samlarfilm, utvecklad som examensarbete inom Frontendutveckling.

_Live Demo_

Applikationen är driftsatt och kan testas här: https://filmtorget-wxyh.vercel.app/

_Projektbeskrivning_

Filmtorget är skapat för att lösa problemet med att specifik metadata för samlarfilm ofta saknas på generella köp- och säljsajter. Applikationen låter användare kategorisera annonser baserat på regionskoder, utgåvor (exempelvis Steelbooks) och specifika filmformat.

_Funktioner_

Metadata för samlare: Möjlighet att filtrera och sortera på egenskaper som är unika för fysisk film.

Realtidskommunikation: Integrerad chattfunktion för direktkontakt mellan köpare och säljare.

Profilsystem: Hantering av personliga annonser, verifiering och omdömen från tidigare transaktioner.

Tillgänglighet: Utvecklad enligt WCAG 2.1 nivå AA med fokus på semantisk HTML och fullständig tangentbordsnavigering.

_Teknisk stack_

Framework: Next.js 15 (App Router)

Styling: Tailwind CSS

Backend: Supabase (Databas, Auth, Storage och Realtime)

Ikonbibliotek: Lucide React

_Installation och lokal körning_

1. Klona arkivet till din lokala maskin.

2. Installera nödvändiga beroenden: npm install

3. Konfigurera miljövariabler i en .env.local-fil:
   NEXT_PUBLIC_SUPABASE_URL=din_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=din_nyckel

4. Starta utvecklingsservern: npm run dev

_Kravuppfyllnad_

Projektet uppfyller kraven i den ursprungliga projektplanen gällande CRUD-funktionalitet för annonser, användarautentisering, sökfunktioner och realtidschatt. Arbetet har lagt stor vikt vid att kombinera funktionella krav med hög kodkvalitet och tillgänglighet.
