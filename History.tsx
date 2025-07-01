import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { format, parseISO } from 'date-fns';
import { Activity, ArrowUpDown, Download, FileText, Filter, Search, Zap } from 'lucide-react';
import { CSVLink } from 'react-csv';
import { useBillStore } from '../store/billStore';
import { Bill, BillStatus } from '../types';

type AuditEvent = {
  id: string;
  billId: string;
  billName: string;
  actionType: 'created' | 'updated' | 'paid' | 'deleted';
  timestamp: string;
  details: string;
};

export default function History() {
  const { t } = useTranslation();
  const { bills } = useBillStore();
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<BillStatus | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Generate audit events from bills
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  
  // Get unique categories from bills
  const categories = ['all', ...new Set(bills.map(bill => bill.category))];
  
  // ML insights
  const [insights, setInsights] = useState<string[]>([]);
  
  useEffect(() => {
    // Generate audit events
    const events: AuditEvent[] = [];
    
    bills.forEach(bill => {
      // Creation event
      events.push({
        id: `create-${bill.id}`,
        billId: bill.id,
        billName: bill.name,
        actionType: 'created',
        timestamp: bill.createdAt,
        details: `${t('bill_created')} - ${bill.name} (₹${bill.amount})`
      });
      
      // If updated date is different from created date, add update event
      if (bill.updatedAt !== bill.createdAt) {
        events.push({
          id: `update-${bill.id}-${bill.updatedAt}`,
          billId: bill.id,
          billName: bill.name,
          actionType: bill.status === 'paid' ? 'paid' : 'updated',
          timestamp: bill.updatedAt,
          details: bill.status === 'paid' 
            ? `${t('bill_paid')} - ${bill.name} (₹${bill.amount})`
            : `${t('bill_updated')} - ${bill.name} (₹${bill.amount})`
        });
      }
    });
    
    // Sort events by timestamp
    events.sort((a, b) => {
      return sortOrder === 'desc' 
        ? new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        : new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    });
    
    setAuditEvents(events);
    
    // Generate insights
    generateInsights();
  }, [bills, sortOrder, t]);
  
  // Filter audit events based on search and filters
  const filteredEvents = auditEvents.filter(event => {
    // Apply search term
    if (searchTerm && !event.billName.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      const bill = bills.find(b => b.id === event.billId);
      if (!bill || bill.status !== statusFilter) {
        return false;
      }
    }
    
    // Apply category filter
    if (categoryFilter !== 'all') {
      const bill = bills.find(b => b.id === event.billId);
      if (!bill || bill.category !== categoryFilter) {
        return false;
      }
    }
    
    return true;
  });
  
  // Group events by month/year
  const groupedEvents: Record<string, AuditEvent[]> = {};
  
  filteredEvents.forEach(event => {
    const date = parseISO(event.timestamp);
    const monthYear = format(date, 'MMMM yyyy');
    
    if (!groupedEvents[monthYear]) {
      groupedEvents[monthYear] = [];
    }
    
    groupedEvents[monthYear].push(event);
  });
  
  // Prepare CSV data for export
  const csvData = filteredEvents.map(event => {
    const bill = bills.find(b => b.id === event.billId);
    return {
      Date: format(parseISO(event.timestamp), 'dd/MM/yyyy HH:mm'),
      Bill: event.billName,
      Amount: bill?.amount || '-',
      Action: t(event.actionType),
      Details: event.details,
      Category: bill?.category || '-',
      Status: bill ? t(bill.status) : '-'
    };
  });
  
  // Generate ML insights
  const generateInsights = () => {
    const newInsights = [];
    
    // Get paid bills
    const paidBills = bills.filter(bill => bill.status === 'paid');
    
    // Get bills by category
    const billsByCategory: Record<string, Bill[]> = {};
    bills.forEach(bill => {
      if (!billsByCategory[bill.category]) {
        billsByCategory[bill.category] = [];
      }
      billsByCategory[bill.category].push(bill);
    });
    
    // Generate random insights (simulating ML)
    if (paidBills.length > 0) {
      const randomCategory = Object.keys(billsByCategory)[Math.floor(Math.random() * Object.keys(billsByCategory).length)];
      const randomBill = paidBills[Math.floor(Math.random() * paidBills.length)];
      const randomMonth = ['January', 'February', 'March', 'April', 'May', 'June', 'July'][Math.floor(Math.random() * 7)];
      const randomPercent = Math.floor(Math.random() * 30) + 10;
      
      newInsights.push(`${t('your')} ${randomBill.name} ${t('in')} ${randomMonth} ${t('was')} ${randomPercent}% ${t('higher_than_average')}.`);
      
      if (randomCategory) {
        newInsights.push(`${t('you_spent_most_on')} ${randomCategory} ${t('in')} Q${Math.floor(Math.random() * 4) + 1}.`);
      }
      
      if (paidBills.length > 3) {
        const averageAmount = Math.floor(paidBills.reduce((sum, bill) => sum + bill.amount, 0) / paidBills.length);
        newInsights.push(`${t('your_average_bill_amount')}: ₹${averageAmount}`);
      }
    }
    
    setInsights(newInsights);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('history')}</h1>
        
        {filteredEvents.length > 0 && (
          <CSVLink 
            data={csvData} 
            filename={`bill-history-${format(new Date(), 'yyyy-MM-dd')}.csv`}
            className="flex items-center px-3 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100"
          >
            <Download size={16} className="mr-2" />
            {t('export_csv')}
          </CSVLink>
        )}
      </div>
      
      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 space-y-4">
        <div className="flex flex-wrap gap-4">
          <div className="relative flex-grow max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('search_bills')}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter size={16} className="text-gray-500" />
            <span className="text-sm text-gray-500">{t('filter_by')}:</span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as BillStatus | 'all')}
              className="px-3 py-1.5 bg-gray-100 rounded-md text-sm border border-gray-200"
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
              className="px-3 py-1.5 bg-gray-100 rounded-md text-sm border border-gray-200"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category === 'all' ? t('all_categories') : category}
                </option>
              ))}
            </select>
            
            <button
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              className="flex items-center px-3 py-1.5 bg-gray-100 rounded-md text-sm border border-gray-200"
            >
              <ArrowUpDown size={14} className="mr-1.5" />
              {sortOrder === 'desc' ? t('newest_first') : t('oldest_first')}
            </button>
          </div>
        </div>
      </div>
      
      {/* ML Insights */}
      {insights.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center mb-4">
            <Zap size={18} className="text-yellow-500 mr-2" />
            <h2 className="text-lg font-semibold">{t('ml_insights')}</h2>
          </div>
          
          <div className="space-y-3">
            {insights.map((insight, index) => (
              <div key={index} className="p-3 bg-yellow-50 rounded-lg text-gray-800">
                {insight}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Activity Timeline */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center mb-6">
          <Activity size={18} className="text-blue-500 mr-2" />
          <h2 className="text-lg font-semibold">{t('activity_timeline')}</h2>
        </div>
        
        {Object.keys(groupedEvents).length > 0 ? (
          <div className="space-y-8">
            {Object.entries(groupedEvents).map(([monthYear, events]) => (
              <div key={monthYear} className="relative">
                <h3 className="text-md font-medium text-gray-700 sticky top-0 bg-white py-2 z-10">
                  {monthYear}
                </h3>
                
                <div className="ml-4 mt-2 space-y-4">
                  {events.map((event) => (
                    <div key={event.id} className="relative pl-6 pb-4">
                      {/* Timeline connector */}
                      <div className="absolute top-0 left-0 w-px h-full bg-gray-200"></div>
                      
                      {/* Timeline dot */}
                      <div className={`absolute top-1 left-0 w-2 h-2 rounded-full -ml-1 ${
                        event.actionType === 'created' ? 'bg-green-500' :
                        event.actionType === 'paid' ? 'bg-blue-500' :
                        event.actionType === 'updated' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}></div>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <div>
                          <div className="flex items-center mb-1">
                            <FileText size={14} className="text-gray-500 mr-2" />
                            <span className="font-medium">{event.billName}</span>
                          </div>
                          <div className="text-sm text-gray-600">{event.details}</div>
                        </div>
                        
                        <div className="text-sm text-gray-500 mt-2 sm:mt-0">
                          {format(parseISO(event.timestamp), 'PPp')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all'
              ? t('no_matching_history')
              : t('no_history')}
          </div>
        )}
      </div>
    </div>
  );
}
