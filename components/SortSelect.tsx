"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ArrowUpDown, ChevronDown } from "lucide-react";

export default function SortSelect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSort = searchParams.get("sort") || "newest";

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", e.target.value);
    router.push(`/?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="relative flex items-center group">
      <label htmlFor="sort-select" className="sr-only">
        Sortera annonser
      </label>

      <div className="relative flex items-center">
        <ArrowUpDown
          className="absolute left-3 h-4 w-4 text-slate-500 group-focus-within:text-blue-600 transition-colors pointer-events-none"
          aria-hidden="true"
        />

        <select
          id="sort-select"
          value={currentSort}
          onChange={handleSortChange}
          className={`
            appearance-none cursor-pointer
            bg-white border border-slate-300 
            pl-10 pr-10 py-2.5 
            rounded-xl text-sm font-bold text-slate-900
            hover:border-slate-400 hover:bg-slate-50
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            transition-all shadow-sm
          `}
        >
          <option value="newest">Senast inkommet</option>
          <option value="price_asc">Pris: Lägst först</option>
          <option value="price_desc">Pris: Högst först</option>
        </select>

        <ChevronDown
          className="absolute right-3 h-4 w-4 text-slate-500 pointer-events-none"
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
