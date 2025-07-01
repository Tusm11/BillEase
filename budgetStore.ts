import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { Budget, BudgetAnalytics, SummaryType } from '../types';
import { useBillStore } from './billStore';

interface BudgetState {
  budgets: Budget[];
  isLoading: boolean;
  error: string | null;
  summaryType: SummaryType;
  fetchBudgets: () => Promise<void>;
  addBudget: (budgetData: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateBudget: (id: string, budgetData: Partial<Budget>) => void;
  deleteBudget: (id: string) => void;
  setSummaryType: (type: SummaryType) => void;
  getBudgetAnalytics: () => BudgetAnalytics[];
  getAIInsights: () => string[];
}

// Helper to simulate network latency
const simulateLatency = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

export const useBudgetStore = create<BudgetState>((set, get) => ({
  budgets: [],
  isLoading: false,
  error: null,
  summaryType: 'monthly',
  
  fetchBudgets: async () => {
    set({ isLoading: true, error: null });
    try {
      await simulateLatency();
      const storedBudgets = localStorage.getItem('budgets');
      set({ 
        budgets: storedBudgets ? JSON.parse(storedBudgets) : [], 
        isLoading: false 
      });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },
  
  addBudget: (budgetData) => {
    const newBudget: Budget = {
      id: uuidv4(),
      ...budgetData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    set((state) => {
      const updatedBudgets = [...state.budgets, newBudget];
      localStorage.setItem('budgets', JSON.stringify(updatedBudgets));
      return { budgets: updatedBudgets };
    });
  },
  
  updateBudget: (id, budgetData) => {
    set((state) => {
      const budgetIndex = state.budgets.findIndex(budget => budget.id === id);
      
      if (budgetIndex === -1) {
        return state;
      }
      
      const updatedBudgets = [...state.budgets];
      updatedBudgets[budgetIndex] = {
        ...updatedBudgets[budgetIndex],
        ...budgetData,
        updatedAt: new Date().toISOString()
      };
      
      localStorage.setItem('budgets', JSON.stringify(updatedBudgets));
      return { budgets: updatedBudgets };
    });
  },
  
  deleteBudget: (id) => {
    set((state) => {
      const updatedBudgets = state.budgets.filter(budget => budget.id !== id);
      localStorage.setItem('budgets', JSON.stringify(updatedBudgets));
      return { budgets: updatedBudgets };
    });
  },
  
  setSummaryType: (type) => {
    set({ summaryType: type });
  },
  
  getBudgetAnalytics: () => {
    const { budgets, summaryType } = get();
    const { bills } = useBillStore.getState();
    
    return budgets
      .filter(budget => budget.period === summaryType)
      .map(budget => {
        // Calculate spent amount from bills for this category
        const spent = bills
          .filter(bill => bill.category === budget.category && bill.status === 'paid')
          .reduce((sum, bill) => sum + bill.amount, 0);
        
        const remaining = budget.amount - spent;
        
        // Determine status based on percentage used
        let status: 'under' | 'near' | 'over' = 'under';
        const percentUsed = (spent / budget.amount) * 100;
        
        if (percentUsed >= 100) {
          status = 'over';
        } else if (percentUsed >= 80) {
          status = 'near';
        }
        
        return {
          category: budget.category,
          budgeted: budget.amount,
          spent,
          remaining,
          status
        };
      });
  },
  
  getAIInsights: () => {
    const analytics = get().getBudgetAnalytics();
    const insights: string[] = [];
    
    analytics.forEach(item => {
      if (item.status === 'over') {
        insights.push(`You've exceeded your ${item.category} budget by ₹${Math.abs(item.remaining).toLocaleString()}.`);
      } else if (item.status === 'near') {
        insights.push(`You're close to reaching your ${item.category} budget limit.`);
      } else if (item.remaining > item.budgeted * 0.5) {
        insights.push(`You've only used ${Math.round((item.spent / item.budgeted) * 100)}% of your ${item.category} budget.`);
      }
      
      // Random saving insights
      if (item.category === 'Utilities' && Math.random() > 0.5) {
        const savedAmount = Math.floor(Math.random() * 500) + 100;
        insights.push(`You saved ₹${savedAmount} this month in ${item.category} compared to last month.`);
      }
    });
    
    // Add a few general insights
    if (insights.length < 3) {
      insights.push("Setting up automatic payments can help you avoid late fees.");
      insights.push("Consider allocating 50-30-20 of your income to needs, wants, and savings.");
    }
    
    return insights;
  }
}));
