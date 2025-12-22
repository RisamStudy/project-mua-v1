import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import OrderDetailsView from "./order-details-view";
import { format } from "date-fns";

// Force dynamic rendering
export const dynamic = "force-dynamic";

interface Props {
  params: {
    orderId: string;
  };
}

async function getOrderDetails(id: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        client: true,
        payments: {
          orderBy: {
            paymentNumber: "asc",
          },
        },
      },
    });

    if (!order) return null;

    // Helper function to safely convert JsonValue to string array
    const jsonToStringArray = (json: unknown): string[] | null => {
      if (!json) return null;
      if (Array.isArray(json)) {
        return json.filter((item): item is string => typeof item === "string");
      }
      return null;
    };

    // Convert Decimal and Date fields to strings for Client Component
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      client: {
        brideName: order.client.brideName,
        groomName: order.client.groomName,
        primaryPhone: order.client.primaryPhone,
        secondaryPhone: order.client.secondaryPhone,
        ceremonyDate: format(
          new Date(order.client.ceremonyDate),
          "dd MMMM yyyy"
        ),
        ceremonyTime: order.client.ceremonyTime,
        receptionDate: format(
          new Date(order.client.receptionDate),
          "dd MMMM yyyy"
        ),
        receptionTime: order.client.receptionTime,
        eventLocation: order.client.eventLocation,
        brideAddress: order.client.brideAddress,
        groomAddress: order.client.groomAddress,
        brideParents: order.client.brideParents,
        groomParents: order.client.groomParents,
      },
      eventLocation: order.eventLocation,
      items: order.items as unknown as string | null,
      stageModelPhoto: order.stageModelPhoto,
      chairModel: order.chairModel,
      tentColorPhoto: order.tentColorPhoto,
      softlensColor: order.softlensColor,
      dressPhotos: jsonToStringArray(order.dressPhotos),
      specialRequest: order.specialRequest,
      totalAmount: order.totalAmount.toString(),
      paidAmount: order.paidAmount.toString(),
      remainingAmount: order.remainingAmount.toString(),
      paymentStatus: order.paymentStatus,
      payments: order.payments.map((payment) => ({
        id: payment.id,
        paymentNumber: payment.paymentNumber,
        amount: payment.amount.toString(),
        paymentDate: format(new Date(payment.paymentDate), "dd MMMM yyyy"),
        notes: payment.notes,
      })),
      createdAt: format(new Date(order.createdAt), "dd MMMM yyyy"),
    };
  } catch (error) {
    console.error("Failed to fetch order details:", error);
    return null;
  }
}

export default async function OrderDetailsPage({ params }: Props) {
  const { orderId } = params;
  const order = await getOrderDetails(orderId);

  if (!order) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white p-4 sm:p-6 md:p-8">
      <OrderDetailsView order={order} />
    </div>
  );
}
