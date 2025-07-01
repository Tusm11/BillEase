import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Upload as UploadIcon, ArrowRight, Download, FileText, Mail } from 'lucide-react';
import FileUploader from '../components/upload/FileUploader';
import EmailImporter from '../components/upload/EmailImporter';
import { useUploadStore } from '../store/uploadStore';

export default function UploadBills() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'upload' | 'email'>('upload');
  const { processingFiles, processedFiles } = useUploadStore();
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t('upload_bills')}</h1>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex items-center px-6 py-4 text-sm font-medium ${
              activeTab === 'upload'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <UploadIcon size={18} className="mr-2" />
            {t('manual_upload')}
          </button>
          <button
            onClick={() => setActiveTab('email')}
            className={`flex items-center px-6 py-4 text-sm font-medium ${
              activeTab === 'email'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Mail size={18} className="mr-2" />
            {t('import_from_email')}
          </button>
        </div>
        
        <div className="p-6">
          {activeTab === 'upload' ? <FileUploader /> : <EmailImporter />}
        </div>
      </div>
      
      {/* Processing Files Section */}
      {processingFiles.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-medium mb-4">{t('processing_files')}</h2>
          <div className="space-y-3">
            {processingFiles.map((file) => (
              <div key={file.id} className="flex items-center p-3 bg-blue-50 rounded-lg">
                <div className="mr-3 bg-blue-100 p-2 rounded-lg">
                  <FileText size={20} className="text-blue-600" />
                </div>
                <div className="flex-grow">
                  <div className="font-medium">{file.name}</div>
                  <div className="text-sm text-gray-500">{file.size} KB</div>
                </div>
                <div className="flex items-center text-blue-600">
                  <div className="h-2 w-24 bg-gray-200 rounded-full overflow-hidden mr-2">
                    <div 
                      className="h-full bg-blue-600 rounded-full" 
                      style={{ width: `${file.progress}%` }}
                    ></div>
                  </div>
                  <span className="text-xs">{file.progress}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Processed Files Section */}
      {processedFiles.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-medium mb-4">{t('processed_files')}</h2>
          <div className="space-y-3">
            {processedFiles.map((file) => (
              <div key={file.id} className="flex items-center p-4 border border-gray-200 rounded-lg">
                <div className="mr-4 bg-green-100 p-2 rounded-lg">
                  <FileText size={20} className="text-green-600" />
                </div>
                <div className="flex-grow">
                  <div className="font-medium">{file.title}</div>
                  <div className="flex items-center mt-1 text-sm">
                    <span className="bg-gray-100 px-2 py-1 rounded text-gray-700 mr-2">
                      {t('amount')}: ₹{file.amount}
                    </span>
                    <span className="bg-gray-100 px-2 py-1 rounded text-gray-700 mr-2">
                      {t('category')}: {t(file.category)}
                    </span>
                    <span className="bg-gray-100 px-2 py-1 rounded text-gray-700">
                      {t('due_date')}: {file.dueDate}
                    </span>
                  </div>
                </div>
                <div>
                  <button className="text-blue-600 hover:text-blue-800 flex items-center text-sm font-medium">
                    {t('view_details')}
                    <ArrowRight size={16} className="ml-1" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
