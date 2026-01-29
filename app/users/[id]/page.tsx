"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabaseClient";
import Image from "next/image";
import {
  User,
  Package,
  Calendar,
  ArrowLeft,
  Star,
  Loader2,
} from "lucide-react";
import { useParams } from "next/navigation";
import Link from "next/link";
import PublicProfileContent from "@/components/PublicProfileContent";

export default function PublicProfilePage() {
  const params = useParams();
  const [profile, setProfile] = useState<any>(null);
  const [ads, setAds] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!params.id) return;

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", params.id)
        .single();

      const { data: adsData } = await supabase
        .from("ads")
        .select("*")
        .eq("user_id", params.id)
        .order("is_sold", { ascending: true })
        .order("created_at", { ascending: false });

      const { data: reviewsData } = await supabase
        .from("reviews")
        .select("*")
        .eq("receiver_id", params.id);

      setProfile(profileData);
      setAds(adsData || []);
      setReviews(reviewsData || []);
      setLoading(false);
    };

    fetchProfileData();
  }, [params.id]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );

  if (!profile)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-900 font-black uppercase italic">
        Användaren hittades inte
      </div>
    );

  const reviewCount = reviews.length;
  const averageRating =
    reviewCount > 0
      ? Math.round(
          reviews.reduce((acc, item) => acc + item.rating, 0) / reviewCount
        )
      : 0;

  const joinDate = profile.created_at
    ? new Date(profile.created_at).toLocaleDateString("sv-SE", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "en tid tillbaka";

  const activeAdsCount = ads.filter((ad) => !ad.is_sold).length;

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      <div className="bg-slate-950 text-white pt-24 pb-32 relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 text-center relative z-10">
          <Link
            href="/"
            className="absolute top-0 left-0 inline-flex items-center gap-2 text-slate-300 hover:text-white transition-colors text-xs font-bold bg-white/10 px-4 py-2 rounded-full backdrop-blur-md focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <ArrowLeft className="h-4 w-4" /> Tillbaka
          </Link>

          <div className="flex flex-col items-center">
            <div className="h-32 w-32 rounded-full bg-slate-800 border-4 border-slate-700 overflow-hidden relative mb-6 shadow-2xl flex items-center justify-center">
              {profile.avatar_url ? (
                <Image
                  src={profile.avatar_url}
                  alt={profile.username}
                  fill
                  className="object-cover"
                />
              ) : (
                <User className="h-14 w-14 text-slate-600" />
              )}
            </div>

            <h1 className="text-4xl sm:text-5xl font-black tracking-tighter mb-2 uppercase italic">
              {profile.username}
            </h1>

            <div className="flex flex-col items-center gap-2 mb-8">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-5 w-5 ${
                      averageRating >= star
                        ? "text-amber-400 fill-amber-400"
                        : "text-slate-700"
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">
                {reviewCount > 0 ? `${reviewCount} omdömen` : "Inga omdömen än"}
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wide text-slate-200">
                <Package className="h-4 w-4 text-blue-500" />
                {activeAdsCount} aktiva annonser
              </div>
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wide text-slate-200">
                <Calendar className="h-4 w-4 text-blue-500" />
                Medlem sedan {joinDate}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 relative -mt-16 z-20">
        <PublicProfileContent initialAds={ads} userId={params.id as string} />
      </div>
    </div>
  );
}
