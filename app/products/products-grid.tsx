"use client";

import { useState } from "react";
import Link from "next/link";
import DeleteModal from "@/components/ui/delete-modal";
import Toast from "@/components/ui/toast";

interface Product {
  id: string;
  name: string;
  category: string;
  description: string | null;
  price: string;
  imageUrl: string | null;
  isActive: boolean;
}

export default function ProductsGrid({ products }: { products: Product[] }) {
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    productId: string | null;
    productName: string | null;
  }>({
    isOpen: false,
    productId: null,
    productName: null,
  });
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<{
    isOpen: boolean;
    message: string;
    type: "success" | "error";
  }>({
    isOpen: false,
    message: "",
    type: "success",
  });

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(parseFloat(price));
  };

  const handleDelete = async () => {
    if (!deleteModal.productId) return;

    setDeleting(true);
    try {
      const response = await fetch(
        `/api/products/${deleteModal.productId}/delete`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        setDeleteModal({ isOpen: false, productId: null, productName: null });
        setToast({
          isOpen: true,
          message: "Product deleted successfully",
          type: "success",
        });
        setTimeout(() => window.location.reload(), 1500);
      } else {
        const data = await response.json();
        setToast({
          isOpen: true,
          message: data.message || "Failed to delete product",
          type: "error",
        });
      }
    } catch {
      setToast({
        isOpen: true,
        message: "Failed to delete product",
        type: "error",
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.length === 0 ? (
          <div className="col-span-full text-center py-16">
            <div className="flex flex-col items-center gap-4">
              <span className="material-symbols-outlined text-6xl text-gray-600">
                inventory_2
              </span>
              <p className="text-gray-400">
                No products yet. Add your first product!
              </p>
              <Link
                href="/products/new"
                className="mt-4 flex items-center gap-2 bg-[#e91e63] hover:bg-[#c2185b] text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                <span className="material-symbols-outlined">add</span>
                <span>Add New Product</span>
              </Link>
            </div>
          </div>
        ) : (
          products.map((product) => (
            <div
              key={product.id}
              className="bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl overflow-hidden hover:border-[#d4b896] transition-colors group"
            >
              {/* Product Image */}
              <div className="relative aspect-square bg-[#1a1a1a] overflow-hidden">
                {product.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-6xl text-gray-600">
                      photo_camera
                    </span>
                  </div>
                )}

                {/* Category Badge */}
                <div className="absolute top-3 left-3">
                  <span className="px-3 py-1 bg-[#e91e63]/90 backdrop-blur-sm text-white text-xs font-medium rounded-full">
                    {product.category}
                  </span>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-6">
                <h3 className="text-lg font-bold text-white mb-1 line-clamp-1">
                  {product.name}
                </h3>

                {/* Price */}
                <p className="text-xl font-bold text-[#d4b896] mb-3">
                  {formatPrice(product.price)}
                </p>

                <p className="text-sm text-gray-400 mb-4 line-clamp-2 min-h-[40px]">
                  {product.description || "No description"}
                </p>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Link
                    href={`/products/${product.id}/edit`}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#1a1a1a] hover:bg-[#252525] text-[#e91e63] rounded-lg transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">
                      edit
                    </span>
                    <span className="text-sm font-medium">Edit</span>
                  </Link>
                  <button
                    onClick={() =>
                      setDeleteModal({
                        isOpen: true,
                        productId: product.id,
                        productName: product.name,
                      })
                    }
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#1a1a1a] hover:bg-red-500/10 text-red-500 rounded-lg transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">
                      delete
                    </span>
                    <span className="text-sm font-medium">Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <DeleteModal
        isOpen={deleteModal.isOpen}
        onClose={() =>
          setDeleteModal({ isOpen: false, productId: null, productName: null })
        }
        onConfirm={handleDelete}
        title="Delete Product"
        description={`Apakah kamu yakin ingin Menghapus "${deleteModal.productName}"? Tindakan ini tidak dapat dibatalkan.`}
        loading={deleting}
      />

      <Toast
        isOpen={toast.isOpen}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, isOpen: false })}
      />
    </>
  );
}
