import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthAPI } from "@/lib/auth";

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authentication check
    await requireAuthAPI();

    const { id } = await params;
    const body = await request.json();
    const { dueDays } = body;

    if (!dueDays || dueDays < 1) {
      return NextResponse.json(
        { message: "Invalid due days value" },
        { status: 400 }
      );
    }

    console.log(`Updating due date for invoice: ${id} with due days: ${dueDays}`);

    // Get invoice
    const invoice = await prisma.invoice.findUnique({
      where: { id },
    });

    if (!invoice) {
      console.log(`Invoice not found: ${id}`);
      return NextResponse.json({ message: "Invoice not found" }, { status: 404 });
    }

    // Calculate new due date based on issue date
    const issueDate = new Date(invoice.issueDate);
    const newDueDate = new Date(issueDate);
    newDueDate.setDate(newDueDate.getDate() + dueDays);

    // Update invoice
    const updatedInvoice = await prisma.invoice.update({
      where: { id },
      data: {
        dueDate: newDueDate,
      },
    });

    console.log(`Invoice due date updated successfully: ${updatedInvoice.id}`);
    return NextResponse.json({
      success: true,
      message: "Due date updated successfully",
      data: {
        id: updatedInvoice.id,
        dueDate: newDueDate.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "2-digit",
        }),
      },
    });
  } catch (error: unknown) {
    console.error("Update due date error:", error);
    
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Failed to update due date",
        error: process.env.NODE_ENV === 'development' ? error : undefined,
      },
      { status: 500 }
    );
  }
}