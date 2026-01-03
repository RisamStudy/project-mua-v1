"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  orderId: string;
  orderNumber: string;
  remainingAmount: string;
  nextPaymentNumber: number;
}

export default function PaymentModal({
  isOpen,
  onClose,
  onSuccess,
  orderId,
  orderNumber,
  remainingAmount,
  nextPaymentNumber,
}: PaymentModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    amount: "",
    paymentMethod: "Transfer Bank",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Safari compatibility
    
    setLoading(true);
    setError("");

    const amount = parseFloat(formData.amount);
    const remaining = parseFloat(remainingAmount);

    if (amount <= 0) {
      setError("Jumlah pembayaran harus lebih dari 0");
      setLoading(false);
      return;
    }

    if (amount > remaining) {
      setError(
        `Jumlah pembayaran (Rp${amount.toLocaleString(
          "id-ID"
        )}) melebihi sisa pembayaran (Rp${remaining.toLocaleString("id-ID")})`
      );
      setLoading(false);
      return;
    }

    try {
      const requestBody = {
        amount,
        paymentMethod: formData.paymentMethod,
        notes:
          formData.notes ||
          `Pembayaran DP${nextPaymentNumber} untuk pesanan ${orderNumber}`,
      };

      const response = await fetch(`/api/orders/${orderId}/add-payment`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json", // Safari compatibility
        },
        body: JSON.stringify(requestBody),
        credentials: 'same-origin', // Safari CORS compatibility
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        throw new Error(errorData.message || "Failed to add payment");
      }

      const data = await response.json();

      // Reset form
      setFormData({
        amount: "",
        paymentMethod: "Transfer Bank",
        notes: "",
      });

      onSuccess();
    } catch (err: unknown) {
      console.error('Payment error:', err);
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      amount: "",
      paymentMethod: "Transfer Bank",
      notes: "",
    });
    setError("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
      />

      <div className="relative bg-white border border-[#d4b896] rounded-xl p-6 max-w-lg w-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-black">
            Tambah Pembayaran DP{nextPaymentNumber}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-600 hover:text-black"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Order Info */}
          <div className="bg-gray-100 rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600 text-sm">Pesanan</span>
              <span className="text-black font-semibold">{orderNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 text-sm">Sisa Pembayaran</span>
              <span className="text-black font-semibold">
                Rp{parseFloat(remainingAmount).toLocaleString("id-ID")}
              </span>
            </div>
          </div>

          {/* Amount */}
          <div>
            <Label>Jumlah Pembayaran</Label>
            <Input
              type="number"
              min="0"
              max={remainingAmount}
              step="1000"
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: e.target.value })
              }
              placeholder="0"
              required
              className="mt-2"
            />
            <p className="text-xs text-gray-600 mt-2">
              Maksimal: Rp{parseFloat(remainingAmount).toLocaleString("id-ID")}
            </p>
          </div>

          {/* Payment Method */}
          <div>
            <Label>Metode Pembayaran</Label>
            <select
              value={formData.paymentMethod}
              onChange={(e) =>
                setFormData({ ...formData, paymentMethod: e.target.value })
              }
              className="w-full h-12 mt-2 rounded-lg border border-[#d4b896] bg-white px-4 text-black focus:ring-2 focus:ring-[#d4b896]/50 focus:outline-none"
            >
              <option value="Transfer Bank">Transfer Bank</option>
              <option value="Tunai">Tunai</option>
              <option value="E-Wallet">E-Wallet</option>
              <option value="Kartu Kredit">Kartu Kredit</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <Label>Catatan (Opsional)</Label>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              rows={3}
              placeholder="Tambahkan catatan pembayaran..."
              className="w-full mt-2 rounded-lg border border-[#d4b896] bg-white px-4 py-3 text-black focus:ring-2 focus:ring-[#d4b896]/50 focus:outline-none resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t border-[#d4b896]">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-6 py-3 text-gray-600 hover:text-black transition-colors"
            >
              Batal
            </button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-[#d4b896] hover:bg-[#c4a886] text-black"
            >
              {loading ? "Memproses..." : "Tambah Pembayaran"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
