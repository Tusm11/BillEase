import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDropzone } from 'react-dropzone';
import { Upload as UploadIcon, CircleAlert, FileUp, Image } from 'lucide-react';
import { useUploadStore } from '../../store/uploadStore';

export default function FileUploader() {
  const { t } = useTranslation();
  const { uploadFile } = useUploadStore();
  const [error, setError] = useState<string | null>(null);
  
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const ACCEPTED_FILE_TYPES = {
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'application/pdf': ['.pdf'],
  };
  
  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError(null);
    
    acceptedFiles.forEach((file) => {
      if (file.size > MAX_FILE_SIZE) {
        setError(t('file_too_large', { maxSize: '10MB' }));
        return;
      }
      
      // Process the file
      const reader = new FileReader();
      reader.onload = () => {
        // Process file upload
        uploadFile(file);
      };
      reader.readAsDataURL(file);
    });
  }, [t, uploadFile]);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_FILE_TYPES,
    maxSize: MAX_FILE_SIZE,
    onDropRejected: () => {
      setError(t('invalid_file_format'));
    },
  });
  
  return (
    <div className="space-y-6">
      <div 
        {...getRootProps()} 
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
        }`}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="rounded-full bg-blue-100 p-3">
            <FileUp size={24} className="text-blue-600" />
          </div>
          
          <div>
            <p className="font-medium text-gray-800">
              {isDragActive ? t('drop_files_here') : t('drag_and_drop_files')}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {t('or')} <span className="text-blue-600">{t('browse_files')}</span>
            </p>
          </div>
          
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <span className="flex items-center">
              <Image size={14} className="mr-1" />
              JPG, JPEG, PNG
            </span>
            <span>•</span>
            <span className="flex items-center">
              <FileUp size={14} className="mr-1" />
              PDF
            </span>
            <span>•</span>
            <span>{t('max_file_size', { size: '10MB' })}</span>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="flex items-center p-3 bg-red-50 rounded-lg text-red-600 text-sm">
          <CircleAlert size={16} className="mr-2" />
          {error}
        </div>
      )}
      
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h3 className="font-medium text-gray-800 mb-2">{t('accepted_files')}</h3>
        <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
          <li>{t('images')}: JPG, JPEG, PNG</li>
          <li>{t('documents')}: PDF</li>
          <li>{t('max_size')}: 10MB</li>
        </ul>
      </div>
    </div>
  );
}
