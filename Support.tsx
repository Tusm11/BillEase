import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, ChevronUp, MessageSquare, Send, Star, ThumbsUp, Users } from 'lucide-react';
import { useLanguageStore } from '../store/languageStore';

type FaqItem = {
  id: number;
  question: string;
  answer: string;
};

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
};

type FeedbackItem = {
  id: string;
  rating: number;
  comment: string;
  date: Date;
};

export default function Support() {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguageStore();
  
  // FAQ state
  const [openFaqId, setOpenFaqId] = useState<number | null>(null);
  
  // Contact form state
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [formSubmitted, setFormSubmitted] = useState(false);
  
  // Feedback state
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  
  // Chatbot state
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<Message[]>([
    {
      id: '1',
      text: t('chatbot_welcome'),
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  // FAQ data
  const faqs: FaqItem[] = [
    {
      id: 1,
      question: t('faq_add_bill'),
      answer: t('faq_add_bill_answer')
    },
    {
      id: 2,
      question: t('faq_reminders'),
      answer: t('faq_reminders_answer')
    },
    {
      id: 3,
      question: t('faq_data_safe'),
      answer: t('faq_data_safe_answer')
    },
    {
      id: 4,
      question: t('faq_export'),
      answer: t('faq_export_answer')
    },
    {
      id: 5,
      question: t('faq_delete'),
      answer: t('faq_delete_answer')
    },
    {
      id: 6,
      question: t('faq_languages'),
      answer: t('faq_languages_answer')
    }
  ];
  
  // Load feedbacks from localStorage
  useEffect(() => {
    const savedFeedbacks = localStorage.getItem('feedbacks');
    if (savedFeedbacks) {
      setFeedbacks(JSON.parse(savedFeedbacks).map((f: any) => ({
        ...f,
        date: new Date(f.date)
      })));
    }
  }, []);
  
  // Scroll to bottom of chat on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);
  
  // Handle FAQ toggle
  const toggleFaq = (id: number) => {
    setOpenFaqId(openFaqId === id ? null : id);
  };
  
  // Handle contact form input change
  const handleContactInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setContactForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle contact form submission
  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simulate form submission
    setTimeout(() => {
      setFormSubmitted(true);
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setFormSubmitted(false);
        setContactForm({
          name: '',
          email: '',
          message: ''
        });
      }, 3000);
    }, 1000);
  };
  
  // Handle feedback submission
  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) return;
    
    const newFeedback: FeedbackItem = {
      id: Date.now().toString(),
      rating,
      comment: feedbackComment,
      date: new Date()
    };
    
    const updatedFeedbacks = [...feedbacks, newFeedback];
    setFeedbacks(updatedFeedbacks);
    
    // Save to localStorage
    localStorage.setItem('feedbacks', JSON.stringify(updatedFeedbacks));
    
    // Reset form
    setRating(0);
    setFeedbackComment('');
  };
  
  // Chatbot reply logic
  const getChatbotReply = (message: string): string => {
    const lowerMsg = message.toLowerCase();
    
    if (lowerMsg.includes('add bill') || lowerMsg.includes('upload') || lowerMsg.includes('new bill')) {
      return t('chatbot_add_bill');
    } else if (lowerMsg.includes('reminder') || lowerMsg.includes('notify')) {
      return t('chatbot_reminder');
    } else if (lowerMsg.includes('safe') || lowerMsg.includes('secure') || lowerMsg.includes('privacy')) {
      return t('chatbot_data_safe');
    } else if (lowerMsg.includes('export') || lowerMsg.includes('download') || lowerMsg.includes('csv')) {
      return t('chatbot_export');
    } else if (lowerMsg.includes('delete') || lowerMsg.includes('remove')) {
      return t('chatbot_delete');
    } else if (lowerMsg.includes('language') || lowerMsg.includes('translate')) {
      return t('chatbot_language');
    } else if (lowerMsg.includes('hello') || lowerMsg.includes('hi') || lowerMsg.includes('hey')) {
      return t('chatbot_greeting');
    } else if (lowerMsg.includes('thank')) {
      return t('chatbot_thanks');
    } else {
      return t('chatbot_not_understand');
    }
  };
  
  // Handle chat submission
  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!chatInput.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: chatInput,
      sender: 'user',
      timestamp: new Date()
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    
    // Simulate bot thinking
    setTimeout(() => {
      const botReply: Message = {
        id: (Date.now() + 1).toString(),
        text: getChatbotReply(userMessage.text),
        sender: 'bot',
        timestamp: new Date()
      };
      
      setChatMessages(prev => [...prev, botReply]);
    }, 1000);
  };
  
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">{t('support')}</h1>
      
      {/* FAQs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center mb-6">
          <Users size={20} className="text-blue-500 mr-2" />
          <h2 className="text-xl font-semibold">{t('faqs')}</h2>
        </div>
        
        <div className="space-y-4">
          {faqs.map(faq => (
            <div key={faq.id} className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleFaq(faq.id)}
                className="flex items-center justify-between w-full p-4 text-left bg-gray-50 hover:bg-gray-100"
              >
                <span className="font-medium">{faq.question}</span>
                {openFaqId === faq.id ? (
                  <ChevronUp size={18} className="text-gray-500" />
                ) : (
                  <ChevronDown size={18} className="text-gray-500" />
                )}
              </button>
              
              {openFaqId === faq.id && (
                <div className="p-4 bg-white">
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contact Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-6">{t('contact_us')}</h2>
          
          {formSubmitted ? (
            <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <ThumbsUp className="h-5 w-5 text-green-500" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">{t('message_sent')}</p>
                  <p className="text-xs mt-1">{t('message_sent_description')}</p>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('name')}
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={contactForm.name}
                  onChange={handleContactInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('email')}
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={contactForm.email}
                  onChange={handleContactInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('message')}
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  value={contactForm.message}
                  onChange={handleContactInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <button
                type="submit"
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {t('send_message')}
              </button>
            </form>
          )}
        </div>
        
        {/* Feedback */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-6">{t('feedback')}</h2>
          
          <form onSubmit={handleFeedbackSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('rate_experience')}
              </label>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="focus:outline-none"
                  >
                    <Star
                      size={24}
                      className={`${
                        (hoveredRating || rating) >= star
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
                {t('comments')}
              </label>
              <textarea
                id="comment"
                rows={3}
                value={feedbackComment}
                onChange={(e) => setFeedbackComment(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <button
              type="submit"
              disabled={rating === 0}
              className={`w-full px-4 py-2 rounded-lg ${
                rating === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {t('submit_feedback')}
            </button>
          </form>
          
          {feedbacks.length > 0 && (
            <div className="mt-6">
              <h3 className="text-md font-medium mb-3">{t('recent_feedback')}</h3>
              <div className="space-y-3">
                {feedbacks.slice(-3).reverse().map(feedback => (
                  <div key={feedback.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center mb-1">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star
                            key={star}
                            size={16}
                            className={`${
                              feedback.rating >= star 
                                ? 'text-yellow-400 fill-yellow-400' 
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-500 ml-2">
                        {new Date(feedback.date).toLocaleDateString()}
                      </span>
                    </div>
                    {feedback.comment && (
                      <p className="text-sm text-gray-600">{feedback.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Chatbot */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center mb-6">
          <MessageSquare size={20} className="text-blue-500 mr-2" />
          <h2 className="text-xl font-semibold">{t('ai_chatbot')}</h2>
        </div>
        
        <div className="h-80 flex flex-col">
          <div className="flex-1 overflow-y-auto mb-4 space-y-4 p-4 bg-gray-50 rounded-lg">
            {chatMessages.map(message => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs md:max-w-md rounded-lg px-4 py-2 ${
                    message.sender === 'user'
                      ? 'bg-blue-100 text-blue-900'
                      : 'bg-white border border-gray-200'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          
          <form onSubmit={handleChatSubmit} className="flex space-x-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder={t('type_message')}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
        
        <div className="mt-4 text-xs text-gray-500">
          <p>{t('chatbot_disclaimer')}</p>
        </div>
      </div>
    </div>
  );
}
