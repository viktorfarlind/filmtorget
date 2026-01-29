"use client";

import Link from "next/link";
import Image from "next/image";
import { Film, User, PlusCircle, MessageSquare } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabaseClient";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUserData = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", currentUser.id)
          .single();
        setProfile(data);

        fetchUnreadCount(currentUser.id);
      }
    };

    const fetchUnreadCount = async (userId: string) => {
      const { count } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .eq("is_read", false)
        .neq("sender_id", userId);

      setUnreadCount(count || 0);
    };

    fetchUserData();

    const {
      data: { subscription: authSubscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        supabase
          .from("profiles")
          .select("*")
          .eq("id", currentUser.id)
          .single()
          .then(({ data }) => setProfile(data));

        fetchUnreadCount(currentUser.id);
      } else {
        setProfile(null);
        setUnreadCount(0);
        if (_event === "SIGNED_OUT") router.refresh();
      }
    });

    const messageChannel = supabase
      .channel("navbar-messages")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "messages" },
        () => {
          if (user?.id) fetchUnreadCount(user.id);
          else {
            supabase.auth.getSession().then(({ data }) => {
              if (data.session?.user) fetchUnreadCount(data.session.user.id);
            });
          }
        }
      )
      .subscribe();

    return () => {
      authSubscription.unsubscribe();
      supabase.removeChannel(messageChannel);
    };
  }, [router, user?.id]);

  return (
    <nav className="border-b border-slate-800 bg-slate-950 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-blue-600 p-1.5 rounded-lg group-hover:bg-blue-500 transition-colors">
            <Film className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight text-white">
            Filmtorget
          </span>
        </Link>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link
                href="/create-ad"
                className="hidden sm:flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-white transition-colors"
              >
                <PlusCircle className="h-4 w-4" /> Sälj film
              </Link>

              <Link
                href="/messages"
                className="relative p-2 text-slate-400 hover:text-white transition-colors"
              >
                <MessageSquare className="h-6 w-6" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 bg-red-600 text-white text-[10px] font-black h-4 min-w-[1rem] px-1 flex items-center justify-center rounded-full border border-slate-950 shadow-sm animate-in zoom-in">
                    {unreadCount}
                  </span>
                )}
              </Link>

              <Link
                href="/profile"
                className="flex items-center gap-2 pl-4 border-l border-slate-800"
              >
                <div className="h-8 w-8 bg-slate-900 rounded-full flex items-center justify-center border border-slate-700 hover:border-blue-500 transition-colors overflow-hidden relative">
                  {profile?.avatar_url ? (
                    <Image
                      src={profile.avatar_url}
                      alt="Profil"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <User className="h-4 w-4 text-slate-400" />
                  )}
                </div>
                <span className="text-sm font-bold text-white hidden md:block max-w-[150px] truncate">
                  {profile?.username || user.email?.split("@")[0]}
                </span>
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-bold text-slate-400 hover:text-white transition-colors"
              >
                Logga in
              </Link>
              <Link
                href="/create-ad"
                className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-bold hover:bg-blue-500 transition-colors shadow-lg shadow-blue-900/20"
              >
                Sälj film
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
