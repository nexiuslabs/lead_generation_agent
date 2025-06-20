// Simple utility for parsing reminder information from chat messages
export interface ParsedReminder {
  title: string;
  dateTime: string;
  type: 'task' | 'event';
  confidence: number; // 0-1 score of how confident we are in the parsing
}

// Keywords that suggest calendar events vs tasks
const EVENT_KEYWORDS = [
  'meeting', 'appointment', 'call', 'conference', 'presentation', 
  'interview', 'lunch', 'dinner', 'schedule', 'book'
];

const TASK_KEYWORDS = [
  'task', 'todo', 'remind', 'finish', 'complete', 'send', 'buy', 
  'pick up', 'submit', 'review', 'check'
];

// Time expressions and their patterns
const TIME_PATTERNS = [
  { pattern: /at (\d{1,2}):?(\d{0,2})\s*(am|pm)/i, type: 'specific' },
  { pattern: /(\d{1,2}):(\d{2})/i, type: '24hour' },
  { pattern: /(morning|afternoon|evening|night)/i, type: 'general' },
  { pattern: /(noon|midnight)/i, type: 'fixed' }
];

// Date expressions
const DATE_PATTERNS = [
  { pattern: /(today|tonight)/i, offset: 0 },
  { pattern: /(tomorrow)/i, offset: 1 },
  { pattern: /(next week)/i, offset: 7 },
  { pattern: /(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i, type: 'weekday' }
];

export function parseReminderFromMessage(message: string): ParsedReminder {
  const lowerMessage = message.toLowerCase();
  let confidence = 0.3; // Base confidence
  
  // Extract the main action/title
  let title = extractTitle(message);
  if (title.length > 0) confidence += 0.2;
  
  // Extract date and time
  const { dateTime, dateConfidence } = extractDateTime(message);
  confidence += dateConfidence;
  
  // Determine type
  const { type, typeConfidence } = extractType(lowerMessage);
  confidence += typeConfidence;
  
  return {
    title,
    dateTime,
    type,
    confidence: Math.min(confidence, 1)
  };
}

function extractTitle(message: string): string {
  // Remove common reminder triggers
  let title = message
    .replace(/remind me to|reminder to|remind me|set reminder|schedule|add reminder/gi, '')
    .replace(/today|tomorrow|tonight|this afternoon|this evening|next week/gi, '')
    .replace(/at \d{1,2}:?\d{0,2}\s*(am|pm)?/gi, '')
    .replace(/on (monday|tuesday|wednesday|thursday|friday|saturday|sunday)/gi, '')
    .replace(/in the (morning|afternoon|evening)/gi, '')
    .trim();
  
  // Clean up punctuation and extra spaces
  title = title.replace(/^[,\-\s]+|[,\-\s]+$/g, '').trim();
  
  // Capitalize first letter
  if (title.length > 0) {
    title = title.charAt(0).toUpperCase() + title.slice(1);
  }
  
  return title;
}

function extractDateTime(message: string): { dateTime: string; dateConfidence: number } {
  const now = new Date();
  let targetDate = new Date(now);
  let hasTime = false;
  let confidence = 0;
  
  // Extract date
  for (const datePattern of DATE_PATTERNS) {
    const match = message.match(datePattern.pattern);
    if (match) {
      confidence += 0.3;
      
      if (datePattern.type === 'weekday') {
        // Find next occurrence of this weekday
        const weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const targetDay = weekdays.indexOf(match[1].toLowerCase());
        const currentDay = now.getDay();
        let daysUntil = (targetDay - currentDay + 7) % 7;
        if (daysUntil === 0) daysUntil = 7; // Next week if it's the same day
        
        targetDate.setDate(now.getDate() + daysUntil);
      } else if (datePattern.offset !== undefined) {
        targetDate.setDate(now.getDate() + datePattern.offset);
      }
      break;
    }
  }
  
  // Extract time
  for (const timePattern of TIME_PATTERNS) {
    const match = message.match(timePattern.pattern);
    if (match) {
      hasTime = true;
      confidence += 0.2;
      
      if (timePattern.type === 'specific') {
        let hour = parseInt(match[1]);
        const minute = match[2] ? parseInt(match[2]) : 0;
        const ampm = match[3]?.toLowerCase();
        
        if (ampm === 'pm' && hour !== 12) hour += 12;
        if (ampm === 'am' && hour === 12) hour = 0;
        
        targetDate.setHours(hour, minute, 0, 0);
      } else if (timePattern.type === '24hour') {
        const hour = parseInt(match[1]);
        const minute = parseInt(match[2]);
        targetDate.setHours(hour, minute, 0, 0);
      } else if (timePattern.type === 'general') {
        const timeOfDay = match[1].toLowerCase();
        switch (timeOfDay) {
          case 'morning':
            targetDate.setHours(9, 0, 0, 0);
            break;
          case 'afternoon':
            targetDate.setHours(14, 0, 0, 0);
            break;
          case 'evening':
            targetDate.setHours(18, 0, 0, 0);
            break;
          case 'night':
            targetDate.setHours(20, 0, 0, 0);
            break;
        }
      } else if (timePattern.type === 'fixed') {
        const fixed = match[1].toLowerCase();
        if (fixed === 'noon') {
          targetDate.setHours(12, 0, 0, 0);
        } else if (fixed === 'midnight') {
          targetDate.setHours(0, 0, 0, 0);
        }
      }
      break;
    }
  }
  
  // If no specific time was found, set default based on time of day
  if (!hasTime) {
    const currentHour = now.getHours();
    if (currentHour < 12) {
      targetDate.setHours(currentHour + 1, 0, 0, 0); // 1 hour from now
    } else {
      targetDate.setHours(currentHour + 1, 0, 0, 0); // 1 hour from now
    }
  }
  
  // Format for datetime-local input
  const dateTime = targetDate.toISOString().slice(0, 16);
  
  return { dateTime, dateConfidence: confidence };
}

function extractType(message: string): { type: 'task' | 'event'; typeConfidence: number } {
  let eventScore = 0;
  let taskScore = 0;
  
  // Count event keywords
  for (const keyword of EVENT_KEYWORDS) {
    if (message.includes(keyword)) {
      eventScore += 1;
    }
  }
  
  // Count task keywords
  for (const keyword of TASK_KEYWORDS) {
    if (message.includes(keyword)) {
      taskScore += 1;
    }
  }
  
  // Default to task if unclear
  const type = eventScore > taskScore ? 'event' : 'task';
  const confidence = Math.max(eventScore, taskScore) * 0.1;
  
  return { type, typeConfidence: confidence };
}

// Helper function to check if a message looks like a reminder request
export function isReminderMessage(message: string): boolean {
  const lowerMessage = message.toLowerCase();
  
  const reminderTriggers = [
    'remind me', 'reminder', 'set reminder', 'schedule', 'add reminder',
    'don\'t forget', 'remember to', 'need to remember'
  ];
  
  return reminderTriggers.some(trigger => lowerMessage.includes(trigger));
}

// Helper function to get a confidence-based color for UI
export function getConfidenceColor(confidence: number): string {
  if (confidence >= 0.8) return 'text-green-600';
  if (confidence >= 0.6) return 'text-yellow-600';
  return 'text-red-600';
}
</parameter>