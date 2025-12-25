"use client";

import { useState } from "react";
import { Appointment } from "@/lib/types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  date: Date | null;
  appointments: Appointment[];
  onAppointmentClick: (appointment: Appointment) => void;
  onNewAppointment: (date: Date) => void;
}

export default function AppointmentsListModal({
  isOpen,
  onClose,
  date,
  appointments,
  onAppointmentClick,
  onNewAppointment,
}: Props) {
  if (!isOpen || !date) return null;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const dayAppointments = appointments.filter((apt) => {
    const aptDate = new Date(apt.startTime);
    return aptDate.toDateString() === date.toDateString();
  });

  // Sort appointments by start time
  const sortedAppointments = dayAppointments.sort((a, b) => 
    new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl border-2 border-[#d4b896] w-full max-w-md max-h-[80vh] overflow-hidden shadow-xl">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-[#d4b896] flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-black">
              Jadwal Hari Ini
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              {formatDate(date)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-black hover:bg-gray-100 rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 max-h-[60vh] overflow-y-auto">
          {sortedAppointments.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl text-gray-400">
                  event_available
                </span>
              </div>
              <p className="text-gray-500 text-sm mb-4">
                Tidak ada jadwal pada tanggal ini
              </p>
              <button
                onClick={() => {
                  onNewAppointment(date);
                  onClose();
                }}
                className="bg-[#d4b896] hover:bg-[#c4a886] text-black px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Tambah Jadwal
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  onClick={() => {
                    onAppointmentClick(appointment);
                    onClose();
                  }}
                  className="p-3 sm:p-4 border border-[#d4b896] rounded-lg hover:border-[#c4a886] hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0 mt-1"
                      style={{ backgroundColor: appointment.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm sm:text-base font-semibold text-black mb-1">
                        {appointment.title}
                      </h3>
                      {appointment.client && (
                        <p className="text-xs sm:text-sm text-gray-600 mb-1">
                          {appointment.client.brideName} & {appointment.client.groomName}
                        </p>
                      )}
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="material-symbols-outlined text-sm">
                          schedule
                        </span>
                        <span>
                          {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
                        </span>
                      </div>
                      {appointment.description && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {appointment.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {sortedAppointments.length > 0 && (
          <div className="p-4 sm:p-6 border-t border-[#d4b896] bg-gray-50">
            <button
              onClick={() => {
                onNewAppointment(date);
                onClose();
              }}
              className="w-full bg-[#d4b896] hover:bg-[#c4a886] text-black px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">add</span>
              <span>Tambah Jadwal Baru</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}