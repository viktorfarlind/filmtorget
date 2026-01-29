"use client";

import Link from "next/link";
import { Disc, Github, Twitter, Mail, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-white/5">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1 md:col-span-1">
            <Link
              href="/"
              className="flex items-center gap-2 mb-4 group transition-transform active:scale-95"
            >
              <div className="bg-blue-600 p-1.5 rounded-lg -rotate-6 group-hover:rotate-0 transition-all duration-300 shadow-lg shadow-blue-600/20">
                <Disc className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-black tracking-tighter text-white uppercase italic">
                Film<span className="text-blue-500 not-italic">torget</span>
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
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  4K Ultra HD
                </Link>
              </li>
              <li>
                <Link
                  href="/?format=Blu-ray"
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Blu-ray
                </Link>
              </li>
              <li>
                <Link
                  href="/?format=DVD"
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  DVD
                </Link>
              </li>
              <li>
                <Link
                  href="/?format=VHS"
                  className="hover:text-white transition-colors cursor-pointer"
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
                <Link
                  href="#"
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Om Filmtorget
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Säkerhet & Regler
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Köpvillkor
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="hover:text-white transition-colors cursor-pointer"
                >
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
                aria-label="Följ oss på Twitter"
                className="bg-slate-900 p-2 rounded-full hover:bg-blue-600 hover:text-white transition-all cursor-pointer"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="#"
                aria-label="Besök vår GitHub"
                className="bg-slate-900 p-2 rounded-full hover:bg-black hover:text-white transition-all cursor-pointer"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="mailto:hej@filmtorget.se"
                aria-label="Skicka e-post till oss"
                className="bg-slate-900 p-2 rounded-full hover:bg-red-500 hover:text-white transition-all cursor-pointer"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
            <p className="text-xs text-slate-400">
              Prenumerera på nyhetsbrevet för att inte missa sällsynta släpp.
            </p>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-400">
            &copy; {new Date().getFullYear()} Filmtorget. Alla rättigheter
            reserverade.
          </p>
          <p className="text-xs flex items-center gap-1 text-slate-400">
            Skapat med <Heart className="h-3 w-3 text-red-500 fill-red-500" />{" "}
            av Viktor Färlind
          </p>
        </div>
      </div>
    </footer>
  );
}
