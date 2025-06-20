/**
 * Microsoft Graph API integration for calendar and tasks
 */

interface GraphApiResponse<T> {
  value?: T[];
  data?: T;
}

interface CalendarEvent {
  id?: string;
  subject: string;
  body: {
    contentType: string;
    content: string;
  };
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  isReminderOn: boolean;
  reminderMinutesBeforeStart: number;
}

interface TodoTask {
  id?: string;
  title: string;
  body?: {
    content: string;
    contentType: string;
  };
  dueDateTime?: {
    dateTime: string;
    timeZone: string;
  };
  reminderDateTime?: {
    dateTime: string;
    timeZone: string;
  };
  importance: 'low' | 'normal' | 'high';
  status: 'notStarted' | 'inProgress' | 'completed';
}

interface Reminder {
  id: string;
  title: string;
  description?: string;
  dateTime: string;
  type: 'calendar' | 'task';
  importance: 'low' | 'normal' | 'high';
  reminderMinutes: number;
  createdAt: string;
  status: 'pending' | 'completed' | 'cancelled';
  notified?: boolean;
  microsoftId?: string;
}

class MicrosoftGraphApi {
  private baseUrl = 'https://graph.microsoft.com/v1.0';
  private accessToken: string | null = null;

  constructor() {
    this.accessToken = localStorage.getItem('msGraphToken');
  }

  private async getHeaders(): Promise<Record<string, string>> {
    if (!this.accessToken) {
      throw new Error('Microsoft Graph access token not found. Please connect your Microsoft 365 account.');
    }

    return {
      'Authorization': `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json',
    };
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers = await this.getHeaders();
    
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('msGraphToken');
        throw new Error('Microsoft 365 authentication expired. Please reconnect your account.');
      }
      
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.error?.message || `Microsoft Graph API error: ${response.status}`);
    }

    return response.json();
  }

  // Calendar Events
  async createCalendarEvent(event: CalendarEvent): Promise<CalendarEvent> {
    return this.request<CalendarEvent>('/me/events', {
      method: 'POST',
      body: JSON.stringify(event),
    });
  }

  async getCalendarEvents(startTime?: string, endTime?: string): Promise<CalendarEvent[]> {
    let endpoint = '/me/events';
    const params = new URLSearchParams();
    
    if (startTime) params.append('$filter', `start/dateTime ge '${startTime}'`);
    if (endTime) params.append('$filter', `end/dateTime le '${endTime}'`);
    
    if (params.toString()) {
      endpoint += `?${params.toString()}`;
    }

    const response = await this.request<GraphApiResponse<CalendarEvent>>(endpoint);
    return response.value || [];
  }

  async updateCalendarEvent(eventId: string, updates: Partial<CalendarEvent>): Promise<CalendarEvent> {
    return this.request<CalendarEvent>(`/me/events/${eventId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async deleteCalendarEvent(eventId: string): Promise<void> {
    await this.request(`/me/events/${eventId}`, {
      method: 'DELETE',
    });
  }

  // Todo Tasks
  async createTodoTask(task: TodoTask, listId: string = 'tasks'): Promise<TodoTask> {
    return this.request<TodoTask>(`/me/todo/lists/${listId}/tasks`, {
      method: 'POST',
      body: JSON.stringify(task),
    });
  }

  async getTodoTasks(listId: string = 'tasks'): Promise<TodoTask[]> {
    const response = await this.request<GraphApiResponse<TodoTask>>(`/me/todo/lists/${listId}/tasks`);
    return response.value || [];
  }

  async updateTodoTask(taskId: string, updates: Partial<TodoTask>, listId: string = 'tasks'): Promise<TodoTask> {
    return this.request<TodoTask>(`/me/todo/lists/${listId}/tasks/${taskId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async deleteTodoTask(taskId: string, listId: string = 'tasks'): Promise<void> {
    await this.request(`/me/todo/lists/${listId}/tasks/${taskId}`, {
      method: 'DELETE',
    });
  }

  // User Profile
  async getUserProfile(): Promise<any> {
    return this.request('/me');
  }

  // Check if user has required permissions
  async checkPermissions(): Promise<{ calendar: boolean; tasks: boolean }> {
    try {
      // Try to access calendar
      await this.request('/me/events?$top=1');
      const calendar = true;
      
      // Try to access tasks
      await this.request('/me/todo/lists');
      const tasks = true;
      
      return { calendar, tasks };
    } catch (error) {
      // Parse error to determine which permissions are missing
      const errorMessage = error instanceof Error ? error.message : '';
      return {
        calendar: !errorMessage.includes('calendar') && !errorMessage.includes('Calendars'),
        tasks: !errorMessage.includes('task') && !errorMessage.includes('Tasks'),
      };
    }
  }
}

// Reminder service that abstracts Microsoft Graph operations
export class ReminderService {
  private graphApi: MicrosoftGraphApi;

  constructor() {
    this.graphApi = new MicrosoftGraphApi();
  }

  async createReminder(reminder: Omit<Reminder, 'id' | 'createdAt' | 'status' | 'microsoftId'>): Promise<Reminder> {
    const now = new Date().toISOString();
    const reminderDateTime = new Date(reminder.dateTime);
    const endDateTime = new Date(reminderDateTime.getTime() + 60 * 60 * 1000); // 1 hour default duration

    try {
      let microsoftId: string;

      if (reminder.type === 'calendar') {
        // Create calendar event
        const event: CalendarEvent = {
          subject: reminder.title,
          body: {
            contentType: 'text',
            content: reminder.description || '',
          },
          start: {
            dateTime: reminder.dateTime,
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
          end: {
            dateTime: endDateTime.toISOString(),
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
          isReminderOn: true,
          reminderMinutesBeforeStart: reminder.reminderMinutes,
        };

        const createdEvent = await this.graphApi.createCalendarEvent(event);
        microsoftId = createdEvent.id!;
      } else {
        // Create todo task
        const task: TodoTask = {
          title: reminder.title,
          body: reminder.description ? {
            content: reminder.description,
            contentType: 'text',
          } : undefined,
          dueDateTime: {
            dateTime: reminder.dateTime,
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
          reminderDateTime: {
            dateTime: new Date(reminderDateTime.getTime() - reminder.reminderMinutes * 60 * 1000).toISOString(),
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
          importance: reminder.importance,
          status: 'notStarted',
        };

        const createdTask = await this.graphApi.createTodoTask(task);
        microsoftId = createdTask.id!;
      }

      return {
        id: `reminder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...reminder,
        createdAt: now,
        status: 'pending',
        notified: false,
        microsoftId,
      };
    } catch (error) {
      console.error('Failed to create reminder:', error);
      throw error;
    }
  }

  async getReminders(): Promise<Reminder[]> {
    try {
      const now = new Date();
      const futureDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days ahead

      // Get calendar events
      const events = await this.graphApi.getCalendarEvents(now.toISOString(), futureDate.toISOString());
      const calendarReminders: Reminder[] = events.map(event => ({
        id: `calendar_${event.id}`,
        title: event.subject,
        description: event.body?.content || '',
        dateTime: event.start.dateTime,
        type: 'calendar',
        importance: 'normal',
        reminderMinutes: event.reminderMinutesBeforeStart || 15,
        createdAt: '', // Microsoft Graph doesn't provide creation time
        status: 'pending',
        notified: false,
        microsoftId: event.id,
      }));

      // Get todo tasks
      const tasks = await this.graphApi.getTodoTasks();
      const taskReminders: Reminder[] = tasks
        .filter(task => task.dueDateTime && new Date(task.dueDateTime.dateTime) > now)
        .map(task => ({
          id: `task_${task.id}`,
          title: task.title,
          description: task.body?.content || '',
          dateTime: task.dueDateTime!.dateTime,
          type: 'task',
          importance: task.importance,
          reminderMinutes: 15, // Default for tasks
          createdAt: '', // Microsoft Graph doesn't provide creation time
          status: task.status === 'completed' ? 'completed' : 'pending',
          notified: false,
          microsoftId: task.id,
        }));

      return [...calendarReminders, ...taskReminders].sort((a, b) => 
        new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()
      );
    } catch (error) {
      console.error('Failed to fetch reminders:', error);
      throw error;
    }
  }

  async updateReminder(_reminderId: string, _updates: Partial<Reminder>): Promise<Reminder> {
    // Implementation would depend on storing reminder metadata locally
    // This is a simplified version
    throw new Error('Update reminder not implemented yet');
  }

  async deleteReminder(reminder: Reminder): Promise<void> {
    try {
      if (reminder.type === 'calendar' && reminder.microsoftId) {
        await this.graphApi.deleteCalendarEvent(reminder.microsoftId);
      } else if (reminder.type === 'task' && reminder.microsoftId) {
        await this.graphApi.deleteTodoTask(reminder.microsoftId);
      }
    } catch (error) {
      console.error('Failed to delete reminder:', error);
      throw error;
    }
  }

  async checkConnection(): Promise<{ connected: boolean; permissions: { calendar: boolean; tasks: boolean } }> {
    try {
      const permissions = await this.graphApi.checkPermissions();
      return {
        connected: true,
        permissions,
      };
    } catch (error) {
      return {
        connected: false,
        permissions: { calendar: false, tasks: false },
      };
    }
  }
}

export const reminderService = new ReminderService();
export type { Reminder, CalendarEvent, TodoTask };