"use client";

import { useState, useMemo } from "react";
import AdCard from "./AdCard";
import Image from "next/image";
import {
  Search,
  Filter,
  Package,
  ArrowUpDown,
  Star,
  LayoutGrid,
  MessageSquare,
  User,
} from "lucide-react";

export default function PublicProfileContent({
  initialAds,
  reviews = [],
}: {
  initialAds: any[];
  reviews?: any[];
}) {
  const [activeTab, setActiveTab] = useState<"ads" | "reviews">("ads");
  const [searchTerm, setSearchTerm] = useState("");
  const [formatFilter, setFormatFilter] = useState("Alla");
  const [sortBy, setSortBy] = useState("newest");

  const processedAds = useMemo(() => {
    let filtered = initialAds.filter((ad) => {
      const matchesSearch = ad.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesFormat =
        formatFilter === "Alla" || ad.format === formatFilter;
      return matchesSearch && matchesFormat;
    });

    return filtered.sort((a, b) => {
      if (sortBy === "newest")
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      if (sortBy === "price_asc") return a.price - b.price;
      if (sortBy === "price_desc") return b.price - a.price;
      return 0;
    });
  }, [searchTerm, formatFilter, sortBy, initialAds]);

  return (
    <div className="max-w-7xl mx-auto px-4 -mt-10">
      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <div className="flex border-b border-slate-100">
          <button
            onClick={() => setActiveTab("ads")}
            className={`flex-1 py-6 flex items-center justify-center gap-2 font-bold transition-colors ${
              activeTab === "ads"
                ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/30"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <LayoutGrid className="h-5 w-5" />
            Annonser ({initialAds.length})
          </button>
          <button
            onClick={() => setActiveTab("reviews")}
            className={`flex-1 py-6 flex items-center justify-center gap-2 font-bold transition-colors ${
              activeTab === "reviews"
                ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/30"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <Star className="h-5 w-5" />
            Omdömen ({reviews.length})
          </button>
        </div>

        <div className="p-8 md:p-12">
          {activeTab === "ads" ? (
            <>
              <div className="flex flex-col items-center mb-12 text-center">
                <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Sök i utbudet..."
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="relative">
                    <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <select
                      className="w-full pl-11 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none appearance-none text-slate-900 font-medium cursor-pointer"
                      value={formatFilter}
                      onChange={(e) => setFormatFilter(e.target.value)}
                    >
                      <option value="Alla">Alla format</option>
                      <option value="4K UHD">4K UHD</option>
                      <option value="Blu-ray">Blu-ray</option>
                      <option value="DVD">DVD</option>
                    </select>
                  </div>
                  <div className="relative">
                    <ArrowUpDown className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <select
                      className="w-full pl-11 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none appearance-none text-slate-900 font-medium cursor-pointer"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      <option value="newest">Nya först</option>
                      <option value="price_asc">Pris: Lågt till högt</option>
                      <option value="price_desc">Pris: Högt till lågt</option>
                    </select>
                  </div>
                </div>
              </div>

              {processedAds.length === 0 ? (
                <div className="flex flex-col items-center py-20 text-center">
                  <div className="bg-slate-50 p-6 rounded-full mb-6 text-slate-300">
                    <Package className="h-12 w-12" />
                  </div>
                  <p className="text-slate-500 text-lg font-medium">
                    Inga annonser matchar dina val.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-12">
                  {processedAds.map((ad) => (
                    <div
                      key={ad.id}
                      className={`relative transition-all duration-300 ${
                        ad.is_sold ? "grayscale opacity-60" : ""
                      }`}
                    >
                      <AdCard ad={ad} />
                      {ad.is_sold && (
                        <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center rounded-2xl pointer-events-none z-10">
                          <span className="text-[10px] sm:text-xs bg-white text-slate-900 font-black px-2 py-1 rounded shadow-xl rotate-[-10deg] uppercase border border-slate-900">
                            Såld
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="max-w-3xl mx-auto py-8">
              {reviews.length === 0 ? (
                <div className="flex flex-col items-center py-16 text-center">
                  <div className="bg-amber-50 p-6 rounded-full mb-6 text-amber-400">
                    <MessageSquare className="h-12 w-12" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    Inga omdömen ännu
                  </h3>
                  <p className="text-slate-500">
                    Bli den första som gör affär med denna säljare!
                  </p>
                </div>
              ) : (
                <div className="space-y-8">
                  {reviews.map((review) => (
                    <div
                      key={review.id}
                      className="bg-slate-50 p-6 rounded-3xl border border-slate-100 transition-all hover:border-slate-200"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-white border border-slate-200 overflow-hidden relative shadow-sm">
                            {review.reviewer?.avatar_url ? (
                              <Image
                                src={review.reviewer.avatar_url}
                                alt=""
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <User className="h-full w-full p-2 text-slate-300" />
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">
                              {review.reviewer?.username}
                            </p>
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                  key={s}
                                  className={`h-3 w-3 ${
                                    review.rating >= s
                                      ? "text-amber-400 fill-amber-400"
                                      : "text-slate-300"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                          {new Date(review.created_at).toLocaleDateString(
                            "sv-SE"
                          )}
                        </span>
                      </div>
                      <p className="text-slate-600 leading-relaxed italic">
                        "{review.comment}"
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
