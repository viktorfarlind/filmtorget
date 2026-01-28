import Link from "next/link";
import { Film, Github, Twitter, Mail, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-900">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4 group">
              <div className="bg-blue-600 p-1.5 rounded-lg group-hover:bg-blue-500 transition-colors">
                <Film className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight text-white">
                Filmtorget
              </span>
            </Link>
            <p className="text-sm leading-relaxed mb-4">
              Sveriges dedikerade marknadsplats för filmsamlare. Köp, sälj och
              hitta limiterade utgåvor tryggt och enkelt.
            </p>
          </div>

          <div>
            <h3 className="text-white font-bold mb-4">Utforska</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/?format=4K%20UHD"
                  className="hover:text-white transition-colors"
                >
                  4K Ultra HD
                </Link>
              </li>
              <li>
                <Link
                  href="/?format=Steelbook"
                  className="hover:text-white transition-colors"
                >
                  Steelbooks
                </Link>
              </li>
              <li>
                <Link
                  href="/?format=Blu-ray"
                  className="hover:text-white transition-colors"
                >
                  Blu-ray
                </Link>
              </li>
              <li>
                <Link
                  href="/?format=VHS"
                  className="hover:text-white transition-colors"
                >
                  VHS
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold mb-4">Information</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Om Filmtorget
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Säkerhet & Regler
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Köpvillkor
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Kontakta Support
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold mb-4">Häng med</h3>
            <div className="flex gap-4 mb-4">
              <a
                href="#"
                className="bg-slate-900 p-2 rounded-full hover:bg-blue-600 hover:text-white transition-all"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="bg-slate-900 p-2 rounded-full hover:bg-black hover:text-white transition-all"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="mailto:hej@filmtorget.se"
                className="bg-slate-900 p-2 rounded-full hover:bg-red-500 hover:text-white transition-all"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
            <p className="text-xs text-slate-500">
              Prenumerera på nyhetsbrevet för att inte missa sällsynta släpp.
            </p>
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div className="pt-8 border-t border-slate-900 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-600">
            &copy; {new Date().getFullYear()} Filmtorget. Alla rättigheter
            reserverade.
          </p>
          <p className="text-xs flex items-center gap-1">
            Skapat med <Heart className="h-3 w-3 text-red-500 fill-red-500" />{" "}
            av Viktor Färlind
          </p>
        </div>
      </div>
    </footer>
  );
}
