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
} from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import Link from "next/link";
import Image from "next/image";

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

      if (error || !ad) {
        alert("Kunde inte hitta annonsen");
        router.push("/");
        return;
      }

      if (ad.user_id !== user.id) {
        alert("Ej behörig.");
        router.push("/");
        return;
      }

      setTitle(ad.title);
      setPrice(ad.price.toString());
      setDescription(ad.description || "");
      setFormat(ad.format);
      setCondition(ad.condition);
      setRegion(ad.region_code || "B / 2 (Europa)");
      setIsSteelbook(ad.is_steelbook);
      setCurrentImageUrl(ad.image_url);
      setImagePreview(ad.image_url);
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
    } catch (error: any) {
      console.error("Error updating:", error);
      alert("Fel vid uppdatering: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <Link
            href={`/ads/${adId}`}
            className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Avbryt
          </Link>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Redigera annons
          </h1>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col lg:flex-row gap-8"
        >
          <div className="lg:w-1/3 flex flex-col gap-4">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
              <label className="block text-sm font-bold text-slate-900 mb-3">
                Omslagsbild
              </label>
              <div className="relative aspect-2/3 w-full bg-slate-50 rounded-xl border-2 border-dashed border-slate-300 overflow-hidden group cursor-pointer">
                {imagePreview && (
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-medium">
                  Ändra bild
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
              <label className="flex items-center gap-3 cursor-pointer">
                <div
                  className={`w-6 h-6 rounded border flex items-center justify-center transition-colors ${
                    isSteelbook
                      ? "bg-blue-600 border-blue-600"
                      : "bg-white border-slate-300"
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
                <span className="text-sm font-bold text-slate-900">
                  Steelbook
                </span>
              </label>
            </div>
          </div>

          <div className="lg:w-2/3 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Type className="h-4 w-4" /> Titel
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <DollarSign className="h-4 w-4" /> Pris
                  </label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Film className="h-4 w-4" /> Format
                  </label>
                  <div className="relative">
                    <select
                      value={format}
                      onChange={(e) => setFormat(e.target.value)}
                      className="w-full appearance-none rounded-xl border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                    >
                      {["4K UHD", "Blu-ray", "DVD", "VHS"].map((f) => (
                        <option key={f} value={f}>
                          {f}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-3.5 pointer-events-none text-slate-400">
                      <Layers className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Globe className="h-4 w-4 text-slate-400" /> Region
                </label>
                <div className="relative">
                  <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="w-full appearance-none rounded-xl border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                  >
                    <option value="B / 2 (Europa)">B / 2 (Europa)</option>
                    <option value="A / 1 (USA)">A / 1 (USA)</option>
                    <option value="C / 3 (Asien)">C / 3 (Asien)</option>
                    <option value="Regionfri">Regionfri (ABC / 0)</option>
                  </select>
                  <div className="absolute right-4 top-3.5 pointer-events-none text-slate-400">
                    <Globe className="h-4 w-4" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="h-4 w-4" /> Skick
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {["Nyskick", "Mycket bra", "Bra"].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setCondition(opt)}
                      className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all ${
                        condition === opt
                          ? "bg-slate-900 text-white border-slate-900"
                          : "bg-slate-50 text-slate-600 border-slate-200"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="h-4 w-4" /> Beskrivning
                </label>
                <textarea
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-full bg-blue-600 py-4 text-sm font-bold text-white shadow-lg hover:bg-blue-700 transition-all flex justify-center items-center gap-2"
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
