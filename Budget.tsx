import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { AlertTriangle, Pencil, Plus, Trash, Zap } from 'lucide-react';
import { useBudgetStore } from '../store/budgetStore';
import { useBillStore } from '../store/billStore';
import { SummaryType } from '../types';

export default function Budget() {
  const { t } = useTranslation();
  const { budgets, fetchBudgets, addBudget, updateBudget, deleteBudget, setSummaryType, summaryType, getBudgetAnalytics, getAIInsights } = useBudgetStore();
  const { bills, fetchBills } = useBillStore();
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    period: 'monthly' as SummaryType,
  });
  
  useEffect(() => {
    fetchBudgets();
    fetchBills();
  }, [fetchBudgets, fetchBills]);
  
  // Get unique categories from bills
  const categories = [...new Set(bills.map(bill => bill.category))];
  
  // Get budget analytics
  const budgetAnalytics = getBudgetAnalytics();
  
  // Get AI insights
  const insights = getAIInsights();
  
  // Handle edit budget
  const handleEditBudget = (id: string) => {
    const budget = budgets.find(b => b.id === id);
    if (budget) {
      setFormData({
        category: budget.category,
        amount: budget.amount.toString(),
        period: budget.period,
      });
      setSelectedBudget(id);
      setIsEditModalOpen(true);
    }
  };
  
  // Handle form input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const budgetData = {
      category: formData.category,
      amount: parseInt(formData.amount),
      period: formData.period,
    };
    
    if (isEditModalOpen && selectedBudget) {
      updateBudget(selectedBudget, budgetData);
      setIsEditModalOpen(false);
    } else {
      addBudget(budgetData);
      setIsAddModalOpen(false);
    }
    
    // Reset form
    setFormData({
      category: '',
      amount: '',
      period: 'monthly',
    });
    setSelectedBudget(null);
  };
  
  // Chart data for pie chart
  const chartData = budgetAnalytics.map((item) => ({
    name: item.category,
    value: item.spent
  }));
  
  // Colors for pie chart
  const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
  
  // Summary tabs
  const summaryTabs: SummaryType[] = ['weekly', 'monthly', 'yearly'];
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('budget')}</h1>
        
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          <Plus size={16} className="mr-2" />
          {t('add_budget')}
        </button>
      </div>
      
      {/* Summary Type Tabs */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg max-w-md">
          {summaryTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setSummaryType(tab)}
              className={`flex-1 px-3 py-2 text-sm rounded-md transition-colors ${
                summaryType === tab
                  ? 'bg-white shadow text-blue-600 font-medium'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {t(tab)}
            </button>
          ))}
        </div>
      </div>
      
      {/* Budget Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pie Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 lg:col-span-1">
          <h2 className="text-lg font-semibold mb-4">{t('spending_by_category')}</h2>
          
          {chartData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `₹${value}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              {t('no_budget_data')}
            </div>
          )}
        </div>
        
        {/* Budget Analytics */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4">{t('budget_vs_actual')}</h2>
          
          {budgetAnalytics.length > 0 ? (
            <div className="space-y-4">
              {budgetAnalytics.map((item, index) => {
                const percentUsed = (item.spent / item.budgeted) * 100;
                
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{item.category}</div>
                      <div className="text-sm">
                        ₹{item.spent.toLocaleString()} / ₹{item.budgeted.toLocaleString()}
                      </div>
                    </div>
                    
                    <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`absolute left-0 top-0 h-full rounded-full ${
                          item.status === 'over'
                            ? 'bg-red-500'
                            : item.status === 'near'
                              ? 'bg-yellow-500'
                              : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(percentUsed, 100)}%` }}
                      />
                    </div>
                    
                    {item.status === 'over' && (
                      <div className="text-sm text-red-600 flex items-center">
                        <AlertTriangle size={14} className="mr-1" />
                        {t('over_budget', { amount: Math.abs(item.remaining).toLocaleString() })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-8 text-center text-gray-500">
              {t('no_budgets_set')}
            </div>
          )}
        </div>
      </div>
      
      {/* Budgets Table */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold mb-4">{t('budget_settings')}</h2>
        
        {budgets.filter(b => b.period === summaryType).length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="pb-3 text-left font-medium text-gray-500">{t('category')}</th>
                  <th className="pb-3 text-left font-medium text-gray-500">{t('period')}</th>
                  <th className="pb-3 text-left font-medium text-gray-500">{t('budget_amount')}</th>
                  <th className="pb-3 text-right font-medium text-gray-500">{t('actions')}</th>
                </tr>
              </thead>
              <tbody>
                {budgets
                  .filter(budget => budget.period === summaryType)
                  .map((budget) => (
                    <tr key={budget.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3">{budget.category}</td>
                      <td className="py-3">{t(budget.period)}</td>
                      <td className="py-3">₹{budget.amount.toLocaleString()}</td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleEditBudget(budget.id)}
                            className="p-1.5 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
                          >
                            <Pencil size={14} />
                          </button>
                          
                          <button
                            onClick={() => deleteBudget(budget.id)}
                            className="p-1.5 rounded-full bg-red-100 text-red-600 hover:bg-red-200"
                          >
                            <Trash size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-gray-500">
            {t('no_budgets_for_period')}
          </div>
        )}
      </div>
      
      {/* AI Insights */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">{t('ai_insights')}</h2>
          <div className="flex items-center">
            <Zap size={16} className="text-yellow-500 mr-1" />
            <span className="text-sm font-medium text-yellow-500">{t('ai_powered')}</span>
          </div>
        </div>
        
        {insights.length > 0 ? (
          <div className="space-y-3">
            {insights.map((insight, index) => (
              <div key={index} className="p-3 bg-blue-50 rounded-lg text-blue-800">
                {insight}
              </div>
            ))}
          </div>
        ) : (
          <div className="py-6 text-center text-gray-500">
            {t('no_insights_available')}
          </div>
        )}
      </div>
      
      {/* Add/Pencil Budget Modal */}
      {(isAddModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <h2 className="text-xl font-semibold mb-4">
              {isEditModalOpen ? t('edit_budget') : t('add_budget')}
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('category')}
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">{t('select_category')}</option>
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('budget_amount')}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleInputChange}
                      required
                      min="1"
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('period')}
                  </label>
                  <select
                    name="period"
                    value={formData.period}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="weekly">{t('weekly')}</option>
                    <option value="monthly">{t('monthly')}</option>
                    <option value="yearly">{t('yearly')}</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setIsEditModalOpen(false);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  {t('cancel')}
                </button>
                
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {isEditModalOpen ? t('update') : t('save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
