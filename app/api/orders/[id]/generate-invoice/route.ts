import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthAPI } from "@/lib/auth";

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authentication check
    await requireAuthAPI();

    const { id } = await params;
    
    // Try to parse request body, default to empty object if no body
    let body = {};
    try {
      const requestText = await request.text();
      if (requestText) {
        body = JSON.parse(requestText);
      }
    } catch (parseError) {
      console.log("No request body or invalid JSON, using defaults");
    }
    
    const { dueDays = 7 } = body; // Default to 7 days if not provided
    
    console.log(`Generating invoice for order: ${id} with due days: ${dueDays}`);

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
      console.log(`Order not found: ${id}`);
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    console.log(`Order found: ${order.orderNumber}, payments: ${order.payments.length}`);

    // Check if there's a payment to generate invoice for
    const latestPayment = order.payments[0];
    if (!latestPayment) {
      console.log(`No payment found for order: ${id}`);
      return NextResponse.json(
        { message: "No payment found for this order" },
        { status: 400 }
      );
    }

    console.log(`Latest payment found: ${latestPayment.id}, amount: ${latestPayment.amount}`);

    // Check if invoice already exists for this payment
    const existingInvoice = await prisma.invoice.findFirst({
      where: { paymentId: latestPayment.id },
    });

    if (existingInvoice) {
      console.log(`Invoice already exists: ${existingInvoice.invoiceNumber}`);
      return NextResponse.json({
        success: true,
        message: "Invoice already exists",
        invoiceId: existingInvoice.id,
        data: existingInvoice,
      });
    }

    // Generate unique invoice number with timestamp and random suffix
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const timestamp = now.getTime().toString().slice(-4); // Last 4 digits of timestamp
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, "0"); // Increased randomness
    
    const invoiceNumber = `INV-${year}${month}${day}-${timestamp}${random}`;
    console.log(`Generated invoice number: ${invoiceNumber}`);

    // Check if invoice number already exists (extra safety)
    const duplicateInvoice = await prisma.invoice.findUnique({
      where: { invoiceNumber },
    });

    if (duplicateInvoice) {
      console.log(`Duplicate invoice number detected: ${invoiceNumber}`);
      // Generate a new one with additional randomness
      const extraRandom = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
      const newInvoiceNumber = `INV-${year}${month}${day}-${timestamp}${extraRandom}`;
      console.log(`New invoice number: ${newInvoiceNumber}`);
      
      // Create invoice with new number
      const invoice = await prisma.invoice.create({
        data: {
          invoiceNumber: newInvoiceNumber,
          orderId: id,
          paymentId: latestPayment.id,
          amount: latestPayment.amount,
          paidAmount: latestPayment.amount,
          status: "Paid",
          dueDate: new Date(Date.now() + dueDays * 24 * 60 * 60 * 1000), // dueDays from now
          notes: `Invoice untuk pembayaran DP${latestPayment.paymentNumber} - ${order.orderNumber}`,
        },
      });

      console.log(`Invoice created successfully: ${invoice.id}`);
      return NextResponse.json({
        success: true,
        message: "Invoice generated successfully",
        invoiceId: invoice.id,
        data: invoice,
      });
    }

    // Calculate due date (dueDays from now)
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + dueDays);

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

    console.log(`Invoice created successfully: ${invoice.id}`);
    return NextResponse.json({
      success: true,
      message: "Invoice generated successfully",
      invoiceId: invoice.id,
      data: invoice,
    });
  } catch (error: unknown) {
    console.error("Generate invoice error:", error);
    
    // More detailed error logging
    if (error instanceof Error) {
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Failed to generate invoice",
        error: process.env.NODE_ENV === 'development' ? error : undefined,
      },
      { status: 500 }
    );
  }
}
