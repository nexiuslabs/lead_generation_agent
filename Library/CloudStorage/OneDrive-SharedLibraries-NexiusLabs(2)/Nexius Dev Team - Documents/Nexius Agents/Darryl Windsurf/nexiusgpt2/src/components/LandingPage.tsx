import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, ShieldCheck, Inbox } from 'lucide-react';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-white dark:bg-dark">
      <header className="bg-white dark:bg-dark shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Zap className="h-8 w-8 text-primary-500" />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">NexiusGPT</span>
          </div>
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 bg-primary-600 dark:bg-primary-500 text-white rounded-md hover:bg-primary-700 transition"
          >
            Get Started
          </button>
        </div>
      </header>

      <main className="mt-10">
        <section className="max-w-3xl mx-auto text-center px-4">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white">
            Revolutionize your Email Workflow
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            Automate your email drafting, task management, and procurement processes with AI-powered agents.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="mt-6 px-6 py-3 bg-primary-600 dark:bg-primary-500 text-white rounded-md text-lg font-medium hover:bg-primary-700 transition"
          >
            Get Started
          </button>
        </section>

        <section className="mt-20 bg-gray-50 dark:bg-dark-secondary py-16">
          <div className="max-w-7xl mx-auto px-4 grid gap-12 sm:grid-cols-3">
            <div className="text-center">
              <ShieldCheck className="mx-auto h-12 w-12 text-secondary-500 dark:text-secondary-400" />
              <h3 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">Secure and Private</h3>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                Your data is processed locally and stays secure with end-to-end encryption.
              </p>
            </div>
            <div className="text-center">
              <Zap className="mx-auto h-12 w-12 text-primary-500" />
              <h3 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">AI-Powered Automation</h3>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                Let AI handle repetitive email tasks, replies, and reminders so you can focus on what matters.
              </p>
            </div>
            <div className="text-center">
              <Inbox className="mx-auto h-12 w-12 text-secondary-500 dark:text-secondary-400" />
              <h3 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">Streamlined Procurement</h3>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                Generate purchase requests and manage vendors directly from your chat interface.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="mt-20 bg-white dark:bg-dark-tertiary py-8">
        <div className="max-w-7xl mx-auto px-4 sm:flex sm:items-center sm:justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-400">&copy; {new Date().getFullYear()} NexiusGPT. All rights reserved.</p>
          <div className="mt-4 sm:mt-0 space-x-4">
            <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">Privacy Policy</a>
            <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
