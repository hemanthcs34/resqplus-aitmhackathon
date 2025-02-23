import { format, addDays, parseISO, differenceInDays } from 'date-fns';

export interface Reminder {
  id: number;
  medicationName: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate: string;
  notifications: NotificationSchedule[];
}

interface NotificationSchedule {
  id: number;
  date: string;
  time: string;
  status: 'pending' | 'shown' | 'dismissed';
}

class ReminderService {
  private static STORAGE_KEY = 'reminders';
  private static TIPS_KEY = 'healthTips';

  // Health tips based on medication types
  private static healthTips = {
    antibiotics: [
      "Take the full course even if you feel better",
      "Maintain regular timing for maximum effectiveness"
    ],
    painkillers: [
      "Take with food to avoid stomach irritation",
      "Don't exceed recommended daily dose"
    ],
    // Add more categories as needed
  };

  static saveReminder(reminderData: Omit<Reminder, 'id' | 'notifications'>): Reminder {
    const reminders = this.getReminders();
    const newReminder: Reminder = {
      ...reminderData,
      id: Date.now(),
      notifications: this.generateNotificationSchedule(reminderData)
    };

    reminders.push(newReminder);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(reminders));

    // Start checking for notifications
    this.initNotificationChecker();

    return newReminder;
  }

  static getReminders(): Reminder[] {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  static getDailyTip(medicationName: string): string {
    const tips = {
      default: [
        "Remember to take medications with water",
        "Store medications in a cool, dry place",
        "Keep track of your medication schedule"
      ],
      antibiotics: [
        "Complete the full course of antibiotics",
        "Take at regular intervals as prescribed"
      ]
    };

    const medicationType = medicationName.toLowerCase().includes('antibiotic') 
      ? 'antibiotics' 
      : 'default';

    const tipList = tips[medicationType];
    return tipList[Math.floor(Math.random() * tipList.length)];
  }

  private static generateNotificationSchedule(
    reminder: Omit<Reminder, 'id' | 'notifications'>
  ): NotificationSchedule[] {
    const schedule: NotificationSchedule[] = [];
    const startDate = parseISO(reminder.startDate);
    const endDate = parseISO(reminder.endDate);
    const dayDiff = differenceInDays(endDate, startDate);

    for (let day = 0; day <= dayDiff; day++) {
      const date = addDays(startDate, day);
      const times = this.getTimesForFrequency(reminder.frequency);

      times.forEach(time => {
        schedule.push({
          id: Date.now() + Math.random(),
          date: format(date, 'yyyy-MM-dd'),
          time,
          status: 'pending'
        });
      });
    }

    return schedule;
  }

  private static getTimesForFrequency(frequency: string): string[] {
    switch (frequency) {
      case 'daily':
        return ['09:00'];
      case 'twice':
        return ['09:00', '21:00'];
      case 'weekly':
        return ['09:00'];
      default:
        return ['09:00'];
    }
  }

  static initNotificationChecker() {
    // Check for due notifications every minute
    setInterval(() => {
      this.checkNotifications();
    }, 60000);
  }

  private static async checkNotifications() {
    const reminders = this.getReminders();
    const now = new Date();
    const currentDate = format(now, 'yyyy-MM-dd');
    const currentTime = format(now, 'HH:mm');

    reminders.forEach(reminder => {
      reminder.notifications
        .filter(notification => 
          notification.status === 'pending' &&
          notification.date === currentDate &&
          notification.time === currentTime
        )
        .forEach(notification => {
          this.showNotification(reminder);
          notification.status = 'shown';
        });
    });

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(reminders));
  }

  private static showNotification(reminder: Reminder) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Medication Reminder', {
        body: `Time to take ${reminder.medicationName} - ${reminder.dosage}`,
        icon: '/medicine-icon.png'
      });
    }
  }
}

export default ReminderService;