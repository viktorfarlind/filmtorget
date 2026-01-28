import Link from "next/link";
import Image from "next/image";
import { AlertCircle, Disc } from "lucide-react";

interface AdProps {
  id: string;
  title: string;
  price: number;
  format: string;
  image_url: string | null;
  is_steelbook: boolean;
  created_at: string;
}

export default function AdCard({ ad }: { ad: AdProps }) {
  const getFormatStyle = (format: string) => {
    switch (format) {
      case "Blu-ray":
        return {
          border: "border-blue-500",
          shadow: "hover:shadow-blue-500/20",
          badge: "bg-blue-100 text-blue-700 border-blue-200",
        };
      case "4K UHD":
        return {
          border: "border-slate-900",
          shadow: "hover:shadow-slate-900/20",
          badge: "bg-slate-900 text-white border-slate-700",
        };
      case "DVD":
        return {
          border: "border-gray-400",
          shadow: "hover:shadow-gray-400/20",
          badge: "bg-gray-100 text-gray-700 border-gray-300",
        };
      case "VHS":
        return {
          border: "border-orange-500",
          shadow: "hover:shadow-orange-500/20",
          badge: "bg-orange-100 text-orange-800 border-orange-200",
        };
      default:
        return {
          border: "border-slate-200",
          shadow: "hover:shadow-slate-300/20",
          badge: "bg-slate-100 text-slate-600 border-slate-200",
        };
    }
  };

  const style = getFormatStyle(ad.format);

  return (
    <Link href={`/ads/${ad.id}`} className="group flex flex-col h-full">
      {/* KORTET */}
      <div
        className={`
        relative overflow-hidden rounded-xl bg-white 
        border-[1.5px] ${style.border} 
        transition-all duration-300 
        group-hover:-translate-y-1 group-hover:shadow-xl ${style.shadow}
      `}
      >
        <div className="aspect-2/3 relative bg-slate-100">
          {ad.image_url ? (
            <Image
              src={ad.image_url}
              alt={ad.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-300">
              <AlertCircle className="h-10 w-10" />
            </div>
          )}

          {ad.is_steelbook && (
            <div className="absolute top-0 left-0 w-full bg-linear-to-b from-black/60 to-transparent p-2">
              <span className="inline-block bg-amber-400 text-amber-950 text-[10px] font-extrabold px-2 py-0.5 rounded shadow-sm uppercase tracking-wider border border-amber-300">
                Steelbook
              </span>
            </div>
          )}

          <div className="absolute bottom-2 right-2">
            <div className="bg-white/95 backdrop-blur-md px-2 py-1 rounded-md shadow-sm border border-slate-100">
              <span className="block font-bold text-slate-900 leading-none text-sm">
                {ad.price} kr
              </span>
            </div>
          </div>
        </div>

        <div className="p-3 flex flex-col gap-1.5">
          <h3
            className="font-bold text-slate-800 text-sm truncate leading-tight"
            title={ad.title}
          >
            {ad.title}
          </h3>

          <div className="flex items-center justify-between mt-auto">
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${style.badge}`}
            >
              {ad.format}
            </span>
            <span className="text-[10px] text-slate-400">
              {new Date(ad.created_at).toLocaleDateString("sv-SE", {
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
