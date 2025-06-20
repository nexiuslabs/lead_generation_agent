import React, { useState, useRef, useEffect } from 'react';
import {
  X,
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
import {
  GeneralSection,
  AppearanceSection,
  CustomiseSection,
  SubscriptionsSection,
  EditorSection,
  DefaultSection
} from './SettingsSections';
import ProfilePage from '../features/profile/ProfilePage';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const Settings: React.FC<SettingsProps> = ({ isOpen, onClose }) => {
  const [activeSection, setActiveSection] = useState('profile');
  const [isMobile, setIsMobile] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState<boolean>(() =>
    JSON.parse(sessionStorage.getItem('settings.advancedOpen') || 'false')
  );
  const [enableForNewChats, _setEnableForNewChats] = useState(false);
  const [selectedTraits, setSelectedTraits] = useState<string[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('light');
  const [toast, setToast] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();
  const { logout } = useAuth();

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Handle logout
  const handleLogout = () => {
    showToast('Logging out...');
    // ensure user sees feedback
    setTimeout(() => {
      logout();
      onClose();
      navigate('/login');
    }, 300);
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

  useEffect(() => {
    if (isOpen) {
      const prevFocused = document.activeElement as HTMLElement;
      closeButtonRef.current?.focus();
      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
        if (e.key === 'Tab') {
          if (!modalRef.current) return;
          const els = modalRef.current.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          const first = els[0];
          const last = els[els.length-1];
          if (e.shiftKey) {
            if (document.activeElement === first) { e.preventDefault(); last.focus(); }
          } else {
            if (document.activeElement === last) { e.preventDefault(); first.focus(); }
          }
        }
      };
      document.addEventListener('keydown', onKeyDown);
      return () => {
        document.removeEventListener('keydown', onKeyDown);
        prevFocused?.focus();
      };
    }
  }, [isOpen, onClose]);

  const toggleAdvanced = () => {
    setAdvancedOpen(prev => {
      const next = !prev;
      sessionStorage.setItem('settings.advancedOpen', JSON.stringify(next));
      showToast(next ? 'Advanced settings expanded' : 'Advanced settings collapsed');
      return next;
    });
  };

  if (!isOpen) return null;

  const sections = [
    { id: 'general', label: 'General', icon: <SettingsIcon size={18} /> },
    { id: 'appearance', label: 'Appearance', icon: <MonitorSmartphone size={18} /> },
    { id: 'customise', label: 'Customise Nexius', icon: <UserCircle size={18} /> },
    { id: 'profile', label: 'Profile Settings', icon: <UserCircle size={18} /> },
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



  const handleTraitToggle = (trait: string) => {
    if (selectedTraits.includes(trait)) {
      setSelectedTraits(selectedTraits.filter(t => t !== trait));
    } else {
      setSelectedTraits([...selectedTraits, trait]);
    }
  };

  const handleThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newTheme = e.target.value as 'light' | 'dark' | 'system';
    setTheme(newTheme);
    showToast(`Theme set to ${newTheme}`);
  };

  // Render content based on active section
  const renderContent = () => {
    switch (activeSection) {
      case 'general':
        return <GeneralSection />;
      case 'appearance':
        return <AppearanceSection theme={theme} onThemeChange={handleThemeChange} />;
      case 'customise':
        return (
          <CustomiseSection
            selectedTraits={selectedTraits}
            onTraitToggle={handleTraitToggle}
            enableForNewChats={enableForNewChats}
            advancedOpen={advancedOpen}
            onToggleAdvanced={toggleAdvanced}
              onNavigateProfile={() => setActiveSection('profile')}
          />
        );
      case 'profile':
        return <ProfilePage />;
      case 'subscriptions':
        return <SubscriptionsSection showToast={showToast} />;
      case 'editor':
        return <EditorSection />;
      default:
        return <DefaultSection sectionId={activeSection} />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-heading"
        className={`bg-white dark:bg-gray-900 shadow-2xl flex flex-col w-full ${isMobile ? 'max-w-full h-full rounded-none' : 'max-w-3xl h-[80vh] max-h-[90vh] rounded-2xl'} overflow-hidden border border-gray-200 dark:border-gray-700 animate-fadeIn`}
        style={{ boxShadow: '0 8px 40px 0 rgba(29,42,77,0.15)' }}
      >
        {/* Mobile: section picker */}
        {isMobile && (
          <div className="w-full px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <label htmlFor="section-select" className="sr-only">Select settings section</label>
            <select
              id="section-select"
              value={activeSection}
              onChange={(e) => setActiveSection(e.target.value)}
              className="w-full p-3 bg-gray-100 dark:bg-gray-700 rounded-md text-base focus:outline-none"
              aria-label="Select settings section"
            >
              {sections.map(s => (<option key={s.id} value={s.id}>{s.label}</option>))}
            </select>
          </div>
        )}
        {/* Sidebar for desktop */}
        {!isMobile && (
          <div className="w-60 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
            <ul className="py-2">
              {sections.map((section) => (
                <li key={section.id}>
                  <button
                    aria-label={section.label}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full text-left py-3 px-4 flex items-center text-base ${
                      activeSection === section.id
                        ? 'bg-gray-200 dark:bg-gray-700'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <span className="mr-3 text-gray-500">{section.icon}</span>
                    <span className="text-gray-700 dark:text-gray-300">{section.label}</span>
                  </button>
                </li>
              ))}
            </ul>
            {/* Logout */}
            <div className="border-t border-gray-200 dark:border-gray-700 mt-2 pt-2">
              <button
                aria-label="Logout"
                onClick={handleLogout}
                className="w-full text-left py-3 px-4 flex items-center text-base text-red-500 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
              >
                <span className="mr-3"><LogOut size={18} /></span>
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
        {/* Main Content */}
        <div className="flex-1 p-6 overflow-y-auto relative">
          <h2 id="settings-heading" className="sr-only">Settings</h2>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="absolute top-4 right-4 p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            aria-label="Close settings"
          >
            <X size={20} />
          </button>
          {toast && (
            <div className="absolute top-4 right-4 p-2 bg-green-100 text-green-600 rounded-md">
              {toast}
            </div>
          )}
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Settings;