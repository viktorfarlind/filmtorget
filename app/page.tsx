import { Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/utils/supabaseClient";
import AdCard from "@/components/AdCard";
import HeroSection from "@/components/HeroSection";
import MainAdList from "@/components/MainAdList";
import { Suspense } from "react";

// Tvingar Next.js att rendera sidan dynamiskt vid varje begäran.
// Detta säkerställer att användare alltid ser de senaste annonserna.
export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

/**
 * Startsidan är en React Server Component (RSC).
 * Genom att hämta data direkt på servern minimerar vi mängden JavaScript 
 * som skickas till klienten, vilket resulterar i en lägre Total Blocking Time (TBT).
 */
export default async function Home(props: Props) {
  const searchParams = await props.searchParams;

  /**
   * DATAHÄMTNING PÅ SERVER:
   * Vi hämtar de 10 senaste annonserna direkt i komponenten. 
   * Detta eliminerar behovet av useEffect och klientsida-fetch, 
   * vilket förbättrar First Contentful Paint (FCP).
   */
  const { data: latestAdsData } = await supabase
    .from("ads")
    .select("*")
    .eq("is_sold", false)
    .order("created_at", { ascending: false })
    .limit(10);

  const latestAds = latestAdsData || [];

  return (
    <div className="flex flex-col gap-12 pb-24 bg-slate-50 min-h-screen">
      <HeroSection />

      {latestAds.length > 0 && (
        <section
          className="-mt-6 relative z-10 space-y-6"
          aria-labelledby="latest-heading"
        >
          <div className="text-center px-4">
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur px-4 py-1.5 rounded-full shadow-sm border border-blue-100 mb-2">
              <Sparkles
                className="h-4 w-4 text-blue-600 fill-blue-600"
                aria-hidden="true"
              />
              <h2
                id="latest-heading"
                className="text-xs font-black text-blue-900 uppercase tracking-widest italic"
              >
                Nyinkommet
              </h2>
            </div>
          </div>

          <div className="relative w-full">
            {/* MOBILVY: Horisontell scroll för snabb överblick på små skärmar */}
            <div className="md:hidden w-full relative">
              <div className="flex overflow-x-auto gap-4 px-4 snap-x snap-mandatory scrollbar-hide pb-4">
                {latestAds.map((ad, index) => (
                  <div
                    key={`mob-${ad.id}`}
                    className="w-40 shrink-0 snap-center transition-transform active:scale-95"
                  >
                    {/* LCP OPTIMERING: 
                      priority={index < 4} sätter fetchpriority="high" på de första bilderna.
                      Detta gör att webbläsaren prioriterar dessa resurser i nätverkskön.
                    */}
                    <AdCard ad={ad} priority={index < 4} />
                  </div>
                ))}
              </div>
            </div>

            {/* DESKTOPVY */}
            <div className="hidden md:flex w-full overflow-x-auto pb-8 pt-4 px-8 scrollbar-hide">
              <div className="flex gap-6 mx-auto">
                {latestAds.map((ad, index) => (
                  <div
                    key={`desk-${ad.id}`}
                    className="w-48 shrink-0 transition-transform hover:-translate-y-2 duration-300"
                  >
                    {/* Samma logik för resursprioritering som i mobilvyn */}
                    <AdCard ad={ad} priority={index < 4} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/**
       * STREAMING MED SUSPENSE:
       * MainAdList hämtar alla annonser (och hanterar filtrering).
       * Genom att omsluta den i Suspense kan Next.js "streama" resten av sidan 
       * till webbläsaren omedelbart (skal, hero, nyinkommet), medan den tyngre 
       * huvudlistan laddas färdigt i bakgrunden.
       */}
      <Suspense
        fallback={
          <div className="w-full h-96 flex items-center justify-center">
            <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
          </div>
        }
      >
        <MainAdList searchParams={searchParams} />
      </Suspense>
    </div>
  );
}