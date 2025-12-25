import ClientsTable from "./clients-table";
import ClientsHeader from "./clients-header";
import { prisma } from "@/lib/prisma";

// Force dynamic rendering
export const dynamic = "force-dynamic";

async function getClients() {
  try {
    const clients = await prisma.client.findMany({
      orderBy: { createdAt: "desc" },
      // Removed take limit to show all clients
    });

    return clients.map((client) => ({
      id: client.id,
      brideName: client.brideName,
      groomName: client.groomName,
      primaryPhone: client.primaryPhone,
      secondaryPhone: client.secondaryPhone || "-",
      ceremonyDate: client.ceremonyDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "2-digit",
      }),
      receptionDate: client.receptionDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "2-digit",
      }),
    }));
  } catch (error) {
    console.error("Failed to fetch clients:", error);
    return [];
  }
}

export default async function ClientsPage() {
  const clients = await getClients();

  return (
    <div className="min-h-screen bg-gray-50 text-black p-4 sm:p-6 md:p-8">
      <ClientsHeader />
      <ClientsTable clients={clients} />
    </div>
  );
}
