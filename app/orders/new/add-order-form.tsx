"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface Client {
  id: string;
  brideName: string;
  groomName: string;
  eventLocation: string;
}

interface OrderItem {
  id: string;
  name: string;
  quantity: string; // Changed to string
  price: string; // Changed to string
  total: number;
}

const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        const maxWidth = 1200;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const reader = new FileReader();
              reader.readAsDataURL(blob);
              reader.onload = () => resolve(reader.result as string);
              reader.onerror = reject;
            }
          },
          "image/jpeg",
          0.85
        );
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
};

export default function AddOrderForm({ clients }: { clients: Client[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [selectedClient, setSelectedClient] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [items, setItems] = useState<OrderItem[]>([
    { id: "1", name: "", quantity: "1", price: "0", total: 0 },
  ]);

  const [stageModelPhoto, setStageModelPhoto] = useState<string>("");
  const [tentColorPhoto, setTentColorPhoto] = useState<string>("");
  const [dressPhotos, setDressPhotos] = useState<string[]>(["", "", ""]);

  const [chairModel, setChairModel] = useState("");
  const [softlensColor, setSoftlensColor] = useState("");
  const [specialRequest, setSpecialRequest] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("Belum Lunas");
  const [dpNumber, setDpNumber] = useState("1");
  const [paidAmount, setPaidAmount] = useState("0");

  const handleClientChange = (clientId: string) => {
    setSelectedClient(clientId);
    const client = clients.find((c) => c.id === clientId);
    if (client) {
      setEventLocation(client.eventLocation);
    }
  };

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (value: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setError("Format foto harus JPG, JPEG, PNG, atau WebP");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Ukuran foto maksimal 10MB");
      return;
    }

    try {
      const compressed = await compressImage(file);
      setter(compressed);
      setError("");
    } catch {
      setError("Gagal memproses foto");
    }
  };

  const handleDressPhotoUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setError("Format foto harus JPG, JPEG, PNG, atau WebP");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Ukuran foto maksimal 10MB");
      return;
    }

    try {
      const compressed = await compressImage(file);
      const newPhotos = [...dressPhotos];
      newPhotos[index] = compressed;
      setDressPhotos(newPhotos);
      setError("");
    } catch {
      setError("Gagal memproses foto");
    }
  };

  const calculateItemTotal = (quantity: string, price: string): number => {
    const qty = parseInt(quantity) || 0;
    const prc = parseFloat(price) || 0;
    return qty * prc;
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        id: Date.now().toString(),
        name: "",
        quantity: "1",
        price: "0",
        total: 0,
      },
    ]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof OrderItem, value: string) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          if (field === "quantity" || field === "price") {
            updated.total = calculateItemTotal(
              field === "quantity" ? value : item.quantity,
              field === "price" ? value : item.price
            );
          }
          return updated;
        }
        return item;
      })
    );
  };

  const grandTotal = items.reduce((sum, item) => sum + item.total, 0);
  const remainingAmount = grandTotal - (parseFloat(paidAmount) || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!selectedClient) {
      setError("Silakan pilih client");
      setLoading(false);
      return;
    }

    if (items.some((item) => !item.name || parseFloat(item.price) <= 0)) {
      setError("Silakan lengkapi semua detail item");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: selectedClient,
          eventLocation,
          items: items.map(({ id: _id, quantity, price, ...item }) => ({
            ...item,
            quantity: parseInt(quantity),
            price: parseFloat(price),
            total: item.total,
          })),
          stageModelPhoto: stageModelPhoto || null,
          chairModel: chairModel || null,
          tentColorPhoto: tentColorPhoto || null,
          softlensColor: softlensColor || null,
          dressPhotos: dressPhotos.filter((p) => p !== ""),
          specialRequest: specialRequest || null,
          totalAmount: grandTotal,
          paidAmount: parseFloat(paidAmount || "0"),
          paymentStatus,
          dpNumber: parseInt(dpNumber),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create order");
      }

      router.push("/orders");
      router.refresh();
    } catch (err: unknown) {
      console.error("Submit error:", err);
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Informasi Klien */}
      <div className="bg-white border border-[#d4b896] rounded-xl p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-bold text-black mb-4 sm:mb-6">
          Informasi Klien
        </h2>
        <div className="space-y-4 sm:space-y-6">
          <div>
            <Label className="text-sm sm:text-base">Pilih Klien</Label>
            <select
              value={selectedClient}
              onChange={(e) => handleClientChange(e.target.value)}
              required
              className="w-full h-10 sm:h-12 mt-2 rounded-lg border border-[#d4b896] bg-white px-3 sm:px-4 text-sm sm:text-base text-black focus:ring-2 focus:ring-[#d4b896]/50 focus:outline-none"
            >
              <option value="">
                Pilih klien yang sudah ada atau tambahkan yang baru
              </option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.brideName} & {client.groomName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label className="text-sm sm:text-base">Lokasi Acara</Label>
            <Input
              type="text"
              value={eventLocation}
              onChange={(e) => setEventLocation(e.target.value)}
              placeholder="cth: Gedung Serbaguna, Rumah"
              required
              className="mt-2 text-sm sm:text-base"
            />
          </div>
        </div>
      </div>

      {/* Item & Layanan yang Dipesan */}
      <div className="bg-white border border-[#d4b896] rounded-xl p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-bold text-black mb-4 sm:mb-6">
          Item & Layanan yang Dipesan
        </h2>

        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <div className="min-w-[600px] px-4 sm:px-0">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#d4b896]">
                  <th className="text-left text-xs sm:text-sm font-medium text-gray-600 pb-2 sm:pb-3">
                    Item
                  </th>
                  <th className="text-left text-xs sm:text-sm font-medium text-gray-400 pb-2 sm:pb-3 w-20 sm:w-24">
                    Jml
                  </th>
                  <th className="text-left text-xs sm:text-sm font-medium text-gray-400 pb-2 sm:pb-3 w-32 sm:w-40">
                    Harga
                  </th>
                  <th className="text-left text-xs sm:text-sm font-medium text-gray-400 pb-2 sm:pb-3 w-32 sm:w-40">
                    Total
                  </th>
                  <th className="text-left text-xs sm:text-sm font-medium text-gray-400 pb-2 sm:pb-3 w-16 sm:w-20">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-[#d4b896]">
                    <td className="py-2 sm:py-3">
                      <Input
                        type="text"
                        value={item.name}
                        onChange={(e) =>
                          updateItem(item.id, "name", e.target.value)
                        }
                        placeholder="Paket Rias Pengantin"
                        required
                        className="bg-white border-[#d4b896] text-black text-sm sm:text-base"
                      />
                    </td>
                    <td className="py-2 sm:py-3 px-1 sm:px-2">
                      <Input
                        type="number"
                        inputMode="numeric"
                        min="1"
                        step="1"
                        value={item.quantity}
                        onChange={(e) =>
                          updateItem(item.id, "quantity", e.target.value)
                        }
                        required
                        className="bg-white border-[#d4b896] text-black text-sm sm:text-base"
                      />
                    </td>
                    <td className="py-2 sm:py-3 px-1 sm:px-2">
                      <Input
                        type="number"
                        inputMode="numeric"
                        min="0"
                        step="1"
                        value={item.price}
                        onChange={(e) =>
                          updateItem(item.id, "price", e.target.value)
                        }
                        required
                        className="bg-white border-[#d4b896] text-black text-sm sm:text-base"
                      />
                    </td>
                    <td className="py-2 sm:py-3 px-1 sm:px-2">
                      <div className="px-2 sm:px-4 py-2 bg-gray-100 rounded-lg text-black text-xs sm:text-sm">
                        Rp{item.total.toLocaleString("id-ID")}
                      </div>
                    </td>
                    <td className="py-2 sm:py-3 px-1 sm:px-2">
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        disabled={items.length === 1}
                        className="p-1.5 sm:p-2 text-gray-400 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        <span className="material-symbols-outlined text-lg sm:text-xl">
                          delete
                        </span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <button
          type="button"
          onClick={addItem}
          className="mt-3 sm:mt-4 flex items-center gap-2 text-[#d4b896] hover:text-[#c4a886] transition-colors text-sm sm:text-base"
        >
          <span className="material-symbols-outlined text-lg sm:text-xl">
            add
          </span>
          <span>Tambah Item</span>
        </button>

        <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-[#d4b896] space-y-2 sm:space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-base sm:text-lg font-semibold text-black">
              Total
            </span>
            <span className="text-xl sm:text-2xl font-bold text-black">
              Rp{grandTotal.toLocaleString("id-ID")}
            </span>
          </div>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
            <span className="text-xs sm:text-sm text-gray-600">
              Uang yang Dibayar
            </span>
            <Input
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={paidAmount}
              onChange={(e) => setPaidAmount(e.target.value)}
              placeholder="0"
              className="w-full sm:w-48 bg-white border-[#d4b896] text-black text-sm sm:text-base"
            />
          </div>
          <div className="flex justify-between items-center text-xs sm:text-sm text-gray-600">
            <span>Sisa yang Harus Dibayar</span>
            <span className="font-semibold">
              Rp{remainingAmount.toLocaleString("id-ID")}
            </span>
          </div>
        </div>
      </div>

      {/* Detail Dekorasi Pernikahan */}
      <div className="bg-white border border-[#d4b896] rounded-xl p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-bold text-black mb-4 sm:mb-6">
          Detail Dekorasi Pernikahan
        </h2>

        <div className="space-y-4 sm:space-y-6">
          <div>
            <Label className="text-sm sm:text-base">
              Foto Model Pelaminan (Opsional)
            </Label>
            <p className="text-xs text-gray-400 mt-1 mb-2 sm:mb-3">
              Upload foto model pelaminan (Max 10MB, JPG/PNG/WebP)
            </p>
            <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
              <div className="flex-1 w-full">
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={(e) => handleImageUpload(e, setStageModelPhoto)}
                  className="w-full text-xs sm:text-sm text-gray-400 file:mr-2 sm:file:mr-4 file:py-2 file:px-3 sm:file:px-4 file:rounded-lg file:border-0 file:bg-[#d4b896] file:text-black file:cursor-pointer hover:file:bg-[#c4a886] file:text-xs sm:file:text-sm"
                />
              </div>
              {stageModelPhoto && (
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden border-2 border-[#d4b896]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={stageModelPhoto}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>

          <div>
            <Label className="text-sm sm:text-base">
              Kursi Pelaminan (Opsional)
            </Label>
            <Input
              type="text"
              value={chairModel}
              onChange={(e) => setChairModel(e.target.value)}
              placeholder="cth: Sofa, Kursi tunggal"
              className="mt-2 text-sm sm:text-base"
            />
          </div>

          <div>
            <Label className="text-sm sm:text-base">
              Foto Warna Kain Tenda (Opsional)
            </Label>
            <p className="text-xs text-gray-400 mt-1 mb-2 sm:mb-3">
              Upload foto warna kain tenda (Max 10MB, JPG/PNG/WebP)
            </p>
            <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
              <div className="flex-1 w-full">
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={(e) => handleImageUpload(e, setTentColorPhoto)}
                  className="w-full text-xs sm:text-sm text-gray-400 file:mr-2 sm:file:mr-4 file:py-2 file:px-3 sm:file:px-4 file:rounded-lg file:border-0 file:bg-[#d4b896] file:text-black file:cursor-pointer hover:file:bg-[#c4a886] file:text-xs sm:file:text-sm"
                />
              </div>
              {tentColorPhoto && (
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden border-2 border-[#d4b896]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={tentColorPhoto}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>

          <div>
            <Label className="text-sm sm:text-base">
              Warna Tenda (Opsional)
            </Label>
            <Input
              type="text"
              value={softlensColor}
              onChange={(e) => setSoftlensColor(e.target.value)}
              placeholder="cth: Coklat, Abu-abu"
              className="mt-2 text-sm sm:text-base"
            />
          </div>

          <div>
            <Label className="text-sm sm:text-base">
              Foto Gaun - 3 Foto (Opsional)
            </Label>
            <p className="text-xs text-gray-400 mt-1 mb-2 sm:mb-3">
              Upload hingga 3 foto gaun (Max 10MB per foto, JPG/PNG/WebP)
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
              {[0, 1, 2].map((index) => (
                <div key={index} className="space-y-2">
                  <p className="text-xs text-gray-400">Foto Gaun {index + 1}</p>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={(e) => handleDressPhotoUpload(e, index)}
                    className="w-full text-xs text-gray-400 file:mr-2 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-[#d4b896] file:text-black file:cursor-pointer hover:file:bg-[#c4a886] file:text-xs"
                  />
                  {dressPhotos[index] && (
                    <div className="w-full aspect-square rounded-lg overflow-hidden border-2 border-[#d4b896]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={dressPhotos[index]}
                        alt={`Gaun ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-sm sm:text-base">Permintaan Opsional</Label>
            <textarea
              value={specialRequest}
              onChange={(e) => setSpecialRequest(e.target.value)}
              rows={4}
              placeholder="Tulis permintaan tambahan di sini..."
              className="w-full mt-2 rounded-lg border border-[#d4b896] bg-white px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-black focus:ring-2 focus:ring-[#d4b896]/50 focus:outline-none resize-none"
            />
          </div>
        </div>
      </div>

      {/* Pembayaran */}
      <div className="bg-white border border-[#d4b896] rounded-xl p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-bold text-black mb-4 sm:mb-6">
          Pembayaran
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <Label className="text-sm sm:text-base">Status Pembayaran</Label>
            <select
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
              className="w-full h-10 sm:h-12 mt-2 rounded-lg border border-[#d4b896] bg-white px-3 sm:px-4 text-sm sm:text-base text-black focus:ring-2 focus:ring-[#d4b896]/50 focus:outline-none"
            >
              <option value="Belum Lunas">Belum Lunas</option>
              <option value="Lunas">Lunas</option>
            </select>
          </div>

          <div>
            <Label className="text-sm sm:text-base">Pembayaran DP ke</Label>
            <select
              value={dpNumber}
              onChange={(e) => setDpNumber(e.target.value)}
              className="w-full h-10 sm:h-12 mt-2 rounded-lg border border-[#d4b896] bg-white px-3 sm:px-4 text-sm sm:text-base text-black focus:ring-2 focus:ring-[#d4b896]/50 focus:outline-none"
            >
              <option value="1">DP1</option>
              <option value="2">DP2</option>
              <option value="3">DP3</option>
            </select>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-end gap-3 sm:gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base text-gray-600 hover:text-black transition-colors"
        >
          Batal
        </button>
        <Button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto bg-[#d4b896] hover:bg-[#c4a886] text-black px-6 sm:px-8 text-sm sm:text-base"
        >
          {loading ? "Membuat Pesanan..." : "Buat Pesanan"}
        </Button>
      </div>
    </form>
  );
}
