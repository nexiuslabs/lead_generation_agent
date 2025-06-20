import React, { useState, useEffect } from 'react';
import { Globe, RefreshCw } from 'lucide-react';

interface WebViewPreviewProps {}

const WebViewPreview: React.FC<WebViewPreviewProps> = () => {
  const [url, setUrl] = useState('https://example.com');
  const [inputUrl, setInputUrl] = useState('https://example.com');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Ensure URL has protocol
    let newUrl = inputUrl;
    if (!/^https?:\/\//i.test(newUrl)) {
      newUrl = 'https://' + newUrl;
      setInputUrl(newUrl);
    }
    
    setUrl(newUrl);
    setIsLoading(true);
    setError(null);
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setError(null);
  };

  const handleIframeLoad = () => {
    console.log('iframe loaded');
    setIsLoading(false);
  };

  const handleIframeError = () => {
    setError('Failed to load the URL. Please try another website.');
    setIsLoading(false);
  };

  // Set common URLs for testing
  useEffect(() => {
    // Start with a reliable URL that should work in most environments
    setUrl('https://www.bing.com');
    setInputUrl('https://www.bing.com');
  }, []);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-dark border border-gray-200 dark:border-dark-secondary rounded-md">
      <div className="border-b border-gray-200 dark:border-dark-secondary p-3">
        <form onSubmit={handleSubmit} className="flex items-center">
          <div className="flex items-center text-[#1D2A4D] dark:text-dark-default mr-2">
            <Globe size={18} />
          </div>
          <input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder="Enter URL to preview..."
            className="flex-1 px-3 py-1.5 border border-gray-300 dark:border-dark-secondary rounded-md focus:ring-[#00CABA] focus:border-[#00CABA] dark:bg-dark-secondary dark:text-white text-sm"
          />
          <button
            type="button"
            onClick={handleRefresh}
            className="ml-2 p-1.5 rounded-md text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-dark-tertiary"
            title="Refresh"
          >
            <RefreshCw size={18} />
          </button>
        </form>
      </div>
      
      <div className="flex-1 relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white dark:bg-dark bg-opacity-70 dark:bg-opacity-70 flex items-center justify-center z-10">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#00CABA]"></div>
          </div>
        )}
        
        {error && (
          <div className="absolute inset-0 flex items-center justify-center z-10 p-4">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4 text-red-700 dark:text-red-300">
              {error}
            </div>
          </div>
        )}
        
        <iframe
          src={url}
          className="w-full h-full border-0"
          onLoad={handleIframeLoad}
          onError={handleIframeError}
          title="Web Preview"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          referrerPolicy="no-referrer"
        />
      </div>
    </div>
  );
};

export default WebViewPreview;