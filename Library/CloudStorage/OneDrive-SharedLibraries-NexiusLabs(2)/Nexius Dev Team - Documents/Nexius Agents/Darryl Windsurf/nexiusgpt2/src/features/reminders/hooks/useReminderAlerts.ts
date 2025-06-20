import { useEffect } from 'react';
import { useAppDispatch } from '../../../store';
import { showToast } from '../../../store/slices/uiSlice';
import { markNotified } from '../../../store/slices/remindersSlice';
import type { Reminder } from '../api/microsoftGraphApi';

/**
 * Hook to fire in-app toasts, optional browser notifications, and sound when reminders become due.
 */
export function useReminderAlerts(reminders: Reminder[]) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Request browser notification permission if not decided
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    const interval = setInterval(() => {
      const now = Date.now();
      reminders.forEach(r => {
        if (!r.notified && new Date(r.dateTime).getTime() <= now) {
          // In-app toast
          dispatch(showToast({ message: `🔔 Reminder: ${r.title}`, type: 'info' }));
          // Play alert sound
          new Audio('https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg')
            .play()
            .catch(() => {});
          // Browser notification
          if (Notification.permission === 'granted') {
            new Notification('Reminder due', { body: r.title });
          }
          // Mark as notified to avoid repeats
          dispatch(markNotified(r.id!));
        }
      });
    }, 30000);

    return () => clearInterval(interval);
  }, [reminders, dispatch]);
}
