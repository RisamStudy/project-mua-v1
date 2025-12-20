"use client";

import { Appointment } from '@/lib/types';

interface Props {
  appointments: Appointment[];
  onAppointmentClick: (appointment: Appointment) => void;
}

export default function UpcomingAppointments({ appointments, onAppointmentClick }: Props) {
  const now = new Date();
  
  // Filter upcoming appointments (today and future)
  const upcomingAppointments = appointments
    .filter(apt => {
      const aptDate = new Date(apt.startTime);
      // Set both dates to start of day for fair comparison
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      aptDate.setHours(0, 0, 0, 0);
      return aptDate >= today;
    })
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    .slice(0, 10);

  const formatTime = (startStr: string, endStr: string) => {
    const start = new Date(startStr);
    const end = new Date(endStr);
    
    const formatTimeStr = (date: Date) => {
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    };
    
    return `${formatTimeStr(start)} - ${formatTimeStr(end)}`;
  };

  const getMonthAndDay = (dateStr: string) => {
    const date = new Date(dateStr);
    return {
      month: date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
      day: date.getDate(),
    };
  };

  return (
    <div className="bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl p-6">
      <h2 className="text-xl font-bold text-white mb-6">Upcoming Appointments</h2>
      
      {upcomingAppointments.length === 0 ? (
        <p className="text-gray-400 text-center py-8">No upcoming appointments</p>
      ) : (
        <div className="space-y-4">
          {upcomingAppointments.map(apt => {
            const dateInfo = getMonthAndDay(apt.startTime);
            
            return (
              <div
                key={apt.id}
                onClick={() => onAppointmentClick(apt)}
                className="flex gap-4 p-4 rounded-lg bg-[#1a1a1a] hover:bg-[#252525] transition-colors cursor-pointer"
              >
                <div
                  className="flex flex-col items-center justify-center w-16 h-16 rounded-lg text-white font-bold shrink-0"
                  style={{ backgroundColor: apt.color }}
                >
                  <span className="text-xs">{dateInfo.month}</span>
                  <span className="text-2xl">{dateInfo.day}</span>
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold truncate">
                    {apt.client ? apt.client.brideName : apt.title}
                  </h3>
                  <p className="text-sm text-gray-400 truncate">
                    {apt.description || (apt.client ? apt.client.groomName : 'No description')}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatTime(apt.startTime, apt.endTime)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}