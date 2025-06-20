import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  PlusCircle, 
  HelpCircle, 
  CreditCard,
  RefreshCw
} from 'lucide-react';

interface SubscriptionProps {
  isOpen: boolean;
  onClose: () => void;
}

const Subscription: React.FC<SubscriptionProps> = ({ isOpen, onClose }) => {
  const [selectedPlan, setSelectedPlan] = useState<'pro' | 'teams'>('pro');
  const [isAnnualBilling, setIsAnnualBilling] = useState(false);
  const [currentPlan, setCurrentPlan] = useState('pro'); // Assuming user is on the base Pro plan
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close subscription popup
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div 
        ref={modalRef}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-5xl p-6 max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-3xl font-semibold">Pricing</h2>
          <button 
            onClick={onClose}
            className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            aria-label="Close subscription popup"
          >
            <X size={20} />
          </button>
        </div>
        
        <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-3xl">
          Start with a free account to speed up your workflow on public projects or boost 
          your entire team with instantly-opening production environments.
        </p>
        
        {/* Token information */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-md p-4 flex justify-between items-center mb-8">
          <div className="flex items-center">
            <span className="font-mono font-bold text-lg mr-2">10.9M</span> 
            tokens left. 
            <span className="ml-2 text-blue-500 hover:text-blue-600 cursor-pointer">
              Reset to 10M in 8 days.
            </span>
          </div>
          
          <div className="flex items-center">
            <div className="mr-2 text-gray-600 dark:text-gray-300">Need more tokens?</div>
            <div className="text-sm">
              Upgrade your plan below or buy a 
              <span className="text-blue-500 hover:text-blue-600 cursor-pointer ml-1">
                token reload
              </span>
            </div>
          </div>
        </div>
        
        {/* Plan selector and annual billing toggle */}
        <div className="flex justify-between items-center mb-8">
          <div className="inline-flex rounded-md bg-gray-100 dark:bg-gray-700 p-1">
            <button
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                selectedPlan === 'pro' 
                  ? 'bg-white dark:bg-gray-600 shadow-sm' 
                  : 'text-gray-600 dark:text-gray-300'
              }`}
              onClick={() => setSelectedPlan('pro')}
            >
              Pro
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                selectedPlan === 'teams' 
                  ? 'bg-white dark:bg-gray-600 shadow-sm' 
                  : 'text-gray-600 dark:text-gray-300'
              }`}
              onClick={() => setSelectedPlan('teams')}
            >
              Teams
            </button>
          </div>
          
          <div className="flex items-center">
            <span className="mr-2 text-sm text-gray-600 dark:text-gray-300">Annual billing</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={isAnnualBilling}
                onChange={() => setIsAnnualBilling(!isAnnualBilling)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
        
        {/* Pricing plans grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {/* Pro Plan */}
          <div className={`border ${currentPlan === 'pro' ? 'border-blue-500' : 'border-gray-200 dark:border-gray-700'} rounded-lg p-6`}>
            <div className="mb-4">
              <h3 className="text-xl font-bold">Pro</h3>
              <div className="flex items-center mt-2">
                <span className="inline-block bg-gray-200 dark:bg-gray-700 rounded-md p-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 7h-9"/><path d="M14 17H5"/><circle cx="17" cy="17" r="3"/><circle cx="7" cy="7" r="3"/></svg>
                </span>
                <span className="ml-2 text-sm font-medium">10M tokens</span>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-8">
              Ideal for hobbyists and casual users for light, exploratory use.
            </p>
            
            <div className="mt-auto">
              <div className="flex items-baseline">
                <span className="text-3xl font-bold">$20</span>
                <span className="text-gray-600 dark:text-gray-400 ml-1">/ month</span>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1 mb-4">
                Billed monthly
              </div>
              
              {currentPlan === 'pro' ? (
                <button className="w-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 py-2 rounded-md text-sm font-medium transition-colors">
                  Manage current plan
                </button>
              ) : (
                <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-md text-sm font-medium transition-colors">
                  Upgrade to Pro
                </button>
              )}
            </div>
          </div>
          
          {/* Pro 50 Plan */}
          <div className={`border ${currentPlan === 'pro50' ? 'border-blue-500' : 'border-gray-200 dark:border-gray-700'} rounded-lg p-6`}>
            <div className="mb-4">
              <h3 className="text-xl font-bold">Pro <span className="font-bold">50</span></h3>
              <div className="flex items-center mt-2">
                <span className="inline-block bg-gray-200 dark:bg-gray-700 rounded-md p-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 7h-9"/><path d="M14 17H5"/><circle cx="17" cy="17" r="3"/><circle cx="7" cy="7" r="3"/></svg>
                </span>
                <span className="ml-2 text-sm font-medium">
                  <span className="text-green-500">26M tokens</span>
                  <span className="text-gray-500 line-through ml-1">25M tokens</span>
                </span>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-8">
              Designed for professionals who need to use Nexius a few times per week.
            </p>
            
            <div className="mt-auto">
              <div className="flex items-baseline">
                <span className="text-3xl font-bold">$50</span>
                <span className="text-gray-600 dark:text-gray-400 ml-1">/ month</span>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1 mb-4">
                Billed monthly
              </div>
              
              <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-md text-sm font-medium transition-colors">
                Upgrade to Pro 50
              </button>
            </div>
          </div>
          
          {/* Pro 100 Plan */}
          <div className={`border ${currentPlan === 'pro100' ? 'border-blue-500' : 'border-gray-200 dark:border-gray-700'} rounded-lg p-6`}>
            <div className="mb-4">
              <h3 className="text-xl font-bold">Pro <span className="font-bold">100</span></h3>
              <div className="flex items-center mt-2">
                <span className="inline-block bg-gray-200 dark:bg-gray-700 rounded-md p-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 7h-9"/><path d="M14 17H5"/><circle cx="17" cy="17" r="3"/><circle cx="7" cy="7" r="3"/></svg>
                </span>
                <span className="ml-2 text-sm font-medium">
                  <span className="text-green-500">55M tokens</span>
                  <span className="text-gray-500 line-through ml-1">50M tokens</span>
                </span>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-8">
              Perfect for heavy users looking to enhance daily workflows.
            </p>
            
            <div className="mt-auto">
              <div className="flex items-baseline">
                <span className="text-3xl font-bold">$100</span>
                <span className="text-gray-600 dark:text-gray-400 ml-1">/ month</span>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1 mb-4">
                Billed monthly
              </div>
              
              <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-md text-sm font-medium transition-colors">
                Upgrade to Pro 100
              </button>
            </div>
          </div>
          
          {/* Pro 200 Plan */}
          <div className={`border ${currentPlan === 'pro200' ? 'border-blue-500' : 'border-gray-200 dark:border-gray-700'} rounded-lg p-6`}>
            <div className="mb-4">
              <h3 className="text-xl font-bold">Pro <span className="font-bold">200</span></h3>
              <div className="flex items-center mt-2">
                <span className="inline-block bg-gray-200 dark:bg-gray-700 rounded-md p-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 7h-9"/><path d="M14 17H5"/><circle cx="17" cy="17" r="3"/><circle cx="7" cy="7" r="3"/></svg>
                </span>
                <span className="ml-2 text-sm font-medium">
                  <span className="text-green-500">120M tokens</span>
                  <span className="text-gray-500 line-through ml-1">100M tokens</span>
                </span>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-8">
              Best for power users relying on Nexius as a core tool for continuous use.
            </p>
            
            <div className="mt-auto">
              <div className="flex items-baseline">
                <span className="text-3xl font-bold">$200</span>
                <span className="text-gray-600 dark:text-gray-400 ml-1">/ month</span>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1 mb-4">
                Billed monthly
              </div>
              
              <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-md text-sm font-medium transition-colors">
                Upgrade to Pro 200
              </button>
            </div>
          </div>
        </div>
        
        {/* Refresh subscription data button */}
        <div className="flex justify-end">
          <button className="flex items-center text-blue-500 hover:text-blue-600 text-sm">
            <RefreshCw size={14} className="mr-1" />
            Refresh subscription data
          </button>
        </div>
      </div>
    </div>
  );
};

export default Subscription;