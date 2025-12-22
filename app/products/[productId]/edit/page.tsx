import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import EditProductForm from "./edit-product-form";

// Force dynamic rendering
export const dynamic = "force-dynamic";

interface Props {
  params: {
    productId: string;
  };
}

async function getProduct(id: string) {
  try {
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) return null;

    // Convert Decimal to string for Client Component
    return {
      id: product.id,
      name: product.name,
      category: product.category,
      description: product.description,
      price: product.price.toString(), // Convert Decimal to string
      imageUrl: product.imageUrl,
      isActive: product.isActive,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    };
  } catch (error) {
    console.error("Failed to fetch product:", error);
    return null;
  }
}

export default async function EditProductPage({ params }: Props) {
  const { productId } = await params;
  const product = await getProduct(productId);

  if (!product) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <EditProductForm product={product} />
      </div>
    </div>
  );
}
