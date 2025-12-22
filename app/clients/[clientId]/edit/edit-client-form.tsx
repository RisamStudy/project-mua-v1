"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface Client {
  id: string;
  brideName: string;
  groomName: string;
  primaryPhone: string;
  secondaryPhone: string | null;
  brideAddress: string;
  groomAddress: string;
  brideParents: string;
  groomParents: string;
  ceremonyDate: Date;
  ceremonyTime: string | null;
  receptionDate: Date;
  receptionTime: string | null;
  eventLocation: string;
}

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
  receptionDate: string;
  receptionTime: string;
  eventLocation: string;
}

export default function EditClientForm({ client }: { client: Client }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Format dates untuk input type="date"
  const formatDateForInput = (date: Date) => {
    return new Date(date).toISOString().split("T")[0];
  };

  const [formData, setFormData] = useState<FormData>({
    brideName: client.brideName,
    groomName: client.groomName,
    primaryPhone: client.primaryPhone,
    secondaryPhone: client.secondaryPhone || "",
    brideAddress: client.brideAddress,
    groomAddress: client.groomAddress,
    brideParents: client.brideParents,
    groomParents: client.groomParents,
    ceremonyDate: formatDateForInput(client.ceremonyDate),
    ceremonyTime: client.ceremonyTime || "",
    receptionDate: formatDateForInput(client.receptionDate),
    receptionTime: client.receptionTime || "",
    eventLocation: client.eventLocation,
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
      const response = await fetch(`/api/clients/${client.id}/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update client");
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
    <>
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <Link
          href="/clients"
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
        >
          <span className="material-symbols-outlined">arrow_back</span>
          <span>Back to Client List</span>
        </Link>

        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
          Edit Client
        </h1>
        <p className="text-sm md:text-base text-gray-400">
          Perbarui detail untuk {client.brideName} & {client.groomName}.
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl p-6 md:p-8"
      >
        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Client Information Section */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-6">
            Informasi Client
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Bride's Name */}
            <div>
              <Label>Nama Pengantin Wanita</Label>
              <Input
                type="text"
                name="brideName"
                value={formData.brideName}
                onChange={handleChange}
                required
                className="mt-2 bg-[#1a1a1a] border-[#2a2a2a] text-white"
              />
            </div>

            {/* Groom's Name */}
            <div>
              <Label>Nama Pengantin Pria</Label>
              <Input
                type="text"
                name="groomName"
                value={formData.groomName}
                onChange={handleChange}
                required
                className="mt-2 bg-[#1a1a1a] border-[#2a2a2a] text-white"
              />
            </div>

            {/* Primary Phone */}
            <div>
              <Label>Nomor Telephone Wanita</Label>
              <Input
                type="tel"
                name="primaryPhone"
                value={formData.primaryPhone}
                onChange={handleChange}
                required
                className="mt-2 bg-[#1a1a1a] border-[#2a2a2a] text-white"
              />
            </div>

            {/* Secondary Phone */}
            <div>
              <Label>Nomor Telephone Pria</Label>
              <Input
                type="tel"
                name="secondaryPhone"
                value={formData.secondaryPhone}
                onChange={handleChange}
                className="mt-2 bg-[#1a1a1a] border-[#2a2a2a] text-white"
              />
            </div>
          </div>
        </div>

        {/* Event Details Section */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-6">Detail Acara</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Ceremony Date */}
            <div>
              <Label>Tanggal Akad</Label>
              <Input
                type="date"
                name="ceremonyDate"
                value={formData.ceremonyDate}
                onChange={handleChange}
                required
                className="mt-2 bg-[#1a1a1a] border-[#2a2a2a] text-white"
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
                className="mt-2 bg-[#1a1a1a] border-[#2a2a2a] text-white"
              />
            </div>

            {/* Reception Date */}
            <div>
              <Label>Tanggal Resepsi</Label>
              <Input
                type="date"
                name="receptionDate"
                value={formData.receptionDate}
                onChange={handleChange}
                required
                className="mt-2 bg-[#1a1a1a] border-[#2a2a2a] text-white"
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
                className="mt-2 bg-[#1a1a1a] border-[#2a2a2a] text-white"
              />
            </div>
          </div>
        </div>

        {/* Addresses Section */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-6">Alamat</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Bride's Address */}
            <div>
              <Label>Alamat Pengantin Wanita</Label>
              <textarea
                name="brideAddress"
                value={formData.brideAddress}
                onChange={handleChange}
                required
                rows={3}
                className="w-full mt-2 rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] px-4 py-3 text-white focus:ring-2 focus:ring-[#d4b896]/50 focus:outline-none focus:border-[#d4b896] placeholder:text-gray-500 transition-colors resize-none"
              />
            </div>

            {/* Groom's Address */}
            <div>
              <Label>Alamat Pengantin Pria</Label>
              <textarea
                name="groomAddress"
                value={formData.groomAddress}
                onChange={handleChange}
                required
                rows={3}
                className="w-full mt-2 rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] px-4 py-3 text-white focus:ring-2 focus:ring-[#d4b896]/50 focus:outline-none focus:border-[#d4b896] placeholder:text-gray-500 transition-colors resize-none"
              />
            </div>
          </div>
        </div>

        {/* Parents' Information Section */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-6">
            Informasi Orang Tua
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Bride's Parents */}
            <div>
              <Label>Nama Orang Tua Pengantin Wanita</Label>
              <Input
                type="text"
                name="brideParents"
                value={formData.brideParents}
                onChange={handleChange}
                required
                className="mt-2 bg-[#1a1a1a] border-[#2a2a2a] text-white"
              />
            </div>

            {/* Groom's Parents */}
            <div>
              <Label>Nama Orang Tua Pengantin Pria</Label>
              <Input
                type="text"
                name="groomParents"
                value={formData.groomParents}
                onChange={handleChange}
                required
                className="mt-2 bg-[#1a1a1a] border-[#2a2a2a] text-white"
              />
            </div>
          </div>
        </div>

        {/* Event Location - Full Width */}
        <div className="mb-8">
          <Label>Lokasi Acara</Label>
          <Input
            type="text"
            name="eventLocation"
            value={formData.eventLocation}
            onChange={handleChange}
            required
            className="mt-2 bg-[#1a1a1a] border-[#2a2a2a] text-white"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-6 border-t border-[#2a2a2a]">
          <Link
            href="/clients"
            className="w-full sm:w-auto px-6 py-3 text-center text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </Link>
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
                Saving...
              </span>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </form>
    </>
  );
}
