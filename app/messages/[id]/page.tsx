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

export default function ChatPage() {
  const { id: conversationId } = useParams();
  const router = useRouter();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [conversation, setConversation] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
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
        setConversation(conv);
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

        setMessages(msgs || []);
        setLoading(false);

        // Realtime prenumeration
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
              setMessages((prev) => {
                if (prev.find((m) => m.id === payload.new.id)) return prev;
                return [...prev, payload.new];
              });
              if (payload.new.sender_id !== user.id) {
                await supabase
                  .from("messages")
                  .update({ is_read: true })
                  .eq("id", payload.new.id);
              }
            }
          )
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
        };
      } catch (err) {
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
    const { error } = await supabase.from("reviews").insert({
      reviewer_id: currentUser.id,
      receiver_id:
        currentUser.id === conversation.buyer_id
          ? conversation.seller_id
          : conversation.buyer_id,
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

    const { data, error } = await supabase
      .from("messages")
      .insert({
        conversation_id: conversationId,
        sender_id: currentUser.id,
        content,
        is_read: false,
      })
      .select()
      .single();

    if (error) {
      alert("Kunde inte skicka");
    }
    setSending(false);
  };

  if (error)
    return (
      <div className="h-[calc(100vh-64px)] flex flex-col items-center justify-center p-4 bg-white">
        <p className="text-red-500 font-bold mb-4">{error}</p>
        <Link
          href="/messages"
          className="bg-slate-900 text-white px-6 py-2 rounded-full text-sm font-bold cursor-pointer"
        >
          Tillbaka
        </Link>
      </div>
    );

  if (loading || !conversation)
    return (
      <div className="h-[calc(100vh-64px)] flex items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );

  const isSeller = currentUser?.id === conversation.ad.user_id;
  const otherUser =
    currentUser?.id === conversation.buyer_id
      ? conversation.seller
      : conversation.buyer;

  return (
    <div className="fixed inset-0 top-16 flex flex-col bg-slate-50 overflow-hidden">
      <div className="flex-1 flex flex-col max-w-4xl w-full mx-auto bg-white border-x border-slate-200 overflow-hidden relative shadow-2xl">
        <div className="bg-white border-b border-slate-100 p-4 flex items-center justify-between z-20">
          <div className="flex items-center gap-4 min-w-0">
            <Link
              href="/messages"
              className="p-2 hover:bg-slate-100 rounded-full transition-colors shrink-0 cursor-pointer"
            >
              <ArrowLeft className="h-5 w-5 text-slate-600" />
            </Link>
            <Link
              href={`/users/${otherUser?.id}`}
              className="h-10 w-10 rounded-full bg-slate-100 relative overflow-hidden shrink-0 border border-slate-200 hover:opacity-80 transition-opacity cursor-pointer"
            >
              {otherUser?.avatar_url ? (
                <Image
                  src={otherUser.avatar_url}
                  alt=""
                  fill
                  className="object-cover"
                />
              ) : (
                <UserIcon className="p-2 text-slate-400" />
              )}
            </Link>
            <div className="min-w-0">
              <Link
                href={`/users/${otherUser?.id}`}
                className="hover:text-blue-600 transition-colors cursor-pointer block"
              >
                <h2 className="font-bold text-slate-900 truncate leading-tight">
                  {otherUser?.username || "Användare"}
                </h2>
              </Link>
              <div className="flex items-center gap-2">
                <Link
                  href={`/ads/${conversation.ad?.id}`}
                  className="text-[11px] text-slate-500 truncate font-medium uppercase tracking-tighter hover:text-blue-600 transition-colors cursor-pointer"
                >
                  Film: {conversation.ad?.title}
                </Link>
                {conversation.ad?.is_sold && (
                  <span className="bg-emerald-100 text-emerald-700 text-[9px] font-black px-1.5 py-0.5 rounded flex items-center gap-0.5">
                    <CheckCircle2 className="h-2 w-2" /> SÅLD
                  </span>
                )}
              </div>
            </div>
          </div>

          {isSeller && !conversation.ad?.is_sold && (
            <button
              onClick={markAsSold}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black px-3 py-2 rounded-lg transition-all shadow-sm active:scale-95 flex-shrink-0 cursor-pointer uppercase"
            >
              Markera såld
            </button>
          )}
        </div>

        {conversation.ad?.is_sold && !isSeller && !reviewSubmitted && (
          <div className="bg-amber-50 border-b border-amber-100 p-4 text-center">
            {!showReviewForm ? (
              <div className="flex flex-col items-center gap-2">
                <p className="text-sm text-amber-900 font-bold">
                  Filmen är såld! Hur var din upplevelse?
                </p>
                <button
                  onClick={() => setShowReviewForm(true)}
                  className="bg-amber-500 text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-wider hover:bg-amber-600 transition-all cursor-pointer shadow-sm"
                >
                  Lämna omdöme
                </button>
              </div>
            ) : (
              <div className="max-w-sm mx-auto space-y-4 py-2">
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className="cursor-pointer transition-transform active:scale-125"
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
                  className="w-full p-4 rounded-2xl border border-amber-200 text-sm outline-none focus:ring-4 focus:ring-amber-500/10 bg-white"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={2}
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowReviewForm(false)}
                    className="flex-1 bg-white text-slate-500 py-3 rounded-xl font-bold text-xs cursor-pointer border border-slate-200"
                  >
                    Avbryt
                  </button>
                  <button
                    onClick={submitReview}
                    className="flex-1 bg-slate-900 text-white py-3 rounded-xl font-bold text-xs cursor-pointer"
                  >
                    Skicka betyg
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 bg-white"
        >
          {messages.map((msg) => {
            const isMine = msg.sender_id === currentUser.id;
            return (
              <div
                key={msg.id}
                className={`flex ${isMine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`relative max-w-[85%] sm:max-w-[70%] px-4 py-3 rounded-2xl shadow-sm ${
                    isMine
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-slate-100 text-slate-900 rounded-bl-none"
                  }`}
                >
                  <p className="text-[15px] leading-relaxed whitespace-pre-wrap font-medium">
                    {msg.content}
                  </p>
                  <div className="flex items-center justify-end gap-1.5 mt-1.5 opacity-60">
                    <p className="text-[9px] font-bold uppercase">
                      {new Date(msg.created_at).toLocaleTimeString("sv-SE", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    {isMine && (
                      <span className="text-[10px] font-black">
                        {msg.is_read ? "✓✓" : "✓"}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-4 bg-white border-t border-slate-100">
          <form onSubmit={sendMessage} className="flex gap-3 max-w-3xl mx-auto">
            <input
              type="text"
              placeholder="Skriv ett meddelande..."
              className="flex-1 bg-slate-100 border-none rounded-2xl px-5 py-4 text-[15px] text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/10 transition-all font-medium"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
            <button
              type="submit"
              disabled={sending || !newMessage.trim()}
              className="bg-blue-600 text-white p-4 rounded-2xl hover:bg-blue-700 transition-all active:scale-90 shadow-lg shadow-blue-600/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
