import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthAPI } from "@/lib/auth";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authentication check
    await requireAuthAPI();

    const { id } = await params;

    // Delete product
    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error: unknown) {
    console.error("Delete product error:", error);

    const prismaError = error as { code?: string; message?: string };
    if (prismaError.code === "P2025") {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: prismaError.message || "Failed to delete product" },
      { status: 500 }
    );
  }
}
