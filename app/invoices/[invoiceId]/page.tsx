import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import InvoicePreview from "./invoice-preview";

// Force dynamic rendering
export const dynamic = "force-dynamic";

interface Props {
  params: {
    invoiceId: string;
  };
}

async function getInvoiceDetails(id: string) {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            client: true,
            payments: {
              orderBy: {
                paymentNumber: "asc",
              },
            },
          },
        },
        payment: true,
      },
    });

    if (!invoice) return null;

    return {
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      issueDate: invoice.issueDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "2-digit",
      }),
      dueDate:
        invoice.dueDate?.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "2-digit",
        }) || null,
      amount: invoice.amount.toString(),
      paidAmount: invoice.paidAmount.toString(),
      status: invoice.status,
      notes: invoice.notes,
      order: {
        orderNumber: invoice.order.orderNumber,
        items: invoice.order.items,
        totalAmount: invoice.order.totalAmount.toString(),
        payments: invoice.order.payments.map((p) => ({
          id: p.id,
          paymentNumber: p.paymentNumber,
          amount: p.amount.toString(),
          paymentDate: p.paymentDate.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "2-digit",
          }),
          paymentMethod: p.paymentMethod,
          notes: p.notes,
        })),
      },
      client: {
        brideName: invoice.order.client.brideName,
        groomName: invoice.order.client.groomName,
        primaryPhone: invoice.order.client.primaryPhone,
        brideAddress: invoice.order.client.brideAddress,
        eventLocation: invoice.order.client.eventLocation,
      },
        payment: invoice.payment
        ? {
            id: invoice.payment.id,
            paymentNumber: invoice.payment.paymentNumber,
            amount: invoice.payment.amount.toString(),
            paymentDate: invoice.payment.paymentDate.toLocaleDateString(
              "en-US",
              {
                year: "numeric",
                month: "short",
                day: "2-digit",
              }
            ),
            paymentMethod: invoice.payment.paymentMethod,
            notes: invoice.payment.notes,
          }
        : null,
    };
  } catch (error) {
    console.error("Failed to fetch invoice:", error);
    return null;
  }
}

export default async function InvoicePreviewPage({ params }: Props) {
  const { invoiceId } = await params;
  const invoice = await getInvoiceDetails(invoiceId);

  if (!invoice) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 text-black p-4 sm:p-6 md:p-8">
      <InvoicePreview invoice={invoice} />
    </div>
  );
}
