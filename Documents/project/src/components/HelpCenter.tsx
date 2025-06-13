import React, { useState } from 'react';
import { Search, ChevronRight, ArrowLeft, ThumbsUp, ThumbsDown } from 'lucide-react';

interface HelpCenterProps {
  onClose: () => void;
}

const HelpCenter: React.FC<HelpCenterProps> = ({ onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('welcome');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
  };

  const handleFeedbackSubmit = (helpful: boolean) => {
    setFeedbackSubmitted(true);
    // In a real app, you would send this feedback to a server
    console.log(`User found page ${helpful ? 'helpful' : 'not helpful'}`);
  };

  return (
    <div className="flex h-screen bg-white dark:bg-gray-900 overflow-hidden">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-gray-200 dark:border-gray-700 h-full overflow-y-auto">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center">
          <a href="/" className="text-xl font-bold text-[#1D2A4D] dark:text-white">
            nexius
          </a>
          <button 
            onClick={onClose}
            className="ml-auto text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <ArrowLeft size={20} />
          </button>
        </div>
        
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search or ask..."
              className="pl-10 pr-4 py-2 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
              Ctrl K
            </div>
          </div>
        </div>
        
        <div className="p-4">
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
              Building with Nexius
            </h3>
            <ul className="space-y-1">
              <li 
                className={`text-sm py-1.5 px-2 rounded-md cursor-pointer flex items-center ${
                  selectedCategory === 'welcome' 
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium' 
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                onClick={() => handleCategoryClick('welcome')}
              >
                <span className="flex-1">Welcome</span>
                {selectedCategory === 'welcome' && <ChevronRight size={16} />}
              </li>
              <li 
                className={`text-sm py-1.5 px-2 rounded-md cursor-pointer flex items-center ${
                  selectedCategory === 'getting-started' 
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium' 
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                onClick={() => handleCategoryClick('getting-started')}
              >
                <span className="flex-1">Getting Started Guide for Nexius.new</span>
                {selectedCategory === 'getting-started' && <ChevronRight size={16} />}
              </li>
              <li 
                className={`text-sm py-1.5 px-2 rounded-md cursor-pointer flex items-center ${
                  selectedCategory === 'using-bolt' 
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium' 
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                onClick={() => handleCategoryClick('using-bolt')}
              >
                <span className="flex-1">Using Nexius</span>
                {selectedCategory === 'using-bolt' && <ChevronRight size={16} />}
              </li>
              <li 
                className={`text-sm py-1.5 px-2 rounded-md cursor-pointer flex items-center ${
                  selectedCategory === 'supported-tech' 
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium' 
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                onClick={() => handleCategoryClick('supported-tech')}
              >
                <span className="flex-1">Supported Technologies</span>
                {selectedCategory === 'supported-tech' && <ChevronRight size={16} />}
              </li>
              <li 
                className={`text-sm py-1.5 px-2 rounded-md cursor-pointer flex items-center ${
                  selectedCategory === 'tutorials' 
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium' 
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                onClick={() => handleCategoryClick('tutorials')}
              >
                <span className="flex-1">Tutorials</span>
                {selectedCategory === 'tutorials' && <ChevronRight size={16} />}
              </li>
              <li 
                className={`text-sm py-1.5 px-2 rounded-md cursor-pointer flex items-center ${
                  selectedCategory === 'deploy' 
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium' 
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                onClick={() => handleCategoryClick('deploy')}
              >
                <span className="flex-1">Deploy</span>
                {selectedCategory === 'deploy' && <ChevronRight size={16} />}
              </li>
            </ul>
          </div>
          
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
              Best practices
            </h3>
            <ul className="space-y-1">
              <li 
                className={`text-sm py-1.5 px-2 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center ${
                  selectedCategory === 'overview' 
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium' 
                    : ''
                }`}
                onClick={() => handleCategoryClick('overview')}
              >
                <span className="flex-1">Overview</span>
                {selectedCategory === 'overview' && <ChevronRight size={16} />}
              </li>
              <li 
                className={`text-sm py-1.5 px-2 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center ${
                  selectedCategory === 'in-app-help' 
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium' 
                    : ''
                }`}
                onClick={() => handleCategoryClick('in-app-help')}
              >
                <span className="flex-1">In-app help with discussion mode</span>
                {selectedCategory === 'in-app-help' && <ChevronRight size={16} />}
              </li>
              <li 
                className={`text-sm py-1.5 px-2 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center ${
                  selectedCategory === 'token-efficiency' 
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium' 
                    : ''
                }`}
                onClick={() => handleCategoryClick('token-efficiency')}
              >
                <span className="flex-1">Maximize token efficiency</span>
                {selectedCategory === 'token-efficiency' && <ChevronRight size={16} />}
              </li>
              <li 
                className={`text-sm py-1.5 px-2 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center ${
                  selectedCategory === 'prompt-effectively' 
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium' 
                    : ''
                }`}
                onClick={() => handleCategoryClick('prompt-effectively')}
              >
                <span className="flex-1">Prompt effectively</span>
                {selectedCategory === 'prompt-effectively' && <ChevronRight size={16} />}
              </li>
            </ul>
          </div>
          
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
              Using Nexius with other tools
            </h3>
            <ul className="space-y-1">
              <li 
                className={`text-sm py-1.5 px-2 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center ${
                  selectedCategory === 'tools-overview' 
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium' 
                    : ''
                }`}
                onClick={() => handleCategoryClick('tools-overview')}
              >
                <span className="flex-1">Overview</span>
                {selectedCategory === 'tools-overview' && <ChevronRight size={16} />}
              </li>
              <li 
                className={`text-sm py-1.5 px-2 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center ${
                  selectedCategory === 'figma' 
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium' 
                    : ''
                }`}
                onClick={() => handleCategoryClick('figma')}
              >
                <span className="flex-1">Figma for design</span>
                {selectedCategory === 'figma' && <ChevronRight size={16} />}
              </li>
              <li 
                className={`text-sm py-1.5 px-2 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center ${
                  selectedCategory === 'supabase' 
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium' 
                    : ''
                }`}
                onClick={() => handleCategoryClick('supabase')}
              >
                <span className="flex-1">Supabase for databases</span>
                {selectedCategory === 'supabase' && <ChevronRight size={16} />}
              </li>
              <li 
                className={`text-sm py-1.5 px-2 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center ${
                  selectedCategory === 'stripe' 
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium' 
                    : ''
                }`}
                onClick={() => handleCategoryClick('stripe')}
              >
                <span className="flex-1">Stripe for payment</span>
                {selectedCategory === 'stripe' && <ChevronRight size={16} />}
              </li>
              <li 
                className={`text-sm py-1.5 px-2 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center ${
                  selectedCategory === 'netlify' 
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium' 
                    : ''
                }`}
                onClick={() => handleCategoryClick('netlify')}
              >
                <span className="flex-1">Netlify for hosting</span>
                {selectedCategory === 'netlify' && <ChevronRight size={16} />}
              </li>
              <li 
                className={`text-sm py-1.5 px-2 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center ${
                  selectedCategory === 'expo' 
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium' 
                    : ''
                }`}
                onClick={() => handleCategoryClick('expo')}
              >
                <span className="flex-1">Expo for mobile apps</span>
                {selectedCategory === 'expo' && <ChevronRight size={16} />}
              </li>
            </ul>
          </div>
          
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
              Contact support
            </h3>
          </div>
          
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
              Community
            </h3>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-4 text-sm text-blue-600 dark:text-blue-400">
            Building with Nexius
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">
            Welcome to Nexius
          </h1>
          
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              Get started with Nexius
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="text-blue-600 dark:text-blue-400 mb-4">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-md flex items-center justify-center">
                    <ChevronRight size={20} className="text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-2">Getting Started Guide</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Introduction to Nexius concepts
                </p>
              </div>
              
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="text-blue-600 dark:text-blue-400 mb-4">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-md flex items-center justify-center">
                    <ChevronRight size={20} className="text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-2">Best practices</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Write great prompts and use your Nexius resources efficiently
                </p>
              </div>
              
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="text-blue-600 dark:text-blue-400 mb-4">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-md flex items-center justify-center">
                    <ChevronRight size={20} className="text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-2">Integrations</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Explore Nexius's integrations with other services
                </p>
              </div>
              
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="text-blue-600 dark:text-blue-400 mb-4">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-md flex items-center justify-center">
                    <ChevronRight size={20} className="text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-2">Community</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Join the community
                </p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6 pb-10">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Was this page helpful?
              </div>
              
              {!feedbackSubmitted ? (
                <div className="flex gap-3">
                  <button 
                    onClick={() => handleFeedbackSubmit(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <ThumbsUp size={14} />
                    <span>Yes</span>
                  </button>
                  <button 
                    onClick={() => handleFeedbackSubmit(false)}
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <ThumbsDown size={14} />
                    <span>No</span>
                  </button>
                </div>
              ) : (
                <div className="text-sm text-green-600 dark:text-green-400">
                  Thank you for your feedback!
                </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-between items-center border-t border-gray-200 dark:border-gray-700 pt-4 pb-6">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Getting Started Guide for Nexius.new<br />
              This document should serve as a starting point for all users...
            </div>
            <button className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-md text-sm">
              Next
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HelpCenter;