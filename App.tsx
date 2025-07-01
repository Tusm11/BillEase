import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './index.css';
import './i18n';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import UploadBills from './pages/UploadBills';
import Payments from './pages/Payments';
import Reminders from './pages/Reminders';
import Budget from './pages/Budget';
import History from './pages/History';
import Profile from './pages/Profile';
import Support from './pages/Support';
import { initializeMockData } from './services/mockDataService';

export function App() {
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    // Load fonts
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@400;500;600;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    // Initialize mock data
    initializeMockData();

    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="fixed inset-0" style={{ fontFamily: 'Inter, sans-serif' }}>
        <div className="relative size-full">
          <div className="absolute inset-0 bg-[#f9f9f9] flex size-full flex-col items-center justify-center gap-4 p-8 text-center">
            <div className="relative flex items-center justify-center w-14 h-14 bg-white border rounded-full">
              <div className="absolute h-14 w-14 rounded-full animate-spin bg-gradient-to-b from-blue-500/70 to-transparent"></div>
              <div className="absolute flex items-center justify-center bg-white rounded-full h-[52px] w-[52px]">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 12H18M12 6V18" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>

            <div className="text-[#000000] font-semibold text-2xl">BillEase</div>
            <div className="text-blue-500 text-lg">{t('loading')}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="upload" element={<UploadBills />} />
          <Route path="payments" element={<Payments />} />
          <Route path="reminders" element={<Reminders />} />
          <Route path="budget" element={<Budget />} />
          <Route path="history" element={<History />} />
          <Route path="profile" element={<Profile />} />
          <Route path="support" element={<Support />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
