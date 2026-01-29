"use client";

import { useState } from "react";
import { supabase } from "@/utils/supabaseClient";
import { useRouter } from "next/navigation";
import { MessageCircle, Loader2 } from "lucide-react";

type Props = {
  adId: string;
  sellerId: string;
  buyerId: string | undefined;
};

export default function ContactSellerButton({
  adId,
  sellerId,
  buyerId,
}: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleContact = async () => {
    setLoading(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const currentUserId = session?.user?.id || buyerId;

      if (!currentUserId) {
        router.push("/login");
        return;
      }

      const { data: existing } = await supabase
        .from("conversations")
        .select("id")
        .eq("ad_id", adId)
        .eq("buyer_id", currentUserId)
        .single();

      if (existing) {
        router.push(`/messages/${existing.id}`);
        return;
      }

      const { data: newConv, error: insertError } = await supabase
        .from("conversations")
        .insert({
          ad_id: adId,
          buyer_id: currentUserId,
          seller_id: sellerId,
        })
        .select("id")
        .single();

      if (insertError) throw insertError;

      router.push(`/messages/${newConv.id}`);
    } catch (error) {
      console.error("Chat error:", error);
      alert("Kunde inte starta konversationen.");
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleContact}
      disabled={loading}
      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-6 rounded-full shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
    >
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <>
          <MessageCircle className="w-5 h-5" />
          Kontakta säljaren
        </>
      )}
    </button>
  );
}
