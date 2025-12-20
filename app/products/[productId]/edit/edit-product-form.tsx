"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import Toast from '@/components/ui/toast';

interface Product {
  id: string;
  name: string;
  category: string;
  description: string | null;
  price: string;
  imageUrl: string | null;
}

export default function EditProductForm({ product }: { product: Product }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(product.imageUrl);
  
  const [toast, setToast] = useState<{
    isOpen: boolean;
    message: string;
    type: 'success' | 'error';
  }>({
    isOpen: false,
    message: '',
    type: 'success',
  });
  
  const [formData, setFormData] = useState({
    name: product.name,
    category: product.category,
    description: product.description || '',
    price: product.price,
  });

  const compressImage = (file: File, maxWidth: number = 800): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
          resolve(compressedBase64);
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setToast({
        isOpen: true,
        message: 'Please upload an image file',
        type: 'error',
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setToast({
        isOpen: true,
        message: 'Image size must be less than 10MB',
        type: 'error',
      });
      return;
    }

    try {
      const compressedBase64 = await compressImage(file, 800);
      setImagePreview(compressedBase64);
    } catch (error) {
      setToast({
        isOpen: true,
        message: 'Failed to process image',
        type: 'error',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = {
        name: formData.name.trim(),
        category: formData.category.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        imageUrl: imagePreview,
      };

      const response = await fetch(`/api/products/${product.id}/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update product');
      }

      setToast({
        isOpen: true,
        message: 'Product updated successfully!',
        type: 'success',
      });

      setTimeout(() => {
        router.push('/products');
        router.refresh();
      }, 1500);
    } catch (err: any) {
      setToast({
        isOpen: true,
        message: err.message || 'Something went wrong',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="mb-6 md:mb-8">
        <Link
          href="/products"
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
        >
          <span className="material-symbols-outlined">arrow_back</span>
          <span>Kembali ke Produk</span>
        </Link>

        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
          Edit Produk
        </h1>
        <p className="text-sm md:text-base text-gray-400">
          Perbarui informasi dan foto produk.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Product Photo */}
        <div className="bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-2">Foto Produk</h2>
          <p className="text-sm text-gray-400 mb-6">Unggah Foto Produk (automatically compressed).</p>
          
          <div className="border-2 border-dashed border-[#2a2a2a] rounded-xl p-8 text-center hover:border-[#d4b896] transition-colors cursor-pointer">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="product-image"
            />
            <label htmlFor="product-image" className="cursor-pointer">
              {imagePreview ? (
                <div className="space-y-4">
                  <img src={imagePreview} alt="Preview" className="max-h-64 mx-auto rounded-lg" />
                  <p className="text-sm text-gray-400">Klik untuk mengubah gambar</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <span className="material-symbols-outlined text-6xl text-gray-600">cloud_upload</span>
                  <div>
                    <p className="text-white mb-2">
                      <span className="text-[#e91e63]">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-sm text-gray-400">PNG, JPG or GIF (auto-compressed)</p>
                  </div>
                </div>
              )}
            </label>
          </div>
        </div>

        {/* Product Details */}
        <div className="bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-2">Detail Produk</h2>
          <p className="text-sm text-gray-400 mb-6">Perbarui informasi produk.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label>Nama Produk</Label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Gold Package or Gown #12A"
                required
                className="mt-2"
              />
            </div>

            <div>
              <Label>Kategori</Label>
              <Input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g., Bridal Package, Gown, Makeup"
                required
                className="mt-2"
              />
            </div>

            <div>
              <Label>Harga</Label>
              <Input
                type="number"
                min="0"
                step="1000"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="0"
                required
                className="mt-2"
              />
            </div>

            <div className="md:col-span-2">
              <Label>Deskripsi</Label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                placeholder="Enter product details, features, or notes..."
                className="w-full mt-2 rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] px-4 py-3 text-white focus:ring-2 focus:ring-[#d4b896]/50 focus:outline-none resize-none"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-4">
          <Link
            href="/products"
            className="w-full sm:w-auto px-6 py-3 text-center text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </Link>
          <Button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto bg-[#d4b896] hover:bg-[#c4a886] text-black px-8"
          >
            {loading ? 'Updating...' : 'Perbarui Produk'}
          </Button>
        </div>
      </form>

      <Toast
        isOpen={toast.isOpen}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, isOpen: false })}
      />
    </>
  );
}