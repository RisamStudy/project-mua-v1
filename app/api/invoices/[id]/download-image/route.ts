import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { launchBrowser } from "@/lib/puppeteer-config";
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

    // Create HTML content for image generation
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
                line-height: 1.5; 
                color: #333; 
                background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
                padding: 40px;
                min-height: 100vh;
            }
            .container { 
                max-width: 900px; 
                margin: 0 auto; 
                background: white;
                border-radius: 15px;
                box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                overflow: hidden;
                position: relative;
            }
            .container::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 5px;
                background: linear-gradient(90deg, #d4b896, #c4a886, #d4b896);
            }
            .header { 
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 40px;
                padding: 40px 40px 30px 40px;
                border-bottom: 3px solid #d4b896;
                background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
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
                font-size: 36px;
                font-weight: bold;
                color: #d4b896;
                margin-bottom: 5px;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
            }
            .invoice-number {
                font-size: 16px;
                color: #666;
                background: #d4b896;
                color: white;
                padding: 5px 15px;
                border-radius: 20px;
                font-weight: bold;
            }
            .company-info {
                text-align: right;
            }
            .company-name {
                font-size: 20px;
                font-weight: bold;
                margin-bottom: 8px;
                color: #d4b896;
            }
            .company-address {
                font-size: 13px;
                color: #666;
                line-height: 1.6;
            }
            .bill-to-section {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 40px;
                margin-bottom: 40px;
                padding: 0 40px 30px 40px;
                border-bottom: 2px solid #d4b896;
            }
            .section-title {
                font-size: 13px;
                font-weight: bold;
                color: #d4b896;
                text-transform: uppercase;
                letter-spacing: 1px;
                margin-bottom: 15px;
                border-bottom: 2px solid #d4b896;
                padding-bottom: 5px;
            }
            .client-name {
                font-size: 18px;
                font-weight: bold;
                margin-bottom: 8px;
                color: #333;
            }
            .client-details {
                font-size: 13px;
                color: #666;
                line-height: 1.6;
            }
            .payment-details {
                text-align: right;
            }
            .detail-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 8px;
                font-size: 13px;
            }
            .detail-label {
                color: #666;
            }
            .detail-value {
                font-weight: bold;
                color: #333;
            }
            .items-section {
                padding: 0 40px;
                margin-bottom: 30px;
            }
            .items-table {
                width: 100%;
                border-collapse: collapse;
                border-radius: 10px;
                overflow: hidden;
                box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            }
            .items-table th {
                background: linear-gradient(135deg, #d4b896, #c4a886);
                color: white;
                padding: 18px;
                text-align: left;
                font-size: 13px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                font-weight: bold;
            }
            .items-table td {
                padding: 18px;
                border-bottom: 1px solid #eee;
                font-size: 15px;
                background: white;
            }
            .items-table tr:nth-child(even) td {
                background: #f8f9fa;
            }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .totals-section {
                display: flex;
                justify-content: flex-end;
                margin-bottom: 40px;
                padding: 0 40px;
            }
            .totals-table {
                width: 450px;
            }
            .total-row {
                display: flex;
                justify-content: space-between;
                padding: 12px 0;
                font-size: 15px;
            }
            .total-row.subtotal {
                border-bottom: 1px solid #eee;
                color: #666;
            }
            .total-row.grand-total {
                font-weight: bold;
                font-size: 18px;
                border-top: 3px solid #d4b896;
                padding-top: 15px;
                color: #333;
            }
            .total-row.paid {
                background: linear-gradient(135d, #d4edda, #c3e6cb);
                padding: 15px;
                border-radius: 8px;
                color: #155724;
                font-weight: bold;
                margin: 10px 0;
                border: 2px solid #b8dacc;
            }
            .total-row.remaining {
                background: linear-gradient(135deg, #fff3cd, #ffeaa7);
                padding: 15px;
                border-radius: 8px;
                color: #856404;
                font-weight: bold;
                border: 2px solid #d4b896;
                margin: 10px 0;
            }
            .notes-section {
                margin-top: 40px;
                padding: 30px 40px 40px 40px;
                border-top: 2px solid #d4b896;
                background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
            }
            .notes-title {
                font-size: 13px;
                font-weight: bold;
                color: #d4b896;
                text-transform: uppercase;
                letter-spacing: 1px;
                margin-bottom: 15px;
                border-bottom: 2px solid #d4b896;
                padding-bottom: 5px;
            }
            .notes-content {
                font-size: 13px;
                color: #666;
                line-height: 1.8;
            }
            .notes-item {
                margin-bottom: 12px;
                padding: 10px;
                background: white;
                border-radius: 5px;
                border-left: 4px solid #d4b896;
            }
            .watermark {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%) rotate(-45deg);
                font-size: 120px;
                color: rgba(212, 184, 150, 0.05);
                font-weight: bold;
                z-index: 0;
                pointer-events: none;
            }
            .content {
                position: relative;
                z-index: 1;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="watermark">INVOICE</div>
            <div class="content">
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
                <div class="items-section">
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
                                    <td><strong>${item.name}</strong></td>
                                    <td class="text-center">${item.quantity}</td>
                                    <td class="text-right">${formatCurrency(item.price)}</td>
                                    <td class="text-right"><strong>${formatCurrency(item.total)}</strong></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>

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
                            <span>JUMLAH TOTAL</span>
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
                                <strong>Invoice untuk pembayaran DP${invoice.payment.paymentNumber} - ${invoice.order.orderNumber}</strong><br>
                                <strong>Metode Pembayaran:</strong> ${invoice.payment.paymentMethod || 'Transfer Bank'}
                            </div>
                        ` : ''}
                        
                        ${invoice.payment?.notes ? `
                            <div class="notes-item">
                                <strong>Catatan pembayaran:</strong> ${invoice.payment.notes}
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
                <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #d4b896; text-align: center; font-size: 12px; color: #666;">
                    <p style="margin-bottom: 15px;"><strong>Informasi Rekening Bank</strong></p>
                    <div style="display: flex; justify-content: center; gap: 30px; flex-wrap: wrap;">
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
        </div>
    </body>
    </html>
    `;

    // Generate image using Puppeteer
    const browser = await launchBrowser();
    
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 1600, deviceScaleFactor: 2 });
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
    const screenshot = await page.screenshot({
      type: 'png',
      fullPage: true
    });
    
    await browser.close();

    // Convert Uint8Array to Buffer
    const buffer = Buffer.from(screenshot);

    return new Response(buffer, {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="Invoice-${invoice.invoiceNumber}.png"`
      }
    });

  } catch (error) {
    console.error("Error generating image:", error);
    return NextResponse.json(
      { message: "Failed to generate image" },
      { status: 500 }
    );
  }
}