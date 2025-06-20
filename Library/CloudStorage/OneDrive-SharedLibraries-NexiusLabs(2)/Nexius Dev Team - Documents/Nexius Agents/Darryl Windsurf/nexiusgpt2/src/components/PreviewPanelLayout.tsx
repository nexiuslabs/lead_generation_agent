import React from 'react';
import PreviewPanel from './PreviewPanel';

export interface PreviewPanelLayoutProps {
  isMobile: boolean;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  taskTitle: string;
  email: any;
  draftReply?: string;
  notes?: string;
  onSendReply?: (reply: string) => void;
  onSaveNotes?: (notes: string) => void;
  onClose?: () => void;
  taskId: string;
  emailLoading?: boolean;
  initialTab?: 'email' | 'reply' | 'notes'; // NEW: allow parent to set initial tab
} 

export interface PreviewPanelProps {
  taskTitle: string;
  email: any;
  draftReply: string;
  notes: string;
  onSendReply?: (reply: string) => void;
  onSaveNotes?: (notes: string) => void;
  onClose?: () => void;
  taskId: string;
}

const PreviewPanelLayout: React.FC<PreviewPanelLayoutProps> = ({
  isMobile,
  isCollapsed,
  setIsCollapsed,
  taskTitle,
  email,
  draftReply = '',
  notes = '',
  onSendReply,
  onSaveNotes,
  onClose,
  taskId,
  emailLoading,
  initialTab
}) => {
  // --- Desktop ---
  if (!isMobile) {
    return (
      <div className="relative" style={{ backgroundColor: 'rgba(0,0,0,0.05)' }}>
        <div
          className="w-full md:w-1/2"
          style={{ height: 'calc(100vh - 64px)' }}
        >
          <PreviewPanel
            taskTitle={taskTitle}
            email={email}
            draftReply={draftReply}
            notes={notes}
            taskId={taskId}
            emailLoading={emailLoading}
            initialTab={initialTab}
            onClose={onClose || (() => setIsCollapsed(true))}
            {...(onSendReply ? { onSendReply } : {})}
            {...(onSaveNotes ? { onSaveNotes } : {})}
          />
        </div>
      </div>
    );
  }

  // --- Mobile ---
  return (
    <div className="flex-1 w-full">
      <PreviewPanel
        taskTitle={taskTitle}
        email={email}
        draftReply={draftReply}
        notes={notes}
        onClose={onClose || (() => setIsCollapsed(true))}
        taskId={taskId}
        emailLoading={emailLoading}
        initialTab={initialTab}
        {...(onSendReply ? { onSendReply } : {})}
        {...(onSaveNotes ? { onSaveNotes } : {})}
      />
    </div>
  );
};

export default PreviewPanelLayout;
