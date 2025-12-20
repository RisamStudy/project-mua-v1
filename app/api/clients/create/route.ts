import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      brideName,
      groomName,
      primaryPhone,
      secondaryPhone,
      brideAddress,
      groomAddress,
      brideParents,
      groomParents,
      ceremonyDate,
      ceremonyTime,
      receptionDate,
      receptionTime,
      eventLocation,
    } = body;

    // Validasi input
    if (!brideName || !groomName || !primaryPhone || !ceremonyDate || !receptionDate) {
      return NextResponse.json(
        { message: 'Required fields are missing' },
        { status: 400 }
      );
    }

    // Create client and appointments in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create client
      const client = await tx.client.create({
        data: {
          brideName,
          groomName,
          primaryPhone,
          secondaryPhone,
          brideAddress,
          groomAddress,
          brideParents,
          groomParents,
          ceremonyDate: new Date(ceremonyDate),
          ceremonyTime,
          receptionDate: new Date(receptionDate),
          receptionTime,
          eventLocation,
        },
      });

      // Helper function to create datetime
      const createDateTime = (dateStr: string, timeStr: string | null) => {
        const date = new Date(dateStr);
        if (timeStr) {
          const [hours, minutes] = timeStr.split(':');
          date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        } else {
          // Default time if not provided
          date.setHours(9, 0, 0, 0);
        }
        return date;
      };

      // Create Akad Appointment
      const ceremonyStart = createDateTime(ceremonyDate, ceremonyTime);
      const ceremonyEnd = new Date(ceremonyStart);
      ceremonyEnd.setHours(ceremonyEnd.getHours() + 2); // Default 2 hours duration

      await tx.appointment.create({
        data: {
          title: `Akad - ${brideName} & ${groomName}`,
          description: `Akad Nikah di ${eventLocation}`,
          startTime: ceremonyStart,
          endTime: ceremonyEnd,
          clientId: client.id,
          color: '#9c27b0', // Purple for ceremony
        },
      });

      // Create Resepsi Appointment
      const receptionStart = createDateTime(receptionDate, receptionTime);
      const receptionEnd = new Date(receptionStart);
      receptionEnd.setHours(receptionEnd.getHours() + 3); // Default 3 hours duration

      await tx.appointment.create({
        data: {
          title: `Resepsi - ${brideName} & ${groomName}`,
          description: `Resepsi Pernikahan di ${eventLocation}`,
          startTime: receptionStart,
          endTime: receptionEnd,
          clientId: client.id,
          color: '#e91e63', // Pink for reception
        },
      });

      return client;
    });

    return NextResponse.json({
      success: true,
      message: 'Client and appointments created successfully',
      data: result,
    });
  } catch (error: any) {
    console.error('Create client error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to create client' },
      { status: 500 }
    );
  }
}