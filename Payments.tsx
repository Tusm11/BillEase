import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CSVLink } from 'react-csv';
import { format } from 'date-fns';
import { Calendar, Download, Filter, ToggleLeft, ToggleRight } from 'lucide-react';
import { useBillStore } from '../store/billStore';
import { Bill, BillStatus } from '../types';

export default function Payments() {
  const { t } = useTranslation();
  const { bills, updateBillStatus } = useBillStore();
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState<BillStatus | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [autoPayEnabled, setAutoPayEnabled] = useState<Record<string, boolean>>({});
  const [autoPayLimit, setAutoPayLimit] = useState<Record<string, number>>({});
  
  // Get unique categories from bills
  const categories = ['all', ...new Set(bills.map(bill => bill.category))];
  
  // Filter bills based on selected filters
  const filteredBills = bills.filter(bill => {
    if (statusFilter !== 'all' && bill.status !== statusFilter) return false;
    if (categoryFilter !== 'all' && bill.category !== categoryFilter) return false;
    return true;
  });
  
  // Sort bills by due date (most recent first)
  const sortedBills = [...filteredBills].sort((a, b) => {
    return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
  });
  
  // Group bills by payment status
  const groupedBills = sortedBills.reduce<Record<string, Bill[]>>((acc, bill) => {
    if (!acc[bill.status]) {
      acc[bill.status] = [];
    }
    acc[bill.status].push(bill);
    return acc;
  }, {});
  
  // Handle AutoPay toggle
  const toggleAutoPay = (billId: string) => {
    setAutoPayEnabled(prev => ({
      ...prev,
      [billId]: !prev[billId]
    }));
  };
  
  // Handle AutoPay limit change
  const handleAutoPayLimitChange = (billId: string, limit: string) => {
    const numericLimit = parseInt(limit);
    if (!isNaN(numericLimit)) {
      setAutoPayLimit(prev => ({
        ...prev,
        [billId]: numericLimit
      }));
    }
  };
  
  // Prepare CSV data for export
  const csvData = sortedBills.map(bill => ({
    Name: bill.name,
    Amount: bill.amount,
    DueDate: bill.dueDate,
    Status: t(bill.status),
    Category: bill.category,
    CreatedAt: bill.createdAt,
    UpdatedAt: bill.updatedAt
  }));
  
  // Calculate payment history (from paid bills)
  const paymentHistory = bills
    .filter(bill => bill.status === 'paid')
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 10); // Show only last 10 payments
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('payments')}</h1>
        
        <div className="flex items-center space-x-2">
          <CSVLink 
            data={csvData} 
            filename={`payment-records-${format(new Date(), 'yyyy-MM-dd')}.csv`}
            className="flex items-center px-3 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100"
          >
            <Download size={16} className="mr-2" />
            {t('export_csv')}
          </CSVLink>
        </div>
      </div>
      
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <Filter size={16} className="text-gray-500" />
            <span className="text-sm text-gray-500">{t('filter_by')}:</span>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as BillStatus | 'all')}
              className="px-3 py-1 bg-gray-100 rounded-md text-sm border border-gray-200"
            >
              <option value="all">{t('all_statuses')}</option>
              <option value="paid">{t('paid')}</option>
              <option value="due_soon">{t('due_soon')}</option>
              <option value="upcoming">{t('upcoming')}</option>
              <option value="overdue">{t('overdue')}</option>
            </select>
            
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-1 bg-gray-100 rounded-md text-sm border border-gray-200"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category === 'all' ? t('all_categories') : category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {/* Bills by Status */}
      {Object.entries(groupedBills).length > 0 ? (
        <div className="space-y-6">
          {Object.entries(groupedBills).map(([status, bills]) => (
            <div key={status} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-lg font-semibold mb-4">{t(status as BillStatus)}</h2>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="pb-3 text-left font-medium text-gray-500">{t('bill_name')}</th>
                      <th className="pb-3 text-left font-medium text-gray-500">{t('amount')}</th>
                      <th className="pb-3 text-left font-medium text-gray-500">{t('due_date')}</th>
                      <th className="pb-3 text-left font-medium text-gray-500">{t('category')}</th>
                      <th className="pb-3 text-left font-medium text-gray-500">{t('autopay')}</th>
                      <th className="pb-3 text-right font-medium text-gray-500">{t('actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bills.map((bill) => (
                      <tr key={bill.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3">{bill.name}</td>
                        <td className="py-3">₹{bill.amount.toLocaleString()}</td>
                        <td className="py-3">
                          {format(new Date(bill.dueDate), 'dd MMM yyyy')}
                        </td>
                        <td className="py-3">{bill.category}</td>
                        <td className="py-3">
                          <div className="flex items-center space-x-2">
                            <button 
                              onClick={() => toggleAutoPay(bill.id)}
                              className="text-gray-500 hover:text-gray-700"
                            >
                              {autoPayEnabled[bill.id] ? (
                                <ToggleRight size={20} className="text-green-500" />
                              ) : (
                                <ToggleLeft size={20} />
                              )}
                            </button>
                            
                            {autoPayEnabled[bill.id] && (
                              <input
                                type="number"
                                value={autoPayLimit[bill.id] || bill.amount}
                                onChange={(e) => handleAutoPayLimitChange(bill.id, e.target.value)}
                                className="w-20 px-2 py-1 text-sm border border-gray-300 rounded"
                                placeholder={t('limit')}
                              />
                            )}
                          </div>
                        </td>
                        <td className="py-3 text-right">
                          {bill.status === 'paid' ? (
                            <button
                              onClick={() => updateBillStatus(bill.id, 'upcoming')}
                              className="text-sm text-gray-600 hover:text-gray-900"
                            >
                              {t('mark_as_unpaid')}
                            </button>
                          ) : (
                            <button
                              onClick={() => updateBillStatus(bill.id, 'paid')}
                              className="text-sm text-blue-600 hover:text-blue-700"
                            >
                              {t('mark_as_paid')}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
          <p className="text-gray-500">{t('no_bills_found')}</p>
        </div>
      )}
      
      {/* Payment History */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold mb-4">{t('payment_history')}</h2>
        
        {paymentHistory.length > 0 ? (
          <div className="space-y-4">
            {paymentHistory.map((payment) => (
              <div key={payment.id} className="flex items-center border-b border-gray-100 pb-4">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-4">
                  <Calendar size={16} className="text-green-600" />
                </div>
                
                <div className="flex-grow">
                  <div className="font-medium">{payment.name}</div>
                  <div className="text-sm text-gray-500">
                    {format(new Date(payment.updatedAt), 'dd MMM yyyy')}
                  </div>
                </div>
                
                <div className="text-green-600 font-medium">
                  ₹{payment.amount.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-500">{t('no_payment_history')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
