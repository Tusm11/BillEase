import { useTranslation } from 'react-i18next';
import { useBillStore } from '../store/billStore';
import { SummaryType } from '../types';

export default function Summary() {
  const { t } = useTranslation();
  const { summaryType, setSummaryType, summaryData } = useBillStore();
  
  const summaryTabs: SummaryType[] = ['weekly', 'monthly', 'yearly'];
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">{t('summary')}</h2>
        
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {summaryTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setSummaryType(tab)}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                summaryType === tab
                  ? 'bg-white shadow text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {t(tab)}
            </button>
          ))}
        </div>
      </div>
      
      {summaryData ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-500">{t('total_bills')}</div>
            <div className="text-2xl font-bold mt-1">{summaryData.totalBills}</div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-sm text-gray-500">{t('amount_paid')}</div>
            <div className="text-2xl font-bold mt-1 text-green-600">₹{summaryData.amountPaid.toLocaleString()}</div>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-sm text-gray-500">{t('amount_due')}</div>
            <div className="text-2xl font-bold mt-1 text-blue-600">₹{summaryData.amountDue.toLocaleString()}</div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-32">
          <div className="animate-pulse text-gray-400">{t('loading')}</div>
        </div>
      )}
    </div>
  );
}
