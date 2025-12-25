"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import DeleteModal from "@/components/ui/delete-modal";

interface Client {
  id: string;
  brideName: string;
  groomName: string;
}

interface Appointment {
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

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  clients: Client[];
  selectedDate: Date | null;
  editingAppointment: Appointment | null;
}

const colorOptions = [
  { label: "Gold", value: "#d4b896" },
  { label: "Pink", value: "#e91e63" },
  { label: "Purple", value: "#9c27b0" },
  { label: "Blue", value: "#2196f3" },
  { label: "Green", value: "#4caf50" },
  { label: "Teal", value: "#009688" },
];

export default function AppointmentModal({
  isOpen,
  onClose,
  onSuccess,
  clients,
  selectedDate,
  editingAppointment,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const formatDateForInput = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  const formatTimeForInput = (date: Date) => {
    return date.toTimeString().slice(0, 5);
  };

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: selectedDate
      ? formatDateForInput(selectedDate)
      : formatDateForInput(new Date()),
    startTime: "09:00",
    endTime: "10:00",
    clientId: "",
    color: "#d4b896",
  });

  useEffect(() => {
    if (editingAppointment) {
      const start = new Date(editingAppointment.startTime);
      const end = new Date(editingAppointment.endTime);

      setFormData({
        title: editingAppointment.title,
        description: editingAppointment.description || "",
        date: formatDateForInput(start),
        startTime: formatTimeForInput(start),
        endTime: formatTimeForInput(end),
        clientId: editingAppointment.client?.id || "",
        color: editingAppointment.color,
      });
    } else if (selectedDate) {
      setFormData((prev) => ({
        ...prev,
        date: formatDateForInput(selectedDate),
      }));
    }
  }, [editingAppointment, selectedDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const startDateTime = new Date(`${formData.date}T${formData.startTime}`);
      const endDateTime = new Date(`${formData.date}T${formData.endTime}`);

      const url = editingAppointment
        ? `/api/calendar/${editingAppointment.id}/update`
        : "/api/calendar/create";

      const response = await fetch(url, {
        method: editingAppointment ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description || null,
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
          clientId: formData.clientId || null,
          color: formData.color,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save appointment");
      }

      onSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!editingAppointment) return;

    setDeleting(true);
    try {
      const response = await fetch(
        `/api/calendar/${editingAppointment.id}/delete`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        setShowDeleteModal(false);
        onSuccess();
      } else {
        const data = await response.json();
        setError(data.message || "Failed to delete appointment");
      }
    } catch {
      setError("Failed to delete appointment");
    } finally {
      setDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        />

        <div className="relative bg-white border border-[#d4b896] rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-black">
              {editingAppointment ? "Edit Appointment" : "New Appointment"}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-600 hover:text-black"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Client Selection */}
            <div>
              <Label>Client (Optional)</Label>
              <select
                value={formData.clientId}
                onChange={(e) =>
                  setFormData({ ...formData, clientId: e.target.value })
                }
                className="w-full h-12 mt-2 rounded-lg border border-[#d4b896] bg-white px-4 text-black focus:ring-2 focus:ring-[#d4b896]/50 focus:outline-none"
              >
                <option value="">Select a client</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.brideName} & {client.groomName}
                  </option>
                ))}
              </select>
            </div>

            {/* Title */}
            <div>
              <Label>Title</Label>
              <Input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="e.g., Bridal Makeup"
                required
                className="mt-2"
              />
            </div>

            {/* Description */}
            <div>
              <Label>Description</Label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Add notes about this appointment..."
                rows={3}
                className="w-full mt-2 rounded-lg border border-[#d4b896] bg-white px-4 py-3 text-black focus:ring-2 focus:ring-[#d4b896]/50 focus:outline-none resize-none"
              />
            </div>

            {/* Date */}
            <div>
              <Label>Date</Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                required
                className="mt-2"
              />
            </div>

            {/* Time Range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Time</Label>
                <Input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) =>
                    setFormData({ ...formData, startTime: e.target.value })
                  }
                  required
                  className="mt-2"
                />
              </div>
              <div>
                <Label>End Time</Label>
                <Input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) =>
                    setFormData({ ...formData, endTime: e.target.value })
                  }
                  required
                  className="mt-2"
                />
              </div>
            </div>

            {/* Color */}
            <div>
              <Label>Color</Label>
              <div className="grid grid-cols-6 gap-2 mt-2">
                {colorOptions.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, color: color.value })
                    }
                    className={`h-10 rounded-lg border-2 transition-all ${
                      formData.color === color.value
                        ? "border-white scale-110"
                        : "border-transparent hover:scale-105"
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.label}
                  />
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-6 border-t border-[#d4b896]">
              <div>
                {editingAppointment && (
                  <Button
                    type="button"
                    onClick={() => setShowDeleteModal(true)}
                    className="bg-red-500 hover:bg-red-600 text-white"
                  >
                    Delete
                  </Button>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 text-gray-600 hover:text-black transition-colors"
                >
                  Cancel
                </button>
                <Button type="submit" disabled={loading}>
                  {loading
                    ? "Saving..."
                    : editingAppointment
                    ? "Update"
                    : "Create"}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Appointment"
        description="Are you sure you want to delete this appointment? This action cannot be undone."
        loading={deleting}
      />
    </>
  );
}
