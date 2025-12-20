import { prisma } from '@/lib/prisma';
import AddOrderForm from './add-order-form';

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

export default async function AddOrderPage() {
  const clients = await getClients();

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Buat Pesanan Baru
          </h1>
          <p className="text-sm md:text-base text-gray-400">
            Isi formulir di bawah ini untuk menambahkan pesanan baru untuk klien.
          </p>
        </div>

        <AddOrderForm clients={clients} />
      </div>
    </div>
  );
}