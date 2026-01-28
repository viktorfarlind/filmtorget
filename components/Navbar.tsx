"use client";

import Link from "next/link";
import { Film, User, LogOut, Plus, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabaseClient";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-slate-900 text-white shadow-lg">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-blue-600 p-1.5 rounded-lg group-hover:bg-blue-500 transition-colors">
            <Film className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight text-white group-hover:text-blue-200 transition-colors">
            Filmtorget
          </span>
        </Link>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link
                href="/create-ad"
                className="hidden sm:flex items-center gap-1 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-semibold transition-all shadow-md hover:shadow-blue-500/25"
              >
                <Plus className="h-4 w-4" />
                Sälj film
              </Link>

              <Link
                href="/create-ad"
                className="sm:hidden text-gray-300 hover:text-white"
              >
                <Plus className="h-7 w-7" />
              </Link>

              <button
                onClick={handleLogout}
                className="text-gray-400 hover:text-red-400 transition-colors"
              >
                <LogOut className="h-6 w-6" />
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-2 text-sm font-semibold text-gray-300 hover:text-white transition-colors"
            >
              <User className="h-5 w-5" />
              <span>Logga in</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
