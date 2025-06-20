import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Reminder } from '../../../store/slices/simpleRemindersSlice';

interface CalendarViewProps {
  reminders: Reminder[];
}

const CalendarView: React.FC<CalendarViewProps> = ({ reminders }) => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState<Date>(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );

  const prevMonth = () => {
    setCurrentMonth(
      new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() - 1,
        1
      )
    );
  };

  const nextMonth = () => {
    setCurrentMonth(
      new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() + 1,
        1
      )
    );
  };

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDay = new Date(year, month, 1).getDay();

  // Build weeks array
  const weeks: (number | null)[][] = [];
  let week: (number | null)[] = Array(startDay).fill(null);
  for (let day = 1; day <= daysInMonth; day++) {
    week.push(day);
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }
  if (week.length) {
    while (week.length < 7) week.push(null);
    weeks.push(week);
  }

  const formatYMD = (d: Date) => {
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${mm}-${dd}`;
  };

  return (
    <div className="mt-8 bg-white dark:bg-gray-800 p-4 rounded shadow">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
        >
          <ChevronLeft />
        </button>
        <h3 className="text-lg font-semibold dark:text-gray-100">
          {currentMonth.toLocaleString('default', { month: 'long' })} {year}
        </h3>
        <button
          onClick={nextMonth}
          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
        >
          <ChevronRight />
        </button>
      </div>
      <div className="grid grid-cols-7 text-center font-medium text-gray-600 dark:text-gray-400">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} className="p-2">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {weeks.map((w, wi) =>
          w.map((day, di) => {
            const isToday =
              day === today.getDate() &&
              month === today.getMonth() &&
              year === today.getFullYear();
            const cellDate = day
              ? formatYMD(new Date(year, month, day))
              : '';
            const dayReminders = reminders.filter(r =>
              r.datetime.startsWith(cellDate)
            );
            return (
              <div
                key={`${wi}-${di}`}
                className={`h-24 p-1 border rounded ${
                  isToday
                    ? 'bg-blue-100 dark:bg-blue-900'
                    : 'bg-white dark:bg-gray-700'
                }`}
              >
                {day && (
                  <>
                    <div className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      {day}
                    </div>
                    {dayReminders.map(r => (
                      <div
                        key={r.id}
                        className="text-xs text-gray-600 dark:text-gray-300 truncate"
                      >
                        {r.title}
                      </div>
                    ))}
                  </>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default CalendarView;
