import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Delete appointment
    await prisma.appointment.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Appointment deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete appointment error:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { message: 'Appointment not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { message: error.message || 'Failed to delete appointment' },
      { status: 500 }
    );
  }
}