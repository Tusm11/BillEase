import { useTranslation } from 'react-i18next';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useBillStore } from '../store/billStore';

export default function BillAnalytics() {
  const { t } = useTranslation();
  const { summaryData } = useBillStore();
  
  const COLORS = ['#10B981', '#EF4444', '#6366F1', '#F59E0B'];
  
  const data = summaryData ? [
    { name: t('paid'), value: summaryData.billsByCategory.paid },
    { name: t('overdue'), value: summaryData.billsByCategory.overdue },
    { name: t('upcoming'), value: summaryData.billsByCategory.upcoming },
    { name: t('due_soon'), value: summaryData.billsByCategory.due_soon },
  ] : [];
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-lg font-semibold mb-4">{t('bill_analytics')}</h2>
      
      {summaryData ? (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse text-gray-400">{t('loading')}</div>
        </div>
      )}
    </div>
  );
}
