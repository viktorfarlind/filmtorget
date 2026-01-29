"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/utils/supabaseClient";
import {
  Upload,
  Loader2,
  ArrowLeft,
  Film,
  DollarSign,
  Layers,
  Type,
  FileText,
  CheckCircle2,
  Save,
  Globe,
  ChevronDown,
} from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import Link from "next/link";
import Image from "next/image";
import { Ad } from "@/types/database";

export default function EditAdPage() {
  const router = useRouter();
  const params = useParams();
  const adId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [format, setFormat] = useState("Blu-ray");
  const [condition, setCondition] = useState("Nyskick");
  const [region, setRegion] = useState("B / 2 (Europa)");
  const [isSteelbook, setIsSteelbook] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchAd = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { data: ad, error } = await supabase
        .from("ads")
        .select("*")
        .eq("id", adId)
        .single();

      const adData = ad as Ad;

      if (error || !adData) {
        alert("Kunde inte hitta annonsen");
        router.push("/");
        return;
      }

      if (adData.user_id !== user.id) {
        alert("Ej behörig.");
        router.push("/");
        return;
      }

      setTitle(adData.title);
      setPrice(adData.price.toString());
      setDescription(adData.description || "");
      setFormat(adData.format);
      setCondition(adData.condition);
      setRegion(adData.region_code || "B / 2 (Europa)");
      setIsSteelbook(adData.is_steelbook);
      setCurrentImageUrl(adData.image_url);
      setImagePreview(adData.image_url);
      setLoading(false);
    };

    fetchAd();
  }, [adId, router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      let publicUrl = currentImageUrl;

      if (imageFile) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          const fileExt = imageFile.name.split(".").pop();
          const fileName = `${uuidv4()}.${fileExt}`;
          const filePath = `${user.id}/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from("ad-images")
            .upload(filePath, imageFile);

          if (uploadError) throw uploadError;

          const { data } = supabase.storage
            .from("ad-images")
            .getPublicUrl(filePath);

          publicUrl = data.publicUrl;
        }
      }

      const { error: updateError } = await supabase
        .from("ads")
        .update({
          title,
          description,
          price: parseInt(price),
          format,
          condition,
          region_code: region,
          is_steelbook: isSteelbook,
          image_url: publicUrl,
        })
        .eq("id", adId);

      if (updateError) throw updateError;

      router.push(`/ads/${adId}`);
      router.refresh();
    } catch (error) {
      const err = error as Error;
      alert("Fel vid uppdatering: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center bg-slate-50"
        role="status"
      >
        <Loader2 className="animate-spin h-8 w-8 text-blue-600 mb-2" />
        <span className="text-slate-600 font-bold uppercase tracking-widest text-xs">
          Laddar annons...
        </span>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <Link
            href={`/ads/${adId}`}
            className="inline-flex items-center text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors mb-4 group outline-none"
          >
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Avbryt och gå tillbaka
          </Link>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">
            Redigera annons
          </h1>
        </header>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col lg:flex-row gap-8"
        >
          <div className="lg:w-1/3 flex flex-col gap-6">
            <div className="bg-white p-5 rounded-4xl shadow-sm border border-slate-200">
              <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-4">
                Omslagsbild
              </label>
              <div className="relative aspect-2/3 w-full bg-slate-100 rounded-2xl border-2 border-dashed border-slate-300 overflow-hidden group">
                {imagePreview ? (
                  <>
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-black uppercase text-[10px] tracking-widest">
                      Byt bild
                    </div>
                  </>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                    <Upload className="h-8 w-8 mb-2" />
                    <span className="text-[10px] font-bold uppercase">
                      Ladda upp
                    </span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
            </div>

            <div className="bg-white p-5 rounded-[2.5rem] shadow-sm border border-slate-200">
              <label className="flex items-center gap-4 cursor-pointer group">
                <div
                  className={`w-7 h-7 rounded-xl border-2 flex items-center justify-center transition-all ${
                    isSteelbook
                      ? "bg-blue-600 border-blue-600 shadow-lg"
                      : "bg-white border-slate-200"
                  }`}
                >
                  {isSteelbook && (
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  )}
                </div>
                <input
                  type="checkbox"
                  checked={isSteelbook}
                  onChange={(e) => setIsSteelbook(e.target.checked)}
                  className="hidden"
                />
                <div className="flex flex-col">
                  <span className="text-sm font-black text-slate-900 uppercase italic">
                    Steelbook
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                    Fodral av metall
                  </span>
                </div>
              </label>
            </div>
          </div>

          <div className="lg:w-2/3 space-y-6">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                  <Type className="h-3.5 w-3.5 text-blue-500" /> Filmtitel
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 px-5 py-4 text-sm font-bold text-slate-900 focus:border-blue-500 outline-none transition-all uppercase italic"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                    <DollarSign className="h-3.5 w-3.5 text-blue-500" /> Pris
                    (SEK)
                  </label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 px-5 py-4 text-sm font-bold text-slate-900 focus:border-blue-500 outline-none transition-all uppercase italic"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                    <Film className="h-3.5 w-3.5 text-blue-500" /> Format
                  </label>
                  <div className="relative">
                    <select
                      value={format}
                      onChange={(e) => setFormat(e.target.value)}
                      className="w-full appearance-none rounded-2xl border-2 border-slate-100 bg-slate-50 px-5 py-4 text-sm font-black text-slate-900 uppercase italic focus:border-blue-500 outline-none cursor-pointer"
                    >
                      {["4K UHD", "Blu-ray", "DVD", "VHS"].map((f) => (
                        <option key={f} value={f}>
                          {f}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                  <Globe className="h-3.5 w-3.5 text-blue-500" /> Region
                </label>
                <div className="relative">
                  <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="w-full appearance-none rounded-2xl border-2 border-slate-100 bg-slate-50 px-5 py-4 text-sm font-black text-slate-900 uppercase italic focus:border-blue-500 outline-none cursor-pointer"
                  >
                    <option value="B / 2 (Europa)">B / 2 (Europa)</option>
                    <option value="A / 1 (USA)">A / 1 (USA)</option>
                    <option value="C / 3 (Asien)">C / 3 (Asien)</option>
                    <option value="Regionfri">Regionfri (ABC / 0)</option>
                  </select>
                  <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2 mb-3">
                  <Layers className="h-3.5 w-3.5 text-blue-500" /> Skick
                </span>
                <div className="grid grid-cols-3 gap-3">
                  {["Nyskick", "Mycket bra", "Bra"].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setCondition(opt)}
                      className={`py-4 px-3 rounded-2xl text-[12px] font-black uppercase border-2 transition-all outline-none ${
                        condition === opt
                          ? "bg-slate-950 text-white border-slate-950"
                          : "bg-slate-50 text-slate-600 border-slate-100"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                  <FileText className="h-3.5 w-3.5 text-blue-500" /> Beskrivning
                </label>
                <textarea
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 px-5 py-4 text-sm font-bold text-slate-900 focus:border-blue-500 outline-none transition-all resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-2xl bg-blue-600 py-5 text-sm font-black text-white uppercase tracking-widest shadow-xl hover:bg-blue-700 disabled:opacity-50 transition-all flex justify-center items-center gap-3"
              >
                {saving ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <Save className="h-5 w-5" /> Spara ändringar
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
