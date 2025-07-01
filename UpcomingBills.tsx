import { useTranslation } from 'react-i18next';
import { format, isPast, differenceInDays } from 'date-fns';
import { useBillStore } from '../store/billStore';
import { CircleAlert, Check, Clock } from 'lucide-react';

export default function UpcomingBills() {
  const { t } = useTranslation();
  const { bills, updateBillStatus } = useBillStore();
  
  // Sort bills by due date (nearest first)
  const sortedBills = [...bills].sort((a, b) => {
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <Check size={16} className="text-green-500" />;
      case 'overdue':
        return <CircleAlert size={16} className="text-red-500" />;
      case 'due_soon':
        return <Clock size={16} className="text-amber-500" />;
      default:
        return <Clock size={16} className="text-blue-500" />;
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'due_soon':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };
  
  const getDueDateLabel = (dueDate: string) => {
    const today = new Date();
    const dueDateObj = new Date(dueDate);
    
    if (isPast(dueDateObj)) {
      const days = differenceInDays(today, dueDateObj);
      return `${days} ${days === 1 ? 'day' : 'days'} overdue`;
    } else {
      const days = differenceInDays(dueDateObj, today);
      if (days === 0) return 'Due today';
      return `Due in ${days} ${days === 1 ? 'day' : 'days'}`;
    }
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-lg font-semibold mb-4">{t('upcoming_bills')}</h2>
      
      {sortedBills.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="pb-3 text-left font-medium text-gray-500">{t('bill_name')}</th>
                <th className="pb-3 text-left font-medium text-gray-500">{t('amount')}</th>
                <th className="pb-3 text-left font-medium text-gray-500">{t('due_date')}</th>
                <th className="pb-3 text-left font-medium text-gray-500">{t('status')}</th>
                <th className="pb-3 text-left font-medium text-gray-500">{t('category')}</th>
                <th className="pb-3 text-right font-medium text-gray-500"></th>
              </tr>
            </thead>
            <tbody>
              {sortedBills.map((bill) => (
                <tr key={bill.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3">{bill.name}</td>
                  <td className="py-3">₹{bill.amount.toLocaleString()}</td>
                  <td className="py-3">
                    <div>
                      {format(new Date(bill.dueDate), 'dd MMM yyyy')}
                    </div>
                    <div className="text-xs text-gray-500">
                      {getDueDateLabel(bill.dueDate)}
                    </div>
                  </td>
                  <td className="py-3">
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getStatusColor(bill.status)}`}>
                      {getStatusIcon(bill.status)}
                      <span className="ml-1">{t(bill.status)}</span>
                    </div>
                  </td>
                  <td className="py-3">{bill.category}</td>
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
      ) : (
        <div className="flex items-center justify-center h-24 text-gray-500">
          {t('no_bills')}
        </div>
      )}
    </div>
  );
}
