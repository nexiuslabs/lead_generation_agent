import React, { useState, useMemo } from 'react';
import { Search } from 'lucide-react';

export interface Reminder {
  id: number;
  title: string;
  datetime: string;
}

interface ReminderListProps {
  reminders: Reminder[];
}

const ReminderList: React.FC<ReminderListProps> = ({ reminders }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const filteredReminders = useMemo(
    () =>
      reminders.filter(r =>
        r.title.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [reminders, searchTerm]
  );
  const groupedReminders = useMemo(() => {
    const groups: Record<string, Reminder[]> = {};
    filteredReminders.forEach(r => {
      const dateObj = new Date(r.datetime);
      const dateKey = dateObj.toDateString();
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(r);
    });
    Object.keys(groups).forEach(key => {
      groups[key].sort(
        (a, b) =>
          new Date(a.datetime).getTime() - new Date(b.datetime).getTime()
      );
    });
    return groups;
  }, [filteredReminders]);
  const sortedDateKeys = useMemo(
    () =>
      Object.keys(groupedReminders).sort(
        (a, b) => new Date(b).getTime() - new Date(a).getTime()
      ),
    [groupedReminders]
  );
  return (
    <div>
      <div className="mb-4 relative">
        <Search className="absolute left-3 top-3 text-gray-400" />
        <input
          type="text"
          placeholder="Search reminders..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>
      {filteredReminders.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-400">
          {reminders.length === 0
            ? 'No reminders set.'
            : 'No reminders found.'}
        </p>
      ) : (
        sortedDateKeys.map(dateKey => {
          const dateObj = new Date(dateKey);
          let label = dateObj.toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          });
          const todayKey = new Date().toDateString();
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayKey = yesterday.toDateString();
          if (dateKey === todayKey) label = 'Today';
          else if (dateKey === yesterdayKey) label = 'Yesterday';
          return (
            <div key={dateKey} className="mb-6">
              <h3 className="text-gray-700 dark:text-gray-300 font-semibold mb-2">
                {label}
              </h3>
              <ul className="ml-4 list-disc space-y-1">
                {groupedReminders[dateKey].map(r => {
                  const time = new Date(r.datetime).toLocaleTimeString(
                    undefined,
                    { hour: 'numeric', minute: '2-digit' }
                  );
                  return (
                    <li
                      key={r.id}
                      className="flex justify-between text-gray-800 dark:text-gray-200"
                    >
                      <span>{r.title}</span>
                      <span className="text-gray-600 dark:text-gray-400 text-sm">
                        {time}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })
      )}
    </div>
  );
};

export default ReminderList;
