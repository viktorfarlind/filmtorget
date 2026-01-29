"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabaseClient";
import { Trash2, Edit, Loader2, CheckCircle2, RotateCcw } from "lucide-react";
import Link from "next/link";

export default function AdOwnerControls({
  adId,
  sellerId,
  isSold: initialIsSold,
}: {
  adId: string;
  sellerId: string;
  isSold: boolean;
}) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [isSold, setIsSold] = useState(initialIsSold);

  useEffect(() => {
    setIsSold(initialIsSold);
  }, [initialIsSold]);

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

  const toggleSoldStatus = async () => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from("ads")
        .update({ is_sold: !isSold })
        .eq("id", adId);

      if (error) throw error;

      setIsSold(!isSold);
      router.refresh();
    } catch (error) {
      alert("Kunde inte uppdatera annonsens status.");
    } finally {
      setIsUpdating(false);
    }
  };

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
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mt-8 space-y-3">
      <div className="px-1 mb-1">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          Verktyg för säljare
        </p>
      </div>

      <button
        onClick={toggleSoldStatus}
        disabled={isUpdating}
        className={`w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl font-bold text-sm transition-all shadow-sm cursor-pointer ${
          isSold
            ? "bg-emerald-600 text-white hover:bg-emerald-700"
            : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
        }`}
      >
        {isUpdating ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isSold ? (
          <>
            <RotateCcw className="h-4 w-4" /> Gör tillgänglig igen
          </>
        ) : (
          <>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Markera som
            såld
          </>
        )}
      </button>

      {!isSold && (
        <div className="flex items-center gap-3">
          <Link
            href={`/edit-ad/${adId}`}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold text-sm hover:bg-slate-50 transition-all shadow-sm cursor-pointer"
          >
            <Edit className="h-4 w-4" /> Redigera
          </Link>

          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-50 text-red-600 font-bold text-sm hover:bg-red-100 transition-all border border-red-100 cursor-pointer"
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            Ta bort
          </button>
        </div>
      )}
    </div>
  );
}
