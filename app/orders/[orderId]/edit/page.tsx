import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import EditOrderForm from './edit-order-form';

interface Props {
  params: {
    orderId: string;
  };
}

async function getOrder(id: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        client: true,
      },
    });

    if (!order) return null;

    return {
      id: order.id,
      orderNumber: order.orderNumber,
      clientId: order.clientId,
      eventLocation: order.eventLocation,
      items: order.items,
      stageModelPhoto: order.stageModelPhoto,
      chairModel: order.chairModel,
      tentColorPhoto: order.tentColorPhoto,
      softlensColor: order.softlensColor,
      dressPhotos: order.dressPhotos,
      specialRequest: order.specialRequest,
      totalAmount: order.totalAmount.toString(),
      paidAmount: order.paidAmount.toString(),
      paymentStatus: order.paymentStatus,
    };
  } catch (error) {
    console.error('Failed to fetch order:', error);
    return null;
  }
}

async function getClients() {
  try {
    const clients = await prisma.client.findMany({
      select: {
        id: true,
        brideName: true,
        groomName: true,
        eventLocation: true,
      },
      orderBy: {
        brideName: 'asc',
      },
    });
    return clients;
  } catch (error) {
    console.error('Failed to fetch clients:', error);
    return [];
  }
}

export default async function EditOrderPage({ params }: Props) {
  const { orderId } = await params;
  const [order, clients] = await Promise.all([
    getOrder(orderId),
    getClients(),
  ]);

  if (!order) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <EditOrderForm order={order} clients={clients} />
      </div>
    </div>
  );
}