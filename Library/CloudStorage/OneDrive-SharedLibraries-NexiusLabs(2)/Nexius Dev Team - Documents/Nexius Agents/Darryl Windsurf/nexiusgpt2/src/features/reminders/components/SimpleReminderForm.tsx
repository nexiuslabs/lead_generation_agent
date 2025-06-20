import React, { useState } from 'react';

interface ReminderFormProps {
  onAdd: (newReminder: { title: string; datetime: string }) => void;
}

const SimpleReminderForm: React.FC<ReminderFormProps> = ({ onAdd }) => {
  const [title, setTitle] = useState('');
  const [datetime, setDatetime] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !datetime) {
      alert('Please enter a description and date/time for the reminder.');
      return;
    }
    onAdd({ title, datetime });
    setTitle('');
    setDatetime('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="reminder-title" className="block font-medium text-gray-700 mb-1">
          Reminder:
        </label>
        <input
          id="reminder-title"
          type="text"
          className="w-full border border-gray-300 rounded px-3 py-2"
          placeholder="What do you need to be reminded about?"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="reminder-datetime" className="block font-medium text-gray-700 mb-1">
          Date & Time:
        </label>
        <input
          id="reminder-datetime"
          type="datetime-local"
          className="w-60 border border-gray-300 rounded px-3 py-2"
          value={datetime}
          onChange={e => setDatetime(e.target.value)}
        />
      </div>
      <button
        type="submit"
        className="mt-3 bg-green-600 text-white font-semibold px-4 py-2 rounded hover:bg-green-700"
      >
        Save Reminder
      </button>
    </form>
  );
};

export default SimpleReminderForm;
