import { prisma } from "@/lib/prisma";
import { format, parseISO, isAfter, isBefore, startOfDay } from "date-fns";
import { id } from "date-fns/locale";
import OrdersTimelineView from "./orders-timeline-view";

// Force dynamic rendering
export const dynamic = "force-dynamic";

async function getOrdersTimeline() {
  try {
    const orders = await prisma.order.findMany({
      include: {
        client: true,
        payments: {
          orderBy: {
            paymentNumber: "asc",
          },
        },
      },
    });

    // Helper function to safely convert JsonValue to string array
    const jsonToStringArray = (json: unknown): string[] | null => {
      if (!json) return null;
      if (Array.isArray(json)) {
        return json.filter((item): item is string => typeof item === "string");
      }
      return null;
    };

    // Convert and process orders
    const processedOrders = orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      client: {
        brideName: order.client.brideName,
        groomName: order.client.groomName,
        primaryPhone: order.client.primaryPhone,
        secondaryPhone: order.client.secondaryPhone,
        ceremonyDate: order.client.ceremonyDate,
        ceremonyTime: order.client.ceremonyTime,
        ceremonyEndTime: order.client.ceremonyEndTime,
        receptionDate: order.client.receptionDate,
        receptionTime: order.client.receptionTime,
        receptionEndTime: order.client.receptionEndTime,
        eventLocation: order.client.eventLocation,
        brideAddress: order.client.brideAddress,
        groomAddress: order.client.groomAddress,
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
        paymentDate: format(new Date(payment.paymentDate), "dd MMMM yyyy", { locale: id }),
        notes: payment.notes,
      })),
      createdAt: format(new Date(order.createdAt), "dd MMMM yyyy", { locale: id }),
    }));

    // Group orders by event date (ceremony or reception, whichever is closer to today)
    const today = startOfDay(new Date());
    const groupedOrders: { [key: string]: typeof processedOrders } = {};

    processedOrders.forEach((order) => {
      let eventDate: Date | null = null;
      let eventType: 'ceremony' | 'reception' | null = null;

      // Determine which date to use (ceremony or reception, whichever is closer to today)
      if (order.client.ceremonyDate) {
        const ceremonyDate = startOfDay(new Date(order.client.ceremonyDate));
        if (isAfter(ceremonyDate, today) || ceremonyDate.getTime() === today.getTime()) {
          eventDate = ceremonyDate;
          eventType = 'ceremony';
        }
      }

      if (order.client.receptionDate) {
        const receptionDate = startOfDay(new Date(order.client.receptionDate));
        if (isAfter(receptionDate, today) || receptionDate.getTime() === today.getTime()) {
          if (!eventDate || isBefore(receptionDate, eventDate)) {
            eventDate = receptionDate;
            eventType = 'reception';
          }
        }
      }

      // If no future dates, use the most recent past date
      if (!eventDate) {
        if (order.client.ceremonyDate) {
          const ceremonyDate = startOfDay(new Date(order.client.ceremonyDate));
          eventDate = ceremonyDate;
          eventType = 'ceremony';
        } else if (order.client.receptionDate) {
          const receptionDate = startOfDay(new Date(order.client.receptionDate));
          eventDate = receptionDate;
          eventType = 'reception';
        }
      }

      if (eventDate) {
        const dateKey = format(eventDate, "yyyy-MM-dd");
        if (!groupedOrders[dateKey]) {
          groupedOrders[dateKey] = [];
        }
        groupedOrders[dateKey].push({
          ...order,
          eventDate: format(eventDate, "dd MMMM yyyy", { locale: id }),
          eventType,
          eventTime: eventType === 'ceremony' ? order.client.ceremonyTime : order.client.receptionTime,
          eventEndTime: eventType === 'ceremony' ? order.client.ceremonyEndTime : order.client.receptionEndTime,
        } as any);
      }
    });

    // Sort dates (closest to today first)
    const sortedDates = Object.keys(groupedOrders).sort((a, b) => {
      const dateA = new Date(a);
      const dateB = new Date(b);
      
      // Future dates first (ascending), then past dates (descending)
      const isAFuture = isAfter(dateA, today) || dateA.getTime() === today.getTime();
      const isBFuture = isAfter(dateB, today) || dateB.getTime() === today.getTime();
      
      if (isAFuture && isBFuture) {
        return dateA.getTime() - dateB.getTime(); // Future dates: ascending
      } else if (!isAFuture && !isBFuture) {
        return dateB.getTime() - dateA.getTime(); // Past dates: descending
      } else {
        return isAFuture ? -1 : 1; // Future dates first
      }
    });

    // Convert to timeline format
    const timeline = sortedDates.map(dateKey => ({
      date: dateKey,
      displayDate: format(new Date(dateKey), "dd MMMM yyyy", { locale: id }),
      dayName: format(new Date(dateKey), "EEEE", { locale: id }),
      isToday: dateKey === format(today, "yyyy-MM-dd"),
      isPast: isBefore(new Date(dateKey), today),
      orders: groupedOrders[dateKey] as any,
    }));

    return timeline;
  } catch (error) {
    console.error("Failed to fetch orders timeline:", error);
    return [];
  }
}

export default async function OrdersTimelinePage() {
  const timeline = await getOrdersTimeline();

  return (
    <div className="min-h-screen bg-gray-50 text-black p-4 sm:p-6 md:p-8">
      <OrdersTimelineView timeline={timeline} />
    </div>
  );
}