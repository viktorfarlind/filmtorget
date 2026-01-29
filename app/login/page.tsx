"use client";

import { Suspense } from "react";
import LoginForm from "@/components/LoginForm";
import { Loader2 } from "lucide-react";

export default function AuthPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <Suspense
          fallback={
            <div className="bg-white/5 border border-white/20 backdrop-blur-xl p-8 md:p-10 rounded-[2.5rem] shadow-2xl flex flex-col items-center justify-center min-h-[400px]">
              <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
              <p className="text-slate-400 mt-4 font-bold uppercase tracking-widest text-xs">
                Laddar inloggning...
              </p>
            </div>
          }
        >
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
