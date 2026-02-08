# Filmtorget

En nischad C2C-marknadsplats för fysisk samlarfilm, utvecklad som examensarbete inom Frontendutveckling.

Applikationen är driftsatt och kan testas via länken nedan.

## [Live Demo](https://filmtorget-wxyh.vercel.app/)

### Projektbeskrivning

Filmtorget är skapat för att lösa problemet med att specifik metadata för samlarfilm ofta saknas på generella köp- och säljsajter. Applikationen låter användare kategorisera annonser baserat på regionskoder, utgåvor (exempelvis Steelbooks) och specifika filmformat. Fokus har legat på att bygga en stabil teknisk infrastruktur för nischad data samt att optimera prestanda och tillgänglighet.

### Funktioner

* **Metadata för samlare:** Möjlighet att ange egenskaper som är unika för fysisk film (Region, Steelbook, Format).
* **Realtidskommunikation:** Integrerad chattfunktion via Supabase Realtime för direktkontakt mellan köpare och säljare.
* **Profilsystem:** Hantering av personliga annonser och publika profiler.
* **Tillgänglighet:** Utvecklad enligt WCAG 2.1 med fokus på semantisk HTML och fullständig tangentbordsnavigering (100 poäng i Lighthouse).

#### Nuvarande begränsningar (MVP)

I detta skede lagras all metadata (regionskoder, Steelbook-status etc.) strukturerat i databasen. Sök- och filtreringsfunktionen i den nuvarande versionen är dock begränsad till fritextsökning på titel samt kategorisering via huvudformat (t.ex. 4K UHD, Blu-ray). Fullständig filtrering på samtliga metadataparametrar är planerad för framtida iterationer.

---

### Teknisk stack

* **Framework:** Next.js 15 (App Router / React Server Components)
* **Styling:** Tailwind CSS
* **Backend:** Supabase (PostgreSQL, Auth, Storage och Realtime)
* **Ikonbibliotek:** Lucide React
* **Prestanda:** Google Lighthouse (99 Performance)

---

### Installation och lokal körning

1.  **Klona arkivet** till din lokala maskin.
2.  **Installera beroenden:**

    ```bash
    npm install
    ```
3.  **Konfigurera miljövariabler:** Skapa en `.env.local`-fil i rotmappen och lägg till följande:

    ```env
    NEXT_PUBLIC_SUPABASE_URL=din_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=din_nyckel
    ```
4.  **Starta utvecklingsservern:**
    ```bash
    npm run dev
    ```

---

### Kravuppfyllnad

Projektet uppfyller kraven i den ursprungliga projektplanen gällande CRUD-funktionalitet för annonser, användarautentisering och realtidschatt. Arbetet har lagt stor vikt vid att kombinera funktionella krav med hög teknisk prestanda (LCP på 1.5s) och tillgänglighet. Genom att använda React Server Components har mängden klient-JavaScript minimerats för att skapa en snabb och responsiv användarupplevelse.