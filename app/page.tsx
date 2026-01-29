import Link from "next/link";
import { Disc, Clapperboard, Sparkles } from "lucide-react";
import { supabase } from "@/utils/supabaseClient";
import AdCard from "@/components/AdCard";
import HeroSection from "@/components/HeroSection";
import SortSelect from "@/components/SortSelect";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function Home(props: Props) {
  const searchParams = await props.searchParams;

  const formatFilter =
    typeof searchParams.format === "string" ? searchParams.format : null;
  const searchQuery =
    typeof searchParams.q === "string" ? searchParams.q : null;
  const sortOption =
    typeof searchParams.sort === "string" ? searchParams.sort : "newest";

  const { data: latestAdsData } = await supabase
    .from("ads")
    .select("*")
    .eq("is_sold", false)
    .order("created_at", { ascending: false })
    .limit(10);

  const latestAds = latestAdsData || [];

  let query = supabase.from("ads").select("*").eq("is_sold", false);

  if (formatFilter) query = query.eq("format", formatFilter);
  
  if (searchQuery) {
    query = query.or(
      `title.ilike.%${searchQuery}%,format.ilike.%${searchQuery}%`
    );
  }

  switch (sortOption) {
    case "price_asc":
      query = query.order("price", { ascending: true });
      break;
    case "price_desc":
      query = query.order("price", { ascending: false });
      break;
    case "newest":
    default:
      query = query.order("created_at", { ascending: false });
      break;
  }

  const { data: mainListAds } = await query;

  return (
    <div className="flex flex-col gap-12 pb-24 bg-slate-50 min-h-screen">
      <HeroSection />

      {latestAds.length > 0 && (
        <section className="-mt-6 relative z-10 space-y-6">
          <div className="text-center px-4">
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur px-4 py-1.5 rounded-full shadow-sm border border-blue-100 mb-2">
              <Sparkles className="h-4 w-4 text-blue-600 fill-blue-600" />
              <span className="text-xs font-bold text-blue-900 uppercase tracking-wide">
                Nyinkommet
              </span>
            </div>
          </div>

          <div className="relative w-full">
            <div className="md:hidden w-full relative">
              <div className="flex overflow-x-auto gap-4 px-4 snap-x snap-mandatory scrollbar-hide pb-4">
                {latestAds.map((ad, index) => (
                  <div
                    key={`mob-${ad.id}-${index}`}
                    className="w-40 shrink-0 snap-center transition-transform active:scale-95"
                  >
                    <AdCard ad={ad} />
                  </div>
                ))}
                <div className="w-2 shrink-0" />
              </div>
              <div className="absolute top-0 left-0 h-full w-6 bg-linear-to-r from-slate-50 to-transparent z-10 pointer-events-none" />
              <div className="absolute top-0 right-0 h-full w-6 bg-linear-to-l from-slate-50 to-transparent z-10 pointer-events-none" />
            </div>

            <div className="hidden md:flex w-full overflow-x-auto pb-8 pt-4 px-8 scrollbar-hide">
              <div className="flex gap-6 mx-auto">
                {latestAds.map((ad) => (
                  <div
                    key={`desk-${ad.id}`}
                    className="w-50 shrink-0 transition-transform hover:-translate-y-2 duration-300"
                  >
                    <AdCard ad={ad} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="px-4 max-w-6xl mx-auto w-full border-t border-slate-200 pt-12">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="font-bold text-2xl text-slate-900 flex items-center gap-2">
              <Clapperboard
                className="h-6 w-6 text-slate-700"
                strokeWidth={2}
              />
              {formatFilter ? `${formatFilter}-filmer` : "Alla filmer"}
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              Visar {mainListAds?.length || 0} aktiva annonser
            </p>
          </div>
          <SortSelect />
        </div>

        {!mainListAds || mainListAds.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300 mx-2">
            <div className="inline-flex bg-slate-50 p-4 rounded-full mb-4">
              <Disc className="h-8 w-8 text-slate-300" strokeWidth={1} />
            </div>
            <p className="text-slate-900 font-medium italic">
              Inga nya filmer hittades just nu
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-y-8 gap-x-4 sm:gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {mainListAds.map((ad) => (
              <AdCard key={ad.id} ad={ad} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
