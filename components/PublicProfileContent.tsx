"use client";

import { useState, useMemo, useEffect } from "react";
import AdCard from "./AdCard";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  Filter,
  Package,
  ArrowUpDown,
  Star,
  LayoutGrid,
  MessageSquare,
  User as UserIcon,
  ChevronDown,
} from "lucide-react";
import { supabase } from "@/utils/supabaseClient";
import { Ad, Review, Profile } from "@/types/database";

interface ReviewWithProfile extends Review {
  reviewer?: Pick<Profile, "id" | "username" | "avatar_url">;
}

export default function PublicProfileContent({
  initialAds,
  userId,
}: {
  initialAds: Ad[];
  userId: string;
}) {
  const [activeTab, setActiveTab] = useState<"ads" | "reviews">("ads");
  const [searchTerm, setSearchTerm] = useState("");
  const [formatFilter, setFormatFilter] = useState("Alla");
  const [sortBy, setSortBy] = useState("newest");
  const [reviews, setReviews] = useState<ReviewWithProfile[]>([]);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!userId) return;

      const { data: reviewsData, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("receiver_id", userId)
        .order("created_at", { ascending: false });

      if (error || !reviewsData) return;

      const reviewerIds = [...new Set(reviewsData.map((r) => r.reviewer_id))];

      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, username, avatar_url")
        .in("id", reviewerIds);

      const mergedReviews = reviewsData.map((review) => ({
        ...review,
        reviewer: profiles?.find((p) => p.id === review.reviewer_id),
      }));

      setReviews(mergedReviews as ReviewWithProfile[]);
    };

    fetchReviews();
  }, [userId]);

  const processedAds = useMemo(() => {
    const filtered = initialAds.filter((ad) => {
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
    <div className="max-w-7xl mx-auto px-4 -mt-10 pb-20">
      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <div
          className="flex border-b border-slate-100 bg-slate-50/50"
          role="tablist"
          aria-label="Profilinnehåll"
        >
          <button
            id="tab-ads"
            role="tab"
            aria-selected={activeTab === "ads"}
            aria-controls="panel-ads"
            onClick={() => setActiveTab("ads")}
            className={`flex-1 py-6 flex items-center justify-center gap-2 font-black uppercase italic tracking-tighter transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-600 ${
              activeTab === "ads"
                ? "text-blue-600 border-b-4 border-blue-600 bg-white"
                : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
            }`}
          >
            <LayoutGrid className="h-5 w-5" aria-hidden="true" />
            Annonser ({initialAds.length})
          </button>
          <button
            id="tab-reviews"
            role="tab"
            aria-selected={activeTab === "reviews"}
            aria-controls="panel-reviews"
            onClick={() => setActiveTab("reviews")}
            className={`flex-1 py-6 flex items-center justify-center gap-2 font-black uppercase italic tracking-tighter transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-600 ${
              activeTab === "reviews"
                ? "text-blue-600 border-b-4 border-blue-600 bg-white"
                : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
            }`}
          >
            <Star className="h-5 w-5" aria-hidden="true" />
            Omdömen ({reviews.length})
          </button>
        </div>

        <div className="p-6 md:p-12">
          <section
            id="panel-ads"
            role="tabpanel"
            aria-labelledby="tab-ads"
            className={activeTab === "ads" ? "block" : "hidden"}
          >
            <div className="flex flex-col items-center mb-12">
              <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="relative">
                  <label htmlFor="search-ads" className="sr-only">
                    Sök i användarens annonser
                  </label>
                  <Search
                    className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500"
                    aria-hidden="true"
                  />
                  <input
                    id="search-ads"
                    type="text"
                    placeholder="Sök i utbudet..."
                    className="w-full pl-11 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-slate-950 font-medium transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="relative">
                  <label htmlFor="format-filter" className="sr-only">
                    Filtrera på format
                  </label>
                  <Filter
                    className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500"
                    aria-hidden="true"
                  />
                  <select
                    id="format-filter"
                    className="w-full pl-11 pr-10 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 appearance-none text-slate-950 font-black uppercase italic tracking-tighter cursor-pointer transition-all"
                    value={formatFilter}
                    onChange={(e) => setFormatFilter(e.target.value)}
                  >
                    <option value="Alla">Alla format</option>
                    <option value="4K UHD">4K UHD</option>
                    <option value="Blu-ray">Blu-ray</option>
                    <option value="DVD">DVD</option>
                    <option value="VHS">VHS</option>
                  </select>
                  <ChevronDown
                    className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none"
                    aria-hidden="true"
                  />
                </div>

                <div className="relative">
                  <label htmlFor="sort-ads" className="sr-only">
                    Sortera annonser
                  </label>
                  <ArrowUpDown
                    className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500"
                    aria-hidden="true"
                  />
                  <select
                    id="sort-ads"
                    className="w-full pl-11 pr-10 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 appearance-none text-slate-950 font-black uppercase italic tracking-tighter cursor-pointer transition-all"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="newest">Nya först</option>
                    <option value="price_asc">Pris: Lågt till högt</option>
                    <option value="price_desc">Pris: Högt till lågt</option>
                  </select>
                  <ChevronDown
                    className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none"
                    aria-hidden="true"
                  />
                </div>
              </div>
            </div>

            {processedAds.length === 0 ? (
              <div
                className="flex flex-col items-center py-20 text-center"
                role="status"
              >
                <div className="bg-slate-50 p-6 rounded-full mb-6 text-slate-300">
                  <Package className="h-12 w-12" aria-hidden="true" />
                </div>
                <p className="text-slate-600 text-lg font-bold uppercase italic tracking-tight">
                  Inga annonser matchar dina val.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-y-12 gap-x-4 sm:gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {processedAds.map((ad) => (
                  <div
                    key={ad.id}
                    className={`relative transition-all duration-300 ${
                      ad.is_sold ? "grayscale opacity-50" : ""
                    }`}
                  >
                    <AdCard ad={ad} />
                    {ad.is_sold && (
                      <div className="absolute inset-0 bg-slate-950/40 flex items-center justify-center rounded-2xl pointer-events-none z-10">
                        <span className="text-[10px] sm:text-xs bg-white text-slate-950 font-black px-3 py-1.5 rounded-lg shadow-2xl rotate-[-10deg] uppercase border-2 border-slate-950 tracking-tighter italic">
                          Såld
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          <section
            id="panel-reviews"
            role="tabpanel"
            aria-labelledby="tab-reviews"
            className={activeTab === "reviews" ? "block" : "hidden"}
          >
            <div className="max-w-3xl mx-auto py-4">
              {reviews.length === 0 ? (
                <div
                  className="flex flex-col items-center py-16 text-center"
                  role="status"
                >
                  <div className="bg-amber-50 p-6 rounded-full mb-6 text-amber-500">
                    <MessageSquare className="h-12 w-12" aria-hidden="true" />
                  </div>
                  <h3 className="text-xl font-black text-slate-950 uppercase italic tracking-tighter mb-2">
                    Inga omdömen ännu
                  </h3>
                  <p className="text-slate-600 font-medium">
                    Bli den första som handlar hos denna säljare!
                  </p>
                </div>
              ) : (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {reviews.map((review) => (
                    <article
                      key={review.id}
                      className="bg-slate-50 p-6 rounded-[2rem] border-2 border-slate-100 transition-all hover:border-blue-200"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <Link
                          href={`/users/${review.reviewer_id}`}
                          className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full pr-4"
                        >
                          <div className="h-12 w-12 rounded-full bg-white border-2 border-slate-200 overflow-hidden relative shadow-sm group-hover:border-blue-400 transition-colors">
                            {review.reviewer?.avatar_url ? (
                              <Image
                                src={review.reviewer.avatar_url}
                                alt={`Profilbild för ${review.reviewer.username}`}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <UserIcon
                                className="h-full w-full p-2.5 text-slate-300"
                                aria-hidden="true"
                              />
                            )}
                          </div>
                          <div>
                            <p className="font-black text-slate-950 uppercase italic tracking-tighter group-hover:text-blue-600 transition-colors">
                              {review.reviewer?.username || "Användare"}
                            </p>
                            <div
                              className="flex items-center gap-0.5"
                              aria-label={`Betyg: ${review.rating} av 5 stjärnor`}
                            >
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                  key={s}
                                  className={`h-3.5 w-3.5 ${
                                    review.rating >= s
                                      ? "text-amber-500 fill-amber-500"
                                      : "text-slate-300"
                                  }`}
                                  aria-hidden="true"
                                />
                              ))}
                            </div>
                          </div>
                        </Link>

                        <time
                          dateTime={review.created_at}
                          className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-white px-3 py-1 rounded-full border border-slate-200"
                        >
                          {new Date(review.created_at).toLocaleDateString(
                            "sv-SE"
                          )}
                        </time>
                      </div>
                      <p className="text-slate-800 leading-relaxed font-bold italic text-base bg-white/50 p-4 rounded-2xl border border-white">
                        &quot;{review.comment}&quot;
                      </p>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
