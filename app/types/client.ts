// app/types/client.ts

export interface Client {
  id: string;

  brideName: string;
  groomName: string;

  primaryPhone: string;
  secondaryPhone?: string | null;

  brideAddress: string;
  groomAddress: string;

  brideParents: string;
  groomParents: string;

  ceremonyDate: Date;
  ceremonyTime?: string | null;

  receptionDate: Date;
  receptionTime?: string | null;

  eventLocation: string;

  createdAt: Date;
  updatedAt: Date;
}
