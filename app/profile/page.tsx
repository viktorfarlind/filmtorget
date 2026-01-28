"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabaseClient";
import Link from "next/link";
import Image from "next/image";
import {
  LogOut,
  Plus,
  Package,
  User,
  Loader2,
  Camera,
  Pencil,
} from "lucide-react";
import AdCard from "@/components/AdCard";
import { v4 as uuidv4 } from "uuid";

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [myAds, setMyAds] = useState<any[]>([]);

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
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", user.id);

      if (updateError) throw updateError;

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
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative">
              <div className="h-32 w-32 rounded-full bg-slate-100 border-4 border-white shadow-xl overflow-hidden flex items-center justify-center text-slate-400 relative">
                {profile?.avatar_url ? (
                  <Image
                    src={profile.avatar_url}
                    alt="Profilbild"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <User className="h-12 w-12" />
                )}

                {uploading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
                    <Loader2 className="h-6 w-6 animate-spin text-white" />
                  </div>
                )}
              </div>

              <label className="absolute bottom-0 right-0 bg-blue-600 p-2.5 rounded-full text-white shadow-lg cursor-pointer hover:bg-blue-700 transition-colors border-2 border-white z-30">
                {profile?.avatar_url ? (
                  <Pencil className="h-4 w-4" />
                ) : (
                  <Camera className="h-4 w-4" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                  disabled={uploading}
                />
              </label>
            </div>

            <div className="text-center md:text-left flex-1">
              <h1 className="text-3xl font-extrabold text-slate-900 mb-1">
                {profile?.username || user.email?.split("@")[0]}
              </h1>
              <p className="text-slate-500 text-sm mb-6 flex items-center justify-center md:justify-start gap-2">
                {user.email}
              </p>

              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                <Link
                  href="/create-ad"
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-full transition-all shadow-lg shadow-blue-600/20 active:scale-95"
                >
                  <Plus className="h-4 w-4" /> Skapa annons
                </Link>
                <button
                  onClick={handleSignOut}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-bold rounded-full transition-all active:scale-95"
                >
                  <LogOut className="h-4 w-4" /> Logga ut
                </button>
              </div>
            </div>

            <div className="flex gap-10 border-t md:border-t-0 md:border-l border-slate-100 pt-6 md:pt-0 md:pl-10 mt-6 md:mt-0">
              <div className="text-center">
                <span className="block text-3xl font-extrabold text-slate-900">
                  {myAds.length}
                </span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Annonser
                </span>
              </div>
              <div className="text-center">
                <span className="block text-3xl font-extrabold text-slate-900">
                  0
                </span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Sålda
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-slate-200 rounded-lg">
            <Package className="h-5 w-5 text-slate-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Dina filmer till salu
          </h2>
        </div>

        {myAds.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-slate-200">
            <div className="inline-flex bg-slate-50 p-5 rounded-full mb-4">
              <Package className="h-10 w-10 text-slate-300" />
            </div>
            <p className="text-slate-900 font-bold text-lg">
              Här var det tomt!
            </p>
            <p className="text-slate-500 mb-6">
              Börja rensa i hyllan och tjäna en slant.
            </p>
            <Link
              href="/create-ad"
              className="bg-slate-900 text-white px-8 py-3 rounded-full font-bold hover:bg-slate-800 transition-colors shadow-xl"
            >
              Lägg upp din första film
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:gap-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {myAds.map((ad) => (
              <AdCard key={ad.id} ad={ad} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
