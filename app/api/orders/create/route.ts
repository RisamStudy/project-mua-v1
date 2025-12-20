import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuthAPI } from '@/lib/auth';
import { validateId, sanitizeString, validatePrice, validateArray } from '@/lib/validators/input';
import type { Prisma } from '@prisma/client';

export async function POST(request: Request) {
  try {
    // 1. Authentication
    const user = await requireAuthAPI();
    
    // 2. Parse body
    const body = await request.json();
    const {
      clientId,
      eventLocation,
      items,
      stageModelPhoto,
      chairModel,
      tentColorPhoto,
      softlensColor,
      dressPhotos,
      specialRequest,
      totalAmount,
      paidAmount,
      paymentStatus,
      dpNumber,
    } = body;

    // 3. Validasi input
    if (!clientId || !eventLocation || !items || items.length === 0) {
      return NextResponse.json(
        { message: 'Client, event location, and items are required' },
        { status: 400 }
      );
    }

    // 4. Validate inputs
    const validClientId = validateId(clientId);
    const sanitizedEventLocation = sanitizeString(eventLocation, 500);
    const validItems = validateArray(items, 50);
    const validTotalAmount = validatePrice(totalAmount);
    const validPaidAmount = paidAmount ? validatePrice(paidAmount) : 0;

    // 5. Validate client exists
    const clientExists = await prisma.client.findUnique({
      where: { id: validClientId },
    });

    if (!clientExists) {
      return NextResponse.json(
        { message: 'Client not found' },
        { status: 404 }
      );
    }

    const remainingAmount = validTotalAmount - validPaidAmount;

    // 6. Create order dengan transaction
    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const lastOrder = await tx.order.findFirst({
        orderBy: { createdAt: 'desc' },
        select: { orderNumber: true },
      });

      let orderNumber: string;
      if (lastOrder && lastOrder.orderNumber) {
        // Extract number from last order (e.g., "ORD-005" -> 5)
        const lastNumber = parseInt(lastOrder.orderNumber.split('-')[1]);
        orderNumber = `ORD-${String(lastNumber + 1).padStart(3, '0')}`;
      } else {
        // First order
        orderNumber = 'ORD-001';
      }

      // Create order
      const order = await tx.order.create({
        data: {
          orderNumber,
          clientId: validClientId,
          eventLocation: sanitizedEventLocation,
          items: validItems,
          stageModelPhoto: stageModelPhoto || null,
          chairModel: chairModel ? sanitizeString(chairModel, 255) : null,
          tentColorPhoto: tentColorPhoto || null,
          softlensColor: softlensColor ? sanitizeString(softlensColor, 100) : null,
          dressPhotos: dressPhotos && dressPhotos.length > 0 ? dressPhotos : null,
          specialRequest: specialRequest ? sanitizeString(specialRequest, 1000) : null,
          totalAmount: validTotalAmount,
          paidAmount: validPaidAmount,
          remainingAmount,
          paymentStatus: paymentStatus || 'Belum Lunas',
        },
      });

      

      // Jika ada pembayaran, buat payment record
      if (validPaidAmount > 0) {
        await tx.payment.create({
          data: {
            orderId: order.id,
            paymentNumber: dpNumber || 1,
            amount: validPaidAmount,
            paymentDate: new Date(),
            notes: `Pembayaran DP${dpNumber || 1} untuk pesanan ${orderNumber}`,
          },
        });
      }

      return order;
    });

    return NextResponse.json({
      success: true,
      message: 'Order created successfully',
      data: result,
    });
    
  } catch (error: any) {
    console.error('Create order error:', error);
    
    // Handle auth errors
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Handle validation errors
    if (error.message?.includes('Invalid') || error.message?.includes('must be')) {
      return NextResponse.json(
        { message: error.message },
        { status: 400 }
      );
    }
    
    // Handle client not found
    if (error.message?.includes('Client not found')) {
      return NextResponse.json(
        { message: error.message },
        { status: 404 }
      );
    }
    
    // Handle duplicate order number (shouldn't happen now)
    if (error.code === 'P2002') {
      return NextResponse.json(
        { message: 'Order number conflict. Please try again.' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { message: error.message || 'Failed to create order' },
      { status: 500 }
    );
  }
}