"use client";

import { useState, useMemo } from "react";
import { Client } from "@/app/types/client";
import { ClientRow } from "./ClientRow";

interface Props {
  clients: Client[];
}

type SortField = 'brideName' | 'groomName' | 'ceremonyDate' | 'receptionDate' | 'createdAt';
type SortOrder = 'asc' | 'desc';

export default function ClientsTable({ clients }: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [dateFilter, setDateFilter] = useState<'all' | 'thisMonth' | 'nextMonth' | 'thisYear'>('all');

  // Filter and sort logic
  const filteredAndSortedClients = useMemo(() => {
    let filtered = clients.filter(client => {
      const matchesSearch = 
        client.brideName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.groomName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.primaryPhone.includes(searchTerm) ||
        (client.secondaryPhone && client.secondaryPhone.includes(searchTerm));

      if (!matchesSearch) return false;

      // Date filtering
      if (dateFilter !== 'all') {
        const now = new Date();
        const ceremonyDate = new Date(client.ceremonyDate);
        
        switch (dateFilter) {
          case 'thisMonth':
            return ceremonyDate.getMonth() === now.getMonth() && 
                   ceremonyDate.getFullYear() === now.getFullYear();
          case 'nextMonth':
            const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1);
            return ceremonyDate.getMonth() === nextMonth.getMonth() && 
                   ceremonyDate.getFullYear() === nextMonth.getFullYear();
          case 'thisYear':
            return ceremonyDate.getFullYear() === now.getFullYear();
          default:
            return true;
        }
      }

      return true;
    });

    // Sorting
    filtered.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      if (sortField === 'ceremonyDate' || sortField === 'receptionDate' || sortField === 'createdAt') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      } else {
        aValue = aValue?.toString().toLowerCase() || '';
        bValue = bValue?.toString().toLowerCase() || '';
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [clients, searchTerm, sortField, sortOrder, dateFilter]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
    setShowSortMenu(false);
  };
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
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark text-sm"
          />
        </div>

        <div className="flex items-center gap-4 relative">
          {/* Filter Button */}
          <div className="relative">
            <button 
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className="flex items-center gap-1 text-sm hover:text-primary"
            >
              <span className="material-symbols-outlined text-base">filter_list</span> Filter
              {dateFilter !== 'all' && (
                <span className="w-2 h-2 bg-primary rounded-full"></span>
              )}
            </button>

            {/* Filter Dropdown */}
            {showFilterMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg shadow-lg z-10">
                <div className="p-2">
                  <div className="text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark mb-2">
                    Filter by Date
                  </div>
                  {[
                    { value: 'all', label: 'All Dates' },
                    { value: 'thisMonth', label: 'This Month' },
                    { value: 'nextMonth', label: 'Next Month' },
                    { value: 'thisYear', label: 'This Year' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setDateFilter(option.value as any);
                        setShowFilterMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-background-light dark:hover:bg-background-dark ${
                        dateFilter === option.value ? 'text-primary' : ''
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sort Button */}
          <div className="relative">
            <button 
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="flex items-center gap-1 text-sm hover:text-primary"
            >
              <span className="material-symbols-outlined text-base">swap_vert</span> Sort
            </button>

            {/* Sort Dropdown */}
            {showSortMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg shadow-lg z-10">
                <div className="p-2">
                  <div className="text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark mb-2">
                    Sort by
                  </div>
                  {[
                    { field: 'brideName', label: 'Bride Name' },
                    { field: 'groomName', label: 'Groom Name' },
                    { field: 'ceremonyDate', label: 'Ceremony Date' },
                    { field: 'receptionDate', label: 'Reception Date' },
                    { field: 'createdAt', label: 'Date Added' }
                  ].map((option) => (
                    <button
                      key={option.field}
                      onClick={() => handleSort(option.field as SortField)}
                      className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-background-light dark:hover:bg-background-dark flex items-center justify-between ${
                        sortField === option.field ? 'text-primary' : ''
                      }`}
                    >
                      <span>{option.label}</span>
                      {sortField === option.field && (
                        <span className="material-symbols-outlined text-sm">
                          {sortOrder === 'asc' ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
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
            {filteredAndSortedClients.map((c) => (
              <ClientRow
                key={c.id}
                data={c}
                onEdit={() => console.log("Edit", c.id)}
                onDelete={() => console.log("Delete", c.id)}
              />
            ))}
            {filteredAndSortedClients.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-text-secondary-light dark:text-text-secondary-dark">
                  {searchTerm || dateFilter !== 'all' ? 'No clients match your filters' : 'No clients found'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between p-4">
        <span className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
          Showing {filteredAndSortedClients.length} of {clients.length} clients
          {(searchTerm || dateFilter !== 'all') && (
            <span className="ml-2 text-xs">
              (filtered)
            </span>
          )}
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

      {/* Click outside to close dropdowns */}
      {(showFilterMenu || showSortMenu) && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => {
            setShowFilterMenu(false);
            setShowSortMenu(false);
          }}
        />
      )}
    </div>
  );
}
