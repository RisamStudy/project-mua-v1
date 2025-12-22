import { prisma } from "@/lib/prisma";
import InvoicesTable from "./invoices-table";
import InvoicesHeader from "./invoices-header";

// Force dynamic rendering
export const dynamic = "force-dynamic";

async function getInvoices() {
  try {
    const invoices = await prisma.invoice.findMany({
      include: {
        order: {
          include: {
            client: true,
          },
        },
        payment: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return invoices.map((invoice) => ({
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      clientName: `${invoice.order.client.brideName} & ${invoice.order.client.groomName}`,
      orderNumber: invoice.order.orderNumber,
      amount: invoice.amount.toString(),
      paidAmount: invoice.paidAmount.toString(),
      status: invoice.status,
      issueDate: invoice.issueDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "2-digit",
      }),
      paymentNumber: invoice.payment?.paymentNumber || 0,
    }));
  } catch (error) {
    console.error("Failed to fetch invoices:", error);
    return [];
  }
}

export default async function InvoicesPage() {
  const invoices = await getInvoices();

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white p-4 sm:p-6 md:p-8">
      <InvoicesHeader />
      <InvoicesTable invoices={invoices} />
    </div>
  );
}
