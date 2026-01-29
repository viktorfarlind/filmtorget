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

      const { data, error } = await supabase
        .from("conversations")
        .select(
          `
          id,
          created_at,
          ad:ads(title, image_url),
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
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans text-slate-900">
      <div className="bg-white border-b border-slate-200 pt-12 pb-8">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-xl font-black flex items-center gap-3">
            <MessageSquare className="h-8 w-8 text-blue-600" />
            Inkorg
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {conversations.length === 0 ? (
          <div className="bg-white rounded-[2rem] p-16 text-center border border-slate-200 shadow-sm">
            <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Inbox className="h-10 w-10 text-slate-300" />
            </div>
            <h2 className="text-xl font-bold mb-2">Inkorgen är tom</h2>
            <p className="text-slate-500 mb-8 max-w-xs mx-auto">
              Här ser du dina konversationer när du kontaktat en säljare eller
              lagt upp en annons.
            </p>
            <Link
              href="/"
              className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
            >
              Bläddra bland filmer
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {conversations.map((conv) => {
              const isBuyer = userId === conv.buyer.id;
              const otherUser = isBuyer ? conv.seller : conv.buyer;
              const hasUnread = conv.unreadCount > 0;

              return (
                <Link
                  key={conv.id}
                  href={`/messages/${conv.id}`}
                  className={`group bg-white p-5 rounded-3xl border transition-all flex items-center gap-4 active:scale-[0.98] ${
                    hasUnread
                      ? "border-blue-200 ring-1 ring-blue-100 shadow-md"
                      : "border-slate-200 hover:border-blue-400"
                  }`}
                >
                  <div className="h-16 w-12 relative rounded-lg overflow-hidden bg-slate-100 flex-shrink-0 shadow-sm border border-slate-100">
                    <Image
                      src={conv.ad.image_url}
                      alt={conv.ad.title}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-slate-900 truncate">
                          {conv.ad.title}
                        </span>
                        {hasUnread && (
                          <span className="h-2 w-2 bg-blue-600 rounded-full animate-pulse" />
                        )}
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">
                        {conv.lastMsg
                          ? new Date(
                              conv.lastMsg.created_at
                            ).toLocaleDateString("sv-SE")
                          : ""}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mb-1">
                      <div className="h-5 w-5 rounded-full bg-slate-200 relative overflow-hidden flex-shrink-0">
                        {otherUser.avatar_url ? (
                          <Image
                            src={otherUser.avatar_url}
                            alt=""
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <User className="p-1 text-slate-400" />
                        )}
                      </div>
                      <p className="text-sm text-slate-700 font-bold truncate">
                        {otherUser.username}
                      </p>
                      <span
                        className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${
                          isBuyer
                            ? "bg-blue-50 text-blue-600"
                            : "bg-green-50 text-green-600"
                        }`}
                      >
                        {isBuyer ? "Köper" : "Säljer"}
                      </span>
                    </div>

                    <p
                      className={`text-sm truncate ${
                        hasUnread
                          ? "text-slate-900 font-bold"
                          : "text-slate-500 font-medium"
                      }`}
                    >
                      {conv.lastMsg ? (
                        <>
                          {conv.lastMsg.sender_id === userId ? "Du: " : ""}
                          {conv.lastMsg.content}
                        </>
                      ) : (
                        "Inga meddelanden än"
                      )}
                    </p>
                  </div>

                  <ChevronRight
                    className={`h-5 w-5 transition-all ${
                      hasUnread
                        ? "text-blue-500"
                        : "text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1"
                    }`}
                  />
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
