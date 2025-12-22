import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthAPI } from "@/lib/auth";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authentication check
    await requireAuthAPI();

    const { id } = await params;
    const body = await request.json();
    const { title, description, startTime, endTime, clientId, color } = body;

    // Validasi input
    if (!title || !startTime || !endTime) {
      return NextResponse.json(
        { message: "Title, start time, and end time are required" },
        { status: 400 }
      );
    }

    // Update appointment
    const appointment = await prisma.appointment.update({
      where: { id },
      data: {
        title,
        description,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        clientId: clientId || null,
        color: color || "#d4b896",
      },
      include: {
        client: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Appointment updated successfully",
      data: appointment,
    });
  } catch (error: unknown) {
    console.error("Update appointment error:", error);

    const prismaError = error as { code?: string; message?: string };
    if (prismaError.code === "P2025") {
      return NextResponse.json(
        { message: "Appointment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: prismaError.message || "Failed to update appointment" },
      { status: 500 }
    );
  }
}
