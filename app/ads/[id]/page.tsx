import { supabase } from "@/utils/supabaseClient";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  User,
  MessageCircle,
  ShieldCheck,
  MapPin,
  Globe,
  Disc,
  Layers,
} from "lucide-react";
import { notFound } from "next/navigation";
import AdOwnerControls from "@/components/AdOwnerControls";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function AdDetailsPage(props: Props) {
  const params = await props.params;

  const { data: ad, error } = await supabase
    .from("ads")
    .select(
      `
      *,
      profiles (
        username,
        avatar_url,
        id
      )
    `
    )
    .eq("id", params.id)
    .single();

  if (error || !ad) {
    return notFound();
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isOwner = user && ad.user_id === user.id;

  // Förbättrad logik för säljarnamn:
  // 1. Profilens användarnamn
  // 2. Delen före @ i mejladressen (om den sparats i annonsen)
  // 3. Fallback till "Säljare"
  const sellerName = ad.profiles?.username || ad.user_email?.split('@')[0] || "Säljare";

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

  const contactLink = `mailto:${ad.user_email}?subject=${encodeURIComponent(`Intresserad av: ${ad.title}`)}&body=${encodeURIComponent(`Hejsan! Jag såg din annons på Filmtorget för ${ad.title} (${ad.price} kr) och är intresserad av att köpa den. Finns den kvar?`)}`;

  return (
    <div className="min-h-screen bg-white pb-24">
      <div className="relative h-[40vh] w-full overflow-hidden bg-slate-900">
        <div className="absolute inset-0 opacity-50 blur-3xl scale-110">
          <Image src={ad.image_url} alt="" fill className="object-cover" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-white" />

        <div className="absolute top-6 left-4 z-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-full font-medium hover:bg-white/30 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Tillbaka
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-32 relative z-10">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/3 flex-shrink-0">
            <div className="aspect-[2/3] relative rounded-lg shadow-2xl overflow-hidden border-4 border-white bg-slate-200">
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
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight mb-2">
                {ad.title}
              </h1>
              <p className="text-3xl font-bold text-blue-600">{ad.price} kr</p>
            </div>

            <Link href={`/users/${ad.user_id}`} className="block group">
              <div className="bg-slate-50 rounded-xl p-4 flex items-center justify-between border border-slate-100 mb-8 group-hover:border-blue-200 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden border border-slate-300 relative">
                    {ad.profiles?.avatar_url ? (
                      <Image src={ad.profiles.avatar_url} alt="" fill className="object-cover" />
                    ) : (
                      <User className="h-6 w-6 text-slate-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium uppercase">
                      Säljes av
                    </p>
                    <p className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {sellerName}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-green-600 text-xs font-bold bg-green-50 px-2 py-1 rounded">
                  <ShieldCheck className="h-3 w-3" /> Verifierad
                </div>
              </div>
            </Link>

            <h3 className="font-bold text-lg mb-4 text-slate-900">
              Specifikationer
            </h3>
            <div className="grid grid-cols-2 gap-3 mb-8">
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

            <div className="prose prose-slate max-w-none mb-4">
              <h3 className="font-bold text-lg mb-2 text-slate-900">
                Beskrivning
              </h3>
              <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                {ad.description || "Ingen beskrivning angiven av säljaren."}
              </p>
            </div>
            <AdOwnerControls adId={ad.id} sellerId={ad.user_id} />
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-slate-100 p-4 pb-6 safe-area-bottom z-50">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="hidden sm:block">
            <p className="text-xs text-slate-500">Pris</p>
            <p className="text-xl font-bold text-slate-900">{ad.price} kr</p>
          </div>

          {!isOwner ? (
            <Link 
              href={contactLink}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-6 rounded-full shadow-lg hover:shadow-blue-900/20 transition-all flex items-center justify-center gap-2 text-center"
            >
              <MessageCircle className="h-5 w-5" />
              Kontakta säljaren
            </Link>
          ) : (
            <div className="flex-1 text-center text-sm text-slate-500 italic">
              Detta är din annons
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
    <div className="bg-white border border-slate-100 p-3 rounded-lg flex items-center gap-3 shadow-sm">
      <div className="bg-slate-50 p-2 rounded-md">
        <Icon className="h-4 w-4 text-slate-500" />
      </div>
      <div>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">
          {label}
        </p>
        <p className="text-sm font-semibold text-slate-900">{value}</p>
      </div>
    </div>
  );
}