export interface Client {
  id: string;
  brideName: string;
  groomName: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  clientId: string;
  totalAmount: number;
  paymentStatus: 'DP1' | 'DP2' | 'LUNAS';
  eventDate: Date;
  createdAt: Date;
  updatedAt: Date;
  client?: Client;
}

export interface OrderWithClient extends Order {
  client: Client;
}

export interface Appointment {
  id: string;
  title: string;
  description: string | null;
  startTime: string;
  endTime: string;
  color: string;
  client: {
    id: string;
    brideName: string;
    groomName: string;
  } | null;
}