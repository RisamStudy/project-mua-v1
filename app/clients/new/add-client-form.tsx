"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface FormData {
  brideName: string;
  groomName: string;
  primaryPhone: string;
  secondaryPhone: string;
  brideAddress: string;
  groomAddress: string;
  brideParents: string;
  groomParents: string;
  ceremonyDate: string;
  ceremonyTime: string;
  ceremonyEndTime: string;
  receptionDate: string;
  receptionTime: string;
  receptionEndTime: string;
  eventLocation: string;
}

export default function AddClientForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<FormData>({
    brideName: "",
    groomName: "",
    primaryPhone: "",
    secondaryPhone: "",
    brideAddress: "",
    groomAddress: "",
    brideParents: "",
    groomParents: "",
    ceremonyDate: "",
    ceremonyTime: "",
    ceremonyEndTime: "",
    receptionDate: "",
    receptionTime: "",
    receptionEndTime: "",
    eventLocation: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/clients/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create client");
      }

      router.push("/clients");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-[#d4b896] rounded-xl p-6 md:p-8"
    >
      {error && (
        <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bride's Name */}
        <div>
          <Label>Nama Pengantin Wanita</Label>
          <Input
            type="text"
            name="brideName"
            placeholder="e.g., Jane Doe"
            value={formData.brideName}
            onChange={handleChange}
            required
            className="mt-2 bg-white border-[#d4b896] text-black"
          />
        </div>

        {/* Groom's Name */}
        <div>
          <Label>Nama Pengantin Pria</Label>
          <Input
            type="text"
            name="groomName"
            placeholder="e.g., John Smith"
            value={formData.groomName}
            onChange={handleChange}
            required
            className="mt-2 bg-white border-[#d4b896] text-black"
          />
        </div>

        {/* Primary Phone */}
        <div>
          <Label>Nomor HP Pengantin Wanita</Label>
          <Input
            type="tel"
            name="primaryPhone"
            placeholder="e.g., 081234567890"
            value={formData.primaryPhone}
            onChange={handleChange}
            required
            className="mt-2 bg-white border-[#d4b896] text-black"
          />
        </div>

        {/* Secondary Phone */}
        <div>
          <Label>Nomor HP Pengantin Pria</Label>
          <Input
            type="tel"
            name="secondaryPhone"
            placeholder="e.g., 081234567890"
            value={formData.secondaryPhone}
            onChange={handleChange}
            className="mt-2 bg-white border-[#d4b896] text-black"
          />
        </div>

        {/* Bride's Address */}
        <div>
          <Label>Alamat Pengantin Wanita</Label>
          <Input
            type="text"
            name="brideAddress"
            placeholder="Jl. Contoh Kec.Contoh Kota Contoh"
            value={formData.brideAddress}
            onChange={handleChange}
            required
            className="mt-2 bg-white border-[#d4b896] text-black"
          />
        </div>

        {/* Groom's Address */}
        <div>
          <Label>Alamat Pengantin Pria</Label>
          <Input
            type="text"
            name="groomAddress"
            placeholder="e.g., 456 Oak Ave, Anytown, USA 12345"
            value={formData.groomAddress}
            onChange={handleChange}
            required
            className="mt-2 bg-white border-[#d4b896] text-black"
          />
        </div>

        {/* Bride's Parents */}
        <div>
          <Label>Nama Orang Tua Pengantin Wanita</Label>
          <Input
            type="text"
            name="brideParents"
            placeholder="e.g., Mr. & Mrs. Doe"
            value={formData.brideParents}
            onChange={handleChange}
            required
            className="mt-2 bg-white border-[#d4b896] text-black"
          />
        </div>

        {/* Groom's Parents */}
        <div>
          <Label>Nama Orang Tua Pengantin Pria</Label>
          <Input
            type="text"
            name="groomParents"
            placeholder="e.g., Mr. & Mrs. Smith"
            value={formData.groomParents}
            onChange={handleChange}
            required
            className="mt-2 bg-white border-[#d4b896] text-black"
          />
        </div>

        {/* Ceremony Date */}
        <div>
          <Label>Tanggal Akad (Opsional)</Label>
          <Input
            type="date"
            name="ceremonyDate"
            value={formData.ceremonyDate}
            onChange={handleChange}
            className="mt-2 bg-white border-[#d4b896] text-black"
          />
        </div>

        {/* Ceremony Time */}
        <div>
          <Label>Jam Akad</Label>
          <Input
            type="time"
            name="ceremonyTime"
            value={formData.ceremonyTime}
            onChange={handleChange}
            placeholder="e.g., 09:00"
            className="mt-2 bg-white border-[#d4b896] text-black"
          />
        </div>

        {/* Ceremony End Time */}
        <div>
          <Label>Jam Kelar Akad</Label>
          <Input
            type="time"
            name="ceremonyEndTime"
            value={formData.ceremonyEndTime}
            onChange={handleChange}
            placeholder="e.g., 11:00"
            className="mt-2 bg-white border-[#d4b896] text-black"
          />
        </div>

        {/* Reception Date */}
        <div>
          <Label>Tanggal Resepsi (Opsional)</Label>
          <Input
            type="date"
            name="receptionDate"
            value={formData.receptionDate}
            onChange={handleChange}
            className="mt-2 bg-white border-[#d4b896] text-black"
          />
        </div>

        {/* Reception Time */}
        <div>
          <Label>Jam Resepsi</Label>
          <Input
            type="time"
            name="receptionTime"
            value={formData.receptionTime}
            onChange={handleChange}
            placeholder="e.g., 18:00"
            className="mt-2 bg-white border-[#d4b896] text-black"
          />
        </div>

        {/* Reception End Time */}
        <div>
          <Label>Jam Kelar Resepsi</Label>
          <Input
            type="time"
            name="receptionEndTime"
            value={formData.receptionEndTime}
            onChange={handleChange}
            placeholder="e.g., 22:00"
            className="mt-2 bg-white border-[#d4b896] text-black"
          />
        </div>

        {/* Event Location - Full Width */}
        <div className="md:col-span-2">
          <Label>Lokasi Acara</Label>
          <Input
            type="text"
            name="eventLocation"
            placeholder="e.g., Grand Ballroom, 789 Event Plaza, Anytown, USA"
            value={formData.eventLocation}
            onChange={handleChange}
            required
            className="mt-2 bg-white border-[#d4b896] text-black"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-end gap-4 mt-8">
        <button
          type="button"
          onClick={() => router.back()}
          className="w-full sm:w-auto px-6 py-3 text-gray-600 hover:text-black transition-colors"
        >
          Cancel
        </button>
        <Button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto bg-[#d4b896] hover:bg-[#c4a886] text-black px-8"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined animate-spin">
                refresh
              </span>
              Menambahkan...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined">add</span>
              Tambahkan Klien
            </span>
          )}
        </Button>
      </div>
    </form>
  );
}
