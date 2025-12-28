import { prisma } from "@/lib/prisma";
import OrdersTable from "./order-table";
import OrdersHeader from "./order-header";

// Force dynamic rendering
export const dynamic = "force-dynamic";

async function getOrders() {
  try {
    const orders = await prisma.order.findMany({
      include: {
        client: {
          select: {
            brideName: true,
            groomName: true,
            ceremonyDate: true,
            receptionDate: true,
          },
        },
        payments: {
          orderBy: {
            paymentNumber: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Convert Decimal fields to strings and extract DP1 & DP2
    return orders.map((order) => {
      const dp1 = order.payments.find((p) => p.paymentNumber === 1);
      const dp2 = order.payments.find((p) => p.paymentNumber === 2);

      return {
        id: order.id,
        orderNumber: order.orderNumber,
        brideName: order.client.brideName,
        groomName: order.client.groomName,
        ceremonyDate: order.client.ceremonyDate ? order.client.ceremonyDate.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "2-digit",
        }) : "-",
        receptionDate: order.client.receptionDate ? order.client.receptionDate.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "2-digit",
        }) : "-",
        totalAmount: order.totalAmount.toString(),
        paidAmount: order.paidAmount.toString(),
        remainingAmount: order.remainingAmount.toString(),
        paymentStatus: order.paymentStatus,
        dp1: dp1 ? dp1.amount.toString() : "0",
        dp2: dp2 ? dp2.amount.toString() : "0",
      };
    });
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    return [];
  }
}

export default async function OrdersPage() {
  const orders = await getOrders();

  return (
    <div className="min-h-screen bg-gray-50 text-black p-4 sm:p-6 md:p-8">
      <OrdersHeader />
      <OrdersTable orders={orders} />
    </div>
  );
}
