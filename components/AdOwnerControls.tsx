"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabaseClient";
import { Trash2, Edit, Loader2 } from "lucide-react";
import Link from "next/link";

export default function AdOwnerControls({
  adId,
  sellerId,
}: {
  adId: string;
  sellerId: string;
}) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    const checkOwner = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user && user.id === sellerId) {
        setIsOwner(true);
      }
    };
    checkOwner();
  }, [sellerId]);

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Är du helt säker? Detta tar bort annonsen permanent."
    );
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase.from("ads").delete().eq("id", adId);
      if (error) throw error;

      router.push("/");
      router.refresh();
    } catch (error) {
      alert("Kunde inte ta bort annonsen.");
      setIsDeleting(false);
    }
  };

  if (!isOwner) return null;

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mt-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/edit-ad/${adId}`}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold text-sm hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
        >
          <Edit className="h-4 w-4" /> Redigera
        </Link>

        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-50 text-red-600 font-bold text-sm hover:bg-red-100 transition-all border border-red-100"
        >
          {isDeleting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
          Ta bort
        </button>
      </div>
    </div>
  );
}
