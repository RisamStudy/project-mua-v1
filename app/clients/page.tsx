import ClientsTable from './clients-table';
import ClientsHeader from './clients-header';
import { prisma } from '@/lib/prisma';

async function getClients() {
  try {
    const clients = await prisma.client.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50, // Limit untuk performa
    });

    return clients.map(client => ({
      id: client.id,
      brideName: client.brideName,
      groomName: client.groomName,
      primaryPhone: client.primaryPhone,
      secondaryPhone: client.secondaryPhone || '-',
      ceremonyDate: client.ceremonyDate.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: '2-digit' 
      }),
      receptionDate: client.receptionDate.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: '2-digit' 
      }),
    }));
  } catch (error) {
    console.error('Failed to fetch clients:', error);
    return [];
  }
}

export default async function ClientsPage() {
  const clients = await getClients();

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white p-4 sm:p-6 md:p-8">
      <ClientsHeader />
      <ClientsTable clients={clients} />
    </div>
  );
}