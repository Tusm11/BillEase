import { create } from 'zustand';
import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { useBillStore } from './billStore';


// Types
interface ProcessingFile {
  id: string;
  name: string;
  size: number;
  progress: number;
  type: string;
}

interface ProcessedFile {
  id: string;
  title: string;
  amount: number;
  category: string;
  dueDate: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
}

interface UploadState {
  processingFiles: ProcessingFile[];
  processedFiles: ProcessedFile[];
  uploadFile: (file: File) => void;
  importFromEmail: (attachments: any[]) => void;
  simulateFoundEmails: () => any[];
}

// Helper to simulate AI processing
const simulateAIProcessing = (file: File): Promise<{
  title: string;
  amount: number;
  category: string;
  dueDate: string;
}> => {
  return new Promise((resolve) => {
    // Randomly select a title based on file name
    const fileNameLower = file.name.toLowerCase();
    let title = 'Unknown Bill';
    let category = 'Others';
    
    if (fileNameLower.includes('electric') || fileNameLower.includes('power')) {
      title = 'Electricity Bill';
      category = 'Utilities';
    } else if (fileNameLower.includes('water')) {
      title = 'Water Bill';
      category = 'Utilities';
    } else if (fileNameLower.includes('phone') || fileNameLower.includes('mobile')) {
      title = 'Phone Bill';
      category = 'Utilities';
    } else if (fileNameLower.includes('internet') || fileNameLower.includes('wifi')) {
      title = 'Internet Bill';
      category = 'Utilities';
    } else if (fileNameLower.includes('rent') || fileNameLower.includes('house')) {
      title = 'House Rent';
      category = 'Housing';
    } else if (fileNameLower.includes('tv') || fileNameLower.includes('dth')) {
      title = 'DTH Subscription';
      category = 'Entertainment';
    } else if (fileNameLower.includes('insurance')) {
      title = 'Insurance Premium';
      category = 'Insurance';
    } else if (fileNameLower.includes('credit') || fileNameLower.includes('card')) {
      title = 'Credit Card Bill';
      category = 'Finance';
    }
    
    // Random amount between 500 and 5000
    const amount = Math.floor(Math.random() * 4500) + 500;
    
    // Random due date in the next 15 days
    const daysToAdd = Math.floor(Math.random() * 15) + 1;
    const dueDate = format(
      new Date(new Date().setDate(new Date().getDate() + daysToAdd)),
      'yyyy-MM-dd'
    );
    
    // Simulate processing time
    setTimeout(() => {
      resolve({
        title,
        amount,
        category,
        dueDate
      });
    }, Math.random() * 2000 + 1000);
  });
};

// Store
export const useUploadStore = create<UploadState>((set, get) => ({
  processingFiles: [],
  processedFiles: [],
  
  uploadFile: (file: File) => {
    const fileId = uuidv4();
    const fileSizeKB = Math.round(file.size / 1024);
    
    // Add to processing queue
    set((state) => ({
      processingFiles: [
        ...state.processingFiles,
        {
          id: fileId,
          name: file.name,
          size: fileSizeKB,
          progress: 0,
          type: file.type
        }
      ]
    }));
    
    // Simulate upload progress
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += Math.floor(Math.random() * 15) + 5;
      
      if (progress >= 100) {
        progress = 100;
        clearInterval(progressInterval);
        
        // Simulate AI processing
        simulateAIProcessing(file).then((result) => {
          // Remove from processing
          set((state) => ({
            processingFiles: state.processingFiles.filter((f) => f.id !== fileId),
            processedFiles: [
              ...state.processedFiles,
              {
                id: fileId,
                title: result.title,
                amount: result.amount,
                category: result.category,
                dueDate: result.dueDate,
                fileName: file.name,
                fileUrl: URL.createObjectURL(file),
                fileType: file.type,
                fileSize: fileSizeKB,
                uploadedAt: new Date().toISOString()
              }
            ]
          }));
          
          // Add bill to bill store
          const { addBill } = useBillStore.getState();
          
          if (typeof addBill === 'function') {
            addBill({
              id: fileId,
              name: result.title,
              amount: result.amount,
              dueDate: result.dueDate,
              category: result.category,
              status: 'upcoming',
              createdAt: new Date().toISOString().split('T')[0],
              updatedAt: new Date().toISOString().split('T')[0]
            });
          }
        });
      } else {
        // Update progress
        set((state) => ({
          processingFiles: state.processingFiles.map((f) =>
            f.id === fileId ? { ...f, progress } : f
          )
        }));
      }
    }, 200);
  },
  
  importFromEmail: (attachments) => {
    // Process selected email attachments
    attachments.forEach((attachment) => {
      // Add to processing queue
      set((state) => ({
        processingFiles: [
          ...state.processingFiles,
          {
            id: attachment.id,
            name: attachment.name,
            size: attachment.size,
            progress: 0,
            type: attachment.type || 'application/pdf'
          }
        ]
      }));
      
      // Simulate processing
      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += Math.floor(Math.random() * 15) + 5;
        
        if (progress >= 100) {
          progress = 100;
          clearInterval(progressInterval);
          
          // Simulate result
          setTimeout(() => {
            const result = {
              title: attachment.subject || 'Email Bill',
              amount: Math.floor(Math.random() * 4500) + 500,
              category: attachment.category || 'Others',
              dueDate: format(
                new Date(new Date().setDate(new Date().getDate() + Math.floor(Math.random() * 15) + 1)),
                'yyyy-MM-dd'
              )
            };
            
            // Remove from processing
            set((state) => ({
              processingFiles: state.processingFiles.filter((f) => f.id !== attachment.id),
              processedFiles: [
                ...state.processedFiles,
                {
                  id: attachment.id,
                  title: result.title,
                  amount: result.amount,
                  category: result.category,
                  dueDate: result.dueDate,
                  fileName: attachment.name,
                  fileUrl: '#',
                  fileType: attachment.type || 'application/pdf',
                  fileSize: attachment.size,
                  uploadedAt: new Date().toISOString()
                }
              ]
            }));
            
            // Add bill to bill store
            const { addBill } = useBillStore.getState();
            
            if (typeof addBill === 'function') {
              addBill({
                id: attachment.id,
                name: result.title,
                amount: result.amount,
                dueDate: result.dueDate,
                category: result.category,
                status: 'upcoming',
                createdAt: new Date().toISOString().split('T')[0],
                updatedAt: new Date().toISOString().split('T')[0]
              });
            }
          }, 1000);
        } else {
          // Update progress
          set((state) => ({
            processingFiles: state.processingFiles.map((f) =>
              f.id === attachment.id ? { ...f, progress } : f
            )
          }));
        }
      }, 200);
    });
  },
  
  simulateFoundEmails: () => {
    const count = Math.floor(Math.random() * 5) + 1;
    const attachments = [];
    
    const subjects = [
      'Your Monthly Electricity Bill',
      'Water Bill Payment',
      'Internet Service Invoice',
      'Mobile Phone Statement',
      'Credit Card Bill',
      'Insurance Premium',
      'Subscription Renewal',
      'Utility Bill'
    ];
    
    const today = new Date();
    
    for (let i = 0; i < count; i++) {
      const randomDay = Math.floor(Math.random() * 10);
      const date = new Date(today);
      date.setDate(date.getDate() - randomDay);
      
      attachments.push({
        id: uuidv4(),
        name: `Bill_${Math.floor(Math.random() * 1000)}.pdf`,
        size: Math.floor(Math.random() * 900) + 100,
        date: format(date, 'dd MMM yyyy'),
        subject: subjects[Math.floor(Math.random() * subjects.length)],
        type: 'application/pdf'
      });
    }
    
    return attachments;
  }
}));
