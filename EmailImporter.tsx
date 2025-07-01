import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CircleCheck, FileText, Mail, RefreshCw } from 'lucide-react';
import { useUploadStore } from '../../store/uploadStore';

type EmailProvider = 'gmail' | 'outlook' | 'yahoo';

export default function EmailImporter() {
  const { t } = useTranslation();
  const { importFromEmail, simulateFoundEmails } = useUploadStore();
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<EmailProvider | null>(null);
  const [foundAttachments, setFoundAttachments] = useState<any[]>([]);
  const [selectedAttachments, setSelectedAttachments] = useState<string[]>([]);
  
  const emailProviders = [
    { id: 'gmail', name: 'Gmail', icon: '📧' },
    { id: 'outlook', name: 'Outlook', icon: '📨' },
    { id: 'yahoo', name: 'Yahoo Mail', icon: '📩' }
  ];
  
  const handleConnect = async (provider: EmailProvider) => {
    setSelectedProvider(provider);
    setIsLoading(true);
    
    // Simulate API connection
    setTimeout(() => {
      setIsConnected(true);
      setIsLoading(false);
      
      // Simulate finding attachments
      const mockAttachments = simulateFoundEmails();
      setFoundAttachments(mockAttachments);
    }, 1500);
  };
  
  const handleRefresh = () => {
    setIsLoading(true);
    
    // Simulate refreshing email
    setTimeout(() => {
      setIsLoading(false);
      
      // Simulate finding attachments
      const mockAttachments = simulateFoundEmails();
      setFoundAttachments(mockAttachments);
    }, 1500);
  };
  
  const toggleSelectAttachment = (id: string) => {
    setSelectedAttachments(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };
  
  const handleImport = () => {
    const selectedFiles = foundAttachments.filter(
      attachment => selectedAttachments.includes(attachment.id)
    );
    
    importFromEmail(selectedFiles);
    setSelectedAttachments([]);
  };
  
  if (!isConnected) {
    return (
      <div className="space-y-6">
        <div className="text-center p-4">
          <Mail size={40} className="text-blue-500 mx-auto mb-3" />
          <h3 className="text-lg font-medium">{t('connect_email_account')}</h3>
          <p className="text-gray-500 mb-6">{t('connect_email_description')}</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
            {emailProviders.map((provider) => (
              <button
                key={provider.id}
                onClick={() => handleConnect(provider.id as EmailProvider)}
                disabled={isLoading}
                className={`flex flex-col items-center p-4 border rounded-lg transition-colors ${
                  isLoading && selectedProvider === provider.id
                    ? 'bg-gray-100 border-gray-300 animate-pulse'
                    : 'hover:bg-blue-50 hover:border-blue-300 border-gray-200'
                }`}
              >
                <span className="text-3xl mb-2">{provider.icon}</span>
                <span className="font-medium">{provider.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <span className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2">
            {selectedProvider === 'gmail' && '📧'}
            {selectedProvider === 'outlook' && '📨'}
            {selectedProvider === 'yahoo' && '📩'}
          </span>
          <span className="font-medium">
            {selectedProvider === 'gmail' && 'Gmail'}
            {selectedProvider === 'outlook' && 'Outlook'}
            {selectedProvider === 'yahoo' && 'Yahoo Mail'}
          </span>
          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
            <CircleCheck size={12} className="mr-1" /> {t('connected')}
          </span>
        </div>
        
        <div className="flex space-x-2">
          <button 
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center text-sm text-gray-600 hover:text-gray-900"
          >
            <RefreshCw size={14} className={`mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            {t('refresh')}
          </button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center p-8">
          <RefreshCw size={24} className="animate-spin text-blue-500 mr-3" />
          <span className="text-gray-600">{t('scanning_emails')}</span>
        </div>
      ) : (
        <>
          {foundAttachments.length > 0 ? (
            <div className="space-y-4">
              <h3 className="font-medium">
                {t('found_attachments', { count: foundAttachments.length })}
              </h3>
              
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-gray-50 p-3 border-b flex items-center">
                  <div className="w-8">
                    <input 
                      type="checkbox" 
                      checked={selectedAttachments.length === foundAttachments.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedAttachments(foundAttachments.map(a => a.id));
                        } else {
                          setSelectedAttachments([]);
                        }
                      }}
                      className="rounded"
                    />
                  </div>
                  <div className="flex-grow font-medium text-sm">{t('file_name')}</div>
                  <div className="w-32 text-sm text-gray-500">{t('size')}</div>
                  <div className="w-40 text-sm text-gray-500">{t('date')}</div>
                </div>
                
                {foundAttachments.map((attachment) => (
                  <div 
                    key={attachment.id} 
                    className="p-3 border-b last:border-b-0 flex items-center hover:bg-gray-50"
                  >
                    <div className="w-8">
                      <input 
                        type="checkbox" 
                        checked={selectedAttachments.includes(attachment.id)}
                        onChange={() => toggleSelectAttachment(attachment.id)}
                        className="rounded"
                      />
                    </div>
                    <div className="flex-grow flex items-center">
                      <FileText size={16} className="text-blue-500 mr-2" />
                      <span>{attachment.name}</span>
                    </div>
                    <div className="w-32 text-sm text-gray-500">{attachment.size} KB</div>
                    <div className="w-40 text-sm text-gray-500">{attachment.date}</div>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-end">
                <button
                  onClick={handleImport}
                  disabled={selectedAttachments.length === 0}
                  className={`px-4 py-2 rounded-lg font-medium text-white ${
                    selectedAttachments.length === 0
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {t('import_selected', { count: selectedAttachments.length })}
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center p-8 border rounded-lg">
              <Mail size={40} className="text-gray-400 mx-auto mb-3" />
              <h3 className="font-medium text-gray-800">{t('no_bills_found')}</h3>
              <p className="text-gray-500 mb-4">{t('no_bills_found_description')}</p>
              <button
                onClick={handleRefresh}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                {t('refresh_inbox')}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
