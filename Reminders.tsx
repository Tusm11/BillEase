import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, Calendar, Clock, Pencil, Plus, Trash, Zap } from 'lucide-react';
import { format } from 'date-fns';
import { useReminderStore } from '../store/reminderStore';
import { useBillStore } from '../store/billStore';
import { NotificationChannel, ReminderFrequency } from '../types';

export default function Reminders() {
  const { t } = useTranslation();
  const { reminders, fetchReminders, addReminder, updateReminder, deleteReminder, toggleReminderActive, simulateAIReminders } = useReminderStore();
  const { bills, fetchBills } = useBillStore();
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    billId: '',
    title: '',
    message: '',
    date: '',
    time: '09:00',
    frequency: 'once' as ReminderFrequency,
    channels: ['in-app'] as NotificationChannel[],
  });
  
  useEffect(() => {
    fetchReminders();
    fetchBills();
  }, [fetchReminders, fetchBills]);
  
  // Handle edit reminder
  const handleEditReminder = (id: string) => {
    const reminder = reminders.find(r => r.id === id);
    if (reminder) {
      setFormData({
        billId: reminder.billId,
        title: reminder.title,
        message: reminder.message,
        date: reminder.date,
        time: reminder.time,
        frequency: reminder.frequency,
        channels: [...reminder.channels],
      });
      setSelectedReminder(id);
      setIsEditModalOpen(true);
    }
  };
  
  // Handle form input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle channel checkbox change
  const handleChannelChange = (channel: NotificationChannel) => {
    setFormData(prev => {
      if (prev.channels.includes(channel)) {
        return {
          ...prev,
          channels: prev.channels.filter(c => c !== channel)
        };
      } else {
        return {
          ...prev,
          channels: [...prev.channels, channel]
        };
      }
    });
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isEditModalOpen && selectedReminder) {
      updateReminder(selectedReminder, formData);
      setIsEditModalOpen(false);
    } else {
      addReminder({
        ...formData,
        isActive: true,
      });
      setIsAddModalOpen(false);
    }
    
    // Reset form
    setFormData({
      billId: '',
      title: '',
      message: '',
      date: '',
      time: '09:00',
      frequency: 'once',
      channels: ['in-app'],
    });
    setSelectedReminder(null);
  };
  
  // Group reminders by date
  const groupedReminders = reminders.reduce<Record<string, typeof reminders>>((acc, reminder) => {
    if (!acc[reminder.date]) {
      acc[reminder.date] = [];
    }
    acc[reminder.date].push(reminder);
    return acc;
  }, {});
  
  // Sort dates
  const sortedDates = Object.keys(groupedReminders).sort((a, b) => 
    new Date(a).getTime() - new Date(b).getTime()
  );
  
  // Get bill name from bill id
  const getBillName = (billId: string) => {
    const bill = bills.find(b => b.id === billId);
    return bill ? bill.name : t('unknown_bill');
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('reminders')}</h1>
        
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          <Plus size={16} className="mr-2" />
          {t('add_reminder')}
        </button>
      </div>
      
      {/* Reminders Calendar */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold mb-4">{t('upcoming_reminders')}</h2>
        
        {sortedDates.length > 0 ? (
          <div className="space-y-6">
            {sortedDates.map(date => (
              <div key={date} className="space-y-3">
                <div className="flex items-center">
                  <Calendar size={18} className="text-blue-600 mr-2" />
                  <h3 className="font-medium">
                    {format(new Date(date), 'EEEE, MMMM d, yyyy')}
                  </h3>
                </div>
                
                <div className="space-y-2 pl-6">
                  {groupedReminders[date].map(reminder => (
                    <div 
                      key={reminder.id} 
                      className={`p-4 rounded-lg border ${
                        reminder.isActive
                          ? 'bg-white border-gray-200'
                          : 'bg-gray-50 border-gray-200 opacity-70'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`w-10 h-10 rounded-full ${
                            reminder.isActive ? 'bg-blue-100' : 'bg-gray-100'
                          } flex items-center justify-center mr-3`}>
                            <Bell size={16} className={reminder.isActive ? 'text-blue-600' : 'text-gray-500'} />
                          </div>
                          
                          <div>
                            <div className="font-medium">{reminder.title}</div>
                            <div className="text-sm text-gray-500">
                              {getBillName(reminder.billId)} • {reminder.time}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => toggleReminderActive(reminder.id)}
                            className={`p-1.5 rounded-full ${
                              reminder.isActive
                                ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                            }`}
                          >
                            <Bell size={14} />
                          </button>
                          
                          <button
                            onClick={() => handleEditReminder(reminder.id)}
                            className="p-1.5 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
                          >
                            <Pencil size={14} />
                          </button>
                          
                          <button
                            onClick={() => deleteReminder(reminder.id)}
                            className="p-1.5 rounded-full bg-red-100 text-red-600 hover:bg-red-200"
                          >
                            <Trash size={14} />
                          </button>
                        </div>
                      </div>
                      
                      <div className="mt-3 text-gray-600 text-sm">
                        {reminder.message}
                      </div>
                      
                      <div className="mt-3 flex flex-wrap gap-2">
                        {reminder.channels.map(channel => (
                          <span key={channel} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                            {t(channel)}
                          </span>
                        ))}
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                          {t(reminder.frequency)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Bell size={40} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">{t('no_reminders')}</p>
          </div>
        )}
      </div>
      
      {/* Smart Reminders */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">{t('smart_reminders')}</h2>
          
          <div className="flex items-center">
            <button
              onClick={() => {
                // Generate AI reminders for each bill
                bills.forEach(bill => {
                  simulateAIReminders(bill.id);
                });
              }}
              className="flex items-center px-3 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100"
            >
              <Zap size={16} className="mr-2" />
              {t('generate_smart_reminders')}
            </button>
          </div>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-lg text-blue-800 text-sm">
          <p>{t('smart_reminders_description')}</p>
        </div>
      </div>
      
      {/* Add/Pencil Reminder Modal */}
      {(isAddModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <h2 className="text-xl font-semibold mb-4">
              {isEditModalOpen ? t('edit_reminder') : t('add_reminder')}
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('bill')}
                  </label>
                  <select
                    name="billId"
                    value={formData.billId}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">{t('select_bill')}</option>
                    {bills.map(bill => (
                      <option key={bill.id} value={bill.id}>
                        {bill.name} - ₹{bill.amount}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('title')}
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('message')}
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('date')}
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('time')}
                    </label>
                    <input
                      type="time"
                      name="time"
                      value={formData.time}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('frequency')}
                  </label>
                  <select
                    name="frequency"
                    value={formData.frequency}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="once">{t('once')}</option>
                    <option value="daily">{t('daily')}</option>
                    <option value="weekly">{t('weekly')}</option>
                    <option value="monthly">{t('monthly')}</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('notification_channels')}
                  </label>
                  <div className="space-y-2">
                    {(['in-app', 'email', 'sms'] as NotificationChannel[]).map(channel => (
                      <label key={channel} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.channels.includes(channel)}
                          onChange={() => handleChannelChange(channel)}
                          className="rounded mr-2"
                        />
                        <span className="text-sm">{t(channel)}</span>
                      </label>
                    ))}
                  </div>
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
                  {isEditModalOpen ? t('update') : t('create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
