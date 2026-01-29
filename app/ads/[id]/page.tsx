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
        return "bg-slate-200 text-slate-900"; 
      case "VHS":
        return "bg-orange-700 text-white"; 
      default:
        return "bg-slate-200 text-slate-900";
    }
  };

  if (loading)
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-white"
        role="status"
      >
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="sr-only">Laddar annons...</span>
      </div>
    );

  if (!ad)
    return (
      <div
        className="text-center py-20 font-black uppercase italic text-slate-900"
        role="alert"
      >
        Annonsen hittades inte
      </div>
    );

  const isOwner = user && ad.user_id === user.id;

  return (
    <main className="min-h-screen bg-white pb-24 text-slate-900">
      <div className="relative h-[40vh] w-full overflow-hidden bg-slate-900">
        <div
          className={`absolute inset-0 blur-3xl scale-110 opacity-50 transition-all duration-500 ${
            ad.is_sold ? "grayscale" : ""
          }`}
        >
          <Image
            src={ad.image_url}
            alt=""
            fill
            className="object-cover"
            aria-hidden="true"
          />
        </div>
        <div className="absolute inset-0 bg-linear-to-b from-black/40 via-transparent to-white" />
        <div className="absolute top-6 left-4 z-10">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 bg-slate-900/60 backdrop-blur-md text-white px-5 py-2.5 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-slate-900/80 transition-all cursor-pointer focus:ring-4 focus:ring-blue-500 outline-none"
            aria-label="Gå tillbaka till föregående sida"
          >
            <ArrowLeft className="h-4 w-4" /> Tillbaka
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-32 relative z-10">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/3 shrink-0">
            <div
              className={`aspect-2/3 relative rounded-2xl shadow-2xl overflow-hidden border-4 border-white bg-slate-200 transition-all duration-500 ${
                ad.is_sold ? "grayscale opacity-75" : ""
              }`}
            >
              <Image
                src={ad.image_url}
                alt={`Filmomslag: ${ad.title}`}
                fill
                className="object-cover"
                priority
              />
              {ad.is_steelbook && (
                <div className="absolute top-4 right-4 bg-amber-400 text-amber-950 px-3 py-1.5 rounded-lg shadow-lg font-black text-[10px] uppercase tracking-wider border border-amber-300">
                  Steelbook
                </div>
              )}
              {ad.is_sold && (
                <div className="absolute inset-0 bg-slate-900/50 flex items-center justify-center">
                  <div className="bg-white text-slate-900 font-black text-sm px-6 py-3 rounded-lg shadow-2xl rotate-[-10deg] border-2 border-slate-900 uppercase italic">
                    Såld
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 pt-4 md:pt-12">
            <header className="mb-6">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span
                  className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest shadow-sm ${getFormatColor(
                    ad.format
                  )}`}
                >
                  {ad.format}
                </span>
                <span className="text-slate-600 text-xs flex items-center gap-1 font-bold uppercase tracking-tight">
                  <MapPin className="h-3.5 w-3.5" aria-hidden="true" />{" "}
                  {ad.region_code ? `Region ${ad.region_code}` : "Region Fri"}
                </span>
                {ad.is_sold && (
                  <span className="flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-1 rounded uppercase">
                    <CheckCircle2 className="h-3 w-3" aria-hidden="true" /> Såld
                  </span>
                )}
              </div>
              <h1
                className={`text-4xl md:text-5xl font-black tracking-tighter mb-2 uppercase italic leading-none transition-colors duration-500 ${
                  ad.is_sold ? "text-slate-400" : "text-slate-950"
                }`}
              >
                {ad.title}
              </h1>
              <p
                className={`text-4xl font-black italic tracking-tighter transition-colors duration-500 ${
                  ad.is_sold ? "text-slate-400" : "text-blue-600"
                }`}
              >
                {ad.price}{" "}
                <span className="text-xl not-italic uppercase font-bold tracking-normal">
                  kr
                </span>
              </p>
            </header>

            <Link
              href={`/users/${ad.user_id}`}
              className="block group mb-10 cursor-pointer outline-none focus:ring-4 focus:ring-blue-500 rounded-2xl"
              aria-label={`Visa säljaren ${ad.profiles?.username}`}
            >
              <div className="bg-slate-50 rounded-2xl p-5 flex items-center justify-between border-2 border-slate-100 group-hover:border-blue-500 transition-all">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden border-2 border-white relative shadow-md">
                    {ad.profiles?.avatar_url ? (
                      <Image
                        src={ad.profiles.avatar_url}
                        alt=""
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <User
                        className="h-6 w-6 text-slate-400"
                        aria-hidden="true"
                      />
                    )}
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-0.5">
                      Säljes av
                    </p>
                    <p className="font-black text-slate-900 group-hover:text-blue-600 transition-colors uppercase italic tracking-tight">
                      {ad.profiles?.username || "Säljare"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-700 text-[10px] font-black bg-emerald-100 px-3 py-1.5 rounded-full border border-emerald-200 uppercase tracking-tight">
                  <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />{" "}
                  Verifierad
                </div>
              </div>
            </Link>

            <h2 className="font-black text-slate-950 uppercase italic tracking-tighter text-xl mb-6">
              Specifikationer
            </h2>
            <div className="grid grid-cols-2 gap-4 mb-10">
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

            <div className="mb-10">
              <h2 className="font-black text-slate-950 uppercase italic tracking-tighter text-xl mb-4">
                Beskrivning
              </h2>
              <p className="text-slate-700 font-medium leading-relaxed whitespace-pre-wrap bg-slate-50 p-6 rounded-2xl border border-slate-100">
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

      <nav className="fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 p-4 pb-8 z-50 shadow-[0_-8px_30px_rgba(0,0,0,0.08)]">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="hidden sm:block">
            <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">
              Pris
            </p>
            <p
              className={`text-3xl font-black italic tracking-tighter transition-colors duration-500 ${
                ad.is_sold ? "text-slate-400" : "text-slate-950"
              }`}
            >
              {ad.price} kr
            </p>
          </div>

          {!isOwner ? (
            <div className="flex-1 sm:flex-initial sm:min-w-50">
              {ad.is_sold ? (
                <div className="w-full bg-slate-100 text-slate-500 py-4 rounded-2xl font-black text-center uppercase tracking-widest text-sm border-2 border-slate-200 italic opacity-70">
                  Såld
                </div>
              ) : (
                <ContactSellerButton
                  adId={ad.id}
                  sellerId={ad.user_id}
                  buyerId={user?.id}
                />
              )}
            </div>
          ) : (
            <div className="flex-1 text-center text-xs text-slate-700 font-black uppercase italic tracking-tight bg-blue-50 border-2 border-blue-100 py-4 rounded-2xl">
              {ad.is_sold
                ? "Din film är markerad som såld"
                : "Du får inte köpa din egen film!"}
            </div>
          )}
        </div>
      </nav>
    </main>
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
    <div className="bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl flex items-center gap-4 transition-all hover:border-blue-200 shadow-sm">
      <div className="bg-white p-2.5 rounded-xl shadow-inner">
        <Icon className="h-5 w-5 text-blue-600" aria-hidden="true" />
      </div>
      <div>
        <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-0.5">
          {label}
        </p>
        <p className="text-sm font-black text-slate-900 uppercase italic tracking-tight">
          {value}
        </p>
      </div>
    </div>
  );
}
