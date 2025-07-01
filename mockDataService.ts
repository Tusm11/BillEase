import { Bill, BillStatus } from '../types';
import { addDays, subDays, format } from 'date-fns';

const mockBills: Bill[] = [
  {
    id: '1',
    name: 'Electricity Bill',
    amount: 1500,
    dueDate: format(addDays(new Date(), 5), 'yyyy-MM-dd'),
    category: 'Utilities',
    status: 'due_soon',
    paymentMethod: 'Credit Card',
    createdAt: format(subDays(new Date(), 10), 'yyyy-MM-dd'),
    updatedAt: format(subDays(new Date(), 10), 'yyyy-MM-dd'),
  },
  {
    id: '2',
    name: 'Water Bill',
    amount: 750,
    dueDate: format(addDays(new Date(), 12), 'yyyy-MM-dd'),
    category: 'Utilities',
    status: 'upcoming',
    paymentMethod: 'Bank Transfer',
    createdAt: format(subDays(new Date(), 8), 'yyyy-MM-dd'),
    updatedAt: format(subDays(new Date(), 8), 'yyyy-MM-dd'),
  },
  {
    id: '3',
    name: 'Internet Bill',
    amount: 1200,
    dueDate: format(subDays(new Date(), 2), 'yyyy-MM-dd'),
    category: 'Utilities',
    status: 'overdue',
    paymentMethod: 'UPI',
    createdAt: format(subDays(new Date(), 32), 'yyyy-MM-dd'),
    updatedAt: format(subDays(new Date(), 32), 'yyyy-MM-dd'),
  },
  {
    id: '4',
    name: 'Phone Bill',
    amount: 850,
    dueDate: format(subDays(new Date(), 5), 'yyyy-MM-dd'),
    category: 'Utilities',
    status: 'paid',
    paymentMethod: 'UPI',
    createdAt: format(subDays(new Date(), 35), 'yyyy-MM-dd'),
    updatedAt: format(subDays(new Date(), 5), 'yyyy-MM-dd'),
  },
  {
    id: '5',
    name: 'House Rent',
    amount: 25000,
    dueDate: format(addDays(new Date(), 3), 'yyyy-MM-dd'),
    category: 'Housing',
    status: 'due_soon',
    paymentMethod: 'Bank Transfer',
    createdAt: format(subDays(new Date(), 7), 'yyyy-MM-dd'),
    updatedAt: format(subDays(new Date(), 7), 'yyyy-MM-dd'),
  },
  {
    id: '6',
    name: 'DTH Subscription',
    amount: 600,
    dueDate: format(addDays(new Date(), 15), 'yyyy-MM-dd'),
    category: 'Entertainment',
    status: 'upcoming',
    paymentMethod: 'Credit Card',
    createdAt: format(subDays(new Date(), 15), 'yyyy-MM-dd'),
    updatedAt: format(subDays(new Date(), 15), 'yyyy-MM-dd'),
  }
];

export const initializeMockData = (): void => {
  if (!localStorage.getItem('bills')) {
    localStorage.setItem('bills', JSON.stringify(mockBills));
  }
};
