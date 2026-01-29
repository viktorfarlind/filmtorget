"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabaseClient";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  User,
  MapPin,
  Globe,
  Disc,
  Layers,
  ShieldCheck,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import AdOwnerControls from "@/components/AdOwnerControls";
import ContactSellerButton from "@/components/ContactSellerButton";

export default function AdDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const [ad, setAd] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAd = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);

      const { data, error } = await supabase
        .from("ads")
        .select(`*, profiles (username, avatar_url, id)`)
        .eq("id", params.id)
        .single();

      if (error || !data) {
        setLoading(false);
        return;
      }

      setAd(data);
      setLoading(false);
    };

    if (params.id) fetchAd();
  }, [params.id]);

  const getFormatColor = (format: string) => {
    switch (format) {
      case "Blu-ray":
        return "bg-blue-600 text-white";
      case "4K UHD":
        return "bg-slate-900 text-white";
      case "DVD":
        return "bg-gray-200 text-gray-800";
      case "VHS":
        return "bg-orange-600 text-white";
      default:
        return "bg-slate-200 text-slate-800";
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );

  if (!ad)
    return (
      <div className="text-center py-20 font-bold">Annonsen hittades inte</div>
    );

  const isOwner = user && ad.user_id === user.id;

  return (
    <div className="min-h-screen bg-white pb-24 text-slate-900">
      <div className="relative h-[40vh] w-full overflow-hidden bg-slate-900">
        <div
          className={`absolute inset-0 blur-3xl scale-110 opacity-50 transition-all duration-500 ${
            ad.is_sold ? "grayscale" : ""
          }`}
        >
          <Image src={ad.image_url} alt="" fill className="object-cover" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-white" />
        <div className="absolute top-6 left-4 z-10">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-full font-medium hover:bg-white/30 transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" /> Tillbaka
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-32 relative z-10">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/3 flex-shrink-0">
            <div
              className={`aspect-[2/3] relative rounded-lg shadow-2xl overflow-hidden border-4 border-white bg-slate-200 transition-all duration-500 ${
                ad.is_sold ? "grayscale opacity-75" : ""
              }`}
            >
              <Image
                src={ad.image_url}
                alt={ad.title}
                fill
                className="object-cover"
                priority
              />
              {ad.is_steelbook && (
                <div className="absolute top-4 right-4 bg-amber-400 text-amber-950 px-3 py-1 rounded shadow-lg font-bold text-xs uppercase tracking-wider border border-amber-300">
                  Steelbook
                </div>
              )}
              {ad.is_sold && (
                <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center">
                  <div className="bg-white text-slate-900 font-black text-xs px-4 py-2 rounded shadow-xl rotate-[-5deg] border-2 border-slate-900 uppercase">
                    Såld
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 pt-4 md:pt-12">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <span
                  className={`px-3 py-1 rounded-md text-xs font-bold shadow-sm ${getFormatColor(
                    ad.format
                  )}`}
                >
                  {ad.format}
                </span>
                <span className="text-slate-500 text-sm flex items-center gap-1 font-medium">
                  <MapPin className="h-3 w-3" />{" "}
                  {ad.region_code ? `Region ${ad.region_code}` : "Region Fri"}
                </span>
                {ad.is_sold && (
                  <span className="flex items-center gap-1 bg-emerald-100 text-emerald-700 text-[10px] font-black px-2 py-1 rounded uppercase animate-pulse">
                    <CheckCircle2 className="h-3 w-3" /> Såld
                  </span>
                )}
              </div>
              <h1
                className={`text-3xl md:text-4xl font-extrabold leading-tight mb-2 transition-colors duration-500 ${
                  ad.is_sold ? "text-slate-400" : "text-slate-900"
                }`}
              >
                {ad.title}
              </h1>
              <p
                className={`text-3xl font-bold transition-colors duration-500 ${
                  ad.is_sold ? "text-slate-400" : "text-blue-600"
                }`}
              >
                {ad.price} kr
              </p>
            </div>

            <Link
              href={`/users/${ad.user_id}`}
              className="block group mb-8 cursor-pointer"
            >
              <div className="bg-slate-50 rounded-xl p-4 flex items-center justify-between border border-slate-100 group-hover:border-blue-200 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden border border-slate-300 relative shadow-inner">
                    {ad.profiles?.avatar_url ? (
                      <Image
                        src={ad.profiles.avatar_url}
                        alt=""
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <User className="h-6 w-6 text-slate-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium uppercase">
                      Säljes av
                    </p>
                    <p className="font-bold group-hover:text-blue-600 transition-colors">
                      {ad.profiles?.username || "Säljare"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-green-600 text-xs font-bold bg-green-50 px-2 py-1 rounded">
                  <ShieldCheck className="h-3 w-3" /> Verifierad
                </div>
              </div>
            </Link>

            <h3 className="font-bold text-lg mb-4">Specifikationer</h3>
            <div className="grid grid-cols-2 gap-3 mb-8 text-slate-900">
              <SpecItem icon={Disc} label="Format" value={ad.format} />
              <SpecItem icon={Layers} label="Skick" value={ad.condition} />
              <SpecItem
                icon={Globe}
                label="Region"
                value={ad.region_code || "-"}
              />
              <SpecItem
                icon={ShieldCheck}
                label="Utgåva"
                value={ad.is_steelbook ? "Steelbook" : "Standard"}
              />
            </div>

            <div className="prose prose-slate max-w-none mb-8">
              <h3 className="font-bold text-lg mb-2">Beskrivning</h3>
              <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                {ad.description || "Ingen beskrivning angiven av säljaren."}
              </p>
            </div>

            <AdOwnerControls
              adId={ad.id}
              sellerId={ad.user_id}
              isSold={ad.is_sold}
            />
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-slate-100 p-4 pb-6 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="hidden sm:block">
            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">
              Pris
            </p>
            <p
              className={`text-xl font-bold transition-colors duration-500 ${
                ad.is_sold ? "text-slate-400" : "text-slate-900"
              }`}
            >
              {ad.price} kr
            </p>
          </div>

          {!isOwner ? (
            <>
              {ad.is_sold ? (
                <div className="flex-1 bg-slate-100 text-slate-400 py-3 rounded-xl font-black text-center uppercase tracking-widest text-sm border border-slate-200">
                  Såld
                </div>
              ) : (
                <ContactSellerButton
                  adId={ad.id}
                  sellerId={ad.user_id}
                  buyerId={user?.id}
                />
              )}
            </>
          ) : (
            <div className="flex-1 text-center text-sm text-slate-500 font-bold italic bg-slate-50 py-3 rounded-xl border border-slate-100 uppercase tracking-tighter">
              {ad.is_sold
                ? "Din film är markerad som såld"
                : "Du får inte köpa din egen film!"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SpecItem({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-white border border-slate-100 p-3 rounded-lg flex items-center gap-3 shadow-sm hover:border-slate-200 transition-colors">
      <div className="bg-slate-50 p-2 rounded-md">
        <Icon className="h-4 w-4 text-slate-500" />
      </div>
      <div>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">
          {label}
        </p>
        <p className="text-sm font-semibold">{value}</p>
      </div>
    </div>
  );
}
