"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/utils/supabaseClient";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Send, ArrowLeft, Loader2, User as UserIcon } from "lucide-react";
import Link from "next/link";

export default function ChatPage() {
  const { id: conversationId } = useParams();
  const router = useRouter();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [conversation, setConversation] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
            ad:ads(title, image_url, price),
            buyer:profiles!conversations_buyer_id_fkey(username, avatar_url),
            seller:profiles!conversations_seller_id_fkey(username, avatar_url)
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
      const container = scrollContainerRef.current;
      container.scrollTop = container.scrollHeight;
    }
  }, [messages, loading]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser) return;

    const content = newMessage;
    setNewMessage("");

    const tempId = Math.random().toString();
    const tempMessage = {
      id: tempId,
      content: content,
      sender_id: currentUser.id,
      conversation_id: conversationId,
      created_at: new Date().toISOString(),
      is_read: false,
    };

    setMessages((prev) => [...prev, tempMessage]);

    const { data, error } = await supabase
      .from("messages")
      .insert({
        conversation_id: conversationId,
        sender_id: currentUser.id,
        content: content,
        is_read: false,
      })
      .select()
      .single();

    if (error) {
      alert("Kunde inte skicka");
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
    } else {
      setMessages((prev) => prev.map((m) => (m.id === tempId ? data : m)));
    }
  };

  if (error)
    return (
      <div className="h-[calc(100vh-64px)] flex flex-col items-center justify-center p-4">
        <p className="text-red-500 font-bold mb-4">{error}</p>
        <Link
          href="/messages"
          className="bg-slate-900 text-white px-6 py-2 rounded-full text-sm font-bold"
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

  const otherUser =
    currentUser?.id === conversation.buyer_id
      ? conversation.seller
      : conversation.buyer;

  return (
    <div className="fixed inset-0 top-16 flex flex-col bg-slate-50 overflow-hidden">
      <div className="flex-1 flex flex-col max-w-4xl w-full mx-auto bg-white border-x border-slate-200 overflow-hidden relative">
      
        <div className="bg-white border-b border-slate-100 p-4 flex items-center gap-4 z-20">
          <Link
            href="/messages"
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-slate-600" />
          </Link>
          <div className="h-10 w-10 rounded-full bg-slate-100 relative overflow-hidden flex-shrink-0 border border-slate-200">
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
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-slate-900 truncate leading-tight">
              {otherUser?.username || "Användare"}
            </h2>
            <p className="text-[11px] text-slate-500 truncate font-medium uppercase tracking-tighter">
              Film: {conversation.ad?.title}
            </p>
          </div>
        </div>

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
                  <p className="text-[15px] leading-relaxed whitespace-pre-wrap">
                    {msg.content}
                  </p>
                  <div className="flex items-center justify-end gap-1.5 mt-1.5 opacity-60">
                    <p className="text-[9px] font-medium uppercase">
                      {new Date(msg.created_at).toLocaleTimeString("sv-SE", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      })}
                    </p>
                    {isMine && (
                      <span className="text-[10px] font-bold">
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
              className="flex-1 bg-slate-100 border-none rounded-2xl px-5 py-3.5 text-[15px] text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/10 transition-all"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
            <button
              type="submit"
              className="bg-blue-600 text-white p-3.5 rounded-2xl hover:bg-blue-700 transition-all active:scale-90 shadow-lg shadow-blue-600/20"
            >
              <Send className="h-5 w-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
