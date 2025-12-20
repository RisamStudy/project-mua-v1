import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Cek apakah client ada
    const client = await prisma.client.findUnique({
      where: { id },
    });

    if (!client) {
      return NextResponse.json(
        { message: 'Client not found' },
        { status: 404 }
      );
    }

    // Delete client dari database
    await prisma.client.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Client deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete client error:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { message: 'Client not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { message: error.message || 'Failed to delete client' },
      { status: 500 }
    );
  }
}