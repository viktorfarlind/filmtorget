"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabaseClient";
import { useRouter, useSearchParams } from "next/navigation";
import { Disc, Mail, Lock, Loader2, ArrowRight } from "lucide-react";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams.get("view") === "signup") {
      setIsSignUp(true);
    }
  }, [searchParams]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) throw error;
        alert("Kolla din e-post för att bekräfta kontot!");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push("/profile");
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/5 border border-white/20 backdrop-blur-xl p-8 md:p-10 rounded-[2.5rem] shadow-2xl">
      <div className="flex flex-col items-center mb-8">
        <div className="bg-blue-600 p-3 rounded-2xl rotate-[-6deg] mb-4 shadow-lg shadow-blue-600/20">
          <Disc
            className="h-8 w-8 text-white animate-spin-slow"
            aria-hidden="true"
          />
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter uppercase italic text-center">
          {isSignUp ? "Skapa konto" : "Välkommen åter"}
        </h1>
        <p className="text-slate-300 text-sm mt-2 font-medium text-center">
          {isSignUp
            ? "Börja sälja och köpa film idag"
            : "Logga in på Filmtorget"}
        </p>
      </div>

      <form onSubmit={handleAuth} className="space-y-4">
        <div className="relative">
          <Mail
            className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400"
            aria-hidden="true"
          />
          <input
            type="email"
            placeholder="E-postadress"
            aria-label="E-postadress"
            className="w-full bg-slate-900 border border-white/20 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-950 transition-all font-medium"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="relative">
          <Lock
            className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400"
            aria-hidden="true"
          />
          <input
            type="password"
            placeholder="Lösenord"
            aria-label="Lösenord"
            className="w-full bg-slate-900 border border-white/20 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-950 transition-all font-medium"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && (
          <div
            role="alert"
            className="bg-red-500/10 border border-red-500/40 text-red-400 text-xs py-3 px-4 rounded-xl font-bold animate-in fade-in zoom-in duration-300"
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest py-4 rounded-2xl transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-950"
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              {isSignUp ? "Skapa konto" : "Logga in"}
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </>
          )}
        </button>
      </form>

      <div className="mt-8 text-center border-t border-white/10 pt-6">
        <button
          onClick={() => setIsSignUp(!isSignUp)}
          className="text-slate-300 hover:text-white text-sm font-bold transition-colors cursor-pointer focus:outline-none focus:underline decoration-blue-500 underline-offset-4"
        >
          {isSignUp
            ? "Har du redan ett konto? Logga in"
            : "Inget konto? Skapa ett här"}
        </button>
      </div>
    </div>
  );
}
