"use client";

export default function InvoicesHeader() {
  return (
    <div className="mb-6 md:mb-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-black mb-2">
            Invoice History
          </h1>
          <p className="text-sm md:text-base text-gray-600">
            Kelola dan lacak semua faktur klien.
          </p>
        </div>
      </div>
    </div>
  );
}