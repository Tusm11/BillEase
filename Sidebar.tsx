import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import { Bell, CreditCard, CircleHelp, History, LayoutDashboard, PiggyBank, Upload, User } from 'lucide-react';

export default function Sidebar() {
  const { t } = useTranslation();

  const navItems = [
    { to: '/dashboard', icon: <LayoutDashboard size={20} />, label: t('dashboard') },
    { to: '/upload', icon: <Upload size={20} />, label: t('upload_bills') },
    { to: '/payments', icon: <CreditCard size={20} />, label: t('payments') },
    { to: '/reminders', icon: <Bell size={20} />, label: t('reminders') },
    { to: '/budget', icon: <PiggyBank size={20} />, label: t('budget') },
    { to: '/history', icon: <History size={20} />, label: t('history') },
    { to: '/profile', icon: <User size={20} />, label: t('profile') },
    { to: '/support', icon: <CircleHelp size={20} />, label: t('support') },
  ];

  return (
    <div className="h-full w-64 bg-white border-r border-gray-200 flex-shrink-0 hidden md:block">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 12H18M12 6V18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className="text-xl font-bold">{t('app_name')}</h1>
        </div>
      </div>
      <nav className="p-2">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`
                }
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
