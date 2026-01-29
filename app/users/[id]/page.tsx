import { supabase } from "@/utils/supabaseClient";
import Image from "next/image";
import { User, Package, Calendar, ArrowLeft, Star } from "lucide-react";
import { notFound } from "next/navigation";
import Link from "next/link";
import PublicProfileContent from "@/components/PublicProfileContent";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function PublicProfilePage(props: Props) {
  const params = await props.params;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!profile) return notFound();

  const { data: ads } = await supabase
    .from("ads")
    .select("*")
    .eq("user_id", params.id)
    .order("is_sold", { ascending: true })
    .order("created_at", { ascending: false });

  const { data: reviews } = await supabase
    .from("reviews")
    .select(
      `
      *,
      reviewer:profiles!reviews_reviewer_id_fkey(username, avatar_url)
    `
    )
    .eq("receiver_id", params.id)
    .order("created_at", { ascending: false });

  const reviewCount = reviews?.length || 0;
  const averageRating =
    reviewCount > 0
      ? Math.round(
          reviews!.reduce((acc, item) => acc + item.rating, 0) / reviewCount
        )
      : 0;

  const joinDate = profile.created_at
    ? new Date(profile.created_at).toLocaleDateString("sv-SE", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "en tid tillbaka";

  const activeAdsCount = ads?.filter((ad) => !ad.is_sold).length || 0;

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      <div className="bg-slate-950 text-white pt-24 pb-32 relative">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <Link
            href="/"
            className="absolute top-8 left-6 inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-bold bg-white/5 px-4 py-2 rounded-full backdrop-blur-sm"
          >
            <ArrowLeft className="h-4 w-4" /> Tillbaka
          </Link>

          <div className="flex flex-col items-center">
            <div className="h-28 w-28 rounded-full bg-slate-800 border-4 border-slate-700 overflow-hidden relative mb-6 shadow-2xl">
              {profile.avatar_url ? (
                <Image
                  src={profile.avatar_url}
                  alt=""
                  fill
                  className="object-cover"
                />
              ) : (
                <User className="h-full w-full p-7 text-slate-500" />
              )}
            </div>

            <h1 className="text-4xl font-black tracking-tight mb-2">
              {profile.username}
            </h1>

            <div className="flex items-center gap-2 mb-6">
              <div className="flex items-center">
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
              <span className="text-sm font-bold text-slate-400">
                {reviewCount > 0
                  ? `(${reviewCount} omdömen)`
                  : "(Inga omdömen)"}
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 text-slate-400 text-sm font-medium">
              <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                <Package className="h-4 w-4 text-blue-500" />
                {activeAdsCount} aktiva annonser
              </div>
              <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                <Calendar className="h-4 w-4 text-blue-500" />
                Medlem sedan {joinDate}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 relative -mt-16 z-20">
        <PublicProfileContent initialAds={ads || []} reviews={reviews || []} />
      </div>
    </div>
  );
}
