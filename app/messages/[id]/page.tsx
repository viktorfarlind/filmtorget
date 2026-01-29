"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/utils/supabaseClient";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  Send,
  ArrowLeft,
  Loader2,
  User as UserIcon,
  CheckCircle2,
  Star,
} from "lucide-react";
import Link from "next/link";
import { User } from "@supabase/supabase-js";
import { Ad, Profile, Message } from "@/types/database";

interface ChatConversation {
  id: string;
  ad_id: string;
  buyer_id: string;
  seller_id: string;
  created_at: string;
  ad: Pick<Ad, "id" | "title" | "image_url" | "price" | "is_sold" | "user_id">;
  buyer: Profile;
  seller: Profile;
}

export default function ChatPage() {
  const { id: conversationId } = useParams();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [conversation, setConversation] = useState<ChatConversation | null>(
    null
  );
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const setupChat = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) {
          setError("Du måste vara inloggad");
          return;
        }

        const user = session.user;
        setCurrentUser(user);

        const { data: conv, error: convError } = await supabase
          .from("conversations")
          .select(
            `
            *,
            ad:ads(id, title, image_url, price, is_sold, user_id),
            buyer:profiles!conversations_buyer_id_fkey(id, username, avatar_url),
            seller:profiles!conversations_seller_id_fkey(id, username, avatar_url)
          `
          )
          .eq("id", conversationId)
          .single();

        if (convError || !conv) {
          setError("Kunde inte hämta konversationen.");
          return;
        }

        const chatConv = conv as unknown as ChatConversation;
        setConversation(chatConv);

        const { data: existingReview } = await supabase
          .from("reviews")
          .select("id")
          .eq("reviewer_id", user.id)
          .eq("ad_id", chatConv.ad.id)
          .maybeSingle();

        if (existingReview) {
          setReviewSubmitted(true);
        }

        await supabase
          .from("messages")
          .update({ is_read: true })
          .eq("conversation_id", conversationId)
          .neq("sender_id", user.id)
          .eq("is_read", false);

        const { data: msgs } = await supabase
          .from("messages")
          .select("*")
          .eq("conversation_id", conversationId)
          .order("created_at", { ascending: true });

        setMessages((msgs as Message[]) || []);
        setLoading(false);

        const channel = supabase
          .channel(`chat:${conversationId}`)
          .on(
            "postgres_changes",
            {
              event: "INSERT",
              schema: "public",
              table: "messages",
              filter: `conversation_id=eq.${conversationId}`,
            },
            async (payload) => {
              const msg = payload.new as Message;
              setMessages((prev) => {
                if (prev.some((m) => m.id === msg.id)) return prev;
                return [...prev, msg];
              });

              if (msg.sender_id !== user.id) {
                await supabase
                  .from("messages")
                  .update({ is_read: true })
                  .eq("id", msg.id);
              }
            }
          )
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
        };
      } catch {
        setError("Ett oväntat fel uppstod");
      }
    };
    setupChat();
  }, [conversationId]);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop =
        scrollContainerRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const markAsSold = async () => {
    if (!conversation) return;
    if (!window.confirm("Vill du markera denna film som såld?")) return;
    const { error } = await supabase
      .from("ads")
      .update({ is_sold: true })
      .eq("id", conversation.ad.id);
    if (!error) {
      setConversation({
        ...conversation,
        ad: { ...conversation.ad, is_sold: true },
      });
      router.refresh();
    }
  };

  const submitReview = async () => {
    if (!currentUser || !conversation) return;
    const { error } = await supabase.from("reviews").insert({
      reviewer_id: currentUser.id,
      receiver_id:
        currentUser.id === conversation.buyer_id
          ? conversation.seller_id
          : conversation.buyer_id,
      ad_id: conversation.ad.id,
      rating: rating,
      comment: comment,
    });

    if (!error) {
      setReviewSubmitted(true);
      setShowReviewForm(false);
      alert("Tack för ditt omdöme!");
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser || sending) return;

    setSending(true);
    const content = newMessage;
    setNewMessage("");

    const { data, error: sendError } = await supabase
      .from("messages")
      .insert({
        conversation_id: conversationId as string,
        sender_id: currentUser.id,
        content,
        is_read: false,
      })
      .select()
      .single();

    if (sendError) {
      alert("Kunde inte skicka");
    } else if (data) {
      const sentMsg = data as Message;
      setMessages((prev) => {
        if (prev.some((m) => m.id === sentMsg.id)) return prev;
        return [...prev, sentMsg];
      });
    }
    setSending(false);
  };

  if (error)
    return (
      <div className="fixed inset-0 top-16 z-[100] flex flex-col items-center justify-center p-4 bg-white">
        <p
          className="text-red-600 font-black uppercase italic mb-4"
          role="alert"
        >
          {error}
        </p>
        <Link
          href="/messages"
          className="bg-slate-950 text-white px-8 py-3 rounded-full text-sm font-bold uppercase tracking-widest focus:ring-4 focus:ring-blue-500"
        >
          Tillbaka
        </Link>
      </div>
    );

  if (loading || !conversation)
    return (
      <div className="fixed inset-0 top-16 z-[100] flex items-center justify-center bg-white">
        <Loader2
          className="h-8 w-8 animate-spin text-blue-600"
          aria-label="Laddar chatt"
        />
      </div>
    );

  const isSeller = currentUser?.id === conversation.ad.user_id;
  const otherUser =
    currentUser?.id === conversation.buyer_id
      ? conversation.seller
      : conversation.buyer;

  return (
    <div className="fixed inset-0 top-16 z-100 flex flex-col bg-white overflow-hidden font-sans">
      <div className="flex-1 flex flex-col max-w-4xl w-full mx-auto bg-white border-x border-slate-200 overflow-hidden relative shadow-2xl">
        <header className="bg-white border-b border-slate-200 p-4 flex items-center justify-between z-20">
          <div className="flex items-center gap-4 min-w-0">
            <Link
              href="/messages"
              aria-label="Tillbaka till meddelanden"
              className="p-2 hover:bg-slate-100 rounded-full transition-colors shrink-0 focus:ring-2 focus:ring-blue-500"
            >
              <ArrowLeft className="h-5 w-5 text-slate-800" />
            </Link>
            <Link
              href={`/users/${otherUser?.id}`}
              className="h-10 w-10 rounded-full bg-slate-100 relative overflow-hidden shrink-0 border border-slate-200 focus:ring-2 focus:ring-blue-500"
            >
              {otherUser?.avatar_url ? (
                <Image
                  src={otherUser.avatar_url}
                  alt=""
                  fill
                  className="object-cover"
                />
              ) : (
                <UserIcon className="p-2 text-slate-400" aria-hidden="true" />
              )}
            </Link>
            <div className="min-w-0">
              <h2 className="font-black text-slate-950 truncate leading-tight uppercase italic tracking-tighter">
                {otherUser?.username || "Användare"}
              </h2>
              <div className="flex items-center gap-2">
                <Link
                  href={`/ads/${conversation.ad?.id}`}
                  className="text-[11px] text-slate-600 truncate font-bold uppercase tracking-tighter hover:text-blue-600 transition-colors"
                >
                  Film: {conversation.ad?.title}
                </Link>
                {conversation.ad?.is_sold && (
                  <span className="bg-emerald-100 text-emerald-900 text-[9px] font-black px-1.5 py-0.5 rounded flex items-center gap-0.5 border border-emerald-200">
                    <CheckCircle2 className="h-2 w-2" /> SÅLD
                  </span>
                )}
              </div>
            </div>
          </div>

          {isSeller && !conversation.ad?.is_sold && (
            <button
              onClick={markAsSold}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold px-4 py-2 rounded-lg transition-all shadow-sm active:scale-95 uppercase tracking-widest focus:ring-4 focus:ring-emerald-500/50 cursor-pointer"
            >
              Markera såld
            </button>
          )}
        </header>

        {conversation.ad?.is_sold && !isSeller && !reviewSubmitted && (
          <section
            className="bg-amber-50 border-b border-amber-200 p-4 text-center"
            aria-labelledby="review-heading"
          >
            {!showReviewForm ? (
              <div className="flex flex-col items-center gap-2">
                <p
                  id="review-heading"
                  className="text-sm text-amber-900 font-black uppercase italic"
                >
                  Filmen är såld! Hur var din upplevelse?
                </p>
                <button
                  onClick={() => setShowReviewForm(true)}
                  className="bg-amber-500 text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-amber-600 transition-all focus:ring-4 focus:ring-amber-500/50 shadow-md cursor-pointer"
                >
                  Lämna omdöme
                </button>
              </div>
            ) : (
              <div
                className="max-w-sm mx-auto space-y-4 py-2"
                role="group"
                aria-labelledby="review-form-title"
              >
                <h3 id="review-form-title" className="sr-only">
                  Skicka omdöme
                </h3>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      aria-label={`Ge ${star} stjärnor av 5`}
                      className="transition-transform active:scale-125 focus:outline-none cursor-pointer"
                    >
                      <Star
                        className={`h-8 w-8 ${
                          rating >= star
                            ? "text-amber-500 fill-amber-500"
                            : "text-slate-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <textarea
                  placeholder="Skriv en kort kommentar om säljaren..."
                  aria-label="Kommentar till omdöme"
                  className="w-full p-4 rounded-2xl border-2 border-amber-200 text-sm outline-none focus:ring-4 focus:ring-amber-500/20 bg-white text-slate-950 font-medium"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={2}
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowReviewForm(false)}
                    className="flex-1 bg-white text-slate-700 py-3 rounded-xl font-bold text-xs border-2 border-slate-200 hover:bg-slate-50 cursor-pointer"
                  >
                    Avbryt
                  </button>
                  <button
                    type="button"
                    onClick={submitReview}
                    className="flex-1 bg-slate-950 text-white py-3 rounded-xl font-bold text-xs hover:bg-slate-800 uppercase tracking-widest cursor-pointer"
                  >
                    Skicka betyg
                  </button>
                </div>
              </div>
            )}
          </section>
        )}

        <main
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 bg-white scroll-smooth"
          aria-live="polite"
        >
          {messages.map((msg) => {
            const isMine = msg.sender_id === currentUser?.id;
            return (
              <article
                key={msg.id}
                className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                aria-label={`${isMine ? "Du" : otherUser?.username} skickade:`}
              >
                <div
                  className={`relative max-w-[85%] sm:max-w-[70%] px-5 py-3 rounded-2xl shadow-sm border ${
                    isMine
                      ? "bg-blue-600 text-white border-blue-500 rounded-br-none"
                      : "bg-slate-100 text-slate-900 border-slate-200 rounded-bl-none"
                  }`}
                >
                  <p className="text-[15px] leading-relaxed whitespace-pre-wrap font-bold tracking-tight uppercase italic">
                    {msg.content}
                  </p>
                  <div
                    className={`flex items-center justify-end gap-1.5 mt-2 ${
                      isMine ? "text-blue-50" : "text-slate-600"
                    }`}
                  >
                    <time className="text-[9px] font-black uppercase tracking-widest">
                      {new Date(msg.created_at).toLocaleTimeString("sv-SE", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </time>
                    {isMine && (
                      <span
                        className="text-[10px] font-black"
                        aria-label={msg.is_read ? "Läst" : "Skickat"}
                      >
                        {msg.is_read ? "✓✓" : "✓"}
                      </span>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </main>

        <footer className="p-4 bg-white border-t border-slate-200">
          <form
            onSubmit={sendMessage}
            className="flex gap-3 max-w-3xl mx-auto items-end"
          >
            <div className="flex-1 relative">
              <label htmlFor="message-input" className="sr-only">
                Skriv meddelande
              </label>
              <textarea
                id="message-input"
                placeholder="Skriv ett meddelande..."
                rows={1}
                className="w-full bg-slate-50 border-2 border-transparent rounded-2xl px-5 py-4 text-[15px] text-slate-950 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold uppercase italic tracking-tight resize-none"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage(e as unknown as React.FormEvent);
                  }
                }}
              />
            </div>
            <button
              type="submit"
              disabled={sending || !newMessage.trim()}
              aria-label="Skicka meddelande"
              className="bg-blue-600 text-white p-4 rounded-2xl hover:bg-blue-700 transition-all active:scale-90 shadow-lg shadow-blue-600/20 disabled:opacity-40 focus:ring-4 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer"
            >
              {sending ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <Send className="h-6 w-6" />
              )}
            </button>
          </form>
        </footer>
      </div>
    </div>
  );
}
