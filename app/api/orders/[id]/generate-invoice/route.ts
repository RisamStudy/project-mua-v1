import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthAPI } from "@/lib/auth";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authentication check
    await requireAuthAPI();

    const { id } = await params;

    // Get order with latest payment
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        payments: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    // Check if there's a payment to generate invoice for
    const latestPayment = order.payments[0];
    if (!latestPayment) {
      return NextResponse.json(
        { message: "No payment found for this order" },
        { status: 400 }
      );
    }

    // Check if invoice already exists for this payment
    const existingInvoice = await prisma.invoice.findFirst({
      where: { paymentId: latestPayment.id },
    });

    if (existingInvoice) {
      return NextResponse.json({
        success: true,
        message: "Invoice already exists",
        invoiceId: existingInvoice.id,
        data: existingInvoice,
      });
    }

    // Generate invoice number
    const count = await prisma.invoice.count();
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(
      count + 1
    ).padStart(3, "0")}`;

    // Calculate due date (7 days from now)
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7);

    // Create invoice
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        orderId: id,
        paymentId: latestPayment.id,
        amount: latestPayment.amount,
        paidAmount: latestPayment.amount,
        status: "Paid",
        dueDate,
        notes: `Invoice untuk pembayaran DP${latestPayment.paymentNumber} - ${order.orderNumber}`,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Invoice generated successfully",
      invoiceId: invoice.id,
      data: invoice,
    });
  } catch (error: unknown) {
    console.error("Generate invoice error:", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Failed to generate invoice",
      },
      { status: 500 }
    );
  }
}
