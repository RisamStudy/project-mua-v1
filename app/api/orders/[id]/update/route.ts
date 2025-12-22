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
      paymentStatus,
    } = body;

    // Validasi input
    if (!clientId || !eventLocation || !items || items.length === 0) {
      return NextResponse.json(
        { message: "Client, event location, and items are required" },
        { status: 400 }
      );
    }

    // Get current order to calculate remaining amount
    const currentOrder = await prisma.order.findUnique({
      where: { id },
      select: { paidAmount: true },
    });

    if (!currentOrder) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    const remainingAmount = totalAmount - Number(currentOrder.paidAmount);

    // Update order
    const order = await prisma.order.update({
      where: { id },
      data: {
        clientId,
        eventLocation,
        items,
        stageModelPhoto: stageModelPhoto || null,
        chairModel,
        tentColorPhoto: tentColorPhoto || null,
        softlensColor,
        dressPhotos: dressPhotos && dressPhotos.length > 0 ? dressPhotos : null,
        specialRequest,
        totalAmount,
        remainingAmount,
        paymentStatus,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Order updated successfully",
      data: order,
    });
  } catch (error: unknown) {
    console.error("Update order error:", error);

    const prismaError = error as { code?: string; message?: string };
    if (prismaError.code === "P2025") {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: prismaError.message || "Failed to update order" },
      { status: 500 }
    );
  }
}
