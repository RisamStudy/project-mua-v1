"use client";

import { Client } from "@/app/types/client";

interface Props {
  data: Client;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ClientRow({ data, onEdit, onDelete }: Props) {
  return (
    <tr className="hover:bg-background-light dark:hover:bg-background-dark transition">
      <td className="px-6 py-4 font-medium">{data.brideName}</td>
      <td className="px-6 py-4 text-text-secondary-light dark:text-text-secondary-dark">
        {data.groomName}
      </td>
      <td className="px-6 py-4">{data.primaryPhone}</td>
      <td className="px-6 py-4">{data.secondaryPhone || "-"}</td>
      <td className="px-6 py-4">{new Date(data.ceremonyDate).toLocaleDateString("id-ID")}</td>
      <td className="px-6 py-4">{new Date(data.receptionDate).toLocaleDateString("id-ID")}</td>

      <td className="px-6 py-4 text-right">
        <div className="flex justify-end gap-2">
          <button onClick={() => onEdit(data.id)} className="p-1.5 hover:text-primary">
            <span className="material-symbols-outlined text-lg">edit</span>
          </button>
          <button onClick={() => onDelete(data.id)} className="p-1.5 hover:text-primary">
            <span className="material-symbols-outlined text-lg">delete</span>
          </button>
        </div>
      </td>
    </tr>
  );
}
