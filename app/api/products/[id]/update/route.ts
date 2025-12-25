import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthAPI } from "@/lib/auth";
import { Decimal } from "@prisma/client/runtime/library";

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authentication check
    await requireAuthAPI();

    const { id } = await params;
    const body = await request.json();
    const { name, category, description, price, imageUrl } = body;

    // Validasi input
    if (!name || !category || price === undefined) {
      return NextResponse.json(
        { message: "Name, category, and price are required" },
        { status: 400 }
      );
    }

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    // Update product
    const product = await prisma.product.update({
      where: { id },
      data: {
        name: name.trim(),
        category: category.trim(),
        description: description ? description.trim() : null,
        price: new Decimal(parseFloat(price)),
        imageUrl: imageUrl || null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Product updated successfully",
      data: product,
    });
  } catch (error: unknown) {
    console.error("Update product error:", error);

    const prismaError = error as { code?: string; message?: string };
    if (prismaError.code === "P2025") {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: prismaError.message || "Failed to update product" },
      { status: 500 }
    );
  }
}
