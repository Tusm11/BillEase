import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, Menu, X } from 'lucide-react';
import LanguageSelector from './LanguageSelector';

export default function TopBar() {
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200 py-3 px-4 flex items-center justify-between">
      <div className="flex items-center md:hidden">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="text-gray-600 hover:text-gray-900"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      
      <div className="md:hidden">
        <h1 className="text-lg font-bold">{t('app_name')}</h1>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="relative">
          <button className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200">
            <Bell size={18} />
          </button>
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
        </div>
        
        <LanguageSelector />
        
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
            U
          </div>
        </div>
      </div>
      
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-white pt-16">
          <nav className="p-4">
            <ul className="space-y-4">
              <li>
                <a href="/dashboard" className="block px-4 py-2 rounded-lg hover:bg-gray-100">
                  {t('dashboard')}
                </a>
              </li>
              <li>
                <a href="/upload" className="block px-4 py-2 rounded-lg hover:bg-gray-100">
                  {t('upload_bills')}
                </a>
              </li>
              <li>
                <a href="/payments" className="block px-4 py-2 rounded-lg hover:bg-gray-100">
                  {t('payments')}
                </a>
              </li>
              <li>
                <a href="/reminders" className="block px-4 py-2 rounded-lg hover:bg-gray-100">
                  {t('reminders')}
                </a>
              </li>
              <li>
                <a href="/budget" className="block px-4 py-2 rounded-lg hover:bg-gray-100">
                  {t('budget')}
                </a>
              </li>
              <li>
                <a href="/history" className="block px-4 py-2 rounded-lg hover:bg-gray-100">
                  {t('history')}
                </a>
              </li>
              <li>
                <a href="/profile" className="block px-4 py-2 rounded-lg hover:bg-gray-100">
                  {t('profile')}
                </a>
              </li>
              <li>
                <a href="/support" className="block px-4 py-2 rounded-lg hover:bg-gray-100">
                  {t('support')}
                </a>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
}
