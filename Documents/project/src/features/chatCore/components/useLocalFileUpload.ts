import { useState } from 'react';

export function useLocalFileUpload(destinationFolder: string = '/uploads') {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    const fileArray = Array.from(files);
    setUploadedFiles(prev => [...prev, ...fileArray]);
  };

  const removeFile = (idx: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== idx));
  };

  return { uploadedFiles, handleFiles, removeFile, setUploadedFiles };
}

