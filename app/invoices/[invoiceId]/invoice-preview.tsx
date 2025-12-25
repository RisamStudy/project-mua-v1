"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// Paksa dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PaymentData {
  id: string;
  paymentNumber: number;
  amount: string;
  paymentDate: string;
  paymentMethod: string;
}

interface InvoiceData {
  id: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string | null;
  amount: string;
  paidAmount: string;
  status: string;
  notes: string | null;
  order: {
    orderNumber: string;
    items: unknown;
    totalAmount: string;
    payments: PaymentData[];
  };
  client: {
    brideName: string;
    groomName: string;
    primaryPhone: string;
    brideAddress: string;
    eventLocation: string;
  };
  payment: PaymentData | null;
}

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  total: number;
}

export default function InvoicePreview({ invoice }: { invoice: InvoiceData }) {
  const [downloading, setDownloading] = useState(false);
  const [isSafari, setIsSafari] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Detect Safari after component mounts to avoid hydration issues
  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      setIsSafari(/^((?!chrome|android).)*safari/i.test(navigator.userAgent));
    }
  }, []);

  // Parse items - handle both array and stringified JSON
  const parseItems = (itemsData: unknown): OrderItem[] => {
    if (Array.isArray(itemsData)) return itemsData as OrderItem[];
    if (typeof itemsData === "string") {
      try {
        const parsed = JSON.parse(itemsData);
        return Array.isArray(parsed) ? (parsed as OrderItem[]) : [];
      } catch {
        return [];
      }
    }
    return [];
  };

  const items = parseItems(invoice.order.items);
  const payments = invoice.order?.payments || [];

  const formatCurrency = (amount: string) => {
    return `Rp ${parseFloat(amount).toLocaleString("id-ID")}`;
  };

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      if (typeof window !== 'undefined') {
        // Generate filename based on groom and bride names
        const groomName = invoice.client.groomName || 'Groom';
        const brideName = invoice.client.brideName || 'Bride';
        const invoiceNumber = invoice.invoiceNumber || 'INV';
        
        // Clean names for filename (remove special characters)
        const cleanGroomName = groomName.replace(/[^a-zA-Z0-9]/g, '');
        const cleanBrideName = brideName.replace(/[^a-zA-Z0-9]/g, '');
        const filename = `Invoice_${cleanGroomName}_${cleanBrideName}_${invoiceNumber}`;
        
        // Set document title for filename suggestion
        const originalTitle = document.title;
        document.title = filename;
        
        // Print langsung tanpa CSS tambahan apapun
        window.print();
        
        // Restore title
        setTimeout(() => {
          document.title = originalTitle;
        }, 1000);
      }
    } catch (error) {
      console.error("Download error:", error);
      alert("Terjadi kesalahan saat mencetak. Silakan coba lagi atau gunakan browser lain.");
    } finally {
      setDownloading(false);
    }
  };

  const subtotal = items.reduce((sum: number, item: OrderItem) => {
    return sum + parseFloat(item.total?.toString() || "0");
  }, 0);

  const totalDP = payments.reduce((sum: number, payment: PaymentData) => {
    return sum + parseFloat(payment.amount);
  }, 0);

  const sisaPembayaran = subtotal - totalDP;

  return (
    <div className="max-w-5xl mx-auto relative min-h-screen" style={{ backgroundColor: '#ffffff' }}>
      {/* Header */}
      <div className="mb-6 md:mb-8 print:hidden bg-white p-6 border-b border-[#d4b896]">
        <Link
          href="/invoices"
          className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors mb-4"
        >
          <span className="material-symbols-outlined">arrow_back</span>
          <span>Back to Invoices</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: '#000000' }}>
              Pratinjau & Generator Faktur
            </h1>
            <p className="text-sm md:text-base text-gray-600">
              Tinjau dan selesaikan faktur untuk Pesanan #
              {invoice.order.orderNumber}.
            </p>
          </div>
          <Button
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="bg-[#d4b896] hover:bg-[#c4a886] flex-shrink-0 border border-[#d4b896]"
            style={{ color: '#000000' }}
          >
            {downloading ? (
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined animate-spin">
                  refresh
                </span>
                Generating...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined">download</span>
                <span>Generate & Download PDF</span>
                {mounted && isSafari && (
                  <span className="text-xs opacity-75">(Safari)</span>
                )}
              </span>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
        {/* Invoice Document */}
        <div className="lg:col-span-2">
          <div 
            className="rounded-xl p-4 sm:p-6 md:p-8 lg:p-10 shadow-lg border-2 border-[#d4b896] print:shadow-none print:border-none print:rounded-none"
            style={{ backgroundColor: '#ffffff' }}
          >
            {/* Invoice Header - Responsive Stack on Mobile */}
            <div className="mb-6 md:mb-10">
              {/* Mobile: Stacked Layout */}
              <div className="flex flex-col gap-4 sm:hidden">
                {/* Logo & Title */}
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-14 h-14">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/logo.png"
                      alt="RORO MUA Logo"
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold mb-0.5" style={{ color: '#000000' }}>FAKTUR</h1>
                    <p className="text-xs" style={{ color: '#666666' }}>#{invoice.invoiceNumber}</p>
                  </div>
                </div>

                {/* Company Info */}
                <div className="border-t pt-3">
                  <h2 className="text-sm font-bold mb-1" style={{ color: '#000000' }}>RORO MUA</h2>
                  <p className="text-xs leading-relaxed" style={{ color: '#666666' }}>
                    Perumahan Kaliwulu blok AC no.1<br />
                    Kec.Plered Kab Cirebon<br />
                    (Depan Lapangan)
                  </p>
                </div>
              </div>

              {/* Tablet & Desktop: Side by Side */}
              <div className="hidden sm:flex justify-between items-start gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="flex-shrink-0 w-16 h-16 md:w-20 md:h-20">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/logo.png"
                      alt="RORO MUA Logo"
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </div>
                  <div>
                    <h1 className="text-xl md:text-2xl font-bold mb-1" style={{ color: '#000000' }}>FAKTUR</h1>
                    <p className="text-xs md:text-sm" style={{ color: '#666666' }}>#{invoice.invoiceNumber}</p>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <h2 className="text-sm md:text-base font-bold mb-1" style={{ color: '#000000' }}>RORO MUA</h2>
                  <p className="text-xs leading-tight" style={{ color: '#666666' }}>
                    Perumahan Kaliwulu blok AC no.1
                  </p>
                  <p className="text-xs leading-tight" style={{ color: '#666666' }}>
                    Kec.Plered Kab Cirebon
                  </p>
                  <p className="text-xs leading-tight" style={{ color: '#666666' }}>
                    (Depan Lapangan)
                  </p>
                </div>
              </div>
            </div>

            {/* Bill To & Payment Details - Responsive Stack */}
            <div className="mb-6 md:mb-10 pb-6 border-b-2 border-[#d4b896]">
              {/* Mobile: Stacked */}
              <div className="space-y-4 sm:hidden">
                <div>
                  <h3 className="text-xs font-bold mb-2 uppercase tracking-wide" style={{ color: '#d4b896' }}>
                    Diterbitkan Kepada
                  </h3>
                  <p className="font-bold text-sm mb-1" style={{ color: '#000000' }}>{invoice.client.brideName}</p>
                  <p className="text-xs leading-relaxed" style={{ color: '#666666' }}>{invoice.client.brideAddress}</p>
                  <p className="text-xs" style={{ color: '#666666' }}>{invoice.client.primaryPhone}</p>
                </div>

                <div>
                  <h3 className="text-xs font-bold mb-2 uppercase tracking-wide" style={{ color: '#d4b896' }}>
                    Detail Pembayaran
                  </h3>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span style={{ color: '#666666' }}>Tanggal Terbit:</span>
                      <span className="font-semibold" style={{ color: '#000000' }}>{invoice.issueDate}</span>
                    </div>
                    {invoice.dueDate && (
                      <div className="flex justify-between text-xs">
                        <span style={{ color: '#666666' }}>Jatuh Tempo:</span>
                        <span className="font-semibold" style={{ color: '#000000' }}>{invoice.dueDate}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-xs">
                      <span style={{ color: '#666666' }}>ID Pesanan:</span>
                      <span className="font-semibold" style={{ color: '#000000' }}>{invoice.order.orderNumber}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tablet & Desktop: Side by Side */}
              <div className="hidden sm:grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xs font-bold mb-3 uppercase tracking-wide" style={{ color: '#d4b896' }}>
                    Diterbitkan Kepada
                  </h3>
                  <p className="font-bold text-sm md:text-base mb-1" style={{ color: '#000000' }}>{invoice.client.brideName}</p>
                  <p className="text-xs md:text-sm" style={{ color: '#666666' }}>{invoice.client.brideAddress}</p>
                  <p className="text-xs md:text-sm" style={{ color: '#666666' }}>{invoice.client.primaryPhone}</p>
                </div>

                <div className="text-right">
                  <h3 className="text-xs font-bold mb-3 uppercase tracking-wide" style={{ color: '#d4b896' }}>
                    Detail Pembayaran
                  </h3>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs md:text-sm">
                      <span style={{ color: '#666666' }}>Tanggal Terbit:</span>
                      <span className="font-semibold" style={{ color: '#000000' }}>{invoice.issueDate}</span>
                    </div>
                    {invoice.dueDate && (
                      <div className="flex justify-between text-xs md:text-sm">
                        <span style={{ color: '#666666' }}>Jatuh Tempo:</span>
                        <span className="font-semibold" style={{ color: '#000000' }}>{invoice.dueDate}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-xs md:text-sm">
                      <span style={{ color: '#666666' }}>ID Pesanan:</span>
                      <span className="font-semibold" style={{ color: '#000000' }}>{invoice.order.orderNumber}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Items Table - Responsive */}
            <div className="mb-6 md:mb-8 overflow-x-auto -mx-4 sm:mx-0">
              <div className="min-w-[320px] px-4 sm:px-0">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b-2 border-[#d4b896]">
                      <th className="text-left py-2 md:py-3 font-semibold text-[10px] md:text-xs uppercase tracking-wide" style={{ color: '#d4b896' }}>
                        Layanan
                      </th>
                      <th className="text-center py-2 md:py-3 font-semibold text-[10px] md:text-xs uppercase tracking-wide w-12 md:w-16" style={{ color: '#d4b896' }}>
                        QTY
                      </th>
                      <th className="text-right py-2 md:py-3 font-semibold text-[10px] md:text-xs uppercase tracking-wide w-24 md:w-32" style={{ color: '#d4b896' }}>
                        Harga
                      </th>
                      <th className="text-right py-2 md:py-3 font-semibold text-[10px] md:text-xs uppercase tracking-wide w-24 md:w-32" style={{ color: '#d4b896' }}>
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item: OrderItem, idx: number) => (
                      <tr key={idx} className="border-b border-[#d4b896]/30">
                        <td className="py-3 md:py-4 text-xs md:text-sm pr-2 align-top" style={{ color: '#000000' }}>
                          {item.name}
                        </td>
                        <td className="py-3 md:py-4 text-center text-xs md:text-sm align-top" style={{ color: '#000000' }}>
                          {item.quantity}
                        </td>
                        <td className="py-3 md:py-4 text-right text-xs md:text-sm align-top" style={{ color: '#000000' }}>
                          {formatCurrency(item.price.toString())}
                        </td>
                        <td className="py-3 md:py-4 text-right text-xs md:text-sm font-semibold align-top" style={{ color: '#000000' }}>
                          {formatCurrency(item.total.toString())}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totals Section - Responsive */}
            <div className="flex justify-end">
              <div className="w-full sm:w-80 md:w-96 space-y-2">
                {/* Subtotal */}
                <div className="flex justify-between py-2 text-xs md:text-sm">
                  <span style={{ color: '#666666' }}>Subtotal</span>
                  <span className="font-semibold" style={{ color: '#000000' }}>
                    {formatCurrency(subtotal.toString())}
                  </span>
                </div>

                {/* DP List */}
                {payments.length > 0 &&
                  payments.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex justify-between py-2 text-xs md:text-sm"
                    >
                      <span style={{ color: '#666666' }}>
                        DP{payment.paymentNumber}
                      </span>
                      <span className="font-semibold" style={{ color: '#000000' }}>
                        {formatCurrency(payment.amount)}
                      </span>
                    </div>
                  ))}

                {/* Divider */}
                <div className="border-t-2 border-[#d4b896] my-2"></div>

                {/* Jumlah Total */}
                <div className="flex justify-between py-2">
                  <span className="font-bold text-sm md:text-base" style={{ color: '#000000' }}>
                    Jumlah Total
                  </span>
                  <span className="font-bold text-sm md:text-base" style={{ color: '#000000' }}>
                    {formatCurrency(subtotal.toString())}
                  </span>
                </div>

                {/* Total Dibayar */}
                <div className="flex justify-between py-2 bg-green-50 px-3 rounded border border-green-200">
                  <span className="font-semibold text-xs md:text-sm" style={{ color: '#15803d' }}>
                    Total Dibayar
                  </span>
                  <span className="font-bold text-xs md:text-sm" style={{ color: '#15803d' }}>
                    {formatCurrency(totalDP.toString())}
                  </span>
                </div>

                {/* Sisa Tagihan */}
                <div className="flex justify-between py-2 md:py-3 px-3 rounded border border-[#d4b896]" style={{ backgroundColor: 'rgba(212, 184, 150, 0.1)' }}>
                  <span className="font-bold text-sm md:text-base" style={{ color: '#d4b896' }}>
                    Sisa Tagihan
                  </span>
                  <span className="font-bold text-sm md:text-base" style={{ color: '#d4b896' }}>
                    {formatCurrency(sisaPembayaran.toString())}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer Notes */}
            {invoice.notes && (
              <div className="mt-8 md:mt-12 pt-6 border-t border-[#d4b896]">
                <h3 className="text-xs font-bold mb-2 uppercase tracking-wide" style={{ color: '#d4b896' }}>
                  Catatan / Keterangan
                </h3>
                <p className="text-xs md:text-sm" style={{ color: '#666666' }}>
                  {invoice.notes}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Invoice Settings Sidebar */}
        <div className="space-y-6 print:hidden">
          <div className="border-2 border-[#d4b896] rounded-xl p-6 shadow-lg" style={{ backgroundColor: '#ffffff' }}>
            <h2 className="text-xl font-bold mb-6" style={{ color: '#000000' }}>
              Pengaturan Faktur
            </h2>

            <div className="space-y-4">
              <div>
                <label className="text-sm mb-2 block" style={{ color: '#666666' }}>
                  Syarat Pembayaran
                </label>
                <select 
                  className="w-full h-10 rounded-lg border-2 border-[#d4b896] px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#d4b896]/50"
                  style={{
                    backgroundColor: '#ffffff',
                    color: '#000000',
                    WebkitAppearance: 'none',
                    MozAppearance: 'none',
                    appearance: 'none',
                    backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23d4b896\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6,9 12,15 18,9\'%3e%3c/polyline%3e%3c/svg%3e")',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 12px center',
                    backgroundSize: '16px'
                  }}
                >
                  <option>Net 7 hari</option>
                  <option>Net 14 hari</option>
                  <option>Net 30 hari</option>
                </select>
              </div>

              <div>
                <label className="text-sm mb-2 block" style={{ color: '#666666' }}>
                  Mata uang
                </label>
                <select 
                  className="w-full h-10 rounded-lg border-2 border-[#d4b896] px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#d4b896]/50"
                  style={{
                    backgroundColor: '#ffffff',
                    color: '#000000',
                    WebkitAppearance: 'none',
                    MozAppearance: 'none',
                    appearance: 'none',
                    backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23d4b896\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6,9 12,15 18,9\'%3e%3c/polyline%3e%3c/svg%3e")',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 12px center',
                    backgroundSize: '16px'
                  }}
                >
                  <option>IDR - Indonesian Rupiah</option>
                  <option>USD - US Dollar</option>
                </select>
              </div>
            </div>
          </div>

          {/* Payment History */}
          {payments.length > 0 && (
            <div className="border-2 border-[#d4b896] rounded-xl p-6 shadow-lg" style={{ backgroundColor: '#ffffff' }}>
              <h2 className="text-xl font-bold mb-6" style={{ color: '#000000' }}>
                Riwayat Pembayaran
              </h2>
              <div className="space-y-3">
                {payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="pb-3 border-b border-[#d4b896]/30 last:border-0"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <p className="font-medium" style={{ color: '#000000' }}>
                        DP{payment.paymentNumber}
                      </p>
                      <p className="font-semibold" style={{ color: '#000000' }}>
                        {formatCurrency(payment.amount)}
                      </p>
                    </div>
                    <p className="text-xs" style={{ color: '#666666' }}>
                      {payment.paymentDate} via {payment.paymentMethod}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="border-2 border-[#d4b896] rounded-xl p-6 shadow-lg" style={{ backgroundColor: '#ffffff' }}>
            <h2 className="text-xl font-bold mb-6" style={{ color: '#000000' }}>
              Catatan / Keterangan
            </h2>
            <p className="text-sm" style={{ color: '#666666' }}>
              Terima kasih telah memilih Roro MUA untuk hari istimewa Anda! Kami
              sangat menghargai kepercayaan Anda.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}