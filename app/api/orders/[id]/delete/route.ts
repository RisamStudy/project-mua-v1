import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
){
  try {
    const { id } = await params;

    // Check if order exists
    const order = await prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      return NextResponse.json(
        { message: 'Order not found' },
        { status: 404 }
      );
    }

    // Delete order (akan otomatis delete payments dan invoices karena cascade)
    await prisma.order.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Order deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete order error:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { message: 'Order not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { message: error.message || 'Failed to delete order' },
      { status: 500 }
    );
  }
}