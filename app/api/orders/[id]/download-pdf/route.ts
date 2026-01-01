import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
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
    const { id } = params;

    // Fetch order details
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        client: true,
        payments: {
          orderBy: {
            paymentNumber: "asc",
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { message: "Order not found" },
        { status: 404 }
      );
    }

    // Helper function to safely convert JsonValue to string array
    const jsonToStringArray = (json: unknown): string[] | null => {
      if (!json) return null;
      if (Array.isArray(json)) {
        return json.filter((item): item is string => typeof item === "string");
      }
      return null;
    };

    // Parse items
    const parseItems = (itemsData: unknown) => {
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

    const items = parseItems(order.items);
    const dressPhotos = jsonToStringArray(order.dressPhotos) || [];

    // Get logo as base64
    const logoBase64 = await getLogoBase64();

    const formatCurrency = (amount: string | number) => {
      return `Rp ${parseFloat(amount.toString()).toLocaleString("id-ID")}`;
    };

    // Generate HTML content for PDF
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Order Details - ${order.orderNumber}</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Arial', sans-serif;
                line-height: 1.6;
                color: #333;
                background: #f9f9f9;
                padding: 20px;
            }
            
            .container {
                max-width: 800px;
                margin: 0 auto;
                background: white;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 0 20px rgba(0,0,0,0.1);
            }
            
            .header {
                text-align: center;
                margin-bottom: 30px;
                border-bottom: 3px solid #d4b896;
                padding-bottom: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 20px;
            }
            
            .logo {
                width: 60px;
                height: 60px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 3px 10px rgba(212, 184, 150, 0.3);
                overflow: hidden;
                background: white;
                border: 2px solid #d4b896;
                flex-shrink: 0;
            }
            .logo img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
            
            .header-content {
                text-align: center;
            }
            
            .header h1 {
                color: #d4b896;
                font-size: 28px;
                margin-bottom: 10px;
            }
            
            .header p {
                color: #666;
                font-size: 14px;
            }
            
            .section {
                margin-bottom: 25px;
                padding: 20px;
                border: 1px solid #e0e0e0;
                border-radius: 8px;
                background: #fafafa;
            }
            
            .section h2 {
                color: #d4b896;
                font-size: 18px;
                margin-bottom: 15px;
                border-bottom: 2px solid #d4b896;
                padding-bottom: 5px;
            }
            
            .info-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 15px;
            }
            
            .info-item {
                margin-bottom: 10px;
            }
            
            .info-label {
                font-weight: bold;
                color: #555;
                font-size: 12px;
                text-transform: uppercase;
                margin-bottom: 3px;
            }
            
            .info-value {
                color: #333;
                font-size: 14px;
            }
            
            .items-table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 10px;
            }
            
            .items-table th,
            .items-table td {
                padding: 12px;
                text-align: left;
                border-bottom: 1px solid #ddd;
            }
            
            .items-table th {
                background-color: #d4b896;
                color: white;
                font-weight: bold;
                font-size: 12px;
                text-transform: uppercase;
            }
            
            .items-table td {
                font-size: 14px;
            }
            
            .items-table .text-right {
                text-align: right;
            }
            
            .total-row {
                background-color: #f0f0f0;
                font-weight: bold;
            }
            
            .payment-status {
                display: inline-block;
                padding: 5px 15px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: bold;
                text-transform: uppercase;
            }
            
            .status-lunas {
                background-color: #d4edda;
                color: #155724;
            }
            
            .status-belum-lunas {
                background-color: #fff3cd;
                color: #856404;
            }
            
            .payment-history {
                margin-top: 15px;
            }
            
            .payment-item {
                display: flex;
                justify-content: space-between;
                padding: 8px 0;
                border-bottom: 1px solid #eee;
            }
            
            .footer {
                margin-top: 30px;
                text-align: center;
                color: #666;
                font-size: 12px;
                border-top: 1px solid #eee;
                padding-top: 20px;
            }
            
            .custom-options {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 15px;
            }
            
            @media print {
                body {
                    background: white;
                    padding: 0;
                }
                
                .container {
                    box-shadow: none;
                    border-radius: 0;
                }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <!-- Header -->
            <div class="header">
                <div class="logo">
                    <img src="${logoBase64.startsWith('data:') ? logoBase64 : `data:image/png;base64,${logoBase64}`}" alt="RORO MUA Logo" />
                </div>
                <div class="header-content">
                    <h1>Detail Pesanan</h1>
                    <p>Order #${order.orderNumber}</p>
                    <p>Tanggal: ${format(new Date(order.createdAt), "dd MMMM yyyy")}</p>
                </div>
            </div>

            <!-- Client Details -->
            <div class="section">
                <h2>Detail Klien & Acara</h2>
                <div class="info-grid">
                    <div class="info-item">
                        <div class="info-label">Kontak Person</div>
                        <div class="info-value">${order.client.brideName}</div>
                        <div class="info-value"><strong>HP Pengantin Wanita:</strong> ${order.client.primaryPhone}</div>
                        ${order.client.secondaryPhone ? `<div class="info-value"><strong>HP Pengantin Pria:</strong> ${order.client.secondaryPhone}</div>` : ''}
                    </div>
                    
                    <div class="info-item">
                        <div class="info-label">Pengantin Wanita</div>
                        <div class="info-value">${order.client.brideName}</div>
                        <div class="info-value" style="font-size: 12px; color: #666;">${order.client.brideAddress}</div>
                    </div>
                    
                    <div class="info-item">
                        <div class="info-label">Pengantin Pria</div>
                        <div class="info-value">${order.client.groomName}</div>
                        <div class="info-value" style="font-size: 12px; color: #666;">${order.client.groomAddress}</div>
                    </div>
                    
                    <div class="info-item">
                        <div class="info-label">Orang Tua Pengantin Wanita</div>
                        <div class="info-value">${order.client.brideParents || 'Belum diisi'}</div>
                    </div>
                    
                    <div class="info-item">
                        <div class="info-label">Orang Tua Pengantin Pria</div>
                        <div class="info-value">${order.client.groomParents || 'Belum diisi'}</div>
                    </div>
                    
                    <div class="info-item">
                        <div class="info-label">Tanggal Akad</div>
                        <div class="info-value">
                            ${order.client.ceremonyDate ? format(new Date(order.client.ceremonyDate), "dd MMMM yyyy") : "-"}
                            ${order.client.ceremonyTime ? ` - ${order.client.ceremonyTime}` : ''}
                            ${order.client.ceremonyEndTime ? ` s/d ${order.client.ceremonyEndTime}` : ''}
                            ${order.client.ceremonyDate ? ' WIB' : ''}
                        </div>
                    </div>
                    
                    <div class="info-item">
                        <div class="info-label">Tanggal Resepsi</div>
                        <div class="info-value">
                            ${order.client.receptionDate ? format(new Date(order.client.receptionDate), "dd MMMM yyyy") : "-"}
                            ${order.client.receptionTime ? ` - ${order.client.receptionTime}` : ''}
                            ${order.client.receptionEndTime ? ` s/d ${order.client.receptionEndTime}` : ''}
                            ${order.client.receptionDate ? ' WIB' : ''}
                        </div>
                    </div>
                </div>
                
                <div class="info-item" style="margin-top: 15px;">
                    <div class="info-label">Lokasi Acara</div>
                    <div class="info-value">${order.eventLocation}</div>
                </div>
            </div>

            <!-- Order Items -->
            <div class="section">
                <h2>Item Pesanan</h2>
                <table class="items-table">
                    <thead>
                        <tr>
                            <th>Item / Paket</th>
                            <th>Jumlah</th>
                            <th class="text-right">Harga</th>
                            <th class="text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${items.map((item: any) => `
                            <tr>
                                <td>${item.name}</td>
                                <td>${item.quantity}</td>
                                <td class="text-right">${formatCurrency(item.price)}</td>
                                <td class="text-right">${formatCurrency(item.total)}</td>
                            </tr>
                        `).join('')}
                        <tr class="total-row">
                            <td colspan="3"><strong>Total</strong></td>
                            <td class="text-right"><strong>${formatCurrency(order.totalAmount.toString())}</strong></td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Custom Options -->
            <div class="section">
                <h2>Pilihan Kustom</h2>
                <div class="custom-options">
                    ${order.stageModelPhoto ? `
                        <div class="info-item">
                            <div class="info-label">Model Pelaminan</div>
                            <div class="info-value">Foto Model Pelaminan tersedia</div>
                        </div>
                    ` : ''}
                    
                    ${order.chairModel ? `
                        <div class="info-item">
                            <div class="info-label">Kursi Pelaminan</div>
                            <div class="info-value">${order.chairModel}</div>
                        </div>
                    ` : ''}
                    
                    ${order.tentColorPhoto ? `
                        <div class="info-item">
                            <div class="info-label">Warna Kain Tenda</div>
                            <div class="info-value">Foto Warna Kain Tenda tersedia</div>
                        </div>
                    ` : ''}
                    
                    ${order.softlensColor ? `
                        <div class="info-item">
                            <div class="info-label">Warna Tenda</div>
                            <div class="info-value">${order.softlensColor}</div>
                        </div>
                    ` : ''}
                    
                    ${dressPhotos.length > 0 ? `
                        <div class="info-item">
                            <div class="info-label">Foto Gaun</div>
                            <div class="info-value">${dressPhotos.length} Foto tersedia</div>
                        </div>
                    ` : ''}
                    
                    ${!order.chairModel && !order.softlensColor && dressPhotos.length === 0 && !order.stageModelPhoto && !order.tentColorPhoto ? `
                        <div class="info-item">
                            <div class="info-value" style="text-align: center; color: #666; font-style: italic;">
                                Tidak ada pilihan kustom yang dipilih
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>

            <!-- Payment Status -->
            <div class="section">
                <h2>Status Pembayaran</h2>
                <div class="info-item">
                    <div class="info-label">Status</div>
                    <div class="info-value">
                        <span class="payment-status ${order.paymentStatus === 'Lunas' ? 'status-lunas' : 'status-belum-lunas'}">
                            ${order.paymentStatus}
                        </span>
                    </div>
                </div>
                
                ${order.paymentStatus === 'Belum Lunas' ? `
                    <div class="info-item">
                        <div class="info-label">Sisa Pembayaran</div>
                        <div class="info-value">${formatCurrency(order.remainingAmount.toString())}</div>
                    </div>
                ` : ''}
                
                ${order.payments.length > 0 ? `
                    <div class="payment-history">
                        <div class="info-label">Riwayat Pembayaran</div>
                        ${order.payments.map(payment => `
                            <div class="payment-item">
                                <div>
                                    <strong>DP${payment.paymentNumber}</strong><br>
                                    <small>${format(new Date(payment.paymentDate), "dd MMMM yyyy")}</small>
                                </div>
                                <div><strong>${formatCurrency(payment.amount.toString())}</strong></div>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
            </div>

            ${order.specialRequest ? `
                <!-- Notes -->
                <div class="section">
                    <h2>Catatan Khusus</h2>
                    <div class="info-value" style="white-space: pre-wrap; font-style: italic; background: #fff9e6; padding: 15px; border-radius: 8px; border: 2px solid #d4b896;">${order.specialRequest}</div>
                </div>
            ` : ''}

            <!-- Footer -->
            <div class="footer">
                <p>Dokumen ini dibuat secara otomatis pada ${format(new Date(), "dd MMMM yyyy 'pukul' HH:mm")} WIB</p>
            </div>
        </div>
    </body>
    </html>
    `;

    // Return HTML content that can be printed as PDF by the browser
    return new NextResponse(htmlContent, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `inline; filename="Order-${order.orderNumber}.html"`
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