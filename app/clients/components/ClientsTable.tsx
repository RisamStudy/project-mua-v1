"use client";

import { Client } from "@/app/types/client";
import { ClientRow } from "./ClientRow";

interface Props {
  clients: Client[];
}

export default function ClientsTable({ clients }: Props) {
  return (
    <div className="rounded-xl bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark">
      
      {/* Search + Filter */}
      <div className="flex items-center justify-between gap-4 p-4 border-b border-border-light dark:border-border-dark">
        <div className="relative w-full max-w-sm">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary-light dark:text-text-secondary-dark">
            search
          </span>
          <input
            type="text"
            placeholder="Search clients..."
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark text-sm"
          />
        </div>

        <div className="flex items-center gap-4">
          <button className="flex items-center gap-1 text-sm hover:text-primary">
            <span className="material-symbols-outlined text-base">filter_list</span> Filter
          </button>
          <button className="flex items-center gap-1 text-sm hover:text-primary">
            <span className="material-symbols-outlined text-base">swap_vert</span> Sort
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="uppercase text-xs text-text-secondary-light dark:text-text-secondary-dark bg-background-light dark:bg-background-dark whitespace-nowrap">
            <tr>
              <th className="px-6 py-3">Mempelai Wanita</th>
              <th className="px-6 py-3">Mempelai Pria</th>
              <th className="px-6 py-3">Primary Phone</th>
              <th className="px-6 py-3">Secondary Phone</th>
              <th className="px-6 py-3">Ceremony Date</th>
              <th className="px-6 py-3">Reception Date</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border-light dark:divide-border-dark">
            {clients.map((c) => (
              <ClientRow
                key={c.id}
                data={c}
                onEdit={() => console.log("Edit", c.id)}
                onDelete={() => console.log("Delete", c.id)}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between p-4">
        <span className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
          Showing {clients.length} clients
        </span>

        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 border border-border-light dark:border-border-dark rounded-lg text-sm opacity-50" disabled>
            <span className="material-symbols-outlined text-lg">chevron_left</span> Previous
          </button>

          <button className="px-3 py-1.5 border border-border-light dark:border-border-dark rounded-lg text-sm">
            Next <span className="material-symbols-outlined text-lg">chevron_right</span>
          </button>
        </div>
      </div>
    </div>
  );
}
