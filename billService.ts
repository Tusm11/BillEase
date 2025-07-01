import { Bill, BillStatus, SummaryData, SummaryType } from '../types';

// Simulate network latency
const simulateLatency = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

// Fetch bills from localStorage (simulated backend)
export const fetchBills = async (): Promise<Bill[]> => {
  await simulateLatency();
  const bills = localStorage.getItem('bills');
  return bills ? JSON.parse(bills) : [];
};

// Update bill status
export const updateBillStatus = async (id: string, status: BillStatus): Promise<Bill> => {
  await simulateLatency();
  const bills = await fetchBills();
  const billIndex = bills.findIndex(bill => bill.id === id);
  
  if (billIndex === -1) {
    throw new Error('Bill not found');
  }
  
  const updatedBill = {
    ...bills[billIndex],
    status,
    updatedAt: new Date().toISOString().split('T')[0]
  };
  
  bills[billIndex] = updatedBill;
  localStorage.setItem('bills', JSON.stringify(bills));
  
  return updatedBill;
};

// Get summary data based on the time period
export const getSummaryData = async (summaryType: SummaryType): Promise<SummaryData> => {
  await simulateLatency();
  const bills = await fetchBills();
  
  // Calculate summary data
  const totalBills = bills.length;
  const amountPaid = bills
    .filter(bill => bill.status === 'paid')
    .reduce((sum, bill) => sum + bill.amount, 0);
  
  const amountDue = bills
    .filter(bill => bill.status !== 'paid')
    .reduce((sum, bill) => sum + bill.amount, 0);
  
  // Count bills by category
  const billsByCategory = {
    paid: bills.filter(bill => bill.status === 'paid').length,
    overdue: bills.filter(bill => bill.status === 'overdue').length,
    upcoming: bills.filter(bill => bill.status === 'upcoming').length,
    due_soon: bills.filter(bill => bill.status === 'due_soon').length,
  };
  
  return {
    totalBills,
    amountPaid,
    amountDue,
    billsByCategory,
  };
};
