import React, { useEffect } from 'react';
import axios from 'axios';
import { useAppDispatch, useAppSelector } from '../../store';
import { setReminders, addReminder } from '../../store/slices/simpleRemindersSlice';
import ReminderList from './components/ReminderList';
import SimpleReminderForm from './components/SimpleReminderForm';
import CalendarView from './components/CalendarView';

const RemindersPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const reminders = useAppSelector(state => state.simpleReminders.items);

  useEffect(() => {
    axios.get('/api/reminders')
      .then(res => dispatch(setReminders(res.data)))
      .catch(err => {
        console.error('Failed to fetch reminders:', err);
        const sampleReminders = [
          { id: 1, title: 'Call Alice', datetime: '2025-06-12T15:00:00' },
          { id: 2, title: 'Team meeting', datetime: '2025-06-13T09:00:00' }
        ];
        dispatch(setReminders(sampleReminders));
      });
  }, [dispatch]);

  const handleAddReminder = (newReminder: { title: string; datetime: string }) => {
    axios.post('/api/reminders', newReminder)
      .then(res => {
        const saved = res.data && res.data.id ? res.data : { ...newReminder, id: Date.now() };
        dispatch(addReminder(saved));
      })
      .catch(err => {
        console.error('Failed to add reminder:', err);
        dispatch(addReminder({ ...newReminder, id: Date.now() }));
      });
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white dark:bg-dark rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Reminders</h1>
      <ReminderList reminders={reminders} />
      <hr className="my-6 border-gray-300 dark:border-gray-600" />
      <h2 className="text-xl font-semibold mb-4">Calendar View</h2>
      <CalendarView reminders={reminders} />
      <hr className="my-6 border-gray-300 dark:border-gray-600" />
      <h2 className="text-xl font-semibold mb-4">Add a New Reminder</h2>
      <SimpleReminderForm onAdd={handleAddReminder} />
    </div>
  );
};

export default RemindersPage;
