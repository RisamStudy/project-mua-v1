import { prisma } from "@/lib/prisma";
import CalendarView from "./calendar-view";

// Force dynamic rendering - jangan cache halaman ini
export const dynamic = "force-dynamic";

async function getAppointments() {
  try {
    const appointments = await prisma.appointment.findMany({
      include: {
        client: true,
      },
      orderBy: {
        startTime: "asc",
      },
    });

    return appointments.map((apt) => ({
      id: apt.id,
      title: apt.title,
      description: apt.description,
      startTime: apt.startTime.toISOString(),
      endTime: apt.endTime.toISOString(),
      color: apt.color,
      client: apt.client
        ? {
            id: apt.client.id,
            brideName: apt.client.brideName,
            groomName: apt.client.groomName,
          }
        : null,
    }));
  } catch (error) {
    console.error("Failed to fetch appointments:", error);
    return [];
  }
}

async function getClients() {
  try {
    const clients = await prisma.client.findMany({
      select: {
        id: true,
        brideName: true,
        groomName: true,
      },
      orderBy: {
        brideName: "asc",
      },
    });
    return clients;
  } catch (error) {
    console.error("Failed to fetch clients:", error);
    return [];
  }
}

export default async function CalendarPage() {
  const [appointments, clients] = await Promise.all([
    getAppointments(),
    getClients(),
  ]);

  return (
    <div className="min-h-screen bg-gray-50 text-black p-4 sm:p-6 md:p-8">
      <CalendarView appointments={appointments} clients={clients} />
    </div>
  );
}
