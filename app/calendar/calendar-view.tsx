"use client";

import { useState } from 'react';
import CalendarGrid from './calendar-grid';
import UpcomingAppointments from './upcoming-appointments';
import AppointmentModal from './appointment-modal';
import AppointmentsListModal from './appointments-list-modal';
import { Button } from '@/components/ui/button';
import { Appointment, Client } from '@/lib/types';

interface Props {
  appointments: Appointment[];
  clients: Client[];
}

export default function CalendarView({ appointments, clients }: Props) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isListModalOpen, setIsListModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);

  const handleNewAppointment = (date?: Date) => {
    setSelectedDate(date || new Date());
    setEditingAppointment(null);
    setIsModalOpen(true);
  };

  const handleEditAppointment = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setIsModalOpen(true);
  };

  const handleDateClick = (date: Date) => {
    const dayAppointments = appointments.filter(apt => {
      const aptDate = new Date(apt.startTime);
      return aptDate.toDateString() === date.toDateString();
    });

    if (dayAppointments.length === 0) {
      // No appointments, create new one
      handleNewAppointment(date);
    } else {
      // Show appointments list modal
      setSelectedDate(date);
      setIsListModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDate(null);
    setEditingAppointment(null);
  };

  const handleCloseListModal = () => {
    setIsListModalOpen(false);
    setSelectedDate(null);
  };

  const handleSuccess = () => {
    handleCloseModal();
    window.location.reload();
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-black mb-2">Calendar</h1>
          <p className="text-sm md:text-base text-gray-600">Manage your client appointments and schedule.</p>
        </div>
        <Button
          onClick={() => handleNewAppointment()}
          className="bg-[#d4b896] hover:bg-[#c4a886] text-black w-full sm:w-auto"
        >
          <span className="flex items-center gap-2">
            <span className="material-symbols-outlined">add</span>
            <span className="hidden sm:inline">New Appointment</span>
            <span className="sm:hidden">New</span>
          </span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-2">
          <CalendarGrid
            currentDate={currentDate}
            setCurrentDate={setCurrentDate}
            appointments={appointments}
            onDateClick={handleDateClick}
            onAppointmentClick={handleEditAppointment}
          />
        </div>
        
        <div className="lg:col-span-1">
          <UpcomingAppointments
            appointments={appointments}
            onAppointmentClick={handleEditAppointment}
          />
        </div>
      </div>

      <AppointmentModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleSuccess}
        clients={clients}
        selectedDate={selectedDate}
        editingAppointment={editingAppointment}
      />

      <AppointmentsListModal
        isOpen={isListModalOpen}
        onClose={handleCloseListModal}
        date={selectedDate}
        appointments={appointments}
        onAppointmentClick={handleEditAppointment}
        onNewAppointment={handleNewAppointment}
      />
    </>
  );
}