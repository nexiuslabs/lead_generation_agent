import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  PlusCircle, 
  HelpCircle, 
  CreditCard,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  CreditCard as Subscription,
  LogOut,
  Settings as SettingsIcon,
  MonitorSmartphone,
  UserCircle,
  Key,
  PackageCheck,
  Sparkles,
  BookOpen,
  Network,
  Save,
  Users,
  Code
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const Settings: React.FC<SettingsProps> = ({ isOpen, onClose }) => {
  const [activeSection, setActiveSection] = useState('appearance');
  const [isMobile, setIsMobile] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [enableForNewChats, setEnableForNewChats] = useState(false);
  const [selectedTraits, setSelectedTraits] = useState<string[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('light');
  const modalRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { logout } = useAuth();

  // Handle logout
  const handleLogout = () => {
    logout();
    onClose();
    navigate('/login');
  };

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' | null;
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      // If no saved preference, use system preference
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setTheme('dark');
      } else {
        setTheme('light');
      }
    }
  }, []);

  // Apply theme whenever it changes
  useEffect(() => {
    if (!theme) return;

    const root = document.documentElement;
    
    // Remove existing theme class
    root.classList.remove('light', 'dark');

    // Apply the new theme
    if (theme === 'system') {
      // Check system preference
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        root.classList.add('dark');
      } else {
        root.classList.add('light');
      }
      
      // Listen for system theme changes
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        root.classList.remove('light', 'dark');
        root.classList.add(e.matches ? 'dark' : 'light');
      };
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      // Apply theme directly
      root.classList.add(theme);
    }

    // Save theme preference to localStorage
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Handle click outside to close settings
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

  // Check if mobile on mount and when window is resized
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  if (!isOpen) return null;

  const sections = [
    { id: 'general', label: 'General', icon: <SettingsIcon size={18} /> },
    { id: 'appearance', label: 'Appearance', icon: <MonitorSmartphone size={18} /> },
    { id: 'customise', label: 'Customise Nexius', icon: <UserCircle size={18} /> },
    { id: 'subscriptions', label: 'My Subscriptions', icon: <Subscription size={18} /> },
    { id: 'editor', label: 'Editor', icon: <Code size={18} /> },
    { id: 'team', label: 'Team', icon: <Users size={18} /> },
    { id: 'tokens', label: 'Tokens', icon: <Key size={18} /> },
    { id: 'applications', label: 'Applications', icon: <PackageCheck size={18} /> },
    { id: 'featurePreviews', label: 'Feature Previews', icon: <Sparkles size={18} /> },
    { id: 'knowledge', label: 'Knowledge', icon: <BookOpen size={18} /> },
    { id: 'network', label: 'Network', icon: <Network size={18} /> },
    { id: 'backups', label: 'Backups', icon: <Save size={18} /> },
  ];

  const traitOptions = [
    'Chatty', 'Witty', 'Straight shooting', 'Encouraging', 'Gen Z',
    'Skeptical', 'Traditional', 'Forward thinking', 'Poetic'
  ];

  const handleTraitToggle = (trait: string) => {
    if (selectedTraits.includes(trait)) {
      setSelectedTraits(selectedTraits.filter(t => t !== trait));
    } else {
      setSelectedTraits([...selectedTraits, trait]);
    }
  };

  const toggleAdvanced = () => {
    setAdvancedOpen(!advancedOpen);
  };

  const handleThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTheme(e.target.value as 'light' | 'dark' | 'system');
  };

  // Render content based on active section
  const renderContent = () => {
    switch (activeSection) {
      case 'subscriptions':
        return (
          <div>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-semibold">Token consumption</h2>
              <button className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-md px-3 py-2 text-sm font-medium transition-colors">
                <PlusCircle size={16} />
                Add tokens
              </button>
            </div>
            
            {/* Plan information */}
            <div className="mb-4 flex items-start">
              <div className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 p-2 rounded-md mr-4">
                <CreditCard size={24} />
              </div>
              <div>
                <div className="font-medium">Pro plan</div>
                <div className="text-gray-600 dark:text-gray-400 text-sm">oruenboi</div>
              </div>
            </div>
            
            {/* Token stats */}
            <div className="flex justify-between mb-2">
              <div className="flex items-center">
                <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
                <span className="text-sm text-gray-700 dark:text-gray-300">Extra tokens left</span>
                <HelpCircle size={14} className="ml-1 text-gray-400" />
              </div>
              <div className="flex items-center">
                <div className="h-3 w-3 rounded-full bg-blue-500 mr-2"></div>
                <span className="text-sm text-gray-700 dark:text-gray-300">Monthly tokens left</span>
              </div>
            </div>
            
            {/* Token amounts */}
            <div className="flex justify-between mb-2">
              <div className="text-3xl font-bold">1.3M</div>
              <div className="text-3xl font-bold">6M <span className="text-gray-500 text-xl font-normal">/ 10M</span></div>
            </div>
            
            {/* Progress bar */}
            <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full mb-10 flex overflow-hidden">
              <div className="h-full bg-green-500 w-[15%]"></div>
              <div className="h-full bg-blue-500 w-[45%]"></div>
              <div className="h-full bg-blue-200 dark:bg-blue-900 w-[40%]"></div>
            </div>
            
            {/* Monthly billing section */}
            <div className="mb-4 flex justify-between items-center">
              <h3 className="text-lg font-semibold">Pro plan monthly billing</h3>
              <button className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-md px-3 py-2 text-sm font-medium transition-colors">
                <CreditCard size={16} />
                Manage billing
              </button>
            </div>
            
            {/* Billing details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="border border-gray-200 dark:border-gray-700 rounded-md p-4">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Next Invoice</div>
                <div className="text-3xl font-bold mb-2">$20</div>
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center">
                  <CreditCard size={18} className="text-gray-500" />
                </div>
              </div>
              <div className="border border-gray-200 dark:border-gray-700 rounded-md p-4">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Next Token Refill</div>
                <div className="text-3xl font-bold mb-2">10M</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">On May 26, 2025</div>
              </div>
            </div>

            {/* Available plans */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Available Plans</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Pro 50</h4>
                    <span className="text-sm text-gray-500">$50/month</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    26M tokens/month
                  </p>
                  <button className="w-full bg-blue-500 text-white rounded-md py-2 text-sm font-medium hover:bg-blue-600 transition-colors">
                    Upgrade
                  </button>
                </div>
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Pro 100</h4>
                    <span className="text-sm text-gray-500">$100/month</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    55M tokens/month
                  </p>
                  <button className="w-full bg-blue-500 text-white rounded-md py-2 text-sm font-medium hover:bg-blue-600 transition-colors">
                    Upgrade
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      case 'appearance':
        return (
          <div>
            <h2 className="text-xl font-semibold mb-6">Appearance</h2>
            <div className="mb-4">
              <label className="block mb-2">Theme</label>
              <div className="relative">
                <select 
                  className="w-full py-2 px-4 bg-gray-100 dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600 appearance-none focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={theme}
                  onChange={handleThemeChange}
                  aria-label="Select theme"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="system">System</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <ChevronDown size={16} className="text-gray-500 dark:text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        );
      case 'customise':
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">Customise Nexius</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 flex items-center">
              Introduce yourself to get better, more personalized responses
              <HelpCircle size={14} className="ml-1 text-gray-400 cursor-help" />
            </p>

            <div className="space-y-6">
              {/* What should Nexius call you? */}
              <div>
                <label htmlFor="username" className="block mb-2 font-medium">
                  What should Nexius call you?
                </label>
                <input
                  type="text"
                  id="username"
                  placeholder="Custom Name"
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* What do you do? */}
              <div>
                <label htmlFor="occupation" className="block mb-2 font-medium">
                  What do you do?
                </label>
                <input
                  type="text"
                  id="occupation"
                  placeholder="Your occupation or role"
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* What traits should Nexius have? */}
              <div>
                <label htmlFor="traits" className="block mb-2 font-medium flex items-center">
                  What traits should Nexius have?
                  <HelpCircle size={14} className="ml-1 text-gray-400 cursor-help" />
                </label>
                <textarea
                  id="traits"
                  placeholder="Describe or select traits"
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white mb-3 min-h-[100px]"
                ></textarea>

                {/* Trait buttons */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {traitOptions.slice(0, 5).map((trait) => (
                    <button
                      key={trait}
                      onClick={() => handleTraitToggle(trait)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm border ${
                        selectedTraits.includes(trait)
                          ? 'bg-blue-50 border-blue-300 text-blue-600 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-400'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      {selectedTraits.includes(trait) ? '' : '+'} {trait}
                    </button>
                  ))}
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {traitOptions.slice(5).map((trait) => (
                    <button
                      key={trait}
                      onClick={() => handleTraitToggle(trait)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm border ${
                        selectedTraits.includes(trait)
                          ? 'bg-blue-50 border-blue-300 text-blue-600 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-400'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      {selectedTraits.includes(trait) ? '' : '+'} {trait}
                    </button>
                  ))}
                  <button className="flex items-center gap-1 px-3 py-1.5 rounded-full text-sm border border-gray-300 dark:border-gray-600">
                    <RefreshCw size={14} />
                  </button>
                </div>
              </div>

              {/* Anything else Nexius should know about you? */}
              <div>
                <label htmlFor="preferences" className="block mb-2 font-medium flex items-center">
                  Anything else Nexius should know about you?
                  <HelpCircle size={14} className="ml-1 text-gray-400 cursor-help" />
                </label>
                <textarea
                  id="preferences"
                  placeholder="Interests, values, or preferences to keep in mind"
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white min-h-[100px]"
                ></textarea>
              </div>

              {/* Advanced section */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <button
                  onClick={toggleAdvanced}
                  className="flex items-center justify-between w-full text-left font-medium"
                >
                  Advanced
                  {advancedOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                
                {advancedOpen && (
                  <div className="mt-3">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <div className="relative">
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={enableForNewChats}
                          onChange={() => setEnableForNewChats(!enableForNewChats)}
                        />
                        <div className={`block w-10 h-6 rounded-full ${enableForNewChats ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                        <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${enableForNewChats ? 'transform translate-x-4' : ''}`}></div>
                      </div>
                      <span>Enable for new chats</span>
                    </label>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button 
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button 
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        );
      case 'general':
        return (
          <div>
            <h2 className="text-xl font-semibold mb-6">General</h2>
            <p>General settings content</p>
          </div>
        );
      case 'editor':
        return (
          <div>
            <h2 className="text-xl font-semibold mb-6">Editor</h2>
            <p>Editor settings content</p>
          </div>
        );
      case 'tokens':
        return (
          <div>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-semibold">Token consumption</h2>
              <button className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-md px-3 py-2 text-sm font-medium transition-colors">
                <PlusCircle size={16} />
                Add tokens
              </button>
            </div>
            
            {/* Plan information */}
            <div className="mb-4 flex items-start">
              <div className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 p-2 rounded-md mr-4">
                <CreditCard size={24} />
              </div>
              <div>
                <div className="font-medium">Pro plan</div>
                <div className="text-gray-600 dark:text-gray-400 text-sm">oruenboi</div>
              </div>
            </div>
            
            {/* Token stats */}
            <div className="flex justify-between mb-2">
              <div className="flex items-center">
                <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
                <span className="text-sm text-gray-700 dark:text-gray-300">Extra tokens left</span>
                <HelpCircle size={14} className="ml-1 text-gray-400" />
              </div>
              <div className="flex items-center">
                <div className="h-3 w-3 rounded-full bg-blue-500 mr-2"></div>
                <span className="text-sm text-gray-700 dark:text-gray-300">Monthly tokens left</span>
              </div>
            </div>
            
            {/* Token amounts */}
            <div className="flex justify-between mb-2">
              <div className="text-3xl font-bold">1.3M</div>
              <div className="text-3xl font-bold">6M <span className="text-gray-500 text-xl font-normal">/ 10M</span></div>
            </div>
            
            {/* Progress bar */}
            <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full mb-10 flex overflow-hidden">
              <div className="h-full bg-green-500 w-[15%]"></div>
              <div className="h-full bg-blue-500 w-[45%]"></div>
              <div className="h-full bg-blue-200 dark:bg-blue-900 w-[40%]"></div>
            </div>
            
            {/* Monthly billing section */}
            <div className="mb-4 flex justify-between items-center">
              <h3 className="text-lg font-semibold">Pro plan monthly billing</h3>
              <button className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-md px-3 py-2 text-sm font-medium transition-colors">
                <CreditCard size={16} />
                Manage billing
              </button>
            </div>
            
            {/* Billing details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="border border-gray-200 dark:border-gray-700 rounded-md p-4">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Next Invoice</div>
                <div className="text-3xl font-bold mb-2">$20</div>
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center">
                  <CreditCard size={18} className="text-gray-500" />
                </div>
              </div>
              <div className="border border-gray-200 dark:border-gray-700 rounded-md p-4">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Next Token Refill</div>
                <div className="text-3xl font-bold mb-2">10M</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">On May 26, 2025</div>
              </div>
            </div>
          </div>
        );
      case 'applications':
        return (
          <div>
            <h2 className="text-xl font-semibold mb-6">Applications</h2>
            
            {/* Netlify Integration */}
            <div className="mb-8">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-medium">Netlify</h3>
                <button className="bg-red-500 hover:bg-red-600 text-white py-1.5 px-4 rounded text-sm">
                  Disconnect
                </button>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Deploy your app seamlessly with your own Netlify account. Use custom domains, optimize performance, 
                and take advantage of powerful deployment tools.
              </p>
            </div>
            
            {/* Supabase Integration */}
            <div className="mb-8">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-medium">Supabase</h3>
                <button className="bg-red-500 hover:bg-red-600 text-white py-1.5 px-4 rounded text-sm">
                  Disconnect
                </button>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Integrate Supabase to enable authentication or sync your app with a robust and scalable database 
                effortlessly.
              </p>
            </div>
            
            {/* Microsoft 365 Integration */}
            <div className="mb-8">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-medium">Microsoft 365</h3>
                <button className="bg-blue-500 hover:bg-blue-600 text-white py-1.5 px-4 rounded text-sm">
                  Connect
                </button>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Connect your Microsoft 365 account to enable Nexius to access your emails, calendar, documents, and teams 
                for enhanced productivity and collaboration.
              </p>
            </div>
            
            {/* Figma Integration */}
            <div className="mb-8">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-medium">Figma</h3>
                <button className="bg-blue-500 hover:bg-blue-600 text-white py-1.5 px-4 rounded text-sm">
                  Connect
                </button>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Integrate Figma to import your designs as code ready to be analyzed by Nexius.
              </p>
            </div>
            
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-8">
              <a 
                href="#" 
                className="text-blue-500 hover:text-blue-600 text-sm"
              >
                Visit StackBlitz to manage how you log in
              </a>
            </div>
          </div>
        );
      // Add more cases for other sections
      default:
        return (
          <div>
            <h2 className="text-xl font-semibold mb-6">{sections.find(s => s.id === activeSection)?.label || 'Settings'}</h2>
            <p>Settings for {sections.find(s => s.id === activeSection)?.label || 'this section'}</p>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div
        ref={modalRef}
        className={`bg-white dark:bg-gray-900 rounded-2xl shadow-2xl flex w-full ${isMobile ? 'max-w-md' : 'max-w-3xl'} h-[80vh] max-h-[90vh] overflow-hidden border border-gray-200 dark:border-gray-700 animate-fadeIn`}
        style={{ boxShadow: '0 8px 40px 0 rgba(29,42,77,0.15)' }}
      >
        {/* Left Sidebar - Narrow with icons on mobile, wider with text on desktop */}
        <div className={`${isMobile ? 'w-12 border-r' : 'w-60'} border-gray-200 dark:border-gray-700 overflow-y-auto`}>
          <ul className="py-2">
            {sections.map((section) => (
              <li key={section.id}>
                <button
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full text-left py-2 ${isMobile ? 'px-2 justify-center' : 'px-4'} flex items-center ${
                    activeSection === section.id
                      ? 'bg-gray-200 dark:bg-gray-700'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <span className={`${isMobile ? '' : 'mr-3'} text-gray-500`}>{section.icon}</span>
                  {!isMobile && <span className="text-gray-700 dark:text-gray-300">{section.label}</span>}
                </button>
              </li>
            ))}
          </ul>
          
          {/* Logout button at the bottom */}
          <div className="border-t border-gray-200 dark:border-gray-700 mt-2 pt-2">
            <button
              onClick={handleLogout}
              className={`w-full text-left py-2 ${isMobile ? 'px-2 justify-center' : 'px-4'} flex items-center text-red-500 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20`}
            >
              <span className={`${isMobile ? '' : 'mr-3'}`}>
                <LogOut size={18} />
              </span>
              {!isMobile && <span>Logout</span>}
            </button>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="flex-1 p-6 overflow-y-auto relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            aria-label="Close settings"
          >
            <X size={20} />
          </button>
          
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Settings;