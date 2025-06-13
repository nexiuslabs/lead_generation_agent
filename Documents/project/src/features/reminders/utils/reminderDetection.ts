/**
 * Natural language processing utilities for detecting reminder requests in chat messages
 */

export interface ReminderIntent {
  isReminder: boolean;
  confidence: number;
  extractedData: {
    title?: string;
    dateTime?: string;
    description?: string;
    type?: 'calendar' | 'task';
    importance?: 'low' | 'normal' | 'high';
  };
  rawText: string;
}

// Common reminder trigger phrases
const REMINDER_TRIGGERS = [
  'remind me',
  'set a reminder',
  'schedule a reminder',
  'create a reminder',
  'add a reminder',
  'remind me to',
  'schedule meeting',
  'book appointment',
  'set appointment',
  'meeting with',
  'call at',
  'deadline',
  'due date',
  'follow up',
  'check in',
  'review',
  'submit',
  'send',
];

// Time-related patterns
const TIME_PATTERNS = [
  // Specific times
  /\b(\d{1,2}):?(\d{2})?\s*(am|pm|AM|PM)\b/,
  /\b(\d{1,2})\s*(am|pm|AM|PM)\b/,
  
  // Relative times
  /\b(tomorrow|today|tonight)\b/i,
  /\b(next|this)\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday|week|month|year)\b/i,
  /\bin\s+(\d+)\s+(minute|minutes|hour|hours|day|days|week|weeks|month|months)\b/i,
  /\b(\d+)\s+(minute|minutes|hour|hours|day|days|week|weeks|month|months)\s+(from\s+now|later)\b/i,
  
  // Dates
  /\b(\d{1,2})\/(\d{1,2})\/(\d{2,4})\b/, // MM/DD/YYYY
  /\b(\d{1,2})-(\d{1,2})-(\d{2,4})\b/, // MM-DD-YYYY
  /\b(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2})\b/i,
  /\b(\d{1,2})\s+(january|february|march|april|may|june|july|august|september|october|november|december)\b/i,
];

// Action words that suggest tasks vs calendar events
const TASK_KEYWORDS = [
  'todo', 'task', 'complete', 'finish', 'submit', 'review', 'check', 'follow up',
  'deadline', 'due', 'deliver', 'send', 'upload', 'download', 'read', 'write'
];

const CALENDAR_KEYWORDS = [
  'meeting', 'appointment', 'call', 'conference', 'interview', 'lunch', 'dinner',
  'event', 'session', 'presentation', 'demo', 'visit', 'trip'
];

// Priority indicators
const HIGH_PRIORITY_KEYWORDS = [
  'urgent', 'asap', 'important', 'critical', 'priority', 'immediately', 'emergency'
];

const LOW_PRIORITY_KEYWORDS = [
  'whenever', 'eventually', 'sometime', 'later', 'low priority', 'not urgent'
];

/**
 * Analyzes a message to detect reminder intent and extract relevant data
 */
export function detectReminderIntent(message: string): ReminderIntent {
  const lowerMessage = message.toLowerCase();
  
  // Check for reminder triggers
  const hasTrigger = REMINDER_TRIGGERS.some(trigger => 
    lowerMessage.includes(trigger.toLowerCase())
  );
  
  // Check for time/date patterns
  const hasTimePattern = TIME_PATTERNS.some(pattern => pattern.test(message));
  
  // Calculate confidence
  let confidence = 0;
  if (hasTrigger) confidence += 0.6;
  if (hasTimePattern) confidence += 0.3;
  
  // Additional confidence boosts
  if (lowerMessage.includes('at ') && hasTimePattern) confidence += 0.1;
  if (lowerMessage.includes('on ') && hasTimePattern) confidence += 0.1;
  
  const isReminder = confidence >= 0.5;
  
  if (!isReminder) {
    return {
      isReminder: false,
      confidence,
      extractedData: {},
      rawText: message
    };
  }
  
  // Extract data
  const extractedData = extractReminderData(message);
  
  return {
    isReminder: true,
    confidence: Math.min(confidence, 1),
    extractedData,
    rawText: message
  };
}

/**
 * Extracts structured data from a reminder message
 */
function extractReminderData(message: string): ReminderIntent['extractedData'] {
  const lowerMessage = message.toLowerCase();
  const extractedData: ReminderIntent['extractedData'] = {};
  
  // Extract title - everything after "remind me to" or similar
  const titleMatch = message.match(/remind me to (.+?)(?:\s+(?:at|on|in|tomorrow|today|next|\d))/i) ||
                    message.match(/remind me to (.+)$/i) ||
                    message.match(/set a reminder (?:to\s+)?(.+?)(?:\s+(?:at|on|in|tomorrow|today|next|\d))/i);
  
  if (titleMatch) {
    extractedData.title = titleMatch[1].trim();
  }
  
  // Extract time/date
  const dateTime = extractDateTime(message);
  if (dateTime) {
    extractedData.dateTime = dateTime;
  }
  
  // Determine type (task vs calendar)
  const hasTaskKeywords = TASK_KEYWORDS.some(keyword => 
    lowerMessage.includes(keyword)
  );
  const hasCalendarKeywords = CALENDAR_KEYWORDS.some(keyword => 
    lowerMessage.includes(keyword)
  );
  
  if (hasCalendarKeywords && !hasTaskKeywords) {
    extractedData.type = 'calendar';
  } else if (hasTaskKeywords && !hasCalendarKeywords) {
    extractedData.type = 'task';
  } else {
    // Default to calendar for meetings/calls, task for others
    extractedData.type = lowerMessage.includes('meeting') || lowerMessage.includes('call') ? 'calendar' : 'task';
  }
  
  // Determine importance
  if (HIGH_PRIORITY_KEYWORDS.some(keyword => lowerMessage.includes(keyword))) {
    extractedData.importance = 'high';
  } else if (LOW_PRIORITY_KEYWORDS.some(keyword => lowerMessage.includes(keyword))) {
    extractedData.importance = 'low';
  } else {
    extractedData.importance = 'normal';
  }
  
  return extractedData;
}

/**
 * Extracts and parses date/time from message text
 */
function extractDateTime(message: string): string | undefined {
  const now = new Date();
  
  // Check for "tomorrow"
  if (message.toLowerCase().includes('tomorrow')) {
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Look for specific time
    const timeMatch = message.match(/(\d{1,2}):?(\d{2})?\s*(am|pm|AM|PM)/);
    if (timeMatch) {
      let hours = parseInt(timeMatch[1]);
      const minutes = parseInt(timeMatch[2] || '0');
      const ampm = timeMatch[3].toLowerCase();
      
      if (ampm === 'pm' && hours !== 12) hours += 12;
      if (ampm === 'am' && hours === 12) hours = 0;
      
      tomorrow.setHours(hours, minutes, 0, 0);
    } else {
      // Default to 9 AM if no time specified
      tomorrow.setHours(9, 0, 0, 0);
    }
    
    return tomorrow.toISOString();
  }
  
  // Check for "today"
  if (message.toLowerCase().includes('today')) {
    const today = new Date(now);
    
    const timeMatch = message.match(/(\d{1,2}):?(\d{2})?\s*(am|pm|AM|PM)/);
    if (timeMatch) {
      let hours = parseInt(timeMatch[1]);
      const minutes = parseInt(timeMatch[2] || '0');
      const ampm = timeMatch[3].toLowerCase();
      
      if (ampm === 'pm' && hours !== 12) hours += 12;
      if (ampm === 'am' && hours === 12) hours = 0;
      
      today.setHours(hours, minutes, 0, 0);
      
      // If the time has already passed today, assume tomorrow
      if (today <= now) {
        today.setDate(today.getDate() + 1);
      }
    } else {
      // Default to 1 hour from now
      today.setTime(now.getTime() + 60 * 60 * 1000);
    }
    
    return today.toISOString();
  }
  
  // Check for "in X hours/minutes/days"
  const relativeMatch = message.match(/in\s+(\d+)\s+(minute|minutes|hour|hours|day|days)/i);
  if (relativeMatch) {
    const amount = parseInt(relativeMatch[1]);
    const unit = relativeMatch[2].toLowerCase();
    
    const future = new Date(now);
    
    if (unit.startsWith('minute')) {
      future.setMinutes(future.getMinutes() + amount);
    } else if (unit.startsWith('hour')) {
      future.setHours(future.getHours() + amount);
    } else if (unit.startsWith('day')) {
      future.setDate(future.getDate() + amount);
    }
    
    return future.toISOString();
  }
  
  // Check for next weekday
  const weekdayMatch = message.match(/next\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i);
  if (weekdayMatch) {
    const targetDay = weekdayMatch[1].toLowerCase();
    const weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const targetIndex = weekdays.indexOf(targetDay);
    
    const nextWeekday = new Date(now);
    const currentDay = nextWeekday.getDay();
    const daysUntilTarget = (targetIndex - currentDay + 7) % 7 || 7; // Next occurrence
    
    nextWeekday.setDate(nextWeekday.getDate() + daysUntilTarget);
    nextWeekday.setHours(9, 0, 0, 0); // Default to 9 AM
    
    return nextWeekday.toISOString();
  }
  
  // Check for specific time (assume today if no date)
  const timeMatch = message.match(/(?:at\s+)?(\d{1,2}):?(\d{2})?\s*(am|pm|AM|PM)/);
  if (timeMatch) {
    let hours = parseInt(timeMatch[1]);
    const minutes = parseInt(timeMatch[2] || '0');
    const ampm = timeMatch[3].toLowerCase();
    
    if (ampm === 'pm' && hours !== 12) hours += 12;
    if (ampm === 'am' && hours === 12) hours = 0;
    
    const targetTime = new Date(now);
    targetTime.setHours(hours, minutes, 0, 0);
    
    // If the time has already passed today, assume tomorrow
    if (targetTime <= now) {
      targetTime.setDate(targetTime.getDate() + 1);
    }
    
    return targetTime.toISOString();
  }
  
  return undefined;
}

/**
 * Generates a user-friendly confirmation message for a detected reminder
 */
export function generateReminderConfirmation(intent: ReminderIntent): string {
  if (!intent.isReminder || !intent.extractedData.title) {
    return "I didn't detect a complete reminder request. Could you provide more details?";
  }
  
  const { title, dateTime, type, importance } = intent.extractedData;
  
  let message = `I'll create a ${type === 'calendar' ? 'calendar event' : 'task'} reminder: "${title}"`;
  
  if (dateTime) {
    const date = new Date(dateTime);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const isTomorrow = date.toDateString() === new Date(now.getTime() + 24 * 60 * 60 * 1000).toDateString();
    
    if (isToday) {
      message += ` for today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (isTomorrow) {
      message += ` for tomorrow at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      message += ` for ${date.toLocaleDateString([], { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit', 
        minute: '2-digit' 
      })}`;
    }
  }
  
  if (importance && importance !== 'normal') {
    message += ` with ${importance} priority`;
  }
  
  message += '. Would you like me to create this reminder?';
  
  return message;
}

/**
 * Suggests improvements for incomplete reminder requests
 */
export function suggestReminderImprovements(intent: ReminderIntent): string[] {
  const suggestions: string[] = [];
  const { title, dateTime, type } = intent.extractedData;
  
  if (!title) {
    suggestions.push("Specify what you'd like to be reminded about (e.g., 'remind me to call John')");
  }
  
  if (!dateTime) {
    suggestions.push("Include when you'd like to be reminded (e.g., 'tomorrow at 3pm', 'in 2 hours', 'next Monday')");
  }
  
  if (!type || (!title?.includes('meeting') && !title?.includes('call') && !title?.includes('appointment'))) {
    suggestions.push("Consider specifying if this is a meeting/appointment or a task to complete");
  }
  
  return suggestions;
}