import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Chat Error Boundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col h-full bg-white dark:bg-dark">
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center max-w-md">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="text-red-500" size={32} />
              </div>
              
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Something went wrong
              </h2>
              
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                The chat interface encountered an unexpected error. 
                You can try reloading the page or starting a new conversation.
              </p>
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mb-6 text-left bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                  <summary className="cursor-pointer font-medium mb-2">Error Details</summary>
                  <pre className="text-xs text-red-600 dark:text-red-400 overflow-auto">
                    {this.state.error.toString()}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </details>
              )}
              
              <div className="flex gap-3 justify-center">
                <button
                  onClick={this.handleReset}
                  className="bg-[#00CABA] text-white px-4 py-2 rounded-lg hover:bg-[#008B7A] transition-colors flex items-center gap-2"
                >
                  <RefreshCw size={16} />
                  Try Again
                </button>
                <button
                  onClick={this.handleReload}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Reload Page
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;