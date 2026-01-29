"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabaseClient";
import Image from "next/image";
import { LogOut, Plus, User, Loader2, Pencil, Star } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import PublicProfileContent from "@/components/PublicProfileContent";
import Link from "next/link";

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [myAds, setMyAds] = useState<any[]>([]);
  const [reviewStats, setReviewStats] = useState({ count: 0, average: 0 });

  useEffect(() => {
    const getData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }
      setUser(user);

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      setProfile(profileData);

      const { data: ads } = await supabase
        .from("ads")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (ads) setMyAds(ads);

      const { data: reviews } = await supabase
        .from("reviews")
        .select("rating")
        .eq("receiver_id", user.id);

      if (reviews && reviews.length > 0) {
        const avg = Math.round(
          reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
        );
        setReviewStats({ count: reviews.length, average: avg });
      }

      setLoading(false);
    };

    getData();
  }, [router]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      const file = e.target.files?.[0];
      if (!file) return;

      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/${uuidv4()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(fileName);

      await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", user.id);

      setProfile({ ...profile, avatar_url: publicUrl });
      router.refresh();
    } catch (error: any) {
      alert("Kunde inte ladda upp bilden: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const soldAdsCount = myAds.filter((ad) => ad.is_sold).length;
  const activeAdsCount = myAds.filter((ad) => !ad.is_sold).length;

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <div className="bg-slate-950 text-white pt-24 pb-32 relative">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex flex-col items-center">
            <div className="relative mb-6">
              <div className="h-28 w-28 rounded-full bg-slate-800 border-4 border-slate-700 overflow-hidden relative shadow-2xl flex items-center justify-center">
                {profile?.avatar_url ? (
                  <Image
                    src={profile.avatar_url}
                    alt="Profilbild"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <User className="h-12 w-12 text-slate-500" />
                )}
                {uploading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
                    <Loader2 className="h-6 w-6 animate-spin text-white" />
                  </div>
                )}
              </div>
              <label className="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full text-white shadow-lg cursor-pointer hover:bg-blue-700 transition-colors border-2 border-slate-950 z-30">
                <Pencil className="h-3 w-3" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                  disabled={uploading}
                />
              </label>
            </div>

            <h1 className="text-4xl font-black tracking-tight mb-2">
              {profile?.username || user.email?.split("@")[0]}
            </h1>

            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-5 w-5 ${
                      reviewStats.average >= star
                        ? "text-amber-400 fill-amber-400"
                        : "text-slate-700"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-bold text-slate-400">
                {reviewStats.count > 0
                  ? `(${reviewStats.count} omdömen)`
                  : "(Inga omdömen)"}
              </span>
            </div>

            <p className="text-slate-400 text-sm mb-8 font-medium">
              {user.email}
            </p>

            <div className="flex flex-wrap gap-3 justify-center mb-10">
              <Link
                href="/create-ad"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-full transition-all shadow-lg shadow-blue-600/20 active:scale-95 cursor-pointer"
              >
                <Plus className="h-4 w-4" /> Skapa annons
              </Link>
              <button
                onClick={handleSignOut}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-white/10 border border-white/10 hover:bg-white/20 text-white text-sm font-bold rounded-full transition-all active:scale-95 cursor-pointer"
              >
                <LogOut className="h-4 w-4" /> Logga ut
              </button>
            </div>

            <div className="flex gap-10">
              <div className="text-center">
                <span className="block text-3xl font-extrabold text-white">
                  {activeAdsCount}
                </span>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Aktiva
                </span>
              </div>
              <div className="text-center">
                <span className="block text-3xl font-extrabold text-emerald-500">
                  {soldAdsCount}
                </span>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Sålda
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 relative -mt-16 z-20">
        {user && <PublicProfileContent initialAds={myAds} userId={user.id} />}
      </div>
    </div>
  );
}
