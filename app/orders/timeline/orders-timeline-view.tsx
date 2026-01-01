"use client";

import { useState } from "react";
import Link from "next/link";
import OrderCard from "./order-card";

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
          {currentDay.orders.map((order, index) => (
            <OrderCard
              key={order.id}
              order={order}
              index={index}
              onPhotoPreview={setPhotoPreview}
            />
          ))}
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