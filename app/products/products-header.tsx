"use client";

import Link from 'next/link';

export default function ProductsHeader() {
  return (
    <div className="mb-6 md:mb-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-black mb-2">
            Product Catalog
          </h1>
          <p className="text-sm md:text-base text-gray-600">
            Browse, add, and manage your products, packages, and gowns.
          </p>
        </div>
        <Link
          href="/products/new"
          className="flex items-center justify-center gap-2 bg-[#d4b896] hover:bg-[#c4a886] text-black px-4 sm:px-6 py-3 rounded-lg font-medium transition-colors w-full sm:w-auto"
        >
          <span className="material-symbols-outlined">add</span>
          <span className="hidden sm:inline">Add New Product</span>
          <span className="sm:hidden">Add Product</span>
        </Link>
      </div>
    </div>
  );
}