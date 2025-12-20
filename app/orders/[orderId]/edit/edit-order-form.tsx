"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface Client {
  id: string;
  brideName: string;
  groomName: string;
  eventLocation: string;
}

interface Order {
  id: string;
  orderNumber: string;
  clientId: string;
  eventLocation: string;
  items: any;
  stageModelPhoto: string | null;
  chairModel: string | null;
  tentColorPhoto: string | null;
  softlensColor: string | null;
  dressPhotos: any;
  specialRequest: string | null;
  totalAmount: any;
  paidAmount: any;
  paymentStatus: string;
}

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
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
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        const maxWidth = 1200;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
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
          'image/jpeg',
          0.85
        );
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
};

export default function EditOrderForm({ order, clients }: { order: Order; clients: Client[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [selectedClient, setSelectedClient] = useState(order.clientId);
  const [eventLocation, setEventLocation] = useState(order.eventLocation);
  const [items, setItems] = useState<OrderItem[]>(
    Array.isArray(order.items) ? order.items.map((item: any, idx: number) => ({
      id: idx.toString(),
      ...item
    })) : []
  );
  
  const [stageModelPhoto, setStageModelPhoto] = useState<string>(order.stageModelPhoto || '');
  const [tentColorPhoto, setTentColorPhoto] = useState<string>(order.tentColorPhoto || '');
  const [dressPhotos, setDressPhotos] = useState<string[]>(
    order.dressPhotos && Array.isArray(order.dressPhotos) 
      ? [...order.dressPhotos, '', '', ''].slice(0, 3)
      : ['', '', '']
  );
  
  const [chairModel, setChairModel] = useState(order.chairModel || '');
  const [softlensColor, setSoftlensColor] = useState(order.softlensColor || '');
  const [specialRequest, setSpecialRequest] = useState(order.specialRequest || '');
  const [paymentStatus, setPaymentStatus] = useState(order.paymentStatus);

  const handleClientChange = (clientId: string) => {
    setSelectedClient(clientId);
    const client = clients.find(c => c.id === clientId);
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

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Format foto harus JPG, JPEG, PNG, atau WebP');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Ukuran foto maksimal 10MB');
      return;
    }

    try {
      const compressed = await compressImage(file);
      setter(compressed);
      setError('');
    } catch (err) {
      setError('Gagal memproses foto');
    }
  };

  const handleDressPhotoUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Format foto harus JPG, JPEG, PNG, atau WebP');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Ukuran foto maksimal 10MB');
      return;
    }

    try {
      const compressed = await compressImage(file);
      const newPhotos = [...dressPhotos];
      newPhotos[index] = compressed;
      setDressPhotos(newPhotos);
      setError('');
    } catch (err) {
      setError('Gagal memproses foto');
    }
  };

  const calculateItemTotal = (quantity: number, price: number) => {
    return quantity * price;
  };

  const addItem = () => {
    setItems([...items, {
      id: Date.now().toString(),
      name: '',
      quantity: 1,
      price: 0,
      total: 0
    }]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof OrderItem, value: string | number) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'quantity' || field === 'price') {
          updated.total = calculateItemTotal(
            field === 'quantity' ? Number(value) : item.quantity,
            field === 'price' ? Number(value) : item.price
          );
        }
        return updated;
      }
      return item;
    }));
  };

  const grandTotal = items.reduce((sum, item) => sum + item.total, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!selectedClient) {
      setError('Please select a client');
      setLoading(false);
      return;
    }

    if (items.some(item => !item.name || item.price <= 0)) {
      setError('Please fill all item details');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/orders/${order.id}/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: selectedClient,
          eventLocation,
          items: items.map(({ id, ...item }) => item),
          stageModelPhoto: stageModelPhoto || null,
          chairModel,
          tentColorPhoto: tentColorPhoto || null,
          softlensColor,
          dressPhotos: dressPhotos.filter(p => p !== ''),
          specialRequest,
          totalAmount: grandTotal,
          paymentStatus,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update order');
      }

      router.push('/orders');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="mb-6 md:mb-8">
        <Link
          href="/orders"
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
        >
          <span className="material-symbols-outlined">arrow_back</span>
          <span>Kembali ke Pesanan</span>
        </Link>

        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
          Ubah Pesanan #{order.orderNumber}
        </h1>
        <p className="text-sm md:text-base text-gray-400">
          Update detail pesanan untuk klien.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Informasi Klien */}
        <div className="bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-6">Informasi Klien</h2>
          <div className="space-y-6">
            <div>
              <Label>Pilih Klien</Label>
              <select
                value={selectedClient}
                onChange={(e) => handleClientChange(e.target.value)}
                required
                className="w-full h-12 mt-2 rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] px-4 text-white focus:ring-2 focus:ring-[#d4b896]/50 focus:outline-none"
              >
                <option value="">Pilih klien</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.brideName} & {client.groomName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label>Lokasi Acara</Label>
              <Input
                type="text"
                value={eventLocation}
                onChange={(e) => setEventLocation(e.target.value)}
                required
                className="mt-2"
              />
            </div>
          </div>
        </div>

        {/* Item & Layanan */}
        <div className="bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-6">Item & Layanan yang Dipesan</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-[#2a2a2a]">
                  <th className="text-left text-sm font-medium text-gray-400 pb-3">Item</th>
                  <th className="text-left text-sm font-medium text-gray-400 pb-3 w-24">Jml</th>
                  <th className="text-left text-sm font-medium text-gray-400 pb-3 w-40">Harga</th>
                  <th className="text-left text-sm font-medium text-gray-400 pb-3 w-40">Total</th>
                  <th className="text-left text-sm font-medium text-gray-400 pb-3 w-20">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-[#2a2a2a]">
                    <td className="py-3">
                      <Input
                        type="text"
                        value={item.name}
                        onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                        required
                        className="bg-[#1a1a1a]"
                      />
                    </td>
                    <td className="py-3 px-2">
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value))}
                        required
                        className="bg-[#1a1a1a]"
                      />
                    </td>
                    <td className="py-3 px-2">
                      <Input
                        type="number"
                        min="0"
                        value={item.price}
                        onChange={(e) => updateItem(item.id, 'price', parseFloat(e.target.value))}
                        required
                        className="bg-[#1a1a1a]"
                      />
                    </td>
                    <td className="py-3 px-2">
                      <div className="px-4 py-2 bg-[#1a1a1a] rounded-lg text-white">
                        Rp{item.total.toLocaleString('id-ID')}
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        disabled={items.length === 1}
                        className="p-2 text-gray-400 hover:text-red-500 disabled:opacity-30 transition-colors"
                      >
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            type="button"
            onClick={addItem}
            className="mt-4 flex items-center gap-2 text-[#d4b896] hover:text-[#c4a886] transition-colors"
          >
            <span className="material-symbols-outlined">add</span>
            <span>Tambah Item</span>
          </button>

          <div className="mt-6 pt-6 border-t border-[#2a2a2a]">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-white">Total</span>
              <span className="text-2xl font-bold text-white">
                Rp{grandTotal.toLocaleString('id-ID')}
              </span>
            </div>
          </div>
        </div>

        {/* Detail Dekorasi dengan Foto */}
        <div className="bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-6">Detail Dekorasi Pernikahan</h2>
          
          <div className="space-y-6">
            {/* Model Pelaminan Photo */}
            <div>
              <Label>Foto Model Pelaminan</Label>
              <p className="text-xs text-gray-400 mt-1 mb-3">Upload foto model pelaminan (Max 10MB, JPG/PNG/WebP)</p>
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={(e) => handleImageUpload(e, setStageModelPhoto)}
                    className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#d4b896] file:text-black file:cursor-pointer hover:file:bg-[#c4a886]"
                  />
                </div>
                {stageModelPhoto && (
                  <div className="w-24 h-24 rounded-lg overflow-hidden border-2 border-[#d4b896]">
                    <img src={stageModelPhoto} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>

            <div>
              <Label>Kursi Pelaminan</Label>
              <Input
                type="text"
                value={chairModel}
                onChange={(e) => setChairModel(e.target.value)}
                placeholder="cth: Sofa, Kursi tunggal"
                className="mt-2"
              />
            </div>

            {/* Tent Color Photo */}
            <div>
              <Label>Foto Warna Kain Tenda</Label>
              <p className="text-xs text-gray-400 mt-1 mb-3">Upload foto warna kain tenda (Max 10MB, JPG/PNG/WebP)</p>
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={(e) => handleImageUpload(e, setTentColorPhoto)}
                    className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#d4b896] file:text-black file:cursor-pointer hover:file:bg-[#c4a886]"
                  />
                </div>
                {tentColorPhoto && (
                  <div className="w-24 h-24 rounded-lg overflow-hidden border-2 border-[#d4b896]">
                    <img src={tentColorPhoto} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>

            <div>
              <Label>Warna Tenda</Label>
              <Input
                type="text"
                value={softlensColor}
                onChange={(e) => setSoftlensColor(e.target.value)}
                placeholder="cth: Coklat, Abu-abu"
                className="mt-2"
              />
            </div>

            {/* Dress Photos */}
            <div>
              <Label>Foto Gaun (3 Foto)</Label>
              <p className="text-xs text-gray-400 mt-1 mb-3">Upload hingga 3 foto gaun (Max 10MB per foto, JPG/PNG/WebP)</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[0, 1, 2].map((index) => (
                  <div key={index} className="space-y-2">
                    <p className="text-xs text-gray-400">Foto Gaun {index + 1}</p>
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={(e) => handleDressPhotoUpload(e, index)}
                      className="w-full text-sm text-gray-400 file:mr-2 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-[#d4b896] file:text-black file:text-xs file:cursor-pointer hover:file:bg-[#c4a886]"
                    />
                    {dressPhotos[index] && (
                      <div className="w-full aspect-square rounded-lg overflow-hidden border-2 border-[#d4b896]">
                        <img src={dressPhotos[index]} alt={`Gaun ${index + 1}`} className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label>Permintaan Opsional</Label>
              <textarea
                value={specialRequest}
                onChange={(e) => setSpecialRequest(e.target.value)}
                rows={4}
                className="w-full mt-2 rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] px-4 py-3 text-white focus:ring-2 focus:ring-[#d4b896]/50 focus:outline-none resize-none"
              />
            </div>
          </div>
        </div>

        {/* Status Pembayaran */}
        <div className="bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-6">Status Pembayaran</h2>
          
          <div>
            <Label>Status Pembayaran</Label>
            <select
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
              className="w-full h-12 mt-2 rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] px-4 text-white focus:ring-2 focus:ring-[#d4b896]/50 focus:outline-none"
            >
              <option value="Belum Lunas">Belum Lunas</option>
              <option value="Lunas">Lunas</option>
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-4">
          <Link
            href="/orders"
            className="w-full sm:w-auto px-6 py-3 text-center text-gray-400 hover:text-white transition-colors"
          >
            Batal
          </Link>
          <Button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto bg-[#d4b896] hover:bg-[#c4a886] text-black px-8"
          >
            {loading ? 'Menyimpan...' : 'Simpan Pesanan'}
          </Button>
        </div>
      </form>
    </>
  );
}