import React, { useState, useEffect } from 'react';
import { X, MoreHorizontal } from 'lucide-react';

const tabList = [
  { key: 'email', label: 'View Email' },
  { key: 'reply', label: 'Reply Draft' },
  { key: 'notes', label: 'Task Notes' },
] as const;
type TabKey = typeof tabList[number]['key'];

import { createDraftReply } from '../features/emailManager/api/emailApi';

export interface PreviewPanelProps {
  taskTitle: string;
  email: any;
  draftReply: string;
  notes: string;
  onSendReply?: (reply: string) => void;
  onSaveNotes?: (notes: string) => void;
  onClose?: () => void;
  taskId: string;
  emailLoading?: boolean;
  initialTab?: TabKey; // NEW: allow parent to set initial tab
}

const PreviewPanel: React.FC<PreviewPanelProps> = ({
  taskTitle,
  email,
  draftReply,
  notes,
  onSendReply,
  onSaveNotes,
  onClose,
  taskId,
  emailLoading,
  initialTab
}) => {
  const [isSending, setIsSending] = useState(false);
  // Use initialTab for initial state, default to 'email'
  const [activeTab, setActiveTab] = useState<TabKey>(initialTab || 'email');
  const [replyDraft, setReplyDraft] = useState(draftReply);
  const [noteDraft, setNoteDraft] = useState(notes);
  const [isDraftLoading, setIsDraftLoading] = useState(false);
  const [showOverflow, setShowOverflow] = useState(false);

  // Sync activeTab with initialTab prop changes
  useEffect(() => {
    if (initialTab && initialTab !== activeTab) {
      setActiveTab(initialTab);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialTab]);

  // Sync replyDraft with draftReply prop changes
  useEffect(() => {
    setReplyDraft(draftReply);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftReply]);

  // Sync noteDraft with notes prop changes
  useEffect(() => {
    setNoteDraft(notes);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notes]);

  // Fetch draft reply when switching to reply tab
  useEffect(() => {
    const fetchDraft = async () => {
      if (activeTab === 'reply' && taskId) {
        setIsDraftLoading(true);
        setReplyDraft('Generating draft reply…');
        try {
          const res = await createDraftReply(taskId);
          setReplyDraft(res.reply_draft || '');
        } catch (err) {
          setReplyDraft('Failed to generate draft reply.');
        } finally {
          setIsDraftLoading(false);
        }
      }
    };
    fetchDraft();
    // Only run when tab changes to reply or taskId changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, taskId]);



  return (
    <aside
      className="flex-shrink-0 w-full sm:w-[400px] max-w-full sm:max-w-[400px] min-w-0 bg-white dark:bg-dark h-full flex flex-col border-l border-gray-200 dark:border-gray-700 shadow-inner"
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      {/* Header */}
      <div className="px-3 sm:px-6 pt-5 pb-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white truncate" title={taskTitle}>
          {taskTitle}
        </h2>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close preview panel"
            className="ml-4 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-[#00CABA] transition-colors"
          >
            <X size={22} className="text-gray-400 hover:text-[#1D2A4D] dark:text-gray-500 dark:hover:text-gray-300" />
          </button>
        )}
      </div>
      {/* Tabs */}
      <nav className="flex px-3 sm:px-6 pt-2 pb-0 border-b border-gray-100 dark:border-gray-800 overflow-x-auto" aria-label="Tabs">
        {tabList.filter((tab) => tab.key !== 'notes').map((tab) => (
          <button
            key={tab.key}
            className={`mr-6 sm:mr-8 px-4 py-2 text-sm sm:text-base font-semibold focus:outline-none transition-colors
              ${activeTab === tab.key
                ? 'text-[#1F2937] dark:text-white border-b-2 border-[#1F2937] dark:border-white font-bold'
                : 'text-[#6B7280] dark:text-gray-400 hover:text-[#374151] dark:hover:text-gray-200 border-b-2 border-transparent'}`}
            aria-current={activeTab === tab.key ? 'page' : undefined}
            onClick={() => setActiveTab(tab.key)}
            type="button"
            style={{ minWidth: '80px' }}
          >
            {tab.label}
          </button>
        ))}
      </nav>
      {/* Overflow for less-used tabs */}
      <div className="relative">
        <button
          type="button"
          aria-label="More actions"
          onClick={() => setShowOverflow(prev => !prev)}
          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none"
        >
          <MoreHorizontal />
        </button>
        {showOverflow && (
          <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-dark border border-gray-200 dark:border-gray-700 rounded shadow-lg z-10">
            <button
              type="button"
              onClick={() => { setActiveTab('notes'); setShowOverflow(false); }}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
            >
              Task Notes
            </button>
          </div>
        )}
      </div>
      {/* Tab Panels */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-3 sm:py-4">
        {activeTab === 'email' && (
  emailLoading ? (
    <div className="flex flex-col items-center justify-center h-64">
      <svg className="animate-spin h-8 w-8 text-[#00CABA] mb-3\" fill="none\" viewBox="0 0 24 24">
        <circle className="opacity-25\" cx="12\" cy="12\" r="10\" stroke="#00CABA\" strokeWidth="4"></circle>
        <path className="opacity-75" fill="#00CABA" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
      </svg>
      <div className="text-[#1D2A4D] dark:text-white font-semibold text-lg">Loading.. Please wait</div>
    </div>
  ) : (
    <div className="bg-white dark:bg-dark-secondary border border-gray-200 dark:border-dark-secondary rounded-lg p-3 sm:p-4 text-gray-800 dark:text-white text-sm sm:text-base whitespace-pre-wrap shadow-sm flex flex-col h-full">
      <div className="mb-2">
        <span className="font-bold text-[#1D2A4D] dark:text-white text-base sm:text-lg uppercase tracking-wide" style={{ fontFamily: 'Montserrat, Poppins, sans-serif' }}>
          {email?.subject || 'No Subject'}
        </span>
      </div>
      <div className="mb-1 text-xs sm:text-sm text-[#3A3A3A] dark:text-gray-300">
        <span className="font-semibold">From:</span> {email?.sender || 'Unknown'}
      </div>
      <div className="mb-4 text-sm sm:text-base text-[#3A3A3A] dark:text-gray-300 flex-1 overflow-y-auto">
        {email?.bodyPreview || 'No content.'}
      </div>
      {email?.attachments && email.attachments.length > 0 && (
        <div className="mt-4">
          <div className="font-semibold text-[#1D2A4D] dark:text-white mb-1 flex items-center gap-2">
            <svg className="inline-block w-5 h-5 text-[#00CABA]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21.44 11.05l-8.49 8.49a5 5 0 01-7.07-7.07l8.49-8.49a3.5 3.5 0 114.95 4.95l-8.49 8.49a2 2 0 01-2.83-2.83l8.49-8.49" /></svg>
            Attachments
          </div>
          <ul className="list-disc pl-4 sm:pl-5 space-y-1">
            {email.attachments.map((att: any, idx: number) => (
              <li key={att.id || idx} className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2 break-all">
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4 text-[#00CABA]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21.44 11.05l-8.49 8.49a5 5 0 01-7.07-7.07l8.49-8.49a3.5 3.5 0 114.95 4.95l-8.49 8.49a2 2 0 01-2.83-2.83l8.49-8.49" /></svg>
                  <span className="text-[#1D2A4D] dark:text-white font-medium text-xs sm:text-base">{att.name}</span>
                </span>
                {att.url && (
                  <a href={att.url} target="_blank" rel="noopener noreferrer" className="ml-0 sm:ml-2 text-[#00CABA] underline hover:text-[#1D2A4D] dark:hover:text-[#00CABA] transition-colors text-xs sm:text-base">Download</a>
                )}
                <span className="ml-0 sm:ml-2 text-xs text-[#3A3A3A] dark:text-gray-400">{att.size ? `${(att.size/1024).toFixed(1)} KB` : ''}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
)}
        {activeTab === 'reply' && (
  <form
    className="flex flex-col h-full"
    onSubmit={async e => {
      e.preventDefault();
      if (!onSendReply) return;
      setIsSending(true);
      try {
        await onSendReply(replyDraft);
      } finally {
        setIsSending(false);
      }
    }}
  >
    <textarea
      className="w-full h-36 sm:h-48 p-2 sm:p-3 border border-gray-300 dark:border-dark-secondary rounded-lg bg-gray-50 dark:bg-dark-secondary focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white text-sm sm:text-base resize-none mb-3"
      value={replyDraft}
      onChange={e => setReplyDraft(e.target.value)}
      placeholder="Type your draft reply here..."
      disabled={isDraftLoading || isSending}
      style={isDraftLoading || isSending ? { color: '#888', fontStyle: 'italic' } : { color: 'inherit' }}
    />
    <div className="flex justify-end">
      <button
        type="submit"
        className="bg-primary-500 hover:bg-primary-600 text-white dark:text-white rounded-lg px-4 sm:px-5 py-2 font-semibold text-sm sm:text-base shadow-sm transition-colors"
        disabled={!onSendReply || isSending}
      >
        {isSending ? 'Sending' : 'Send Reply'}
      </button>
    </div>
  </form>
)}
        {activeTab === 'notes' && (
          <form
            className="flex flex-col h-full"
            onSubmit={e => {
              e.preventDefault();
              if (onSaveNotes) onSaveNotes(noteDraft);
            }}
          >
            <textarea
              className="w-full h-36 sm:h-48 p-2 sm:p-3 border border-gray-300 dark:border-dark-secondary rounded-lg bg-gray-50 dark:bg-dark-secondary focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white text-sm sm:text-base resize-none mb-3"
              value={noteDraft}
              onChange={e => setNoteDraft(e.target.value)}
              placeholder="Add your notes here..."
            />
            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-primary-500 hover:bg-primary-600 text-white dark:text-white rounded-lg px-4 sm:px-5 py-2 font-semibold text-sm sm:text-base shadow-sm transition-colors"
                disabled={!onSaveNotes}
              >
                Save Notes
              </button>
            </div>
          </form>
        )}
      </div>
    </aside>
  );
};

export default PreviewPanel;