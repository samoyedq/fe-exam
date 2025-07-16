'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '../services/api';
import ReCAPTCHA from 'react-google-recaptcha';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [loginError, setLoginError] = useState('');
  const [attemptCount, setAttemptCount] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState('');
  const [recaptchaError, setRecaptchaError] = useState('');
  const recaptchaRef = useRef(null);
  const router = useRouter();

  const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'; // Test key

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    
    if (value && !validateEmail(value)) {
      setEmailError('Username is required');
    } else {
      setEmailError('');
    }
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    
    if (value.length > 0 && value.length < 4) {
      setLoginError('Input valid password');
    } else {
      setLoginError('');
    }
  };

  const handleRecaptchaChange = (token) => {
    setRecaptchaToken(token);
    setRecaptchaError('');
  };

  const handleRecaptchaExpired = () => {
    setRecaptchaToken('');
    setRecaptchaError('ReCaptcha expired. Please verify again.');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (isBlocked) {
      return;
    }

    if (!email) {
      setEmailError('Username is required');
      return;
    }

    if (!validateEmail(email)) {
      setEmailError('Username is required');
      return;
    }

    if (password.length < 4) {
      setLoginError('Input valid password');
      return;
    }

    if (!recaptchaToken) {
      setRecaptchaError('ReCaptcha is required');
      return;
    }

    setIsLoading(true);

    try {
      const data = await authService.login(email, password, recaptchaToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      router.push('/dashboard');
    } catch (error) {
      const newAttemptCount = attemptCount + 1;
      setAttemptCount(newAttemptCount);
      
      if (recaptchaRef.current) {
        recaptchaRef.current.reset();
        setRecaptchaToken('');
      }
      
      if (newAttemptCount >= 3) {
        setIsBlocked(true);
        setLoginError('Maximum limit of invalid password attempts reached. Please try again later.');
      } else {
        setLoginError('Input valid password');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isLoginDisabled = password.length < 4 || !validateEmail(email) || !recaptchaToken || isBlocked || isLoading;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-blue-600">
              Exam track
            </h1>
          </div>
        <div className="bg-white rounded-lg shadow-md p-8">
        
          
          <form className="space-y-4" onSubmit={handleLogin}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Username or Email"
                value={email}
                onChange={handleEmailChange}
              />
              {emailError && (
                <p className="mt-1 text-sm text-red-500">{emailError}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Password"
                value={password}
                onChange={handlePasswordChange}
              />
              {loginError && (
                <p className="mt-1 text-sm text-red-500">{loginError}</p>
              )}
            </div>

    
            <div className="py-2 flex justify-center">
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={RECAPTCHA_SITE_KEY}
                onChange={handleRecaptchaChange}
                onExpired={handleRecaptchaExpired}
                theme="light"
              />
             
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoginDisabled}
                className={`w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                  isLoginDisabled 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer'
                }`}
              >
                {isLoading ? 'Signing in...' : 'Login'}
              </button>
            </div>

            <div className="text-center pt-4 ">
              <button
                type="button"
                onClick={() => router.push('/forgot-password')}
                className="text-sm text-blue-600 hover:text-blue-500 cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>
          </form>
        </div>
        
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            Copyright © 2024 FE Exam track, All Rights Reserved.
          </p>
        </div>
      </div>
    </div>
  );
}