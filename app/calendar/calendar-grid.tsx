"use client";

import { Appointment } from '@/lib/types';

interface Props {
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  appointments: Appointment[];
  onDateClick: (date: Date) => void;
  onAppointmentClick: (appointment: Appointment) => void;
}

export default function CalendarGrid({
  currentDate,
  setCurrentDate,
  appointments,
  onDateClick,
  onAppointmentClick,
}: Props) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  // Get first day of month and number of days
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  // Generate calendar days
  const calendarDays = [];
  
  // Previous month days
  for (let i = firstDay - 1; i >= 0; i--) {
    calendarDays.push({
      day: daysInPrevMonth - i,
      isCurrentMonth: false,
      date: new Date(year, month - 1, daysInPrevMonth - i),
    });
  }
  
  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push({
      day: i,
      isCurrentMonth: true,
      date: new Date(year, month, i),
    });
  }
  
  // Next month days to fill the grid
  const remainingDays = 42 - calendarDays.length;
  for (let i = 1; i <= remainingDays; i++) {
    calendarDays.push({
      day: i,
      isCurrentMonth: false,
      date: new Date(year, month + 1, i),
    });
  }

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter(apt => {
      const aptDate = new Date(apt.startTime);
      return aptDate.toDateString() === date.toDateString();
    });
  };

  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <div className="bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl overflow-hidden">
      {/* Calendar Header - Responsive */}
      <div className="p-4 sm:p-6 border-b border-[#2a2a2a] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-xl md:text-2xl font-bold text-white">
          {monthNames[month]} {year}
        </h2>
        <div className="flex items-center gap-2 justify-end">
          <button
            onClick={previousMonth}
            className="p-2 text-gray-400 hover:text-white hover:bg-[#1a1a1a] rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <button
            onClick={goToToday}
            className="px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-400 hover:text-white hover:bg-[#1a1a1a] rounded-lg transition-colors"
          >
            Today
          </button>
          <button
            onClick={nextMonth}
            className="p-2 text-gray-400 hover:text-white hover:bg-[#1a1a1a] rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </div>

      {/* Calendar Grid - Responsive */}
      <div className="p-2 sm:p-4">
        {/* Day Names */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
          {dayNames.map(day => (
            <div key={day} className="text-center text-[10px] sm:text-xs font-medium text-gray-400 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {calendarDays.map((day, index) => {
            const dayAppointments = getAppointmentsForDate(day.date);
            const isTodayDate = isToday(day.date);

            return (
              <div
                key={index}
                onClick={() => day.isCurrentMonth && onDateClick(day.date)}
                className={`min-h-[60px] sm:min-h-[80px] md:min-h-[100px] p-1 sm:p-2 rounded-lg border transition-colors cursor-pointer ${
                  day.isCurrentMonth
                    ? 'border-[#2a2a2a] bg-[#1a1a1a] hover:border-[#d4b896]'
                    : 'border-transparent bg-[#0a0a0a]'
                }`}
              >
                <div className="flex items-center justify-center mb-1">
                  <span
                    className={`text-xs sm:text-sm font-medium ${
                      isTodayDate
                        ? 'bg-[#d4b896] hover:bg-[#c4a886] text-black w-5 h-5 sm:w-7 sm:h-7 rounded-full flex items-center justify-center'
                        : day.isCurrentMonth
                        ? 'text-white'
                        : 'text-gray-600'
                    }`}
                  >
                    {day.day}
                  </span>
                </div>

                {/* Appointments - Hidden on smallest screens */}
                <div className="hidden sm:block space-y-1">
                  {dayAppointments.slice(0, 2).map(apt => (
                    <div
                      key={apt.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onAppointmentClick(apt);
                      }}
                      className="text-[10px] sm:text-xs px-1 sm:px-2 py-1 rounded truncate hover:opacity-80 transition-opacity"
                      style={{ backgroundColor: apt.color }}
                      title={apt.title}
                    >
                      {apt.client ? `${apt.client.brideName.split(' ')[0]}...` : apt.title}
                    </div>
                  ))}
                  {dayAppointments.length > 2 && (
                    <div className="text-[10px] sm:text-xs text-gray-400 px-1 sm:px-2">
                      +{dayAppointments.length - 2}
                    </div>
                  )}
                </div>

                {/* Appointment Dots for Mobile */}
                {dayAppointments.length > 0 && (
                  <div className="sm:hidden flex justify-center gap-1 mt-1">
                    {dayAppointments.slice(0, 3).map((apt, idx) => (
                      <div
                        key={idx}
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: apt.color }}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}