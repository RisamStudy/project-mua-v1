"use client";

import { memo } from "react";
import Link from "next/link";
import Image from "next/image";
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

interface OrderCardProps {
  order: OrderDetails;
  index: number;
  onPhotoPreview: (photo: string) => void;
}

const OrderCard = memo(function OrderCard({ order, index, onPhotoPreview }: OrderCardProps) {
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

  const items = parseItems(order.items);
  const dressPhotos = order.dressPhotos && Array.isArray(order.dressPhotos) ? order.dressPhotos : [];

  return (
    <div className="bg-white border border-[#d4b896] rounded-xl overflow-hidden">
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
        {/* Contact Info - Simplified */}
        <div>
          <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-[#d4b896] text-lg">person</span>
            Kontak & Lokasi
          </h4>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Kontak:</span>
              <WhatsAppLink
                phoneNumber={order.client.primaryPhone}
                label={order.client.primaryPhone}
                className="text-sm font-medium"
              />
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Lokasi Acara</p>
              <p className="text-sm text-black">{order.eventLocation}</p>
            </div>
          </div>
        </div>

        {/* Custom Options - Only show if exists */}
        {(order.stageModelPhoto || order.tentColorPhoto || dressPhotos.length > 0) && (
          <div>
            <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#d4b896] text-lg">tune</span>
              Pilihan Kustom
            </h4>
            
            <div className="grid grid-cols-2 gap-3">
              {order.stageModelPhoto && (
                <div
                  className="relative aspect-video rounded-lg overflow-hidden border border-[#d4b896] cursor-pointer group"
                  onClick={() => onPhotoPreview(order.stageModelPhoto!)}
                >
                  <Image
                    src={order.stageModelPhoto}
                    alt="Model Pelaminan"
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                    loading="lazy"
                    placeholder="blur"
                    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                    unoptimized
                  />
                  <div className="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    Pelaminan
                  </div>
                </div>
              )}

              {order.tentColorPhoto && (
                <div
                  className="relative aspect-video rounded-lg overflow-hidden border border-[#d4b896] cursor-pointer group"
                  onClick={() => onPhotoPreview(order.tentColorPhoto!)}
                >
                  <Image
                    src={order.tentColorPhoto}
                    alt="Warna Tenda"
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                    loading="lazy"
                    placeholder="blur"
                    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                    unoptimized
                  />
                  <div className="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    Tenda
                  </div>
                </div>
              )}
            </div>

            {dressPhotos.length > 0 && (
              <div className="mt-3">
                <p className="text-xs text-gray-600 mb-2">Foto Gaun ({dressPhotos.length})</p>
                <div className="flex gap-2 overflow-x-auto">
                  {dressPhotos.slice(0, 4).map((photo, idx) => (
                    <div
                      key={idx}
                      className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border border-[#d4b896] cursor-pointer"
                      onClick={() => onPhotoPreview(photo)}
                    >
                      <Image
                        src={photo}
                        alt={`Gaun ${idx + 1}`}
                        fill
                        className="object-cover"
                        loading="lazy"
                        placeholder="blur"
                        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                        unoptimized
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Payment Status - Simplified */}
        <div>
          <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-[#d4b896] text-lg">payments</span>
            Pembayaran
          </h4>
          
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Total:</span>
            <span className="text-sm font-bold text-black">{formatCurrency(order.totalAmount)}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Status:</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.paymentStatus)}`}>
              {order.paymentStatus}
            </span>
          </div>

          {order.paymentStatus === "Belum Lunas" && (
            <div className="mt-2 bg-red-50 border border-red-200 rounded-lg p-2">
              <p className="text-xs text-red-800">
                Sisa: <span className="font-bold">{formatCurrency(order.remainingAmount)}</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default OrderCard;