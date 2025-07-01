import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, CreditCard, Globe, Moon, Save, Settings, Sun, Trash2, User } from 'lucide-react';
import { useLanguageStore } from '../store/languageStore';
import { Language } from '../types';

type ProfileTab = 'personal' | 'notifications' | 'appearance' | 'data';

interface ProfileData {
  name: string;
  mobile: string;
  currency: string;
  language: Language;
  reminderDays: number[];
  notificationChannels: ('push' | 'email' | 'sms')[];
  darkMode: boolean;
}

export default function Profile() {
  const { t } = useTranslation();
  const { currentLanguage, setLanguage } = useLanguageStore();
  
  const [activeTab, setActiveTab] = useState<ProfileTab>('personal');
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showSaveToast, setShowSaveToast] = useState(false);
  
  // Profile data state
  const [profileData, setProfileData] = useState<ProfileData>({
    name: 'User',
    mobile: '+91 9876543210',
    currency: 'INR',
    language: currentLanguage,
    reminderDays: [7, 3, 1],
    notificationChannels: ['push', 'email'],
    darkMode: false
  });
  
  // Load profile data from localStorage
  useEffect(() => {
    const savedProfile = localStorage.getItem('profile');
    if (savedProfile) {
      const parsedProfile = JSON.parse(savedProfile);
      setProfileData(parsedProfile);
      setIsDarkMode(parsedProfile.darkMode);
    }
  }, []);
  
  // Apply dark mode when theme changes
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);
  
  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle checkbox changes for notification channels
  const handleChannelChange = (channel: 'push' | 'email' | 'sms') => {
    setProfileData(prev => {
      if (prev.notificationChannels.includes(channel)) {
        return {
          ...prev,
          notificationChannels: prev.notificationChannels.filter(c => c !== channel)
        };
      } else {
        return {
          ...prev,
          notificationChannels: [...prev.notificationChannels, channel]
        };
      }
    });
  };
  
  // Handle reminder days changes
  const handleReminderDayChange = (day: number) => {
    setProfileData(prev => {
      if (prev.reminderDays.includes(day)) {
        return {
          ...prev,
          reminderDays: prev.reminderDays.filter(d => d !== day)
        };
      } else {
        return {
          ...prev,
          reminderDays: [...prev.reminderDays, day].sort((a, b) => b - a)
        };
      }
    });
  };
  
  // Handle language change
  const handleLanguageChange = (language: Language) => {
    setProfileData(prev => ({
      ...prev,
      language
    }));
    setLanguage(language);
  };
  
  // Handle dark mode toggle
  const handleDarkModeToggle = () => {
    setIsDarkMode(prev => !prev);
    setProfileData(prev => ({
      ...prev,
      darkMode: !prev.darkMode
    }));
  };
  
  // Save profile data
  const handleSaveProfile = () => {
    localStorage.setItem('profile', JSON.stringify(profileData));
    setShowSaveToast(true);
    setTimeout(() => setShowSaveToast(false), 3000);
  };
  
  // Clear all data
  const handleClearData = () => {
    localStorage.clear();
    setShowConfirmDelete(false);
    window.location.reload();
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('profile')}</h1>
        
        <button
          onClick={handleSaveProfile}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          <Save size={16} className="mr-2" />
          {t('save_changes')}
        </button>
      </div>
      
      {/* Save Toast */}
      {showSaveToast && (
        <div className="fixed top-4 right-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-md z-50">
          <div className="flex">
            <div className="py-1">
              <svg className="h-6 w-6 text-green-500 mr-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="font-bold">{t('profile_saved')}</p>
              <p className="text-sm">{t('your_changes_saved')}</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <div className="w-full md:w-64 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <User size={20} className="text-blue-600" />
              </div>
              <div>
                <div className="font-medium">{profileData.name}</div>
                <div className="text-sm text-gray-500">{profileData.mobile}</div>
              </div>
            </div>
          </div>
          
          <nav className="p-2">
            <ul className="space-y-1">
              <li>
                <button
                  onClick={() => setActiveTab('personal')}
                  className={`flex items-center w-full px-3 py-2 rounded-lg transition-colors ${
                    activeTab === 'personal'
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <User size={18} className="mr-3" />
                  {t('personal_info')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('notifications')}
                  className={`flex items-center w-full px-3 py-2 rounded-lg transition-colors ${
                    activeTab === 'notifications'
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Bell size={18} className="mr-3" />
                  {t('notifications')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('appearance')}
                  className={`flex items-center w-full px-3 py-2 rounded-lg transition-colors ${
                    activeTab === 'appearance'
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {isDarkMode ? (
                    <Moon size={18} className="mr-3" />
                  ) : (
                    <Sun size={18} className="mr-3" />
                  )}
                  {t('appearance')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('data')}
                  className={`flex items-center w-full px-3 py-2 rounded-lg transition-colors ${
                    activeTab === 'data'
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Settings size={18} className="mr-3" />
                  {t('data_settings')}
                </button>
              </li>
            </ul>
          </nav>
        </div>
        
        {/* Content */}
        <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {/* Personal Info */}
          {activeTab === 'personal' && (
            <div>
              <h2 className="text-xl font-semibold mb-6">{t('personal_info')}</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('name')}
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={profileData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('mobile_number')}
                  </label>
                  <input
                    type="text"
                    name="mobile"
                    value={profileData.mobile}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('preferred_currency')}
                  </label>
                  <select
                    name="currency"
                    value={profileData.currency}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="INR">Indian Rupee (₹)</option>
                    <option value="USD">US Dollar ($)</option>
                    <option value="EUR">Euro (€)</option>
                    <option value="GBP">British Pound (£)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('preferred_language')}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      onClick={() => handleLanguageChange('en')}
                      className={`flex items-center justify-between px-4 py-2 rounded-md border ${
                        profileData.language === 'en'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center">
                        <Globe size={16} className="mr-2" />
                        <span>English</span>
                      </div>
                      {profileData.language === 'en' && (
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      )}
                    </button>
                    
                    <button
                      onClick={() => handleLanguageChange('hi')}
                      className={`flex items-center justify-between px-4 py-2 rounded-md border ${
                        profileData.language === 'hi'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center">
                        <Globe size={16} className="mr-2" />
                        <span>हिन्दी</span>
                      </div>
                      {profileData.language === 'hi' && (
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      )}
                    </button>
                    
                    <button
                      onClick={() => handleLanguageChange('te')}
                      className={`flex items-center justify-between px-4 py-2 rounded-md border ${
                        profileData.language === 'te'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center">
                        <Globe size={16} className="mr-2" />
                        <span>తెలుగు</span>
                      </div>
                      {profileData.language === 'te' && (
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      )}
                    </button>
                    
                    <button
                      onClick={() => handleLanguageChange('ta')}
                      className={`flex items-center justify-between px-4 py-2 rounded-md border ${
                        profileData.language === 'ta'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center">
                        <Globe size={16} className="mr-2" />
                        <span>தமிழ்</span>
                      </div>
                      {profileData.language === 'ta' && (
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      )}
                    </button>
                    
                    <button
                      onClick={() => handleLanguageChange('kn')}
                      className={`flex items-center justify-between px-4 py-2 rounded-md border ${
                        profileData.language === 'kn'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center">
                        <Globe size={16} className="mr-2" />
                        <span>ಕನ್ನಡ</span>
                      </div>
                      {profileData.language === 'kn' && (
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      )}
                    </button>
                    
                    <button
                      onClick={() => handleLanguageChange('ml')}
                      className={`flex items-center justify-between px-4 py-2 rounded-md border ${
                        profileData.language === 'ml'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center">
                        <Globe size={16} className="mr-2" />
                        <span>മലയാളം</span>
                      </div>
                      {profileData.language === 'ml' && (
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Notifications */}
          {activeTab === 'notifications' && (
            <div>
              <h2 className="text-xl font-semibold mb-6">{t('notification_settings')}</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-md font-medium mb-3">{t('notification_channels')}</h3>
                  <div className="space-y-2">
                    {['push', 'email', 'sms'].map((channel) => (
                      <label key={channel} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={profileData.notificationChannels.includes(channel as any)}
                          onChange={() => handleChannelChange(channel as any)}
                          className="rounded mr-2"
                        />
                        <span className="ml-2">{t(channel)}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-md font-medium mb-3">{t('reminder_intervals')}</h3>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500 mb-2">
                      {t('reminder_intervals_description')}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {[7, 5, 3, 2, 1].map((day) => (
                        <button
                          key={day}
                          onClick={() => handleReminderDayChange(day)}
                          className={`px-4 py-2 rounded-md border ${
                            profileData.reminderDays.includes(day)
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {day} {day === 1 ? t('day') : t('days')}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Appearance */}
          {activeTab === 'appearance' && (
            <div>
              <h2 className="text-xl font-semibold mb-6">{t('appearance')}</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-md font-medium mb-3">{t('theme')}</h3>
                  <div className="flex space-x-4">
                    <button
                      onClick={() => handleDarkModeToggle()}
                      className={`flex items-center px-4 py-3 rounded-lg border ${
                        !isDarkMode
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300'
                      }`}
                    >
                      <Sun size={20} className="mr-3 text-yellow-500" />
                      <div className="text-left">
                        <div className="font-medium">{t('light')}</div>
                        <div className="text-xs text-gray-500">{t('light_theme_description')}</div>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => handleDarkModeToggle()}
                      className={`flex items-center px-4 py-3 rounded-lg border ${
                        isDarkMode
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300'
                      }`}
                    >
                      <Moon size={20} className="mr-3 text-indigo-500" />
                      <div className="text-left">
                        <div className="font-medium">{t('dark')}</div>
                        <div className="text-xs text-gray-500">{t('dark_theme_description')}</div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Data Settings */}
          {activeTab === 'data' && (
            <div>
              <h2 className="text-xl font-semibold mb-6">{t('data_settings')}</h2>
              
              <div className="space-y-6">
                <div className="p-4 bg-red-50 rounded-lg border border-red-100">
                  <h3 className="text-md font-medium text-red-700 mb-2">{t('danger_zone')}</h3>
                  <p className="text-sm text-red-600 mb-4">
                    {t('data_delete_warning')}
                  </p>
                  
                  {!showConfirmDelete ? (
                    <button
                      onClick={() => setShowConfirmDelete(true)}
                      className="flex items-center px-4 py-2 bg-white border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
                    >
                      <Trash2 size={16} className="mr-2" />
                      {t('delete_all_data')}
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-red-700">
                        {t('confirm_delete_prompt')}
                      </p>
                      <div className="flex space-x-3">
                        <button
                          onClick={handleClearData}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                        >
                          {t('yes_delete')}
                        </button>
                        <button
                          onClick={() => setShowConfirmDelete(false)}
                          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                        >
                          {t('cancel')}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                
                <div>
                  <h3 className="text-md font-medium mb-2">{t('export_data')}</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    {t('export_data_description')}
                  </p>
                  <button className="flex items-center px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200">
                    <CreditCard size={16} className="mr-2" />
                    {t('export_all_data')}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
