import React, { useState, useRef, useEffect } from 'react';
import { X, Copy, Users } from 'lucide-react';

interface GetFreeTokensProps {
  isOpen: boolean;
  onClose: () => void;
}

const GetFreeTokens: React.FC<GetFreeTokensProps> = ({ isOpen, onClose }) => {
  const [copySuccess, setCopySuccess] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const referralLink = "https://nexius.new/?rid=othraz";

  // Handle copy referral link
  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  // Handle click outside to close modal
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
        className="bg-white dark:bg-dark rounded-lg shadow-xl w-full max-w-md p-6 text-gray-900 dark:text-white"
      >
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-dark-secondary dark:hover:text-white"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        {/* Icon */}
        <div className="bg-[#1E3A8A] w-12 h-12 rounded-full flex items-center justify-center mb-4">
          <div className="text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="7" width="18" height="12" rx="2" />
              <path d="M7 12h10" />
              <path d="m12 17-5-5 5-5" />
              <path d="m12 17 5-5-5-5" />
            </svg>
          </div>
        </div>

        {/* Title and description */}
        <h2 className="text-xl font-bold mb-2">Refer Users: Earn Tokens</h2>
        <p className="mb-3">
          Earn <span className="font-bold">200K tokens</span> for yourself & each new user you refer.
        </p>
        
        <p className="mb-4">
          Pro users: earn an additional <span className="font-bold">5M tokens</span> for yourself & your referral when they upgrade to a Pro account within 30 days!
        </p>

        {/* Tokens earned card */}
        <div className="bg-gray-100 dark:bg-dark-secondary rounded-lg p-4 mb-4">
          <div className="text-gray-600 dark:text-dark-secondary text-sm mb-1">Referral tokens earned</div>
          <div className="flex justify-between items-center">
            <div className="text-3xl font-bold">200K</div>
            <div className="bg-[#1E3A8A] w-8 h-8 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">n</span>
            </div>
          </div>
        </div>

        {/* Referral counts */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-100 dark:bg-dark-secondary rounded-lg p-4">
            <div className="text-gray-600 dark:text-dark-secondary text-sm mb-1">Free Referrals</div>
            <div className="flex justify-between items-center">
              <div className="text-3xl font-bold">1</div>
              <div className="text-gray-500 dark:text-dark-tertiary">
                <Users size={20} />
              </div>
            </div>
          </div>
          
          <div className="bg-gray-100 dark:bg-dark-secondary rounded-lg p-4">
            <div className="text-gray-600 dark:text-dark-secondary text-sm mb-1">Pro Referrals</div>
            <div className="flex justify-between items-center">
              <div className="text-3xl font-bold">0</div>
              <div className="text-gray-500 dark:text-dark-tertiary">
                <Users size={20} />
              </div>
            </div>
          </div>
        </div>

        {/* Referral link section */}
        <div className="mb-2">
          <p className="text-sm mb-2">
            Use your personal referral link to invite users to join Nexius:
          </p>
          <div className="flex">
            <input
              type="text"
              readOnly
              value={referralLink}
              className="flex-1 p-2 bg-gray-100 dark:bg-dark-secondary border border-gray-300 dark:border-dark-secondary rounded-l-md text-gray-800 dark:text-dark-secondary"
            />
            <button
              onClick={handleCopyLink}
              className="bg-[#2563EB] hover:bg-blue-700 text-white px-3 py-2 rounded-r-md flex items-center"
            >
              <Copy size={16} className="mr-1" />
              {copySuccess ? 'Copied!' : 'Copy link'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GetFreeTokens;