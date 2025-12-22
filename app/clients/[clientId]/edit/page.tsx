import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import EditClientForm from "./edit-client-form";

// Force dynamic rendering
export const dynamic = "force-dynamic";

interface Props {
  params: {
    clientId: string;
  };
}

async function getClient(id: string) {
  try {
    const client = await prisma.client.findUnique({
      where: { id },
    });
    return client;
  } catch (error) {
    console.error("Failed to fetch client:", error);
    return null;
  }
}

export default async function EditClientPage({ params }: Props) {
  const { clientId } = await params;
  const client = await getClient(clientId);

  if (!client) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white p-8">
      <div className="max-w-6xl mx-auto">
        <EditClientForm client={client} />
      </div>
    </div>
  );
}
