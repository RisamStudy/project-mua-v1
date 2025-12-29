"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Toast from "@/components/ui/toast";
import PaymentModal from "@/components/orders/payment-modal";
import { DropdownMenu, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { WhatsAppLink } from "@/components/ui/whatsapp-link";

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  total: number;
}

interface OrderDetails {
  id: string;
  orderNumber: string;
  client: {
    brideName: string;
    groomName: string;
    primaryPhone: string;
    secondaryPhone: string | null;
    ceremonyDate: string | null;
    ceremonyTime: string | null;
    ceremonyEndTime: string | null;
    receptionDate: string | null;
    receptionTime: string | null;
    receptionEndTime: string | null;
    eventLocation: string;
    brideAddress: string;
    groomAddress: string;
    brideParents: string | null;
    groomParents: string | null;
  };
  eventLocation: string;
  items: OrderItem[] | string | null;
  stageModelPhoto: string | null;
  chairModel: string | null;
  tentColorPhoto: string | null;
  softlensColor: string | null;
  dressPhotos: string[] | null;
  specialRequest: string | null;
  totalAmount: string;
  paidAmount: string;
  remainingAmount: string;
  paymentStatus: string;
  payments: Array<{
    id: string;
    paymentNumber: number;
    amount: string;
    paymentDate: string;
    notes: string | null;
  }>;
  createdAt: string;
}

export default function OrderDetailsView({ order }: { order: OrderDetails }) {
  const router = useRouter();
  const [generatingInvoice, setGeneratingInvoice] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [downloadingImage, setDownloadingImage] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    isOpen: boolean;
    message: string;
    type: "success" | "error";
  }>({
    isOpen: false,
    message: "",
    type: "success",
  });

  // Parse items - handle both array and stringified JSON
  const parseItems = (itemsData: OrderItem[] | string | null): OrderItem[] => {
    if (Array.isArray(itemsData)) return itemsData;
    if (typeof itemsData === "string") {
      try {
        const parsed = JSON.parse(itemsData);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  };

  const items = parseItems(order.items);
  const dressPhotos =
    order.dressPhotos && Array.isArray(order.dressPhotos)
      ? order.dressPhotos
      : [];

  const formatCurrency = (amount: string) => {
    return `Rp ${parseFloat(amount).toLocaleString("id-ID")}`;
  };

  const handleGenerateInvoice = async () => {
    setGeneratingInvoice(true);
    try {
      const response = await fetch(`/api/orders/${order.id}/generate-invoice`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dueDays: 7, // Default 7 days
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to generate invoice");
      }

      setToast({
        isOpen: true,
        message: "Invoice generated successfully!",
        type: "success",
      });

      setTimeout(() => {
        router.push(`/invoices/${data.invoiceId}`);
      }, 1500);
    } catch (err: unknown) {
      setToast({
        isOpen: true,
        message:
          err instanceof Error ? err.message : "Failed to generate invoice",
        type: "error",
      });
    } finally {
      setGeneratingInvoice(false);
    }
  };

  const handleDownloadPdf = async () => {
    setDownloadingPdf(true);
    try {
      const response = await fetch(`/api/orders/${order.id}/download-pdf`);
      
      if (!response.ok) {
        throw new Error("Failed to generate PDF");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Order-${order.orderNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setToast({
        isOpen: true,
        message: "PDF berhasil didownload!",
        type: "success",
      });
    } catch (err: unknown) {
      setToast({
        isOpen: true,
        message: err instanceof Error ? err.message : "Gagal mendownload PDF",
        type: "error",
      });
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleDownloadImage = async () => {
    setDownloadingImage(true);
    try {
      const response = await fetch(`/api/orders/${order.id}/download-image`);
      
      if (!response.ok) {
        throw new Error("Failed to generate image");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Order-${order.orderNumber}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setToast({
        isOpen: true,
        message: "Gambar berhasil didownload!",
        type: "success",
      });
    } catch (err: unknown) {
      setToast({
        isOpen: true,
        message: err instanceof Error ? err.message : "Gagal mendownload gambar",
        type: "error",
      });
    } finally {
      setDownloadingImage(false);
    }
  };

  const handlePaymentSuccess = () => {
    setIsPaymentModalOpen(false);
    setToast({
      isOpen: true,
      message: "Payment added successfully!",
      type: "success",
    });

    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  const nextPaymentNumber =
    (order.payments[order.payments.length - 1]?.paymentNumber || 0) + 1;

  // Component untuk Detail Klien & Acara
  const ClientDetails = () => (
    <div className="bg-white border border-[#d4b896] rounded-xl p-4 sm:p-6">
      <h2 className="text-lg sm:text-xl font-bold text-black mb-4 sm:mb-6">
        Detail Klien & Acara
      </h2>
      <div className="space-y-4 sm:space-y-6">
        <div>
          <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">
            Kontak Person
          </p>
         
          <div className="space-y-3">
            {/* Nomor HP Pengantin Wanita (Primary Phone) */}
            <WhatsAppLink
              phoneNumber={order.client.primaryPhone}
              label={`HP Pengantin Wanita - ${order.client.brideName}`}
            />
            
            {/* Nomor HP Pengantin Pria (Secondary Phone) */}
            {order.client.secondaryPhone && (
              <WhatsAppLink
                phoneNumber={order.client.secondaryPhone}
                label={`HP Pengantin Pria - ${order.client.groomName}`}
              />
            )}
          </div>
        </div>

        <div>
          <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">
            Nama Pengantin Wanita
          </p>
          <p className="text-sm sm:text-base text-black">
            {order.client.brideName}
          </p>
        </div>

        <div>
          <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">
            Alamat Pengantin Wanita
          </p>
          <p className="text-sm sm:text-base text-black">
            {order.client.brideAddress}
          </p>
        </div>

        <div>
          <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">
            Nama Pengantin Pria
          </p>
          <p className="text-sm sm:text-base text-black">
            {order.client.groomName}
          </p>
        </div>

        <div>
          <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">
            Alamat Pengantin Pria
          </p>
          <p className="text-sm sm:text-base text-black">
            {order.client.groomAddress}
          </p>
        </div>

        <div>
          <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">
            Orang Tua Pengantin Wanita
          </p>
          <p className="text-sm sm:text-base text-black">
            {order.client.brideParents}
          </p>
        </div>

        <div>
          <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">
            Orang Tua Pengantin Pria
          </p>
          <p className="text-sm sm:text-base text-black">
            {order.client.groomParents}
          </p>
        </div>

        <div>
          <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">
            Tanggal Akad
          </p>
          <p className="text-sm sm:text-base text-black">
            {order.client.ceremonyDate || "-"}
            {order.client.ceremonyDate && order.client.ceremonyTime && ` - ${order.client.ceremonyTime}`}
            {order.client.ceremonyDate && order.client.ceremonyEndTime && ` s/d ${order.client.ceremonyEndTime}`}
            {order.client.ceremonyDate && " WIB"}
          </p>
        </div>

        <div>
          <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">
            Tanggal Resepsi
          </p>
          <p className="text-sm sm:text-base text-black">
            {order.client.receptionDate || "-"}
            {order.client.receptionDate && order.client.receptionTime && ` - ${order.client.receptionTime}`}
            {order.client.receptionDate && order.client.receptionEndTime && ` s/d ${order.client.receptionEndTime}`}
            {order.client.receptionDate && " WIB"}
          </p>
        </div>

        <div>
          <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">
            Lokasi Acara
          </p>
          <p className="text-sm sm:text-base text-black">
            {order.eventLocation}
          </p>
        </div>
      </div>
    </div>
  );

  // Component untuk Pilihan Kustom
  const CustomOptions = () => (
    <div className="bg-white border border-[#d4b896] rounded-xl p-4 sm:p-6">
      <h2 className="text-lg sm:text-xl font-bold text-black mb-4 sm:mb-6">
        Pilihan Kustom
      </h2>

      <div className="space-y-4 sm:space-y-6">
        {order.stageModelPhoto && (
          <div>
            <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">
              Model Pelaminan
            </p>
            <div
              className="relative w-full h-40 sm:h-48 rounded-lg overflow-hidden border border-[#d4b896] cursor-pointer group"
              onClick={() => setPhotoPreview(order.stageModelPhoto)}
            >
              <Image
                src={order.stageModelPhoto}
                alt="Model Pelaminan"
                fill
                className="object-cover transition-transform group-hover:scale-105"
                unoptimized
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-3xl sm:text-4xl opacity-0 group-hover:opacity-100 transition-opacity">
                  zoom_in
                </span>
              </div>
            </div>
          </div>
        )}

        {order.chairModel && (
          <div>
            <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">
              Kursi Pelaminan
            </p>
            <p className="text-sm sm:text-base text-black">
              {order.chairModel}
            </p>
          </div>
        )}

        {order.tentColorPhoto && (
          <div>
            <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">
              Warna Kain Tenda
            </p>
            <div
              className="relative w-full h-40 sm:h-48 rounded-lg overflow-hidden border border-[#d4b896] cursor-pointer group"
              onClick={() => setPhotoPreview(order.tentColorPhoto)}
            >
              <Image
                src={order.tentColorPhoto}
                alt="Warna Kain Tenda"
                fill
                className="object-cover transition-transform group-hover:scale-105"
                unoptimized
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-3xl sm:text-4xl opacity-0 group-hover:opacity-100 transition-opacity">
                  zoom_in
                </span>
              </div>
            </div>
          </div>
        )}

        {order.softlensColor && (
          <div>
            <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">
              Warna Tenda
            </p>
            <p className="text-sm sm:text-base text-black">
              {order.softlensColor}
            </p>
          </div>
        )}

        {dressPhotos.length > 0 && (
          <div>
            <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">
              Foto Gaun ({dressPhotos.length} Foto)
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
              {dressPhotos.map((photo, idx) => (
                <div
                  key={idx}
                  className="relative aspect-square rounded-lg overflow-hidden border border-[#d4b896] cursor-pointer group"
                  onClick={() => setPhotoPreview(photo)}
                >
                  <Image
                    src={photo}
                    alt={`Gaun ${idx + 1}`}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-2xl sm:text-3xl opacity-0 group-hover:opacity-100 transition-opacity">
                      zoom_in
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Component untuk Catatan
  const Notes = () =>
    order.specialRequest ? (
      <div className="bg-white border border-[#d4b896] rounded-xl p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-bold text-black mb-3 sm:mb-4">
          Catatan
        </h2>
        <p className="text-sm sm:text-base text-gray-700 whitespace-pre-wrap">
          {order.specialRequest}
        </p>
      </div>
    ) : null;

  // Component untuk Item Pesanan
  const OrderItems = () => (
    <div className="bg-white border border-[#d4b896] rounded-xl p-4 sm:p-6">
      <h2 className="text-lg sm:text-xl font-bold text-black mb-4 sm:mb-6">
        Item Pesanan
      </h2>
      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <div className="min-w-[320px] px-4 sm:px-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#d4b896]">
                <th className="text-left text-xs sm:text-sm font-medium text-gray-600 pb-2 sm:pb-3">
                  ITEM / PAKET
                </th>
                <th className="text-left text-xs sm:text-sm font-medium text-gray-600 pb-2 sm:pb-3 px-2">
                  JML
                </th>
                <th className="text-right text-xs sm:text-sm font-medium text-gray-600 pb-2 sm:pb-3 px-2">
                  HARGA
                </th>
                <th className="text-right text-xs sm:text-sm font-medium text-gray-600 pb-2 sm:pb-3">
                  TOTAL
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item: OrderItem, idx: number) => (
                <tr key={idx} className="border-b border-[#d4b896]">
                  <td className="py-3 sm:py-4 text-xs sm:text-sm text-black">
                    {item.name}
                  </td>
                  <td className="py-3 sm:py-4 text-xs sm:text-sm text-gray-700 px-2">
                    {item.quantity}
                  </td>
                  <td className="py-3 sm:py-4 text-xs sm:text-sm text-gray-700 text-right px-2">
                    {formatCurrency(item.price.toString())}
                  </td>
                  <td className="py-3 sm:py-4 text-xs sm:text-sm text-black text-right font-semibold">
                    {formatCurrency(item.total.toString())}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-[#d4b896]">
        <div className="flex justify-between items-center">
          <span className="text-base sm:text-xl text-black font-bold">
            Total
          </span>
          <span className="text-base sm:text-xl text-black font-bold">
            {formatCurrency(order.totalAmount)}
          </span>
        </div>
      </div>
    </div>
  );

  // Component untuk Status Pembayaran
  const PaymentStatus = () => (
    <div className="bg-white border border-[#d4b896] rounded-xl p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-bold text-black">
          Status Pembayaran
        </h2>
        {order.paymentStatus !== "Lunas" &&
          parseFloat(order.remainingAmount) > 0 && (
            <button
              onClick={() => setIsPaymentModalOpen(true)}
              className="flex items-center gap-1 sm:gap-2 text-[#d4b896] hover:text-[#c4a886] text-xs sm:text-sm font-medium transition-colors"
            >
              <span className="material-symbols-outlined text-base sm:text-lg">
                add
              </span>
              <span className="hidden sm:inline">Tambah Pembayaran</span>
              <span className="sm:hidden">Tambah</span>
            </button>
          )}
      </div>
      <div className="space-y-3 sm:space-y-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <div
            className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ${
              order.paymentStatus === "Lunas" ? "bg-green-500" : "bg-yellow-500"
            }`}
          />
          <span className="text-sm sm:text-base text-black font-semibold">
            {order.paymentStatus}
          </span>
        </div>

        {order.paymentStatus === "Belum Lunas" && (
          <p className="text-xs sm:text-sm text-gray-600">
            Sisa pembayaran: {formatCurrency(order.remainingAmount)}
          </p>
        )}

        {order.payments.length > 0 && (
          <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-[#d4b896]">
            <p className="text-xs sm:text-sm font-semibold text-gray-600 mb-3 sm:mb-4">
              Riwayat Pembayaran
            </p>
            <div className="space-y-2 sm:space-y-3">
              {order.payments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex justify-between items-start"
                >
                  <div>
                    <p className="text-sm sm:text-base text-black font-medium">
                      DP{payment.paymentNumber}
                    </p>
                    <p className="text-xs text-gray-600">
                      {payment.paymentDate}
                    </p>
                  </div>
                  <p className="text-sm sm:text-base text-black font-semibold">
                    {formatCurrency(payment.amount)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-4 sm:mb-6 md:mb-8">
          <Link
            href="/orders"
            className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors mb-3 sm:mb-4"
          >
            <span className="material-symbols-outlined text-xl sm:text-2xl">
              arrow_back
            </span>
            <span className="text-sm sm:text-base">Kembali ke Pesanan</span>
          </Link>

          <div className="flex flex-col gap-3 sm:gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-black mb-1 sm:mb-2">
                Pesanan #{order.orderNumber}
              </h1>
              <p className="text-xs sm:text-sm md:text-base text-gray-600">
                Tampilan detail pesanan untuk {order.client.brideName}.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Link
                href={`/orders/${order.id}/edit`}
                className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 border border-[#d4b896] text-black px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-medium transition-colors"
              >
                <span className="material-symbols-outlined text-lg sm:text-xl">
                  edit
                </span>
                <span>Ubah Pesanan</span>
              </Link>
              
              <DropdownMenu
                align="left"
                trigger={
                  <Button className="bg-green-600 hover:bg-green-700 text-white text-sm sm:text-base px-4 sm:px-6 py-2.5 sm:py-3">
                    <span className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-lg sm:text-xl">
                        download
                      </span>
                      <span>Download</span>
                      <span className="material-symbols-outlined text-lg sm:text-xl">
                        expand_more
                      </span>
                    </span>
                  </Button>
                }
              >
                <DropdownMenuItem
                  onClick={handleDownloadPdf}
                  disabled={downloadingPdf}
                  className={downloadingPdf ? "opacity-50" : ""}
                >
                  {downloadingPdf ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-lg">
                        refresh
                      </span>
                      <span>Generating PDF...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-lg text-red-600">
                        picture_as_pdf
                      </span>
                      <span>Download sebagai PDF</span>
                    </>
                  )}
                </DropdownMenuItem>
                
                <DropdownMenuItem
                  onClick={handleDownloadImage}
                  disabled={downloadingImage}
                  className={downloadingImage ? "opacity-50" : ""}
                >
                  {downloadingImage ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-lg">
                        refresh
                      </span>
                      <span>Generating Image...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-lg text-blue-600">
                        image
                      </span>
                      <span>Download sebagai Gambar</span>
                    </>
                  )}
                </DropdownMenuItem>
              </DropdownMenu>
              
              <Button
                onClick={handleGenerateInvoice}
                disabled={generatingInvoice}
                className="bg-[#d4b896] hover:bg-[#c4a886] text-black text-sm sm:text-base px-4 sm:px-6 py-2.5 sm:py-3"
              >
                {generatingInvoice ? (
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined animate-spin text-lg sm:text-xl">
                      refresh
                    </span>
                    <span>Generating...</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg sm:text-xl">
                      receipt_long
                    </span>
                    <span>Buat Faktur</span>
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile & Tablet Layout (< 1024px) */}
        <div className="space-y-4 sm:space-y-6 lg:hidden">
          <ClientDetails />
          <CustomOptions />
          <Notes />
          <OrderItems />
          <PaymentStatus />
        </div>

        {/* Desktop Layout (≥ 1024px) */}
        <div className="hidden lg:grid lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <OrderItems />
            <CustomOptions />
            <Notes />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <ClientDetails />
            <PaymentStatus />
          </div>
        </div>
      </div>

      {/* Photo Preview Modal */}
      {photoPreview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
          onClick={() => setPhotoPreview(null)}
        >
          <div className="relative max-w-6xl max-h-[90vh] w-full h-full flex items-center justify-center">
            <button
              onClick={() => setPhotoPreview(null)}
              className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
            >
              <span className="material-symbols-outlined text-xl sm:text-2xl">
                close
              </span>
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photoPreview}
              alt="Preview"
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      <Toast
        isOpen={toast.isOpen}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, isOpen: false })}
      />

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onSuccess={handlePaymentSuccess}
        orderId={order.id}
        orderNumber={order.orderNumber}
        remainingAmount={order.remainingAmount}
        nextPaymentNumber={nextPaymentNumber}
      />
    </>
  );
}
