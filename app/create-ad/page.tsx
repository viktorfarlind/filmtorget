"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabaseClient";
import {
  Upload,
  Loader2,
  ArrowLeft,
  DollarSign,
  Layers,
  Type,
  FileText,
  CheckCircle2,
  Globe,
  PlusCircle,
  Disc,
} from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import Link from "next/link";
import Image from "next/image";

export default function CreateAdPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [format, setFormat] = useState("Blu-ray");
  const [condition, setCondition] = useState("Nyskick");
  const [region, setRegion] = useState("B / 2 (Europa)");
  const [isSteelbook, setIsSteelbook] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.push("/login");
      setUser(user);
    });
  }, [router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !imageFile) return alert("Du måste välja en bild.");

    setLoading(true);

    try {
      const fileExt = imageFile.name.split(".").pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("ad-images")
        .upload(filePath, imageFile);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("ad-images").getPublicUrl(filePath);

      const { error: insertError } = await supabase.from("ads").insert({
        user_id: user.id,
        title,
        description,
        price: parseInt(price),
        format,
        condition,
        region_code: region,
        is_steelbook: isSteelbook,
        image_url: publicUrl,
      });

      if (insertError) throw insertError;

      router.push("/");
      router.refresh();
    } catch (error: any) {
      alert("Fel: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-20 relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 pt-8 relative z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-slate-300 hover:text-white transition-colors mb-8 group bg-white/5 px-4 py-2 rounded-full border border-white/10 cursor-pointer focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-bold uppercase tracking-widest">
            Avbryt
          </span>
        </Link>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col lg:flex-row gap-8"
        >
          <div className="lg:w-1/3 space-y-6">
            <div className="bg-white/5 border border-white/20 backdrop-blur-xl p-6 rounded-[2.5rem] shadow-2xl">
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-300 mb-4 ml-1">
                Omslagsbild
              </label>
              <div
                className={`relative aspect-2/3 w-full bg-slate-900/50 rounded-2xl border-2 border-dashed border-white/20 overflow-hidden hover:border-blue-500 transition-all group cursor-pointer ${
                  !imagePreview ? "flex items-center justify-center" : ""
                }`}
              >
                {imagePreview ? (
                  <>
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold uppercase text-xs tracking-widest">
                      Byt bild
                    </div>
                  </>
                ) : (
                  <div className="text-center p-6">
                    <Upload className="h-8 w-8 text-blue-400 mx-auto mb-3" />
                    <span className="text-xs text-slate-300 font-bold uppercase tracking-wide">
                      Ladda upp bild
                    </span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  required={!imagePreview}
                />
              </div>
            </div>

            <div className="bg-white/5 border border-white/20 backdrop-blur-xl p-6 rounded-[2.5rem] shadow-2xl">
              <label className="flex items-center gap-4 cursor-pointer group">
                <div
                  className={`w-7 h-7 rounded-xl border flex items-center justify-center transition-all ${
                    isSteelbook
                      ? "bg-blue-600 border-blue-600"
                      : "bg-slate-900 border-white/30 group-hover:border-blue-400"
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
                <div className="flex-1">
                  <span className="block text-sm font-bold text-white tracking-wide">
                    Steelbook
                  </span>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                    Fodral av metall
                  </span>
                </div>
              </label>
            </div>
          </div>

          <div className="lg:w-2/3">
            <div className="bg-white/5 border border-white/20 backdrop-blur-xl p-8 md:p-10 rounded-[2.5rem] shadow-2xl space-y-8">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-300 ml-1">
                  <Type className="h-3.5 w-3.5 text-blue-400" /> Filmtitel
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-white/20 rounded-2xl py-4 px-6 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                  placeholder="T.ex. Man of Steel"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-300 ml-1">
                    <DollarSign className="h-3.5 w-3.5 text-blue-400" /> Pris
                    (SEK)
                  </label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full bg-slate-900 border border-white/20 rounded-2xl py-4 px-6 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                    placeholder="1337"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-300 ml-1">
                    <Disc className="h-3.5 w-3.5 text-blue-400" /> Format
                  </label>
                  <div className="relative">
                    <select
                      value={format}
                      onChange={(e) => setFormat(e.target.value)}
                      className="w-full bg-slate-900 border border-white/20 rounded-2xl py-4 px-6 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium appearance-none cursor-pointer"
                    >
                      <option value="4K UHD">4K UHD</option>
                      <option value="Blu-ray">Blu-ray</option>
                      <option value="DVD">DVD</option>
                      <option value="VHS">VHS</option>
                    </select>
                    <Layers className="absolute right-6 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-300 ml-1">
                  <Globe className="h-3.5 w-3.5 text-blue-400" /> Region
                </label>
                <div className="relative">
                  <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="w-full bg-slate-900 border border-white/20 rounded-2xl py-4 px-6 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium appearance-none cursor-pointer"
                  >
                    <option value="B / 2 (Europa)">B / 2 (Europa)</option>
                    <option value="A / 1 (USA)">A / 1 (USA)</option>
                    <option value="C / 3 (Asien)">C / 3 (Asien)</option>
                    <option value="Regionfri">Regionfri (ABC / 0)</option>
                  </select>
                  <Globe className="absolute right-6 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-300 ml-1">
                  <Layers className="h-3.5 w-3.5 text-blue-400" /> Skick
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {["Nyskick", "Mycket bra", "Bra"].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setCondition(opt)}
                      className={`py-3 px-4 rounded-xl text-xs font-bold uppercase border transition-all cursor-pointer focus:ring-2 focus:ring-blue-500 outline-none ${
                        condition === opt
                          ? "bg-blue-600 border-blue-600 text-white shadow-lg"
                          : "bg-slate-900 border-white/20 text-slate-300 hover:border-white/40 hover:text-white"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-300 ml-1">
                  <FileText className="h-3.5 w-3.5 text-blue-400" /> Beskrivning
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-900 border border-white/20 rounded-2xl py-4 px-6 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium resize-none"
                  placeholder="Skriv lite om filmen, t.ex. om det finns svensk text..."
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold uppercase tracking-widest py-5 rounded-2xl transition-all shadow-xl shadow-blue-600/20 active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer focus:ring-4 focus:ring-blue-500/50 outline-none"
              >
                {loading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <>
                    Publicera annons
                    <PlusCircle className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
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
