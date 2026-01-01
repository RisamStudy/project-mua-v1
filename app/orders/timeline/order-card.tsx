"use client";

import { memo } from "react";
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

  // Component untuk Detail Klien & Acara
  const ClientDetails = () => (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
        <span className="material-symbols-outlined text-[#d4b896] text-lg">person</span>
        Detail Klien & Acara
      </h4>
      
      <div className="space-y-3 text-xs">
        <div>
          <p className="text-gray-600 mb-1">Kontak Person</p>
          <div className="space-y-2">
            <WhatsAppLink
              phoneNumber={order.client.primaryPhone}
              label={`HP Pengantin Wanita - ${order.client.brideName}`}
              className="text-xs"
            />
            {order.client.secondaryPhone && (
              <WhatsAppLink
                phoneNumber={order.client.secondaryPhone}
                label={`HP Pengantin Pria - ${order.client.groomName}`}
                className="text-xs"
              />
            )}
          </div>
        </div>

        <div>
          <p className="text-gray-600 mb-1">Nama Pengantin Wanita</p>
          <p className="text-black font-medium">{order.client.brideName}</p>
        </div>

        <div>
          <p className="text-gray-600 mb-1">Alamat Pengantin Wanita</p>
          <p className="text-black">{order.client.brideAddress}</p>
        </div>

        <div>
          <p className="text-gray-600 mb-1">Nama Pengantin Pria</p>
          <p className="text-black font-medium">{order.client.groomName}</p>
        </div>

        <div>
          <p className="text-gray-600 mb-1">Alamat Pengantin Pria</p>
          <p className="text-black">{order.client.groomAddress}</p>
        </div>

        <div>
          <p className="text-gray-600 mb-1">Orang Tua Pengantin Wanita</p>
          <p className="text-black">{order.client.brideParents || "-"}</p>
        </div>

        <div>
          <p className="text-gray-600 mb-1">Orang Tua Pengantin Pria</p>
          <p className="text-black">{order.client.groomParents || "-"}</p>
        </div>

        <div>
          <p className="text-gray-600 mb-1">Tanggal Akad</p>
          <p className="text-black">
            {order.client.ceremonyDate ? format(new Date(order.client.ceremonyDate), "dd MMMM yyyy", { locale: id }) : "-"}
            {order.client.ceremonyDate && order.client.ceremonyTime && ` - ${order.client.ceremonyTime}`}
            {order.client.ceremonyDate && order.client.ceremonyEndTime && ` s/d ${order.client.ceremonyEndTime}`}
            {order.client.ceremonyDate && " WIB"}
          </p>
        </div>
        
        <div>
          <p className="text-gray-600 mb-1">Tanggal Resepsi</p>
          <p className="text-black">
            {order.client.receptionDate ? format(new Date(order.client.receptionDate), "dd MMMM yyyy", { locale: id }) : "-"}
            {order.client.receptionDate && order.client.receptionTime && ` - ${order.client.receptionTime}`}
            {order.client.receptionDate && order.client.receptionEndTime && ` s/d ${order.client.receptionEndTime}`}
            {order.client.receptionDate && " WIB"}
          </p>
        </div>

        <div>
          <p className="text-gray-600 mb-1">Lokasi Acara</p>
          <p className="text-black font-medium">{order.eventLocation}</p>
        </div>
      </div>
    </div>
  );

  // Component untuk Item Pesanan
  const OrderItems = () => (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
        <span className="material-symbols-outlined text-[#d4b896] text-lg">shopping_cart</span>
        Item Pesanan
      </h4>
      
      <div className="space-y-2">
        {items.map((item: OrderItem, idx: number) => (
          <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
            <div className="flex-1">
              <p className="text-xs font-medium text-black">{item.name}</p>
              <p className="text-xs text-gray-600">Qty: {item.quantity} × {formatCurrency(item.price.toString())}</p>
            </div>
            <p className="text-xs font-bold text-black">{formatCurrency(item.total.toString())}</p>
          </div>
        ))}
        
        <div className="flex justify-between items-center pt-2 border-t border-[#d4b896] font-bold">
          <span className="text-sm text-black">Total</span>
          <span className="text-sm text-black">{formatCurrency(order.totalAmount)}</span>
        </div>
      </div>
    </div>
  );

  // Component untuk Pilihan Kustom
  const CustomOptions = () => (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
        <span className="material-symbols-outlined text-[#d4b896] text-lg">tune</span>
        Pilihan Kustom
      </h4>

      <div className="space-y-3">
        {order.stageModelPhoto && (
          <div>
            <p className="text-xs text-gray-600 mb-2">Model Pelaminan</p>
            <div
              className="relative w-full h-32 rounded-lg overflow-hidden border border-[#d4b896] cursor-pointer group"
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
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-2xl opacity-0 group-hover:opacity-100 transition-opacity">
                  zoom_in
                </span>
              </div>
            </div>
          </div>
        )}

        {order.chairModel && (
          <div>
            <p className="text-xs text-gray-600 mb-1">Kursi Pelaminan</p>
            <p className="text-xs text-black">{order.chairModel}</p>
          </div>
        )}

        {order.tentColorPhoto && (
          <div>
            <p className="text-xs text-gray-600 mb-2">Warna Kain Tenda</p>
            <div
              className="relative w-full h-32 rounded-lg overflow-hidden border border-[#d4b896] cursor-pointer group"
              onClick={() => onPhotoPreview(order.tentColorPhoto!)}
            >
              <Image
                src={order.tentColorPhoto}
                alt="Warna Kain Tenda"
                fill
                className="object-cover transition-transform group-hover:scale-105"
                loading="lazy"
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                unoptimized
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-2xl opacity-0 group-hover:opacity-100 transition-opacity">
                  zoom_in
                </span>
              </div>
            </div>
          </div>
        )}

        {order.softlensColor && (
          <div>
            <p className="text-xs text-gray-600 mb-1">Warna Tenda</p>
            <p className="text-xs text-black">{order.softlensColor}</p>
          </div>
        )}

        {dressPhotos.length > 0 && (
          <div>
            <p className="text-xs text-gray-600 mb-2">Foto Gaun ({dressPhotos.length} Foto)</p>
            <div className="grid grid-cols-3 gap-2">
              {dressPhotos.slice(0, 6).map((photo, idx) => (
                <div
                  key={idx}
                  className="relative aspect-square rounded-lg overflow-hidden border border-[#d4b896] cursor-pointer group"
                  onClick={() => onPhotoPreview(photo)}
                >
                  <Image
                    src={photo}
                    alt={`Gaun ${idx + 1}`}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                    loading="lazy"
                    placeholder="blur"
                    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-lg opacity-0 group-hover:opacity-100 transition-opacity">
                      zoom_in
                    </span>
                  </div>
                </div>
              ))}
              {dressPhotos.length > 6 && (
                <div className="aspect-square rounded-lg bg-[#d4b896] flex items-center justify-center">
                  <span className="text-white text-xs font-bold">+{dressPhotos.length - 6}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {!order.chairModel && !order.softlensColor && dressPhotos.length === 0 && !order.stageModelPhoto && !order.tentColorPhoto && (
          <p className="text-xs text-gray-500 italic text-center py-2">
            Tidak ada pilihan kustom yang dipilih
          </p>
        )}
      </div>
    </div>
  );

  // Component untuk Catatan
  const Notes = () => order.specialRequest ? (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
        <span className="material-symbols-outlined text-[#d4b896] text-lg">note</span>
        Catatan
      </h4>
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
        <p className="text-xs text-gray-700 whitespace-pre-wrap">{order.specialRequest}</p>
      </div>
    </div>
  ) : null;

  // Component untuk Status Pembayaran
  const PaymentStatus = () => (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
        <span className="material-symbols-outlined text-[#d4b896] text-lg">payments</span>
        Status Pembayaran
      </h4>
      
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            order.paymentStatus === "Lunas" ? "bg-green-500" : "bg-yellow-500"
          }`} />
          <span className="text-xs font-semibold text-black">{order.paymentStatus}</span>
        </div>

        {order.paymentStatus === "Belum Lunas" && (
          <p className="text-xs text-gray-600">
            Sisa pembayaran: <span className="font-bold text-red-600">{formatCurrency(order.remainingAmount)}</span>
          </p>
        )}

        {order.payments.length > 0 && (
          <div className="mt-3">
            <p className="text-xs font-semibold text-gray-600 mb-2">Riwayat Pembayaran</p>
            <div className="space-y-1">
              {order.payments.map((payment) => (
                <div key={payment.id} className="flex justify-between items-center text-xs">
                  <div>
                    <span className="font-medium">DP{payment.paymentNumber}</span>
                    <span className="text-gray-500 ml-2">{payment.paymentDate}</span>
                  </div>
                  <span className="font-semibold text-green-600">{formatCurrency(payment.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="bg-white border border-[#d4b896] rounded-xl overflow-hidden">
      {/* Order Header */}
      <div className="bg-[#d4b896]/10 px-4 py-3 border-b border-[#d4b896]">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#d4b896] text-white rounded-full flex items-center justify-center text-sm font-bold">
              {index + 1}
            </div>
            <div>
              <h3 className="text-base font-bold text-black">
                Order #{order.orderNumber}
              </h3>
              <p className="text-xs text-gray-600">
                {order.client.brideName} & {order.client.groomName}
              </p>
            </div>
          </div>
          <Link
            href={`/orders/${order.id}`}
            className="flex items-center gap-1 text-[#d4b896] hover:text-[#c4a886] text-xs font-medium transition-colors"
          >
            <span className="material-symbols-outlined text-base">visibility</span>
            <span className="hidden sm:inline">Detail</span>
          </Link>
        </div>
        
        <div className="flex items-center gap-2">
          <span className={`material-symbols-outlined text-base ${
            order.eventType === 'ceremony' ? 'text-pink-600' : 'text-purple-600'
          }`}>
            {getEventTypeIcon(order.eventType)}
          </span>
          <div className="flex-1">
            <span className="text-xs font-medium text-black">
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
          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.paymentStatus)}`}>
            {order.paymentStatus}
          </span>
        </div>
      </div>

      {/* Order Content - 4 Sections */}
      <div className="p-4 space-y-4">
        {/* 1. Detail Klien & Acara */}
        <ClientDetails />
        
        {/* 2. Item Pesanan */}
        <OrderItems />
        
        {/* 3. Pilihan Kustom */}
        <CustomOptions />
        
        {/* 4. Catatan */}
        <Notes />
        
        {/* 5. Status Pembayaran */}
        <PaymentStatus />
      </div>
    </div>
  );
});

export default OrderCard;