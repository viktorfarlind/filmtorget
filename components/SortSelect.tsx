"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ArrowUpDown } from "lucide-react";

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
    <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-sm">
      <ArrowUpDown className="h-4 w-4 text-slate-400" />
      <select
        value={currentSort}
        onChange={handleSortChange}
        className="bg-transparent text-sm font-semibold text-slate-700 focus:outline-none cursor-pointer"
      >
        <option value="newest">Nyaste först</option>
        <option value="price_asc">Pris: Lågt till högt</option>
        <option value="price_desc">Pris: Högt till lågt</option>
      </select>
    </div>
  );
}
