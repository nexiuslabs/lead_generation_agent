import React, { useState } from 'react';
import { useNavigate} from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, User, KeyRound } from 'lucide-react';
import { loginApi, signupApi } from '../auth';

const Login: React.FC = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const auth = useAuth();


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      if (isSignup) {
        if (!name) throw new Error('Name is required');
        if (password !== confirmPassword) throw new Error('Passwords do not match');
        if (email && password && name && password === confirmPassword) {
          await signupApi({ name, email, password });
          setIsSignup(false);
          setEmail('');
          setPassword('');
          setName('');
          setConfirmPassword('');
          // Remove any previously stored email after signup
          localStorage.removeItem('email');
        } else {
          throw new Error('Please fill all fields correctly');
        }
      } else {
        const data = await loginApi({ email, password });
        console.log(data)
        if (data.token) {
          setError('');
          // Store email in localStorage for session tracking
          localStorage.setItem('email', email);
          auth.login(data.token);
          navigate('/chat', { replace: true });

        } else {
          throw new Error(data.message || 'Invalid credentials');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        <div>
          <h2 className="text-center text-3xl font-bold text-[#1D2A4D] uppercase tracking-wider font-['Montserrat','Poppins','Roboto',sans-serif]">
            {isSignup ? 'Create your account' : 'Welcome to Nexius'}
          </h2>
          <p className="mt-2 text-center text-base text-gray-600">
            {isSignup ? 'Sign up to get started' : 'Sign in to your account to continue'}
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            {isSignup && (
              <div className="relative mb-4">
                <label htmlFor="name" className="sr-only">Name</label>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required={isSignup}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="appearance-none rounded-none relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-[#00CABA] focus:border-[#00CABA] focus:z-10 sm:text-sm bg-[#F5F7FA]"
                  placeholder="Your name"
                />
              </div>
            )}
            <div className="relative mb-4">
              <label htmlFor="email" className="sr-only">Email address</label>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`appearance-none rounded-none relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 ${isSignup && !name ? '' : 'rounded-t-md'} focus:outline-none focus:ring-[#00CABA] focus:border-[#00CABA] focus:z-10 sm:text-sm bg-[#F5F7FA]`}
                placeholder="Email address"
              />
            </div>
            <div className="relative mb-4">
              <label htmlFor="password" className="sr-only">Password</label>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={isSignup ? 'new-password' : 'current-password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`appearance-none rounded-none relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 ${isSignup ? '' : 'rounded-b-md'} focus:outline-none focus:ring-[#00CABA] focus:border-[#00CABA] focus:z-10 sm:text-sm bg-[#F5F7FA]`}
                placeholder="Password"
              />
            </div>
            {isSignup && (
              <div className="relative mb-4">
                <label htmlFor="confirm-password" className="sr-only">Confirm Password</label>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <KeyRound className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  id="confirm-password"
                  name="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  required={isSignup}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="appearance-none rounded-none relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-[#00CABA] focus:border-[#00CABA] focus:z-10 sm:text-sm bg-[#F5F7FA]"
                  placeholder="Confirm password"
                />
              </div>
            )}
          </div>
          {!isSignup && (
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-[#00CABA] focus:ring-[#00CABA] border-gray-300 rounded bg-[#F5F7FA]"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Remember me
                </label>
              </div>
              <div className="text-sm">
                <a href="#" className="font-medium text-[#00CABA] hover:text-[#1D2A4D]">
                  Forgot your password?
                </a>
              </div>
            </div>
          )}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
                isLoading ? 'opacity-75 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? (
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </span>
              ) : null}
              {isLoading
                ? isSignup
                  ? 'Signing up...'
                  : 'Signing in...'
                : isSignup
                  ? 'Sign up'
                  : 'Sign in'
              }
            </button>
          </div>
        </form>

        <div className="mt-6">
          {isSignup ? (
            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <button
                type="button"
                className="font-medium text-primary-500 hover:text-primary-600 focus:outline-none bg-transparent"
                onClick={(e) => { e.preventDefault(); setIsSignup(false); }}
              >
                Sign in
              </button>
            </p>
          ) : (
            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
              Don't have an account?{' '}
              <button
                type="button"
                className="font-medium text-primary-500 hover:text-primary-600 focus:outline-none bg-transparent"
                onClick={(e) => { e.preventDefault(); setIsSignup(true); }}
              >
                Sign up now
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;