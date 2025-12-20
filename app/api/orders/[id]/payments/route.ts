import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get all payments for this order
    const payments = await prisma.payment.findMany({
      where: { orderId: id },
      orderBy: {
        paymentNumber: 'asc',
      },
      include: {
        invoice: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: payments,
    });
  } catch (error: any) {
    console.error('Get payments error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to get payments' },
      { status: 500 }
    );
  }
}