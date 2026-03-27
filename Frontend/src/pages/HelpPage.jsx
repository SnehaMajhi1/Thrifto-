import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  HelpCircle, 
  User, 
  ShoppingBag, 
  MessageSquare, 
  ShieldAlert, 
  ChevronDown, 
  ChevronUp,
  Mail,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { chatAPI } from '../services/api';
import Button from '../components/ui/Button';

export default function HelpPage() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [activeAccordion, setActiveAccordion] = useState(null);

  const toggleAccordion = (index) => {
    setActiveAccordion(activeAccordion === index ? null : index);
  };

  const handleContactSupport = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to contact support');
      navigate('/login');
      return;
    }
    try {
      await chatAPI.createAdminChat();
      navigate('/chats');
      toast.success('Wait for admin to respond');
    } catch (err) {
      toast.error('Could not start chat with support');
    }
  };

  const sections = [
    {
      id: 'faq',
      title: 'Common Questions',
      icon: <HelpCircle className="h-6 w-6 text-primary-500" />,
      items: [
        { q: 'How do I create an account?', a: 'Click the Sign Up button in the top right corner and follow the instructions.' },
        { q: 'Is listing items free?', a: 'Yes, listing items on Thrifto is completely free of charge.' },
        { q: 'How does swapping work?', a: 'Find an item you like, click Propose Swap, and offer one of your items. Once both parties agree, you can arrange a meetup.' },
        { q: 'How do I report a fake item?', a: 'On any item detail page, click the Report button and specify the reason. Our admins will review it promptly.' }
      ]
    },
    {
      id: 'account',
      title: 'Account Help',
      icon: <User className="h-6 w-6 text-emerald-500" />,
      items: [
        { q: 'I forgot my password', a: 'Go to the login page and click Forgot Password to receive a reset link.' },
        { q: 'How to change my profile photo?', a: 'Go to your Dashboard, then Settings, and click on your profile picture to upload a new one.' },
        { q: 'Can I delete my account?', a: 'Yes, you can request account deletion via the Privacy section in your settings.' }
      ]
    },
    {
      id: 'buying',
      title: 'Buying & Swapping',
      icon: <ShoppingBag className="h-6 w-6 text-blue-500" />,
      items: [
        { q: 'How do I buy an item?', a: 'Click Buy Now on any item. You will be redirected to the payment and shipping page.' },
        { q: 'Can I cancel a swap request?', a: 'Yes, you can cancel any pending swap request from your Swaps dashboard.' },
        { q: 'What are EcoPoints?', a: 'You earn EcoPoints by donating clothes or completing swaps. These points can be used for future rewards.' }
      ]
    },
    {
      id: 'chat',
      title: 'Chat & Messaging',
      icon: <MessageSquare className="h-6 w-6 text-purple-500" />,
      items: [
        { q: 'How to message a seller?', a: 'On the product details page, click the Message button to start a private conversation.' },
        { q: 'Can admin see my messages?', a: 'Admins can only see messages if a report is filed for safety reasons.' },
        { q: 'How to check my messages?', a: 'Click the message icon in the header or go to your Profile > Messages tab.' }
      ]
    },
    {
      id: 'safety',
      title: 'Report & Safety',
      icon: <ShieldAlert className="h-6 w-6 text-red-500" />,
      items: [
        { q: 'How to report abuse?', a: 'If a user is being inappropriate in chat, use the Report User option in the chat settings.' },
        { q: 'What happens after I report?', a: 'Our moderation team reviews every report within 24 hours and takes appropriate action.' },
        { q: 'Is it safe to meet in person?', a: 'We recommend meeting in public, well-lit places for swaps and always bringing a friend if possible.' }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50/50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">Help Center</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Find answers to common questions and learn how to make the most of Thrifto.
          </p>
        </div>

        {/* Support Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-primary-100 flex flex-col md:flex-row items-center justify-between gap-6 mb-12 hover:shadow-2xl transition-shadow duration-300">
          <div className="flex items-center gap-5">
            <div className="bg-primary-50 p-4 rounded-2xl">
              <Mail className="h-8 w-8 text-primary-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Need more help?</h3>
              <p className="text-gray-500 text-sm">Our support team is available to assist you directly.</p>
            </div>
          </div>
          <Button 
            size="lg" 
            onClick={handleContactSupport}
            className="w-full md:w-auto px-10 rounded-2xl shadow-lg shadow-primary-200"
          >
            Contact Support <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
        </div>

        {/* Content Sections */}
        <div className="space-y-8">
          {sections.map((section, sIdx) => (
            <div key={section.id} className="animate-fade-in-up" style={{ animationDelay: `${sIdx * 100}ms` }}>
              <div className="flex items-center gap-3 mb-6 px-2">
                {section.icon}
                <h2 className="text-2xl font-bold text-gray-800 tracking-tight">{section.title}</h2>
              </div>
              
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-50">
                {section.items.map((item, iIdx) => {
                  const globalIdx = `${sIdx}-${iIdx}`;
                  const isOpen = activeAccordion === globalIdx;
                  return (
                    <div key={iIdx} className="group">
                      <button
                        onClick={() => toggleAccordion(globalIdx)}
                        className="w-full text-left p-6 flex items-center justify-between transition-colors hover:bg-gray-50/80 cursor-pointer"
                      >
                        <span className={`font-semibold text-lg ${isOpen ? 'text-primary-600' : 'text-gray-700'}`}>
                          {item.q}
                        </span>
                        {isOpen ? (
                          <ChevronUp className="h-5 w-5 text-primary-500" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-400 group-hover:text-gray-600" />
                        )}
                      </button>
                      {isOpen && (
                        <div className="px-6 pb-6 animate-slide-down">
                          <p className="text-gray-600 leading-relaxed bg-primary-50/30 p-4 rounded-2xl border border-primary-50/50">
                            {item.a}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer info */}
        <div className="mt-16 text-center text-sm text-gray-400">
          <p>& {new Date().getFullYear()} Thrifto Support. We're here to help.</p>
        </div>
      </div>
    </div>
  );
}
