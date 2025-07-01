export type Bill = {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  category: string;
  status: BillStatus;
  paymentMethod?: string;
  description?: string;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
};

export type BillStatus = 'paid' | 'overdue' | 'upcoming' | 'due_soon';

export type SummaryType = 'weekly' | 'monthly' | 'yearly';

export type SummaryData = {
  totalBills: number;
  amountPaid: number;
  amountDue: number;
  billsByCategory: {
    paid: number;
    overdue: number;
    upcoming: number;
    due_soon: number;
  };
};

export type Language = 'en' | 'hi' | 'te' | 'ta' | 'kn' | 'ml';

export interface LanguageOption {
  code: Language;
  name: string;
  nativeName: string;
}

export type ReminderFrequency = 'once' | 'daily' | 'weekly' | 'monthly';

export type NotificationChannel = 'in-app' | 'email' | 'sms';

export type Reminder = {
  id: string;
  billId: string;
  title: string;
  message: string;
  date: string;
  time: string;
  frequency: ReminderFrequency;
  channels: NotificationChannel[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Budget = {
  id: string;
  category: string;
  amount: number;
  period: SummaryType;
  createdAt: string;
  updatedAt: string;
};

export type BudgetAnalytics = {
  category: string;
  budgeted: number;
  spent: number;
  remaining: number;
  status: 'under' | 'near' | 'over';
};
