import React from 'react';
import { FolderOpen, Code, Terminal } from 'lucide-react';

const Workbench: React.FC = () => {
  return (
    <div className="flex flex-col h-full bg-white dark:bg-dark">
      <div className="flex border-b border-gray-200 dark:border-dark-secondary">
        <div className="w-64 border-r border-gray-200 dark:border-dark-secondary p-4">
          <div className="flex items-center text-[#1D2A4D] dark:text-white mb-4">
            <FolderOpen size={18} className="mr-2" />
            <span className="font-medium">Files</span>
          </div>
          <ul className="text-sm">
            <li className="py-1 px-2 rounded hover:bg-gray-100 dark:hover:bg-dark-tertiary cursor-pointer">
              App.tsx
            </li>
            <li className="py-1 px-2 rounded hover:bg-gray-100 dark:hover:bg-dark-tertiary cursor-pointer">
              index.css
            </li>
            <li className="py-1 px-2 rounded hover:bg-gray-100 dark:hover:bg-dark-tertiary cursor-pointer">
              main.tsx
            </li>
          </ul>
        </div>
        <div className="flex-1 p-4">
          <div className="flex items-center text-[#1D2A4D] dark:text-white mb-4">
            <Code size={18} className="mr-2" />
            <span className="font-medium">Editor</span>
          </div>
          <div className="bg-gray-100 dark:bg-dark-secondary rounded-md p-4 font-mono text-sm h-[calc(100%-40px)] overflow-auto">
            <pre className="text-gray-800 dark:text-gray-200">
              {`import React from 'react';

function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">Hello Nexius!</h1>
        <p>This is your workbench environment.</p>
      </div>
    </div>
  );
}

export default App;`}
            </pre>
          </div>
        </div>
      </div>
      <div className="h-48 border-t border-gray-200 dark:border-dark-secondary p-4">
        <div className="flex items-center text-[#1D2A4D] dark:text-white mb-2">
          <Terminal size={18} className="mr-2" />
          <span className="font-medium">Terminal</span>
        </div>
        <div className="bg-[#1D2A4D] text-white p-3 rounded-md h-[calc(100%-32px)] font-mono text-sm overflow-auto">
          <p>$ npm run dev</p>
          <p className="text-green-400">Ready on localhost:5173</p>
        </div>
      </div>
    </div>
  );
};

export default Workbench;