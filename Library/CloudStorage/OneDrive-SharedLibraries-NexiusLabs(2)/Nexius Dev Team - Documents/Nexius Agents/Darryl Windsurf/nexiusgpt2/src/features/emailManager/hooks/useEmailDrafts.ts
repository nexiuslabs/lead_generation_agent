import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface EmailDraft {
  id: string;
  subject: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  body: string;
  created: number;
  modified: number;
}

interface UseEmailDraftsOptions {
  onSave?: (draft: EmailDraft) => void;
  onError?: (error: Error) => void;
}

const useEmailDrafts = (options?: UseEmailDraftsOptions) => {
  const [drafts, setDrafts] = useState<EmailDraft[]>([]);
  const [currentDraft, setCurrentDraft] = useState<EmailDraft | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Create a new draft
  const createDraft = useCallback((initialData?: Partial<EmailDraft>) => {
    const now = Date.now();
    const newDraft: EmailDraft = {
      id: uuidv4(),
      subject: initialData?.subject || '',
      to: initialData?.to || [],
      cc: initialData?.cc || [],
      bcc: initialData?.bcc || [],
      body: initialData?.body || '',
      created: now,
      modified: now
    };
    
    setCurrentDraft(newDraft);
    return newDraft;
  }, []);

  // Save the current draft
  const saveDraft = useCallback(async (draft: EmailDraft = currentDraft!) => {
    if (!draft) return;
    
    try {
      setIsSaving(true);
      
      // Update the modified timestamp
      const updatedDraft = {
        ...draft,
        modified: Date.now()
      };
      
      // Update the drafts list
      setDrafts(prevDrafts => {
        const index = prevDrafts.findIndex(d => d.id === updatedDraft.id);
        if (index >= 0) {
          // Update existing draft
          const newDrafts = [...prevDrafts];
          newDrafts[index] = updatedDraft;
          return newDrafts;
        } else {
          // Add new draft
          return [...prevDrafts, updatedDraft];
        }
      });
      
      // Set the current draft to the updated draft
      setCurrentDraft(updatedDraft);
      
      // Call the onSave callback if provided
      if (options?.onSave) {
        options.onSave(updatedDraft);
      }
      
      return updatedDraft;
    } catch (error) {
      console.error('Error saving draft:', error);
      
      // Call the onError callback if provided
      if (options?.onError && error instanceof Error) {
        options.onError(error);
      }
      
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [currentDraft, options]);

  // Delete a draft
  const deleteDraft = useCallback((draftId: string) => {
    setDrafts(prevDrafts => prevDrafts.filter(d => d.id !== draftId));
    
    // Clear current draft if it's the deleted one
    if (currentDraft?.id === draftId) {
      setCurrentDraft(null);
    }
  }, [currentDraft]);

  // Load a draft
  const loadDraft = useCallback((draftId: string) => {
    const draft = drafts.find(d => d.id === draftId);
    if (draft) {
      setCurrentDraft(draft);
      return draft;
    }
    return null;
  }, [drafts]);

  // Update the current draft
  const updateCurrentDraft = useCallback((updates: Partial<EmailDraft>) => {
    if (!currentDraft) return null;
    
    const updatedDraft = {
      ...currentDraft,
      ...updates,
      modified: Date.now()
    };
    
    setCurrentDraft(updatedDraft);
    return updatedDraft;
  }, [currentDraft]);

  return {
    drafts,
    currentDraft,
    isSaving,
    createDraft,
    saveDraft,
    deleteDraft,
    loadDraft,
    updateCurrentDraft
  };
};

export default useEmailDrafts;