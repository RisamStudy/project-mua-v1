import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import puppeteer from "puppeteer";
import { format } from "date-fns";

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

    const formatCurrency = (amount: string | number) => {
      return `Rp ${parseFloat(amount.toString()).toLocaleString("id-ID")}`;
    };

    // Generate HTML content for image
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
                padding: 40px;
                border-radius: 15px;
                box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                position: relative;
                overflow: hidden;
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
                text-align: center;
                margin-bottom: 40px;
                padding-bottom: 30px;
                border-bottom: 3px solid #d4b896;
                position: relative;
            }
            
            .header h1 {
                color: #d4b896;
                font-size: 36px;
                margin-bottom: 15px;
                font-weight: bold;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
            }
            
            .header p {
                color: #666;
                font-size: 16px;
                margin-bottom: 5px;
            }
            
            .header .order-number {
                background: #d4b896;
                color: white;
                padding: 8px 20px;
                border-radius: 25px;
                font-weight: bold;
                display: inline-block;
                margin-top: 10px;
            }
            
            .section {
                margin-bottom: 35px;
                padding: 25px;
                border: 2px solid #f0f0f0;
                border-radius: 12px;
                background: linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%);
                box-shadow: 0 5px 15px rgba(0,0,0,0.05);
            }
            
            .section h2 {
                color: #d4b896;
                font-size: 22px;
                margin-bottom: 20px;
                border-bottom: 3px solid #d4b896;
                padding-bottom: 8px;
                font-weight: bold;
                position: relative;
            }
            
            .section h2::after {
                content: '';
                position: absolute;
                bottom: -3px;
                left: 0;
                width: 50px;
                height: 3px;
                background: #c4a886;
            }
            
            .info-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
            }
            
            .info-item {
                margin-bottom: 15px;
                padding: 15px;
                background: #fafbfc;
                border-radius: 8px;
                border-left: 4px solid #d4b896;
            }
            
            .info-label {
                font-weight: bold;
                color: #555;
                font-size: 13px;
                text-transform: uppercase;
                margin-bottom: 5px;
                letter-spacing: 0.5px;
            }
            
            .info-value {
                color: #333;
                font-size: 15px;
                line-height: 1.4;
            }
            
            .items-table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 15px;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 3px 10px rgba(0,0,0,0.1);
            }
            
            .items-table th,
            .items-table td {
                padding: 15px;
                text-align: left;
                border-bottom: 1px solid #eee;
            }
            
            .items-table th {
                background: linear-gradient(135deg, #d4b896 0%, #c4a886 100%);
                color: white;
                font-weight: bold;
                font-size: 13px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            .items-table td {
                font-size: 15px;
                background: white;
            }
            
            .items-table tr:nth-child(even) td {
                background: #f8f9fa;
            }
            
            .items-table .text-right {
                text-align: right;
            }
            
            .total-row td {
                background: #e8f4f8 !important;
                font-weight: bold;
                font-size: 16px;
                border-top: 2px solid #d4b896;
            }
            
            .payment-status {
                display: inline-block;
                padding: 8px 20px;
                border-radius: 25px;
                font-size: 14px;
                font-weight: bold;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            .status-lunas {
                background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
                color: #155724;
                border: 2px solid #b8dacc;
            }
            
            .status-belum-lunas {
                background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
                color: #856404;
                border: 2px solid #f4d03f;
            }
            
            .payment-history {
                margin-top: 20px;
            }
            
            .payment-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px 15px;
                margin-bottom: 8px;
                background: white;
                border-radius: 8px;
                border-left: 4px solid #d4b896;
                box-shadow: 0 2px 5px rgba(0,0,0,0.05);
            }
            
            .payment-item:last-child {
                margin-bottom: 0;
            }
            
            .footer {
                margin-top: 40px;
                text-align: center;
                color: #666;
                font-size: 13px;
                border-top: 2px solid #f0f0f0;
                padding-top: 25px;
                background: #f8f9fa;
                margin-left: -40px;
                margin-right: -40px;
                margin-bottom: -40px;
                padding-left: 40px;
                padding-right: 40px;
                padding-bottom: 25px;
            }
            
            .custom-options {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
            }
            
            .highlight-box {
                background: linear-gradient(135deg, #fff9e6 0%, #fff3cd 100%);
                border: 2px solid #d4b896;
                border-radius: 10px;
                padding: 20px;
                margin: 15px 0;
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
            <div class="watermark">ORDER</div>
            <div class="content">
                <!-- Header -->
                <div class="header">
                    <h1>Detail Pesanan</h1>
                    <div class="order-number">Order #${order.orderNumber}</div>
                    <p>Tanggal: ${format(new Date(order.createdAt), "dd MMMM yyyy")}</p>
                </div>

                <!-- Client Details -->
                <div class="section">
                    <h2>Detail Klien & Acara</h2>
                    <div class="info-grid">
                        <div class="info-item">
                            <div class="info-label">Kontak Person</div>
                            <div class="info-value">
                                <strong>${order.client.brideName}</strong><br>
                                ${order.client.primaryPhone}<br>
                                ${order.client.secondaryPhone || ''}
                            </div>
                        </div>
                        
                        <div class="info-item">
                            <div class="info-label">Pengantin Wanita</div>
                            <div class="info-value">
                                <strong>${order.client.brideName}</strong><br>
                                <small style="color: #666;">${order.client.brideAddress}</small>
                            </div>
                        </div>
                        
                        <div class="info-item">
                            <div class="info-label">Pengantin Pria</div>
                            <div class="info-value">
                                <strong>${order.client.groomName}</strong><br>
                                <small style="color: #666;">${order.client.groomAddress}</small>
                            </div>
                        </div>
                        
                        <div class="info-item">
                            <div class="info-label">Orang Tua Pengantin</div>
                            <div class="info-value">
                                <strong>Wanita:</strong> ${order.client.brideParents}<br>
                                <strong>Pria:</strong> ${order.client.groomParents}
                            </div>
                        </div>
                    </div>
                    
                    <div class="highlight-box">
                        <div class="info-grid">
                            <div class="info-item" style="background: transparent; border: none; padding: 10px;">
                                <div class="info-label">Tanggal Akad</div>
                                <div class="info-value">
                                    ${order.client.ceremonyDate ? format(new Date(order.client.ceremonyDate), "dd MMMM yyyy") : "-"}
                                    ${order.client.ceremonyTime ? ` - ${order.client.ceremonyTime}` : ''}
                                    ${order.client.ceremonyEndTime ? ` s/d ${order.client.ceremonyEndTime}` : ''}
                                    ${order.client.ceremonyDate ? ' WIB' : ''}
                                </div>
                            </div>
                            
                            <div class="info-item" style="background: transparent; border: none; padding: 10px;">
                                <div class="info-label">Tanggal Resepsi</div>
                                <div class="info-value">
                                    ${order.client.receptionDate ? format(new Date(order.client.receptionDate), "dd MMMM yyyy") : "-"}
                                    ${order.client.receptionTime ? ` - ${order.client.receptionTime}` : ''}
                                    ${order.client.receptionEndTime ? ` s/d ${order.client.receptionEndTime}` : ''}
                                    ${order.client.receptionDate ? ' WIB' : ''}
                                </div>
                            </div>
                        </div>
                        
                        <div class="info-item" style="background: transparent; border: none; padding: 10px; margin-top: 10px;">
                            <div class="info-label">Lokasi Acara</div>
                            <div class="info-value"><strong>${order.eventLocation}</strong></div>
                        </div>
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
                                    <td><strong>${item.name}</strong></td>
                                    <td>${item.quantity}</td>
                                    <td class="text-right">${formatCurrency(item.price)}</td>
                                    <td class="text-right"><strong>${formatCurrency(item.total)}</strong></td>
                                </tr>
                            `).join('')}
                            <tr class="total-row">
                                <td colspan="3"><strong>TOTAL KESELURUHAN</strong></td>
                                <td class="text-right"><strong>${formatCurrency(order.totalAmount.toString())}</strong></td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Custom Options -->
                <div class="section">
                    <h2>Pilihan Kustom</h2>
                    <div class="custom-options">
                        ${order.chairModel ? `
                            <div class="info-item">
                                <div class="info-label">Kursi Pelaminan</div>
                                <div class="info-value">${order.chairModel}</div>
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
                                <div class="info-value"><strong>${dressPhotos.length} Foto</strong> tersedia</div>
                            </div>
                        ` : ''}
                    </div>
                </div>

                <!-- Payment Status -->
                <div class="section">
                    <h2>Status Pembayaran</h2>
                    <div class="info-item">
                        <div class="info-label">Status Pembayaran</div>
                        <div class="info-value">
                            <span class="payment-status ${order.paymentStatus === 'Lunas' ? 'status-lunas' : 'status-belum-lunas'}">
                                ${order.paymentStatus}
                            </span>
                        </div>
                    </div>
                    
                    ${order.paymentStatus === 'Belum Lunas' ? `
                        <div class="info-item">
                            <div class="info-label">Sisa Pembayaran</div>
                            <div class="info-value"><strong style="color: #e74c3c;">${formatCurrency(order.remainingAmount.toString())}</strong></div>
                        </div>
                    ` : ''}
                    
                    ${order.payments.length > 0 ? `
                        <div class="payment-history">
                            <div class="info-label" style="margin-bottom: 15px;">Riwayat Pembayaran</div>
                            ${order.payments.map(payment => `
                                <div class="payment-item">
                                    <div>
                                        <strong>DP${payment.paymentNumber}</strong><br>
                                        <small style="color: #666;">${format(new Date(payment.paymentDate), "dd MMMM yyyy")}</small>
                                    </div>
                                    <div><strong style="color: #27ae60;">${formatCurrency(payment.amount.toString())}</strong></div>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>

                ${order.specialRequest ? `
                    <!-- Notes -->
                    <div class="section">
                        <h2>Catatan Khusus</h2>
                        <div class="highlight-box">
                            <div class="info-value" style="white-space: pre-wrap; font-style: italic;">${order.specialRequest}</div>
                        </div>
                    </div>
                ` : ''}

                <!-- Footer -->
                <div class="footer">
                    <p><strong>Dokumen ini dibuat secara otomatis</strong></p>
                    <p>Tanggal: ${format(new Date(), "dd MMMM yyyy 'pukul' HH:mm")} WIB</p>
                </div>
            </div>
        </div>
    </body>
    </html>
    `;

    // Generate image using Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 1600, deviceScaleFactor: 2 });
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
    const imageBuffer = await page.screenshot({
      type: 'png',
      fullPage: true,
      quality: 100
    });
    
    await browser.close();

    // Return image as response
    return new NextResponse(new Uint8Array(imageBuffer), {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="Order-${order.orderNumber}.png"`
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