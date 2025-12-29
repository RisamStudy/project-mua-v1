"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { id } from "date-fns/locale";
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
    ceremonyDate: Date | null;
    ceremonyTime: string | null;
    ceremonyEndTime: string | null;
    receptionDate: Date | null;
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
  eventDate: string;
  eventType: 'ceremony' | 'reception' | null;
  eventTime: string | null;
  eventEndTime: string | null;
}

interface TimelineDay {
  date: string;
  displayDate: string;
  dayName: string;
  isToday: boolean;
  isPast: boolean;
  orders: OrderDetails[];
}

export default function OrdersTimelineView({ timeline }: { timeline: TimelineDay[] }) {
  const [currentDateIndex, setCurrentDateIndex] = useState(0);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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

  const formatCurrency = (amount: string) => {
    return `Rp ${parseFloat(amount).toLocaleString("id-ID")}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Lunas":
        return "bg-green-100 text-green-800 border-green-200";
      case "Belum Lunas":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getEventTypeIcon = (eventType: 'ceremony' | 'reception' | null) => {
    switch (eventType) {
      case 'ceremony':
        return 'favorite';
      case 'reception':
        return 'celebration';
      default:
        return 'event';
    }
  };

  const getEventTypeLabel = (eventType: 'ceremony' | 'reception' | null) => {
    switch (eventType) {
      case 'ceremony':
        return 'Akad Nikah';
      case 'reception':
        return 'Resepsi';
      default:
        return 'Acara';
    }
  };

  const scrollToDate = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && currentDateIndex > 0) {
      setCurrentDateIndex(currentDateIndex - 1);
    } else if (direction === 'next' && currentDateIndex < timeline.length - 1) {
      setCurrentDateIndex(currentDateIndex + 1);
    }
  };

  const currentDay = timeline[currentDateIndex];

  if (!timeline.length) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-gray-400 text-3xl">
              event_busy
            </span>
          </div>
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            Tidak ada acara mendatang
          </h3>
          <p className="text-gray-500">
            Belum ada orders dengan tanggal acara yang terjadwal
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <Link
            href="/orders"
            className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors mb-4"
          >
            <span className="material-symbols-outlined text-xl">arrow_back</span>
            <span className="text-sm sm:text-base">Kembali ke Daftar Orders</span>
          </Link>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[#d4b896] rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-lg">
                timeline
              </span>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-black">
                Timeline Acara Orders
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                Orders diurutkan berdasarkan tanggal acara terdekat ({timeline.length} hari dengan acara)
              </p>
            </div>
          </div>
        </div>

        {/* Date Navigation */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between bg-white border border-[#d4b896] rounded-xl p-4">
            <button
              onClick={() => scrollToDate('prev')}
              disabled={currentDateIndex === 0}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              <span className="material-symbols-outlined">chevron_left</span>
              <span className="hidden sm:inline">Sebelumnya</span>
            </button>

            <div className="text-center">
              <div className="flex items-center gap-2 justify-center mb-1">
                <span className={`material-symbols-outlined text-lg ${
                  currentDay.isToday ? 'text-green-600' : 
                  currentDay.isPast ? 'text-gray-400' : 'text-[#d4b896]'
                }`}>
                  {currentDay.isToday ? 'today' : 'event'}
                </span>
                <h2 className="text-lg sm:text-xl font-bold text-black">
                  {currentDay.displayDate}
                </h2>
                {currentDay.isToday && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                    Hari Ini
                  </span>
                )}
                {currentDay.isPast && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                    Sudah Lewat
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600">
                {currentDay.dayName} • {currentDay.orders.length} acara
              </p>
            </div>

            <button
              onClick={() => scrollToDate('next')}
              disabled={currentDateIndex === timeline.length - 1}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              <span className="hidden sm:inline">Selanjutnya</span>
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>

          {/* Date Indicators */}
          <div className="flex justify-center mt-4">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {timeline.map((day, index) => (
                <button
                  key={day.date}
                  onClick={() => setCurrentDateIndex(index)}
                  className={`flex-shrink-0 w-3 h-3 rounded-full transition-colors ${
                    index === currentDateIndex
                      ? 'bg-[#d4b896]'
                      : day.isToday
                      ? 'bg-green-400'
                      : day.isPast
                      ? 'bg-gray-300'
                      : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                  title={day.displayDate}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Orders Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {currentDay.orders.map((order, index) => {
            const items = parseItems(order.items);
            const dressPhotos = order.dressPhotos && Array.isArray(order.dressPhotos) ? order.dressPhotos : [];

            return (
              <div key={order.id} className="bg-white border border-[#d4b896] rounded-xl overflow-hidden">
                {/* Order Header */}
                <div className="bg-[#d4b896]/10 px-4 sm:px-6 py-4 border-b border-[#d4b896]">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#d4b896] text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-black">
                          Order #{order.orderNumber}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {order.client.brideName} & {order.client.groomName}
                        </p>
                      </div>
                    </div>
                    <Link
                      href={`/orders/${order.id}`}
                      className="flex items-center gap-1 text-[#d4b896] hover:text-[#c4a886] text-sm font-medium transition-colors"
                    >
                      <span className="material-symbols-outlined text-lg">visibility</span>
                      <span className="hidden sm:inline">Detail</span>
                    </Link>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className={`material-symbols-outlined text-lg ${
                      order.eventType === 'ceremony' ? 'text-pink-600' : 'text-purple-600'
                    }`}>
                      {getEventTypeIcon(order.eventType)}
                    </span>
                    <div className="flex-1">
                      <span className="text-sm font-medium text-black">
                        {getEventTypeLabel(order.eventType)}
                      </span>
                      {order.eventTime && (
                        <div className="text-xs text-gray-600 mt-0.5">
                          <span className="font-medium text-green-700">
                            {order.eventTime}
                            {order.eventEndTime && ` s.d ${order.eventEndTime}`}
                            {' WIB'}
                          </span>
                        </div>
                      )}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.paymentStatus)}`}>
                      {order.paymentStatus}
                    </span>
                  </div>
                </div>

                <div className="p-4 sm:p-6 space-y-6">
                  {/* Detail Klien & Acara */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#d4b896] text-lg">person</span>
                      Detail Klien & Acara
                    </h4>
                    
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs text-gray-600">Kontak Person</p>
                          <p className="text-sm font-medium text-black">{order.client.brideName}</p>
                          <WhatsAppLink
                            phoneNumber={order.client.primaryPhone}
                            label={order.client.primaryPhone}
                            className="text-xs"
                          />
                        </div>
                        {order.client.secondaryPhone && (
                          <div>
                            <p className="text-xs text-gray-600">Kontak Kedua</p>
                            <p className="text-sm font-medium text-black">{order.client.groomName}</p>
                            <WhatsAppLink
                              phoneNumber={order.client.secondaryPhone}
                              label={order.client.secondaryPhone}
                              className="text-xs"
                            />
                          </div>
                        )}
                      </div>

                      <div>
                        <p className="text-xs text-gray-600 mb-1">Nama Pengantin Wanita</p>
                        <p className="text-sm text-black">{order.client.brideName}</p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-600 mb-1">Alamat Pengantin Wanita</p>
                        <p className="text-sm text-black">{order.client.brideAddress}</p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-600 mb-1">Nama Pengantin Pria</p>
                        <p className="text-sm text-black">{order.client.groomName}</p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-600 mb-1">Alamat Pengantin Pria</p>
                        <p className="text-sm text-black">{order.client.groomAddress}</p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-600 mb-1">Lokasi Acara</p>
                        <p className="text-sm text-black">{order.eventLocation}</p>
                      </div>

                      {/* Jadwal Acara Lengkap */}
                      {(order.client.ceremonyDate || order.client.receptionDate) && (
                        <div className="pt-3 border-t border-gray-100">
                          <p className="text-xs text-gray-600 mb-2">Jadwal Acara</p>
                          <div className="space-y-2">
                            {order.client.ceremonyDate && (
                              <div className="flex items-start gap-2">
                                <span className="material-symbols-outlined text-pink-600 text-sm mt-0.5">
                                  favorite
                                </span>
                                <div>
                                  <p className="text-sm font-medium text-black">Akad Nikah</p>
                                  <p className="text-xs text-gray-600">
                                    {order.eventDate === format(new Date(order.client.ceremonyDate), "dd MMMM yyyy", { locale: id }) ? 'Hari ini' : format(new Date(order.client.ceremonyDate), "dd MMMM yyyy", { locale: id })}
                                    {order.client.ceremonyTime && (
                                      <>
                                        {' • '}
                                        <span className="font-medium text-green-700">
                                          {order.client.ceremonyTime}
                                          {order.client.ceremonyEndTime && ` s.d ${order.client.ceremonyEndTime}`}
                                          {' WIB'}
                                        </span>
                                      </>
                                    )}
                                  </p>
                                </div>
                              </div>
                            )}
                            
                            {order.client.receptionDate && (
                              <div className="flex items-start gap-2">
                                <span className="material-symbols-outlined text-purple-600 text-sm mt-0.5">
                                  celebration
                                </span>
                                <div>
                                  <p className="text-sm font-medium text-black">Resepsi</p>
                                  <p className="text-xs text-gray-600">
                                    {order.eventDate === format(new Date(order.client.receptionDate), "dd MMMM yyyy", { locale: id }) ? 'Hari ini' : format(new Date(order.client.receptionDate), "dd MMMM yyyy", { locale: id })}
                                    {order.client.receptionTime && (
                                      <>
                                        {' • '}
                                        <span className="font-medium text-blue-700">
                                          {order.client.receptionTime}
                                          {order.client.receptionEndTime && ` s.d ${order.client.receptionEndTime}`}
                                          {' WIB'}
                                        </span>
                                      </>
                                    )}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Pilihan Kustom */}
                  {(order.stageModelPhoto || order.tentColorPhoto || dressPhotos.length > 0 || order.chairModel || order.softlensColor) && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#d4b896] text-lg">tune</span>
                        Pilihan Kustom
                      </h4>
                      
                      <div className="space-y-4">
                        {order.stageModelPhoto && (
                          <div>
                            <p className="text-xs text-gray-600 mb-2">Model Pelaminan</p>
                            <div
                              className="relative w-full h-40 rounded-lg overflow-hidden border border-[#d4b896] cursor-pointer group"
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
                                <span className="material-symbols-outlined text-white text-3xl opacity-0 group-hover:opacity-100 transition-opacity">
                                  zoom_in
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                        {order.chairModel && (
                          <div>
                            <p className="text-xs text-gray-600 mb-1">Kursi Pelaminan</p>
                            <p className="text-sm text-black bg-gray-50 p-2 rounded">{order.chairModel}</p>
                          </div>
                        )}

                        {order.tentColorPhoto && (
                          <div>
                            <p className="text-xs text-gray-600 mb-2">Warna Kain Tenda</p>
                            <div
                              className="relative w-full h-40 rounded-lg overflow-hidden border border-[#d4b896] cursor-pointer group"
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
                                <span className="material-symbols-outlined text-white text-3xl opacity-0 group-hover:opacity-100 transition-opacity">
                                  zoom_in
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                        {order.softlensColor && (
                          <div>
                            <p className="text-xs text-gray-600 mb-1">Warna Tenda</p>
                            <p className="text-sm text-black bg-gray-50 p-2 rounded">{order.softlensColor}</p>
                          </div>
                        )}

                        {dressPhotos.length > 0 && (
                          <div>
                            <p className="text-xs text-gray-600 mb-2">Foto Gaun ({dressPhotos.length} Foto)</p>
                            <div className="grid grid-cols-3 gap-2">
                              {dressPhotos.slice(0, 3).map((photo, idx) => (
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
                                    <span className="material-symbols-outlined text-white text-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                      zoom_in
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                            {dressPhotos.length > 3 && (
                              <p className="text-xs text-gray-500 mt-1">
                                +{dressPhotos.length - 3} foto lainnya
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Catatan */}
                  {order.specialRequest && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#d4b896] text-lg">note_alt</span>
                        Catatan
                      </h4>
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">
                          {order.specialRequest}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
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
    </>
  );
}