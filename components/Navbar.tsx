"use client";

import Link from "next/link";
import Image from "next/image";
import { Disc, User as UserIcon, Tag, MessageSquare } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/utils/supabaseClient";
import { useRouter } from "next/navigation";
import { User, RealtimeChannel } from "@supabase/supabase-js";
import { Profile } from "@/types/database";

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = useCallback(async (userId: string) => {
    const { count } = await supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .eq("is_read", false)
      .neq("sender_id", userId);
    setUnreadCount(count || 0);
  }, []);

  const fetchProfile = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    if (data) setProfile(data as Profile);
  }, []);

  useEffect(() => {
    let profileSubscription: RealtimeChannel | null = null;

    const initializeNavbar = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        fetchProfile(currentUser.id);
        fetchUnreadCount(currentUser.id);

        profileSubscription = supabase
          .channel(`navbar-profile-${currentUser.id}`)
          .on(
            "postgres_changes",
            {
              event: "UPDATE",
              schema: "public",
              table: "profiles",
              filter: `id=eq.${currentUser.id}`,
            },
            (payload) => {
              setProfile(payload.new as Profile);
            }
          )
          .subscribe();
      }
    };

    initializeNavbar();

    const {
      data: { subscription: authSubscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        fetchProfile(currentUser.id);
        fetchUnreadCount(currentUser.id);
      } else {
        setProfile(null);
        setUnreadCount(0);
        if (event === "SIGNED_OUT") router.refresh();
      }
    });

    const messageChannel = supabase
      .channel("navbar-messages")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "messages" },
        () => {
          supabase.auth.getSession().then(({ data }) => {
            if (data.session?.user) fetchUnreadCount(data.session.user.id);
          });
        }
      )
      .subscribe();

    return () => {
      authSubscription.unsubscribe();
      supabase.removeChannel(messageChannel);
      if (profileSubscription) supabase.removeChannel(profileSubscription);
    };
  }, [router, fetchUnreadCount, fetchProfile]);

  return (
    <>
      <div className="h-16 w-full" />
      <nav
        className="fixed top-0 left-0 right-0 h-16 border-b border-white/10 bg-slate-950/95 backdrop-blur-md z-[100]"
        aria-label="Huvudmeny"
      >
        <div className="max-w-7xl mx-auto h-full px-4 flex items-center justify-between">
          <Link
            href="/"
            aria-label="Filmtorget Startsida"
            className="flex items-center gap-2 group transition-transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-950 rounded-lg"
          >
            <div className="bg-blue-600 p-1.5 rounded-lg -rotate-6 group-hover:rotate-0 transition-all duration-300 shadow-lg shadow-blue-600/20">
              <Disc
                className="h-5 w-5 text-white animate-spin-slow"
                aria-hidden="true"
              />
            </div>
            <span className="text-xl font-black tracking-tighter text-white uppercase italic">
              Film<span className="text-blue-500 not-italic">torget</span>
            </span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-4">
            {user ? (
              <>
                <Link
                  href="/create-ad"
                  className="hidden sm:flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <Tag
                    className="h-3.5 w-3.5 text-blue-400"
                    aria-hidden="true"
                  />
                  Sälj film
                </Link>

                <Link
                  href="/messages"
                  aria-label={`Meddelanden, ${unreadCount} olästa`}
                  className="relative p-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <MessageSquare className="h-5 w-5" aria-hidden="true" />
                  {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 bg-blue-600 text-white text-[10px] font-black h-4 min-w-4 px-1 flex items-center justify-center rounded-full border-2 border-slate-950 shadow-sm">
                      {unreadCount}
                    </span>
                  )}
                </Link>

                <Link
                  href="/profile"
                  aria-label="Gå till din profil"
                  className="flex items-center gap-3 pl-2 sm:pl-4 sm:border-l border-white/10 focus:outline-none group"
                >
                  <div className="h-9 w-9 bg-slate-900 rounded-full flex items-center justify-center border border-white/20 group-hover:border-blue-500 group-focus:ring-2 group-focus:ring-blue-500 transition-all overflow-hidden relative shadow-inner">
                    {profile?.avatar_url ? (
                      <Image
                        src={`${profile.avatar_url}?t=${new Date(
                          profile.updated_at
                        ).getTime()}`}
                        alt=""
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <UserIcon
                        className="h-5 w-5 text-slate-400"
                        aria-hidden="true"
                      />
                    )}
                  </div>
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="text-xs font-bold uppercase tracking-widest text-slate-300 hover:text-white transition-colors p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg"
                >
                  Logga in
                </Link>
                <Link
                  href="/login?view=signup"
                  className="bg-blue-600 text-white px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Kom igång
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}
