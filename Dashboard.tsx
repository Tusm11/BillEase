import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import BillAnalytics from '../components/BillAnalytics';
import UpcomingBills from '../components/UpcomingBills';
import Summary from '../components/Summary';
import { useBillStore } from '../store/billStore';

export default function Dashboard() {
  const { t } = useTranslation();
  const { fetchBills, getSummaryData } = useBillStore();

  useEffect(() => {
    fetchBills();
    getSummaryData();
  }, [fetchBills, getSummaryData]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t('dashboard')}</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BillAnalytics />
        <Summary />
      </div>
      
      <UpcomingBills />
    </div>
  );
}
