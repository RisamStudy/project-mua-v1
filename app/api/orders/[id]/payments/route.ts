import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthAPI } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authentication check
    await requireAuthAPI();

    const { id } = await params;

    // Get all payments for this order
    const payments = await prisma.payment.findMany({
      where: { orderId: id },
      orderBy: {
        paymentNumber: "asc",
      },
      include: {
        invoice: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: payments,
    });
  } catch (error: unknown) {
    console.error("Get payments error:", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Failed to get payments",
      },
      { status: 500 }
    );
  }
}
