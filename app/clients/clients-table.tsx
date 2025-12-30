"use client";

import { useState } from "react";
import Link from "next/link";
import DeleteModal from "@/components/ui/delete-modal";
import Toast from "@/components/ui/toast";
import { WhatsAppLink } from "@/components/ui/whatsapp-link";

interface Client {
  id: string;
  brideName: string;
  groomName: string;
  primaryPhone: string;
  secondaryPhone: string;
  ceremonyDate: string;
  receptionDate: string;
}

type SortField = 'brideName' | 'ceremonyDate' | 'receptionDate';
type SortOrder = 'asc' | 'desc';

export default function ClientsTable({ clients }: { clients: Client[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>('brideName');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showSortMenu, setSortMenu] = useState(false);
  const [monthFilter, setMonthFilter] = useState<'all' | 'january' | 'february' | 'march' | 'april' | 'may' | 'june' | 'july' | 'august' | 'september' | 'october' | 'november' | 'december'>('all');
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    clientId: string | null;
    clientName: string | null;
  }>({
    isOpen: false,
    clientId: null,
    clientName: null,
  });
  const [deleting, setDeleting] = useState(false);

  const [toast, setToast] = useState<{
    isOpen: boolean;
    message: string;
    type: "success" | "error";
  }>({
    isOpen: false,
    message: "",
    type: "success",
  });

  // Filter clients based on search and month filter
  const filteredClients = clients.filter((client) => {
    const matchesSearch = 
      client.brideName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.groomName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.primaryPhone.includes(searchQuery);

    if (!matchesSearch) return false;

    // Month filtering based on ceremony date
    if (monthFilter !== 'all') {
      // Skip filtering if no ceremony date
      if (!client.ceremonyDate || client.ceremonyDate === "-") {
        return false;
      }
      
      const ceremonyDate = new Date(client.ceremonyDate);
      const monthIndex = ceremonyDate.getMonth(); // 0-11
      
      const monthMap = {
        'january': 0, 'february': 1, 'march': 2, 'april': 3,
        'may': 4, 'june': 5, 'july': 6, 'august': 7,
        'september': 8, 'october': 9, 'november': 10, 'december': 11
      };
      
      return monthIndex === monthMap[monthFilter];
    }

    return true;
  });

  // Sort clients
  const sortedClients = [...filteredClients];
  if (sortField && sortOrder) {
    sortedClients.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      if (sortField === 'ceremonyDate' || sortField === 'receptionDate') {
        // Handle date sorting
        aValue = a[sortField] && a[sortField] !== "-" ? new Date(a[sortField]).getTime() : 0;
        bValue = b[sortField] && b[sortField] !== "-" ? new Date(b[sortField]).getTime() : 0;
      } else {
        // Handle name sorting
        aValue = a[sortField].toLowerCase();
        bValue = b[sortField].toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }

  // Pagination
  const totalPages = Math.ceil(sortedClients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentClients = sortedClients.slice(startIndex, endIndex);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
    setSortMenu(false);
  };

  const openDeleteModal = (clientId: string, clientName: string) => {
    setDeleteModal({
      isOpen: true,
      clientId,
      clientName,
    });
  };

  const closeDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      clientId: null,
      clientName: null,
    });
  };

  const handleDelete = async () => {
    if (!deleteModal.clientId) return;

    setDeleting(true);
    try {
      const response = await fetch(
        `/api/clients/${deleteModal.clientId}/delete`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        closeDeleteModal();
        setToast({
          isOpen: true,
          message: "Client deleted successfully",
          type: "success",
        });

        // Reload after showing toast
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        const data = await response.json();
        setToast({
          isOpen: true,
          message: data.message || "Failed to delete client",
          type: "error",
        });
      }
    } catch {
      setToast({
        isOpen: true,
        message: "Failed to delete client",
        type: "error",
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl border-2 border-[#d4b896] shadow-lg" style={{ overflow: 'visible' }}>
        {/* Search and Filters - Responsive */}
        <div className="p-4 sm:p-6 border-b border-[#d4b896]" style={{ overflow: 'visible' }}>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                search
              </span>
              <input
                type="text"
                placeholder="Cari Klien..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border-2 border-[#d4b896] rounded-lg pl-12 pr-4 py-3 text-sm md:text-base text-black placeholder:text-gray-500 focus:outline-none focus:border-[#c4a886]"
              />
            </div>
            <div className="flex items-center gap-2 sm:gap-4 relative">
              {/* Filter Button */}
              <div className="relative">
                <button 
                  onClick={() => setShowFilterMenu(!showFilterMenu)}
                  className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs sm:text-sm md:text-base text-gray-600 hover:text-black transition-colors border border-[#d4b896] rounded-lg min-w-0"
                >
                  <span className="material-symbols-outlined text-lg sm:text-xl">filter_list</span>
                  <span className="hidden sm:inline whitespace-nowrap">Filter</span>
                  <span className="sm:hidden text-xs">Filter</span>
                  {monthFilter !== 'all' && (
                    <span className="w-2 h-2 bg-[#d4b896] rounded-full flex-shrink-0"></span>
                  )}
                </button>

                {/* Filter Dropdown */}
                {showFilterMenu && (
                  <div className="absolute left-0 sm:right-0 top-full mt-2 w-48 sm:w-52 bg-white border-2 border-[#d4b896] rounded-lg shadow-lg z-50 max-w-[calc(100vw-2rem)] max-h-80 overflow-y-auto">
                    <div className="p-2">
                      <div className="text-xs font-medium text-gray-600 mb-2">
                        Filter berdasarkan Bulan Akad
                      </div>
                      {[
                        { value: 'all', label: 'Semua Bulan' },
                        { value: 'january', label: 'Januari' },
                        { value: 'february', label: 'Februari' },
                        { value: 'march', label: 'Maret' },
                        { value: 'april', label: 'April' },
                        { value: 'may', label: 'Mei' },
                        { value: 'june', label: 'Juni' },
                        { value: 'july', label: 'Juli' },
                        { value: 'august', label: 'Agustus' },
                        { value: 'september', label: 'September' },
                        { value: 'october', label: 'Oktober' },
                        { value: 'november', label: 'November' },
                        { value: 'december', label: 'Desember' }
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            setMonthFilter(option.value as any);
                            setShowFilterMenu(false);
                            setCurrentPage(1); // Reset to first page
                          }}
                          className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100 transition-colors ${
                            monthFilter === option.value ? 'text-[#d4b896] bg-[#d4b896]/10' : 'text-gray-700'
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
                  onClick={() => setSortMenu(!showSortMenu)}
                  className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs sm:text-sm md:text-base text-gray-600 hover:text-black transition-colors border border-[#d4b896] rounded-lg min-w-0"
                >
                  <span className="material-symbols-outlined text-lg sm:text-xl">swap_vert</span>
                  <span className="hidden sm:inline whitespace-nowrap">Urutkan</span>
                  <span className="sm:hidden text-xs">Sort</span>
                  {sortField && (
                    <span className="w-2 h-2 bg-[#d4b896] rounded-full flex-shrink-0"></span>
                  )}
                </button>

                {/* Sort Dropdown */}
                {showSortMenu && (
                  <div className="absolute left-0 sm:right-0 top-full mt-2 w-48 sm:w-52 bg-white border-2 border-[#d4b896] rounded-lg shadow-lg z-50 max-w-[calc(100vw-2rem)]">
                    <div className="p-2">
                      <div className="text-xs font-medium text-gray-600 mb-2">
                        Urutkan berdasarkan
                      </div>
                      {[
                        { field: 'brideName', label: 'Mempelai Wanita' },
                        { field: 'ceremonyDate', label: 'Tanggal Akad' },
                        { field: 'receptionDate', label: 'Tanggal Resepsi' }
                      ].map((option) => (
                        <button
                          key={option.field}
                          onClick={() => handleSort(option.field as SortField)}
                          className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100 transition-colors flex items-center justify-between ${
                            sortField === option.field ? 'text-[#d4b896]' : 'text-gray-700'
                          }`}
                        >
                          <span>{option.label}</span>
                          {sortField === option.field && (
                            <span className="material-symbols-outlined text-sm text-[#d4b896]">
                              {sortOrder === 'asc' ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Items per page selector */}
              <div className="relative">
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1); // Reset to first page
                  }}
                  className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs sm:text-sm md:text-base text-gray-600 border border-[#d4b896] rounded-lg focus:outline-none focus:border-[#c4a886] min-w-0"
                >
                  <option value={10}>10/hal</option>
                  <option value={25}>25/hal</option>
                  <option value={50}>50/hal</option>
                  <option value={100}>100/hal</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Table - Responsive with horizontal scroll */}
        <div className="overflow-x-auto" style={{ overflowY: 'visible' }}>
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-[#d4b896]">
                <th className="px-6 py-4 text-left text-xs font-medium text-[#d4b896] uppercase tracking-wider">
                  Mempelai Wanita
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-[#d4b896] uppercase tracking-wider">
                  Mempelai Pria
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-[#d4b896] uppercase tracking-wider">
                  Nomor Telephone Wanita
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-[#d4b896] uppercase tracking-wider">
                  Nomor Telephone Pria
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-[#d4b896] uppercase tracking-wider">
                  Tanggal Akad
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-[#d4b896] uppercase tracking-wider">
                  Tanggal Resepsi
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-[#d4b896] uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d4b896]/30">
              {currentClients.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    {searchQuery || monthFilter !== 'all'
                    ? "No clients found matching your search."
                      : "No clients yet. Add your first client!"}
                  </td>
                </tr>
              ) : (
                currentClients.map((client) => (
                  <tr
                    key={client.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-black font-medium">{client.brideName}</td>
                    <td className="px-6 py-4 text-gray-700">
                      {client.groomName}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      <WhatsAppLink 
                        phoneNumber={client.primaryPhone} 
                        label={`HP Pengantin Wanita - ${client.brideName}`}
                      />
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {client.secondaryPhone ? (
                        <WhatsAppLink 
                          phoneNumber={client.secondaryPhone} 
                          label={`HP Pengantin Pria - ${client.groomName}`}
                        />
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {client.ceremonyDate}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {client.receptionDate}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/clients/${client.id}/edit`}
                          className="p-2 text-gray-500 hover:text-[#d4b896] transition-colors"
                          title="Edit client"
                        >
                          <span className="material-symbols-outlined text-xl">
                            edit
                          </span>
                        </Link>
                        <button
                          onClick={() =>
                            openDeleteModal(client.id, client.brideName)
                          }
                          className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                          title="Delete client"
                        >
                          <span className="material-symbols-outlined text-xl">
                            delete
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {sortedClients.length > 0 && (
          <div className="px-6 py-4 border-t border-[#d4b896] flex items-center justify-between bg-gray-50">
            <div className="text-sm text-gray-600">
              Menampilkan {startIndex + 1}-
              {Math.min(endIndex, sortedClients.length)} of{" "}
              {sortedClients.length} Klien
              {(searchQuery || monthFilter !== 'all' || sortField) && (
                <span className="ml-2 text-xs">
                  (filtered/sorted)
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-2 sm:px-3 md:px-4 py-2 text-xs sm:text-sm text-gray-600 hover:text-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-[#d4b896] rounded-lg min-w-0"
              >
                <span className="material-symbols-outlined text-lg sm:text-xl">chevron_left</span>
                <span className="hidden sm:inline whitespace-nowrap">Sebelumnya</span>
                <span className="sm:hidden text-xs">Prev</span>
              </button>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 px-2 sm:px-3 md:px-4 py-2 text-xs sm:text-sm text-gray-600 hover:text-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-[#d4b896] rounded-lg min-w-0"
              >
                <span className="hidden sm:inline whitespace-nowrap">Selanjutnya</span>
                <span className="sm:hidden text-xs">Next</span>
                <span className="material-symbols-outlined text-lg sm:text-xl">chevron_right</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close dropdowns */}
      {(showFilterMenu || showSortMenu) && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => {
            setShowFilterMenu(false);
            setSortMenu(false);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        title="Delete Client"
        description={`Apakah Anda yakin ingin menghapus ${deleteModal.clientName}? Tindakan ini tidak dapat dibatalkan..`}
        loading={deleting}
      />

      <Toast
        isOpen={toast.isOpen}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, isOpen: false })}
      />
    </>
  );
}
