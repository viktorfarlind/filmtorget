"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabaseClient";
import Link from "next/link";
import Image from "next/image";
import {
  MessageSquare,
  User,
  ChevronRight,
  Loader2,
  Inbox,
} from "lucide-react";

export default function MessagesPage() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchConversations = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const { data } = await supabase
        .from("conversations")
        .select(
          `
          id,
          created_at,
          ad:ads(title, image_url, is_sold),
          buyer:profiles!conversations_buyer_id_fkey(id, username, avatar_url),
          seller:profiles!conversations_seller_id_fkey(id, username, avatar_url),
          messages(content, created_at, sender_id, is_read)
        `
        )
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`);

      if (data) {
        const formatted = data
          .map((conv: any) => {
            const lastMsg = conv.messages?.sort(
              (a: any, b: any) =>
                new Date(b.created_at).getTime() -
                new Date(a.created_at).getTime()
            )[0];

            const unreadCount = conv.messages?.filter(
              (m: any) => !m.is_read && m.sender_id !== user.id
            ).length;

            return { ...conv, lastMsg, unreadCount };
          })
          .sort((a, b) => {
            const timeA = a.lastMsg
              ? new Date(a.lastMsg.created_at).getTime()
              : new Date(a.created_at).getTime();
            const timeB = b.lastMsg
              ? new Date(b.lastMsg.created_at).getTime()
              : new Date(b.created_at).getTime();
            return timeB - timeA;
          });

        setConversations(formatted);
      }
      setLoading(false);
    };

    fetchConversations();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2
          className="h-8 w-8 animate-spin text-blue-600"
          aria-label="Laddar meddelanden"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans text-slate-900">
      <header className="bg-white border-b border-slate-200 pt-12 pb-8">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-black flex items-center gap-3 tracking-tight text-slate-950 uppercase italic">
            <MessageSquare
              className="h-8 w-8 text-blue-600"
              aria-hidden="true"
            />
            Meddelanden
          </h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {conversations.length === 0 ? (
          <div
            className="bg-white rounded-[2.5rem] p-16 text-center border border-slate-200 shadow-sm"
            role="status"
          >
            <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Inbox className="h-10 w-10 text-slate-400" aria-hidden="true" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2 uppercase italic">
              Inkorgen är tom
            </h2>
            <p className="text-slate-600 mb-8 max-w-xs mx-auto text-sm font-medium">
              Här ser du dina konversationer när du kontaktat en säljare eller
              lagt upp en annons.
            </p>
            <Link
              href="/"
              className="inline-block bg-blue-600 text-white px-8 py-4 rounded-full font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 text-sm uppercase tracking-widest focus:ring-4 focus:ring-blue-500 focus:ring-offset-2"
            >
              Bläddra bland filmer
            </Link>
          </div>
        ) : (
          <ul className="space-y-4" aria-label="Konversationslista">
            {conversations.map((conv) => {
              const isBuyer = userId === conv.buyer.id;
              const otherUser = isBuyer ? conv.seller : conv.buyer;
              const hasUnread = conv.unreadCount > 0;
              const isSold = conv.ad.is_sold;

              return (
                <li key={conv.id}>
                  <Link
                    href={`/messages/${conv.id}`}
                    aria-label={`Konversation med ${otherUser.username} om ${
                      conv.ad.title
                    }. ${hasUnread ? "Du har olästa meddelanden." : ""}`}
                    className={`group bg-white p-5 rounded-[2rem] border-2 transition-all flex items-center gap-4 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-offset-2 ${
                      hasUnread
                        ? "border-blue-600 shadow-md ring-1 ring-blue-100"
                        : "border-white shadow-sm hover:border-blue-400"
                    }`}
                  >
                    {/* Annonsbild */}
                    <div className="h-20 w-16 relative rounded-xl overflow-hidden bg-slate-200 flex-shrink-0 shadow-inner border border-slate-100">
                      <Image
                        src={conv.ad.image_url}
                        alt=""
                        fill
                        className={`object-cover ${
                          isSold ? "grayscale opacity-40" : ""
                        }`}
                        aria-hidden="true"
                      />
                      {isSold && (
                        <div className="absolute inset-0 bg-slate-950/40 flex items-center justify-center">
                          <span className="text-[10px] bg-white text-slate-950 font-black px-1.5 py-0.5 rounded-sm rotate-[-12deg] shadow-lg uppercase border border-slate-950">
                            Såld
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <h2
                            className={`font-black truncate text-base uppercase italic tracking-tighter ${
                              isSold ? "text-slate-500" : "text-slate-950"
                            }`}
                          >
                            {conv.ad.title}
                          </h2>
                          {hasUnread && (
                            <span
                              className="h-2.5 w-2.5 bg-blue-600 rounded-full flex-shrink-0"
                              aria-label="Oläst meddelande"
                            />
                          )}
                        </div>
                        <time className="text-[10px] font-bold text-slate-500 uppercase ml-2 flex-shrink-0">
                          {conv.lastMsg
                            ? new Date(
                                conv.lastMsg.created_at
                              ).toLocaleDateString("sv-SE")
                            : ""}
                        </time>
                      </div>

                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-6 w-6 rounded-full bg-slate-100 relative overflow-hidden flex-shrink-0 border border-slate-200">
                          {otherUser.avatar_url ? (
                            <Image
                              src={otherUser.avatar_url}
                              alt=""
                              fill
                              className="object-cover"
                              aria-hidden="true"
                            />
                          ) : (
                            <User
                              className="p-1 text-slate-400"
                              aria-hidden="true"
                            />
                          )}
                        </div>
                        <p className="text-sm text-slate-900 font-black uppercase italic tracking-tight">
                          {otherUser.username}
                        </p>
                      </div>

                      <p
                        className={`text-sm truncate leading-relaxed ${
                          hasUnread
                            ? "text-slate-950 font-black"
                            : "text-slate-600 font-medium"
                        }`}
                      >
                        {conv.lastMsg ? (
                          <>
                            <span className="sr-only">Senaste meddelande:</span>
                            {conv.lastMsg.sender_id === userId ? "Du: " : ""}
                            {conv.lastMsg.content}
                          </>
                        ) : (
                          "Inga meddelanden än"
                        )}
                      </p>
                    </div>

                    <ChevronRight
                      className={`h-6 w-6 transition-all ${
                        hasUnread
                          ? "text-blue-600"
                          : "text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1"
                      }`}
                      aria-hidden="true"
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </div>
  );
}
