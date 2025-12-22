import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthAPI } from "@/lib/auth";
import { validateId, sanitizeString } from "@/lib/validators/input";
// import type { Prisma } from '@prisma/client';
import { Prisma } from "@prisma/client";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Authentication
    await requireAuthAPI();

    // 2. Get and validate ID
    const { id } = await params;
    const clientId = validateId(id);

    // 3. Parse body
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

    // 4. Validasi input
    if (
      !brideName ||
      !groomName ||
      !primaryPhone ||
      !ceremonyDate ||
      !receptionDate
    ) {
      return NextResponse.json(
        { message: "Required fields are missing" },
        { status: 400 }
      );
    }

    // 5. Sanitize strings
    const sanitizedBrideName = sanitizeString(brideName, 255);
    const sanitizedGroomName = sanitizeString(groomName, 255);
    const sanitizedPrimaryPhone = sanitizeString(primaryPhone, 50);
    const sanitizedSecondaryPhone = secondaryPhone
      ? sanitizeString(secondaryPhone, 50)
      : null;
    const sanitizedEventLocation = sanitizeString(eventLocation, 500);

    // 6. Update client and appointments in a transaction
    const result = await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        // Update client
        const client = await tx.client.update({
          where: { id: clientId },
          data: {
            brideName: sanitizedBrideName,
            groomName: sanitizedGroomName,
            primaryPhone: sanitizedPrimaryPhone,
            secondaryPhone: sanitizedSecondaryPhone,
            brideAddress: sanitizeString(brideAddress, 1000),
            groomAddress: sanitizeString(groomAddress, 1000),
            brideParents: sanitizeString(brideParents, 255),
            groomParents: sanitizeString(groomParents, 255),
            ceremonyDate: new Date(ceremonyDate),
            ceremonyTime,
            receptionDate: new Date(receptionDate),
            receptionTime,
            eventLocation: sanitizedEventLocation,
          },
        });

        // Helper function to create datetime
        const createDateTime = (dateStr: string, timeStr: string | null) => {
          const date = new Date(dateStr);
          if (timeStr) {
            const [hours, minutes] = timeStr.split(":");
            date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
          } else {
            date.setHours(9, 0, 0, 0);
          }
          return date;
        };

        // Find existing appointments for this client
        const existingAppointments = await tx.appointment.findMany({
          where: { clientId: clientId },
          orderBy: { startTime: "asc" },
        });

        // Identify which is akad and which is resepsi based on title
        const akadAppointment = existingAppointments.find((apt) =>
          apt.title.toLowerCase().includes("akad")
        );
        const resepsiAppointment = existingAppointments.find((apt) =>
          apt.title.toLowerCase().includes("resepsi")
        );

        // Update or create Akad Appointment
        const ceremonyStart = createDateTime(ceremonyDate, ceremonyTime);
        const ceremonyEnd = new Date(ceremonyStart);
        ceremonyEnd.setHours(ceremonyEnd.getHours() + 2);

        if (akadAppointment) {
          await tx.appointment.update({
            where: { id: akadAppointment.id },
            data: {
              title: `Akad - ${sanitizedBrideName} & ${sanitizedGroomName}`,
              description: `Akad Nikah di ${sanitizedEventLocation}`,
              startTime: ceremonyStart,
              endTime: ceremonyEnd,
            },
          });
        } else {
          await tx.appointment.create({
            data: {
              title: `Akad - ${sanitizedBrideName} & ${sanitizedGroomName}`,
              description: `Akad Nikah di ${sanitizedEventLocation}`,
              startTime: ceremonyStart,
              endTime: ceremonyEnd,
              clientId: client.id,
              color: "#9c27b0",
            },
          });
        }

        // Update or create Resepsi Appointment
        const receptionStart = createDateTime(receptionDate, receptionTime);
        const receptionEnd = new Date(receptionStart);
        receptionEnd.setHours(receptionEnd.getHours() + 3);

        if (resepsiAppointment) {
          await tx.appointment.update({
            where: { id: resepsiAppointment.id },
            data: {
              title: `Resepsi - ${sanitizedBrideName} & ${sanitizedGroomName}`,
              description: `Resepsi Pernikahan di ${sanitizedEventLocation}`,
              startTime: receptionStart,
              endTime: receptionEnd,
            },
          });
        } else {
          await tx.appointment.create({
            data: {
              title: `Resepsi - ${sanitizedBrideName} & ${sanitizedGroomName}`,
              description: `Resepsi Pernikahan di ${sanitizedEventLocation}`,
              startTime: receptionStart,
              endTime: receptionEnd,
              clientId: client.id,
              color: "#e91e63",
            },
          });
        }

        return client;
      }
    );

    return NextResponse.json({
      success: true,
      message: "Client and appointments updated successfully",
      data: result,
    });
  } catch (error: unknown) {
    console.error("Update client error:", error);

    const prismaError = error as { code?: string; message?: string };

    // Handle auth errors
    if (prismaError.message === "Unauthorized") {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      );
    }

    // Handle validation errors
    if (prismaError.message?.includes("Invalid")) {
      return NextResponse.json(
        { message: prismaError.message },
        { status: 400 }
      );
    }

    // Handle not found
    if (prismaError.code === "P2025") {
      return NextResponse.json(
        { message: "Client not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: prismaError.message || "Failed to update client" },
      { status: 500 }
    );
  }
}
