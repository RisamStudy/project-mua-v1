import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthAPI } from "@/lib/auth";
import fs from 'fs';
import path from 'path';

// Function to convert logo to base64
async function getLogoBase64(): Promise<string> {
  try {
    // Try logo.png first, then logo1.png as fallback
    const logoPath = path.join(process.cwd(), 'public', 'logo.png');
    const logoPath1 = path.join(process.cwd(), 'public', 'logo1.png');
    
    let logoBuffer: Buffer;
    
    if (fs.existsSync(logoPath)) {
      logoBuffer = fs.readFileSync(logoPath);
    } else if (fs.existsSync(logoPath1)) {
      logoBuffer = fs.readFileSync(logoPath1);
    } else {
      // Fallback: create a simple SVG logo
      const svgLogo = `<svg width="80" height="80" xmlns="http://www.w3.org/2000/svg">
        <circle cx="40" cy="40" r="35" fill="#d4b896"/>
        <text x="40" y="50" text-anchor="middle" fill="white" font-family="Arial" font-size="20" font-weight="bold">RORO</text>
      </svg>`;
      return `data:image/svg+xml;base64,${Buffer.from(svgLogo).toString('base64')}`;
    }
    
    return logoBuffer.toString('base64');
  } catch (error) {
    console.error('Error loading logo:', error);
    // Fallback SVG
    const svgLogo = `<svg width="80" height="80" xmlns="http://www.w3.org/2000/svg">
      <circle cx="40" cy="40" r="35" fill="#d4b896"/>
      <text x="40" y="50" text-anchor="middle" fill="white" font-family="Arial" font-size="20" font-weight="bold">RORO</text>
    </svg>`;
    return `data:image/svg+xml;base64,${Buffer.from(svgLogo).toString('base64')}`;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Require authentication for sensitive file downloads
    await requireAuthAPI();
    
    const { id: invoiceId } = params;

    // Get invoice data
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        order: {
          include: {
            client: true,
            payments: {
              orderBy: { paymentNumber: "asc" },
            },
          },
        },
        payment: true,
      },
    });

    if (!invoice) {
      return NextResponse.json({ message: "Invoice not found" }, { status: 404 });
    }

    // Parse items
    const parseItems = (itemsData: any) => {
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

    const items = parseItems(invoice.order.items);
    const payments = invoice.order?.payments || [];

    const formatCurrency = (amount: string | number) => {
      return `Rp ${parseFloat(amount.toString()).toLocaleString("id-ID")}`;
    };

    const formatDate = (dateString: string | Date) => {
      const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    };

    // Calculate totals
    const subtotal = items.reduce((sum: number, item: any) => {
      return sum + parseFloat(item.total?.toString() || "0");
    }, 0);

    const totalDP = payments.reduce((sum: number, payment: any) => {
      return sum + parseFloat(payment.amount);
    }, 0);

    const sisaPembayaran = subtotal - totalDP;

    // Get logo as base64
    const logoBase64 = await getLogoBase64();

    // Create HTML content for PDF
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Invoice ${invoice.invoiceNumber}</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
                font-family: 'Arial', sans-serif; 
                line-height: 1.6; 
                color: #333; 
                background: #fff;
                padding: 40px;
            }
            .container { max-width: 800px; margin: 0 auto; }
            .header { 
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 40px;
                border-bottom: 3px solid #d4b896;
                padding-bottom: 30px;
            }
            .logo-section {
                display: flex;
                align-items: center;
                gap: 20px;
            }
            .logo {
                width: 80px;
                height: 80px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 5px 15px rgba(212, 184, 150, 0.3);
                overflow: hidden;
                background: white;
                border: 3px solid #d4b896;
            }
            .logo img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
            .invoice-title {
                font-size: 32px;
                font-weight: bold;
                color: #d4b896;
                margin-bottom: 5px;
            }
            .invoice-number {
                font-size: 14px;
                color: #666;
            }
            .company-info {
                text-align: right;
            }
            .company-name {
                font-size: 18px;
                font-weight: bold;
                margin-bottom: 5px;
            }
            .company-address {
                font-size: 12px;
                color: #666;
                line-height: 1.4;
            }
            .bill-to-section {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 40px;
                margin-bottom: 40px;
                padding-bottom: 30px;
                border-bottom: 2px solid #d4b896;
            }
            .section-title {
                font-size: 12px;
                font-weight: bold;
                color: #d4b896;
                text-transform: uppercase;
                letter-spacing: 1px;
                margin-bottom: 15px;
            }
            .client-name {
                font-size: 16px;
                font-weight: bold;
                margin-bottom: 5px;
            }
            .client-details {
                font-size: 12px;
                color: #666;
                line-height: 1.4;
            }
            .payment-details {
                text-align: right;
            }
            .detail-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 5px;
                font-size: 12px;
            }
            .detail-label {
                color: #666;
            }
            .detail-value {
                font-weight: bold;
            }
            .items-table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 30px;
            }
            .items-table th {
                background: #d4b896;
                color: white;
                padding: 15px;
                text-align: left;
                font-size: 12px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            .items-table td {
                padding: 15px;
                border-bottom: 1px solid #eee;
                font-size: 14px;
            }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .totals-section {
                display: flex;
                justify-content: flex-end;
                margin-bottom: 40px;
            }
            .totals-table {
                width: 400px;
            }
            .total-row {
                display: flex;
                justify-content: space-between;
                padding: 8px 0;
                font-size: 14px;
            }
            .total-row.subtotal {
                border-bottom: 1px solid #eee;
            }
            .total-row.grand-total {
                font-weight: bold;
                font-size: 16px;
                border-top: 2px solid #d4b896;
                padding-top: 15px;
            }
            .total-row.paid {
                background: #e8f5e8;
                padding: 10px;
                border-radius: 5px;
                color: #2d5a2d;
                font-weight: bold;
            }
            .total-row.remaining {
                background: #fff3cd;
                padding: 10px;
                border-radius: 5px;
                color: #856404;
                font-weight: bold;
                border: 2px solid #d4b896;
            }
            .notes-section {
                margin-top: 40px;
                padding-top: 30px;
                border-top: 2px solid #d4b896;
            }
            .notes-title {
                font-size: 12px;
                font-weight: bold;
                color: #d4b896;
                text-transform: uppercase;
                letter-spacing: 1px;
                margin-bottom: 15px;
            }
            .notes-content {
                font-size: 12px;
                color: #666;
                line-height: 1.6;
            }
            .notes-item {
                margin-bottom: 10px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <!-- Header -->
            <div class="header">
                <div class="logo-section">
                    <div class="logo">
                        <img src="${logoBase64.startsWith('data:') ? logoBase64 : `data:image/png;base64,${logoBase64}`}" alt="RORO MUA Logo" />
                    </div>
                    <div>
                        <div class="invoice-title">FAKTUR</div>
                        <div class="invoice-number">#${invoice.invoiceNumber}</div>
                    </div>
                </div>
                <div class="company-info">
                    <div class="company-name">RORO MUA</div>
                    <div class="company-address">
                        Perumahan Kaliwulu blok AC no.1<br>
                        Kec.Plered Kab Cirebon<br>
                        (Depan Lapangan)
                    </div>
                </div>
            </div>

            <!-- Bill To Section -->
            <div class="bill-to-section">
                <div>
                    <div class="section-title">Diterbitkan Kepada</div>
                    <div class="client-name">${invoice.order.client.brideName}</div>
                    <div class="client-details">
                        ${invoice.order.client.brideAddress}<br>
                        <strong>HP Pengantin Wanita:</strong> ${invoice.order.client.primaryPhone}
                        ${invoice.order.client.secondaryPhone ? `<br><strong>HP Pengantin Pria:</strong> ${invoice.order.client.secondaryPhone}` : ''}
                    </div>
                </div>
                <div class="payment-details">
                    <div class="section-title">Detail Pembayaran</div>
                    <div class="detail-row">
                        <span class="detail-label">Tanggal Terbit:</span>
                        <span class="detail-value">${formatDate(invoice.issueDate)}</span>
                    </div>
                    ${invoice.dueDate ? `
                    <div class="detail-row">
                        <span class="detail-label">Jatuh Tempo:</span>
                        <span class="detail-value">${formatDate(invoice.dueDate)}</span>
                    </div>
                    ` : ''}
                    <div class="detail-row">
                        <span class="detail-label">ID Pesanan:</span>
                        <span class="detail-value">${invoice.order.orderNumber}</span>
                    </div>
                </div>
            </div>

            <!-- Items Table -->
            <table class="items-table">
                <thead>
                    <tr>
                        <th>Layanan</th>
                        <th class="text-center">QTY</th>
                        <th class="text-right">Harga</th>
                        <th class="text-right">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${items.map((item: any) => `
                        <tr>
                            <td>${item.name}</td>
                            <td class="text-center">${item.quantity}</td>
                            <td class="text-right">${formatCurrency(item.price)}</td>
                            <td class="text-right"><strong>${formatCurrency(item.total)}</strong></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>

            <!-- Totals Section -->
            <div class="totals-section">
                <div class="totals-table">
                    <div class="total-row subtotal">
                        <span>Subtotal</span>
                        <span>${formatCurrency(subtotal)}</span>
                    </div>
                    
                    ${payments.map((payment: any) => `
                        <div class="total-row">
                            <span>DP${payment.paymentNumber}</span>
                            <span>${formatCurrency(payment.amount)}</span>
                        </div>
                    `).join('')}
                    
                    <div class="total-row grand-total">
                        <span>Jumlah Total</span>
                        <span>${formatCurrency(subtotal)}</span>
                    </div>
                    
                    <div class="total-row paid">
                        <span>Total Dibayar</span>
                        <span>${formatCurrency(totalDP)}</span>
                    </div>
                    
                    <div class="total-row remaining">
                        <span>Sisa Tagihan</span>
                        <span>${formatCurrency(sisaPembayaran)}</span>
                    </div>
                </div>
            </div>

            <!-- Notes Section -->
            <div class="notes-section">
                <div class="notes-title">Catatan / Keterangan</div>
                <div class="notes-content">
                    ${invoice.payment ? `
                        <div class="notes-item">
                            Invoice untuk pembayaran DP${invoice.payment.paymentNumber} - ${invoice.order.orderNumber}<br>
                            <strong>Metode Pembayaran:</strong> ${invoice.payment.paymentMethod || 'Transfer Bank'}
                        </div>
                    ` : ''}
                    
                    ${invoice.payment?.notes ? `
                        <div class="notes-item">
                            Catatan pembayaran: ${invoice.payment.notes}
                        </div>
                    ` : ''}
                    
                    ${invoice.notes ? `
                        <div class="notes-item">
                            ${invoice.notes}
                        </div>
                    ` : ''}
                    
                    ${!invoice.notes && !invoice.payment?.notes ? `
                        <div class="notes-item">
                            Terima kasih telah memilih Roro MUA untuk hari istimewa Anda! Kami sangat menghargai kepercayaan Anda.
                        </div>
                    ` : ''}
                </div>
            </div>
            
            <!-- Footer with Bank Information -->
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #d4b896; text-align: center; font-size: 11px; color: #666;">
                <p style="margin-bottom: 10px; font-weight: bold;">Informasi Rekening Bank</p>
                <div style="display: flex; justify-content: center; gap: 30px;">
                    <div>
                        <strong>BCA:</strong> 774 559 3402<br>
                        <small>A/N FATIMATUZ ZAHRO</small>
                    </div>
                    <div>
                        <strong>BRI:</strong> 0601 01000 547 563<br>
                        <small>A/N FATIMA TUZZAHRO</small>
                    </div>
                </div>
            </div>
        </div>
    </body>
    </html>
    `;

    // Return HTML content that can be printed as PDF by the browser
    return new NextResponse(htmlContent, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `inline; filename="Invoice-${invoice.invoiceNumber}.html"`
      }
    });

  } catch (error) {
    console.error("Error generating PDF:", error);
    return NextResponse.json(
      { message: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}