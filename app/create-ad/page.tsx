"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  Globe,
} from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import Link from "next/link";
import Image from "next/image";

export default function CreateAdPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Formulär-state
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
      console.error("Error:", error);
      alert("Fel: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Link
              href="/"
              className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors mb-2"
            >
              <ArrowLeft className="h-4 w-4 mr-1" /> Avbryt
            </Link>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Ny annons
            </h1>
            <p className="text-slate-500">
              Fyll i detaljerna för att sälja din film.
            </p>
          </div>
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
              <div
                className={`relative aspect-2/3 w-full bg-slate-50 rounded-xl border-2 border-dashed border-slate-300 overflow-hidden hover:border-blue-500 hover:bg-blue-50 transition-all group cursor-pointer ${
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
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-medium">
                      Byt bild
                    </div>
                  </>
                ) : (
                  <div className="text-center p-6">
                    <Upload className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                    <span className="text-sm text-slate-600 font-medium block">
                      Klicka för att ladda upp
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

            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
              <label className="flex items-center gap-3 cursor-pointer group">
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
                <div className="flex-1">
                  <span className="block text-sm font-bold text-slate-900">
                    Steelbook
                  </span>
                  <span className="block text-xs text-slate-500">
                    Kryssa i om fodralet är av metall
                  </span>
                </div>
              </label>
            </div>
          </div>

          <div className="lg:w-2/3 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Type className="h-4 w-4 text-slate-400" /> Titel
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="T.ex. The Dark Knight"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-slate-400" /> Pris (SEK)
                  </label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="149"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Film className="h-4 w-4 text-slate-400" /> Format
                  </label>
                  <div className="relative">
                    <select
                      value={format}
                      onChange={(e) => setFormat(e.target.value)}
                      className="w-full appearance-none rounded-xl border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                    >
                      <option value="4K UHD">4K UHD</option>
                      <option value="Blu-ray">Blu-ray</option>
                      <option value="DVD">DVD</option>
                      <option value="VHS">VHS</option>
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
                  <Layers className="h-4 w-4 text-slate-400" /> Skick
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
                  <FileText className="h-4 w-4 text-slate-400" /> Beskrivning
                </label>
                <textarea
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  placeholder="Är det svensk text? Några repor på skivan?..."
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-blue-600 py-4 text-sm font-bold text-white shadow-lg hover:bg-blue-700 transition-all flex justify-center items-center gap-2"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  "Publicera Annons"
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
