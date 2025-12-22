"use client";

import { useState } from "react";
import Link from "next/link";
import DeleteModal from "@/components/ui/delete-modal";
import Toast from "@/components/ui/toast";

interface Client {
  id: string;
  brideName: string;
  groomName: string;
  primaryPhone: string;
  secondaryPhone: string;
  ceremonyDate: string;
  receptionDate: string;
}

export default function ClientsTable({ clients }: { clients: Client[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
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

  // ✅ TOAST STATE - LETAKKAN DI SINI (setelah state lainnya)
  const [toast, setToast] = useState<{
    isOpen: boolean;
    message: string;
    type: "success" | "error";
  }>({
    isOpen: false,
    message: "",
    type: "success",
  });

  const itemsPerPage = 7;

  // Filter clients based on search
  const filteredClients = clients.filter(
    (client) =>
      client.brideName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.groomName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.primaryPhone.includes(searchQuery)
  );

  // Pagination
  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentClients = filteredClients.slice(startIndex, endIndex);

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

  // ✅ HANDLE DELETE DENGAN TOAST - GANTI FUNCTION INI
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
      <div className="bg-[#0f0f0f] rounded-xl border border-[#2a2a2a] overflow-hidden">
        {/* Search and Filters - Responsive */}
        <div className="p-4 sm:p-6 border-b border-[#2a2a2a]">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                search
              </span>
              <input
                type="text"
                placeholder="Cari Klien..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg pl-12 pr-4 py-3 text-sm md:text-base text-white placeholder:text-gray-500 focus:outline-none focus:border-[#d4b896]"
              />
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <button className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-3 text-sm md:text-base text-gray-400 hover:text-white transition-colors">
                <span className="material-symbols-outlined">filter_list</span>
                <span className="hidden sm:inline">Filter</span>
              </button>
              <button className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-3 text-sm md:text-base text-gray-400 hover:text-white transition-colors">
                <span className="material-symbols-outlined">swap_vert</span>
                <span className="hidden sm:inline">Sort</span>
              </button>
            </div>
          </div>
        </div>

        {/* Table - Responsive with horizontal scroll */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-[#2a2a2a]">
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Mempelai Wanita
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Mempelai Pria
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Nomor Telephone Wanita
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Nomor Telephone Pria
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Tanggal Akad
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Tanggal Resepsi
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2a2a]">
              {currentClients.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-gray-400"
                  >
                    {searchQuery
                      ? "No clients found matching your search."
                      : "No clients yet. Add your first client!"}
                  </td>
                </tr>
              ) : (
                currentClients.map((client) => (
                  <tr
                    key={client.id}
                    className="hover:bg-[#1a1a1a] transition-colors"
                  >
                    <td className="px-6 py-4 text-white">{client.brideName}</td>
                    <td className="px-6 py-4 text-gray-300">
                      {client.groomName}
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      {client.primaryPhone}
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      {client.secondaryPhone}
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      {client.ceremonyDate}
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      {client.receptionDate}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/clients/${client.id}/edit`}
                          className="p-2 text-gray-400 hover:text-[#d4b896] transition-colors"
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
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
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
        {filteredClients.length > 0 && (
          <div className="px-6 py-4 border-t border-[#2a2a2a] flex items-center justify-between">
            <div className="text-sm text-gray-400">
              Menampilkan {startIndex + 1}-
              {Math.min(endIndex, filteredClients.length)} of{" "}
              {filteredClients.length} Klien
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-4 py-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <span className="material-symbols-outlined">chevron_left</span>
                Sebelumnya
              </button>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 px-4 py-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Selanjutnya
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>
        )}
      </div>

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
