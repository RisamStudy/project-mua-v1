import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { amount, paymentMethod, notes } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { message: 'Payment amount is required and must be greater than 0' },
        { status: 400 }
      );
    }

    // Get order details
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        payments: {
          orderBy: { paymentNumber: 'desc' },
          take: 1,
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { message: 'Order not found' },
        { status: 404 }
      );
    }

    // Check if payment exceeds remaining amount
    const currentPaid = Number(order.paidAmount);
    const total = Number(order.totalAmount);
    const remaining = total - currentPaid;

    if (amount > remaining) {
      return NextResponse.json(
        { message: `Payment amount (${amount}) exceeds remaining amount (${remaining})` },
        { status: 400 }
      );
    }

    // Determine next payment number
    const lastPaymentNumber = order.payments[0]?.paymentNumber || 0;
    const nextPaymentNumber = lastPaymentNumber + 1;

    // Calculate new totals
    const newPaidAmount = currentPaid + amount;
    const newRemainingAmount = total - newPaidAmount;
    const newPaymentStatus = newRemainingAmount <= 0 ? 'Lunas' : 'Belum Lunas';

    // Create payment and update order in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create payment record
      const payment = await tx.payment.create({
        data: {
          orderId: id,
          paymentNumber: nextPaymentNumber,
          amount,
          paymentMethod: paymentMethod || 'Transfer Bank',
          notes: notes || `Pembayaran DP${nextPaymentNumber} untuk pesanan ${order.orderNumber}`,
        },
      });

      // Update order
      const updatedOrder = await tx.order.update({
        where: { id },
        data: {
          paidAmount: newPaidAmount,
          remainingAmount: newRemainingAmount,
          paymentStatus: newPaymentStatus,
        },
      });

      return { payment, order: updatedOrder };
    });

    return NextResponse.json({
      success: true,
      message: `Payment DP${nextPaymentNumber} added successfully`,
      data: result,
    });
  } catch (error: any) {
    console.error('Add payment error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to add payment' },
      { status: 500 }
    );
  }
}