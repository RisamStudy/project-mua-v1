import { prisma } from "@/lib/prisma";
import ProductsGrid from "./products-grid";
import ProductsHeader from "./products-header";

// Force dynamic rendering
export const dynamic = "force-dynamic";

async function getProducts() {
  try {
    const products = await prisma.product.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return products.map((product) => ({
      id: product.id,
      name: product.name,
      category: product.category,
      description: product.description,
      price: product.price.toString(),
      imageUrl: product.imageUrl,
      isActive: product.isActive,
    }));
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return [];
  }
}

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white p-4 sm:p-6 md:p-8">
      <ProductsHeader />
      <ProductsGrid products={products} />
    </div>
  );
}
