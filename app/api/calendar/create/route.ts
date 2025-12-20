import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, startTime, endTime, clientId, color } = body;

    // Validasi input
    if (!title || !startTime || !endTime) {
      return NextResponse.json(
        { message: 'Title, start time, and end time are required' },
        { status: 400 }
      );
    }

    // Create appointment
    const appointment = await prisma.appointment.create({
      data: {
        title,
        description,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        clientId: clientId || null,
        color: color || '#d4b896',
      },
      include: {
        client: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Appointment created successfully',
      data: appointment,
    });
  } catch (error: any) {
    console.error('Create appointment error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to create appointment' },
      { status: 500 }
    );
  }
}