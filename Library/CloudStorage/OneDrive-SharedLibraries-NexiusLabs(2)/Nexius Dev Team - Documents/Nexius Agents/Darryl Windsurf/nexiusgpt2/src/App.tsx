import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import PreviewPanelLayout from './components/PreviewPanelLayout';
import { sendReply } from './features/emailManager/api/emailApi';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/Login';
import ProfilePage from './features/profile/ProfilePage';
import RemindersPage from './features/reminders/RemindersPage';
import ChatThread from './features/chatThread/ChatThread';
import TasksPage from './features/tasks/TasksPage';

// Core layout components
import Header from './components/Header';
import Sidebar from './components/Sidebar';

import Settings from './components/Settings';
import { EmailChatProvider } from './features/emailManager/components/EmailChatContext';
import HelpCenter from './components/HelpCenter';
import { Toast, Loading } from './components/ui';
import LandingPage from './components/LandingPage';

// Lazy-loaded feature modules
const EmailAgent = lazy(() => import('./features/emailManager/EmailAgent'));
const ProcurementAgent = lazy(() => import('./features/procurementAgent/ProcurementAgent'));

const Chat = lazy(() => import('./components/chat/Chat'));

// Main content wrapper that checks authentication
const MainContent: React.FC = () => {
  const location = useLocation();
  const [previewTaskTitle, setPreviewTaskTitle] = useState<string>('');
  const [previewEmail, setPreviewEmail] = useState<any>(null); // TODO: type properly
  const [previewEmailLoading, setPreviewEmailLoading] = useState(false);
  const [previewTaskId, setPreviewTaskId] = useState<string>('');
  const [isPreviewCollapsed, setIsPreviewCollapsed] = useState(true);
  // NEW: State for draft reply and initial tab
  const [previewDraftReply, setPreviewDraftReply] = useState('');
  const [previewInitialTab, setPreviewInitialTab] = useState<'email' | 'reply' | 'notes'>('email');
  const expandPreviewPanel = () => setIsPreviewCollapsed(false);
  const { isAuthenticated } = useAuth();
  const [chatStarted, setChatStarted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showHelpCenter, setShowHelpCenter] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const appRef = useRef<HTMLDivElement>(null);

  // Check if viewport is mobile size
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Reset collapsed state when switching to mobile
  useEffect(() => {
    if (isMobile) {
      setIsSidebarCollapsed(false);
      setIsSidebarOpen(false); // Close sidebar by default on mobile
    } else {
      setIsSidebarOpen(true); // Keep sidebar open on desktop
    }
  }, [isMobile]);

  // Handle click outside to close sidebar on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobile && isSidebarOpen && appRef.current) {
        const sidebarElement = document.querySelector('aside');
        const menuButton = document.querySelector('.fixed.top-4.left-4');
        
        if (sidebarElement && 
            menuButton && 
            !sidebarElement.contains(event.target as Node) && 
            !menuButton.contains(event.target as Node)) {
          setIsSidebarOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobile, isSidebarOpen]);

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If Help Center is shown, don't show the regular app UI
  if (showHelpCenter) {
    return <HelpCenter onClose={() => setShowHelpCenter(false)} />;
  }

  // Mobile menu toggle button
  const mobileMenuButton = isMobile && (
    <button 
      onClick={toggleSidebar} 
      className="fixed top-4 left-4 z-50 p-2 bg-white dark:bg-gray-800 rounded-md shadow-md"
      aria-label={isSidebarOpen ? "Close chat list" : "Open chat list"}
    >
      <Menu size={24} />
    </button>
  );

  // Render main content (chat panel and preview panel)
  const renderMainContent = () => {
    if (location.pathname.startsWith('/profile')) {
      return <ProfilePage />;
    }
    if (location.pathname.startsWith('/reminders')) {
      return <RemindersPage />;
    }
    if (location.pathname.startsWith('/tasks')) {
      return <TasksPage />;
    }
    return (
      <div className="flex">
        {/* Chat Panel */}
        <div className={`transition-width duration-200 ease-in-out overflow-hidden ${isPreviewCollapsed ? 'w-full' : 'w-full md:w-1/2'}`}>
          <Suspense fallback={<Loading size="lg" message="Loading..." fullScreen />}>
            <Routes>
              <Route 
                path="/chat/email/*" 
                element={
                  <ProtectedRoute>
                    <EmailAgent
  chatStarted={chatStarted}
  setChatStarted={setChatStarted}
  setPreviewDraftReply={setPreviewDraftReply}
  setPreviewInitialTab={setPreviewInitialTab}
  setIsPreviewCollapsed={setIsPreviewCollapsed}
/>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/chat/procurement/*" 
                element={
                  <ProtectedRoute>
                    <ProcurementAgent chatStarted={chatStarted} setChatStarted={setChatStarted} />
                  </ProtectedRoute>
                } 
              />
              <Route
                path="/chat/thread/:threadId"
                element={
                  <ProtectedRoute>
                    <ChatThread />
                  </ProtectedRoute>
                }
              />
              <Route 
                path="/chat" 
                element={
                  <ProtectedRoute>
                    <Chat chatStarted={chatStarted} setChatStarted={setChatStarted} />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </Suspense>
        </div>
        {/* Preview Panel */}
        {location.pathname.startsWith('/chat') && (
        <div className={`flex-none transition-width duration-200 ease-in-out overflow-hidden ${isPreviewCollapsed ? 'w-0' : 'w-64 md:w-1/2'}`}>
          <PreviewPanelLayout
            isMobile={isMobile}
            isCollapsed={isPreviewCollapsed}
            setIsCollapsed={setIsPreviewCollapsed}
            taskTitle={previewTaskTitle}
            email={previewEmail}
            taskId={previewTaskId}
            emailLoading={previewEmailLoading}
            draftReply={previewDraftReply}
            initialTab={previewInitialTab}
            onSendReply={async (replyDraft: string) => {
              try {
                // Placeholder for files: []
                await sendReply(
                  previewTaskId,
                  localStorage.getItem('email') || '',
                  replyDraft,
                  []
                );
                // Optionally, you can show a toast or update UI with response
                // Example: setPreviewDraftReply(''); setIsPreviewCollapsed(true);
              } catch (err) {
                // Optionally, show error toast
                console.error('Failed to send reply:', err);
              }
            }}
          />
        </div>
      )}
      </div>
    );
  };


  return (
    <div ref={appRef} className="min-h-screen bg-white dark:bg-dark text-gray-900 dark:text-white flex flex-col">
      {mobileMenuButton}
      
      <Header 
        chatStarted={chatStarted}
        isSidebarCollapsed={isSidebarCollapsed}
      />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Provide EmailChat context to both Sidebar and EmailAgent */}
        <EmailChatProvider>
          <Sidebar 
            isMobile={isMobile}
            isOpen={isSidebarOpen}
            isCollapsed={isSidebarCollapsed}
            toggleCollapse={toggleSidebarCollapse}
            setShowHelpCenter={setShowHelpCenter}
            showSettings={showSettings}
            setShowSettings={setShowSettings}
            onTaskSelect={expandPreviewPanel}
            setPreviewTaskTitle={setPreviewTaskTitle}
            setPreviewEmail={setPreviewEmail}
            setPreviewTaskId={setPreviewTaskId}
            setPreviewEmailLoading={setPreviewEmailLoading}
          />
          <main className={`flex-1 flex transition-all duration-300 ${
            isMobile ? 'ml-0' : 
            isSidebarCollapsed ? 'ml-16' : 'ml-64'
          }`}>
            {renderMainContent()}
          </main>
        </EmailChatProvider>
          {isMobile && isSidebarOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-30" onClick={toggleSidebar} />
          )}
      </div>

      {/* Settings Modal rendered at root for global overlay */}
      <Settings isOpen={showSettings} onClose={() => setShowSettings(false)} />
      {/* Global Toast notification */}
      <Toast />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginRedirectWrapper />} />
          <Route path="/*" element={<MainContent />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

// Wrapper for Login to redirect to lastRoute if available after login
const LoginRedirectWrapper: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      const lastRoute = localStorage.getItem('lastRoute');
      if (lastRoute && lastRoute !== '/login') {
        navigate(lastRoute, { replace: true });
      } else {
        navigate('/chat', { replace: true });
      }
    }
  }, [isAuthenticated, navigate]);

  return <Login />;
};

export default App;