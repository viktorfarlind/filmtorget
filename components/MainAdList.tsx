import { Clapperboard, Disc } from "lucide-react";
import { supabase } from "@/utils/supabaseClient";
import AdCard from "./AdCard";
import SortSelect from "./SortSelect";

type Props = {
  searchParams: { [key: string]: string | string[] | undefined };
};

export default async function MainAdList({ searchParams }: Props) {
  const formatFilter =
    typeof searchParams.format === "string" ? searchParams.format : null;
  const searchQuery =
    typeof searchParams.q === "string" ? searchParams.q : null;
  const sortOption =
    typeof searchParams.sort === "string" ? searchParams.sort : "newest";

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
    <section
      className="px-4 max-w-6xl mx-auto w-full border-t border-slate-200 pt-12"
      aria-labelledby="main-list-heading"
    >
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-10">
        <div>
          <h2
            id="main-list-heading"
            className="font-black text-3xl text-slate-950 flex items-center gap-3 uppercase italic tracking-tighter"
          >
            <Clapperboard
              className="h-8 w-8 text-blue-600"
              strokeWidth={2.5}
              aria-hidden="true"
            />
            {formatFilter ? `${formatFilter}-filmer` : "Alla filmer"}
          </h2>
          <p className="text-slate-600 text-sm mt-2 font-bold uppercase tracking-tight">
            Visar {mainListAds?.length || 0} aktiva annonser
          </p>
        </div>
        <SortSelect />
      </div>

      {!mainListAds || mainListAds.length === 0 ? (
        <div
          className="text-center py-24 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200 mx-2"
          role="status"
        >
          <div className="inline-flex bg-slate-50 p-6 rounded-full mb-6">
            <Disc
              className="h-12 w-12 text-slate-300 animate-spin-slow"
              strokeWidth={1}
            />
          </div>
          <p className="text-slate-900 font-black uppercase italic tracking-widest">
            Inga nya filmer hittades just nu
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-y-12 gap-x-4 sm:gap-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {mainListAds.map((ad) => (
            <AdCard key={ad.id} ad={ad} />
          ))}
        </div>
      )}
    </section>
  );
}
