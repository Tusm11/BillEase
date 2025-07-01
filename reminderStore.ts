import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { Reminder, ReminderFrequency, NotificationChannel } from '../types';
import { format, addDays } from 'date-fns';

interface ReminderState {
  reminders: Reminder[];
  isLoading: boolean;
  error: string | null;
  fetchReminders: () => Promise<void>;
  addReminder: (reminder: Omit<Reminder, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateReminder: (id: string, reminderData: Partial<Reminder>) => void;
  deleteReminder: (id: string) => void;
  toggleReminderActive: (id: string) => void;
  getSmartReminders: (billId: string) => Reminder[];
  simulateAIReminders: (billId: string) => void;
}

// Helper to simulate network latency
const simulateLatency = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

export const useReminderStore = create<ReminderState>((set, get) => ({
  reminders: [],
  isLoading: false,
  error: null,
  
  fetchReminders: async () => {
    set({ isLoading: true, error: null });
    try {
      await simulateLatency();
      const storedReminders = localStorage.getItem('reminders');
      set({ 
        reminders: storedReminders ? JSON.parse(storedReminders) : [], 
        isLoading: false 
      });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },
  
  addReminder: (reminderData) => {
    const newReminder: Reminder = {
      id: uuidv4(),
      ...reminderData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    set((state) => {
      const updatedReminders = [...state.reminders, newReminder];
      localStorage.setItem('reminders', JSON.stringify(updatedReminders));
      return { reminders: updatedReminders };
    });
  },
  
  updateReminder: (id, reminderData) => {
    set((state) => {
      const reminderIndex = state.reminders.findIndex(reminder => reminder.id === id);
      
      if (reminderIndex === -1) {
        return state;
      }
      
      const updatedReminders = [...state.reminders];
      updatedReminders[reminderIndex] = {
        ...updatedReminders[reminderIndex],
        ...reminderData,
        updatedAt: new Date().toISOString()
      };
      
      localStorage.setItem('reminders', JSON.stringify(updatedReminders));
      return { reminders: updatedReminders };
    });
  },
  
  deleteReminder: (id) => {
    set((state) => {
      const updatedReminders = state.reminders.filter(reminder => reminder.id !== id);
      localStorage.setItem('reminders', JSON.stringify(updatedReminders));
      return { reminders: updatedReminders };
    });
  },
  
  toggleReminderActive: (id) => {
    set((state) => {
      const reminderIndex = state.reminders.findIndex(reminder => reminder.id === id);
      
      if (reminderIndex === -1) {
        return state;
      }
      
      const updatedReminders = [...state.reminders];
      updatedReminders[reminderIndex] = {
        ...updatedReminders[reminderIndex],
        isActive: !updatedReminders[reminderIndex].isActive,
        updatedAt: new Date().toISOString()
      };
      
      localStorage.setItem('reminders', JSON.stringify(updatedReminders));
      return { reminders: updatedReminders };
    });
  },
  
  getSmartReminders: (billId) => {
    return get().reminders.filter(reminder => reminder.billId === billId);
  },
  
  simulateAIReminders: (billId) => {
    // Get the bill from the bill store using billId
    const billsStr = localStorage.getItem('bills');
    if (!billsStr) return;
    
    const bills = JSON.parse(billsStr);
    const bill = bills.find((b: any) => b.id === billId);
    
    if (!bill) return;
    
    // Create smart reminders based on bill due date
    const today = new Date();
    const dueDate = new Date(bill.dueDate);
    
    // Create 3 different reminders: 7 days, 3 days, and 1 day before due date
    const reminderDays = [7, 3, 1];
    
    reminderDays.forEach(days => {
      const reminderDate = addDays(dueDate, -days);
      
      // Only create reminder if the date is in the future
      if (reminderDate > today) {
        const newReminder = {
          billId,
          title: `${bill.name} - ${days} day reminder`,
          message: days === 1 
            ? `Urgent: Your ${bill.name} payment of ₹${bill.amount} is due tomorrow!` 
            : `Your ${bill.name} payment of ₹${bill.amount} is due in ${days} days.`,
          date: format(reminderDate, 'yyyy-MM-dd'),
          time: '09:00',
          frequency: 'once' as ReminderFrequency,
          channels: ['in-app', 'email'] as NotificationChannel[],
          isActive: true
        };
        
        get().addReminder(newReminder);
      }
    });
  }
}));
