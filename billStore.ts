import { create } from 'zustand';
import { Bill, BillStatus, SummaryData, SummaryType } from '../types';
import { fetchBills, updateBillStatus, getSummaryData } from '../services/billService';

interface BillState {
  bills: Bill[];
  isLoading: boolean;
  error: string | null;
  summaryType: SummaryType;
  summaryData: SummaryData | null;
  fetchBills: () => Promise<void>;
  updateBillStatus: (id: string, status: BillStatus) => Promise<void>;
  setSummaryType: (type: SummaryType) => void;
  getSummaryData: () => void;
  addBill: (bill: Bill) => void;
}

export const useBillStore = create<BillState>((set, get) => ({
  bills: [],
  isLoading: false,
  error: null,
  summaryType: 'monthly',
  summaryData: null,
  
  addBill: (bill: Bill) => {
    set((state) => ({
      bills: [...state.bills, bill]
    }));
    // Update local storage
    const bills = localStorage.getItem('bills');
    const parsedBills = bills ? JSON.parse(bills) : [];
    localStorage.setItem('bills', JSON.stringify([...parsedBills, bill]));
    // Refresh summary data
    get().getSummaryData();
  },

  fetchBills: async () => {
    set({ isLoading: true, error: null });
    try {
      const bills = await fetchBills();
      set({ bills, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  updateBillStatus: async (id: string, status: BillStatus) => {
    set({ isLoading: true, error: null });
    try {
      const updatedBill = await updateBillStatus(id, status);
      set((state) => ({
        bills: state.bills.map((bill) => (bill.id === id ? updatedBill : bill)),
        isLoading: false,
      }));
      get().getSummaryData();
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  setSummaryType: (type: SummaryType) => {
    set({ summaryType: type });
    get().getSummaryData();
  },

  getSummaryData: async () => {
    const summaryData = await getSummaryData(get().summaryType);
    set({ summaryData });
  },
}));
