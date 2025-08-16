// src/pages/auth/AuthPage.jsx
import React, { useState, useEffect } from 'react';
import { User, Mail, Lock, LogIn, UserPlus, Eye, EyeOff } from 'lucide-react';

// API_BASE_URL should match your backend Flask app's address
const API_BASE_URL = 'http://localhost:5000';

const LoginForm = ({ onSwitchToRegister, onLoginSuccess, displayMessage }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      displayMessage('Username and password are required.', 'error');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown authentication error' }));
        displayMessage(errorData.error || `Login failed: HTTP error ${response.status}`, 'error');
        return;
      }

      const data = await response.json();

      if (data && data.token && data.user) {
        displayMessage('Login successful!', 'success');
        onLoginSuccess(data.token, data.user);
      } else {
        displayMessage('Login successful, but response missing expected data.', 'warning');
      }

    } catch (error) {
      displayMessage(`Network error or login failed: ${error.message}`, 'error');
      console.error('Login error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full p-8 space-y-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-6">Welcome Back to Firnas Air!</h2>

      <div>
        <label htmlFor="username" className="sr-only">Username</label>
        <div className="relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <User className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
          <input
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            required
            className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-sky-400 focus:border-sky-400 sm:text-sm"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
      </div>

      <div>
        <label htmlFor="password" className="sr-only">Password</label>
        <div className="relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            required
            className="appearance-none block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-sky-400 focus:border-sky-400 sm:text-sm"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
          </button>
        </div>
      </div>

      <div>
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transform transition duration-150 hover:scale-105"
        >
          <LogIn className="w-5 h-5 mr-2" /> Sign In
        </button>
      </div>

      <div className="text-center">
        <p className="text-sm text-gray-600">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="font-medium text-blue-600 hover:text-blue-500 focus:outline-none focus:underline"
          >
            Sign Up
          </button>
        </p>
      </div>
    </form>
  );
};


const RegisterForm = ({ onSwitchToLogin, displayMessage, onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  useEffect(() => {
    if (password && confirmPassword) {
      setPasswordMatch(password === confirmPassword);
    } else {
      setPasswordMatch(true);
    }
  }, [password, confirmPassword]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      displayMessage('Passwords do not match!', 'error');
      return;
    }
    if (!username || !email || !password) {
        displayMessage('All fields are required for registration.', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, email, password, name: username }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Unknown registration error' }));
            displayMessage(errorData.error || `Registration failed: HTTP error ${response.status}`, 'error');
            return;
        }

        const data = await response.json();
        if (data && data.token && data.user) {
            displayMessage('Registration successful! Logging you in...', 'success');
            onLoginSuccess(data.token, data.user);
        } else {
            displayMessage('Registration successful, but response missing login data. Please sign in.', 'warning');
            onSwitchToLogin();
        }

    } catch (error) {
        displayMessage(`Network error or registration failed: ${error.message}`, 'error');
        console.error('Registration error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full p-8 space-y-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-6">Join Firnas Air Today!</h2>

      {/* Username Field */}
      <div>
        <label htmlFor="username" className="sr-only">Username</label>
        <div className="relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <User className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
          <input
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            required
            className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-400 focus:border-teal-400 sm:text-sm"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
      </div>

      {/* Email Field */}
      <div>
        <label htmlFor="email-register" className="sr-only">Email address</label>
        <div className="relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mail className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
          <input
            id="email-register"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-400 focus:border-teal-400 sm:text-sm"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
      </div>

      {/* Password Field */}
      <div>
        <label htmlFor="password-register" className="sr-only">Password</label>
        <div className="relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
          <input
            id="password-register"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            required
            className={`appearance-none block w-full pl-10 pr-10 py-2 border ${!passwordMatch ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-400 focus:border-teal-400 sm:text-sm`}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
          </button>
        </div>
        {!passwordMatch && (
          <p className="mt-2 text-sm text-red-600">Passwords do not match.</p>
        )}
      </div>

      {/* Confirm Password Field */}
      <div>
        <label htmlFor="confirm-password" className="sr-only">Confirm Password</label>
        <div className="relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
          <input
            id="confirm-password"
            name="confirm-password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            required
            className={`appearance-none block w-full pl-10 pr-10 py-2 border ${!passwordMatch ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-400 focus:border-teal-400 sm:text-sm`}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
          </button>
        </div>
        {!passwordMatch && (
          <p className="mt-2 text-sm text-red-600">Passwords do not match.</p>
        )}
      </div>

      {/* Sign Up Button */}
      <div>
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transform transition duration-150 hover:scale-105"
        >
          <UserPlus className="w-5 h-5 mr-2" /> Sign Up
        </button>
      </div>

      {/* Switch to Login Link */}
      <div className="text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="font-medium text-sky-600 hover:text-sky-500 focus:outline-none focus:underline"
          >
            Sign In
          </button>
        </p>
      </div>
    </form>
  );
};


export default function AuthPage({ onLoginSuccess, displayMessage }) {
  // Initialize to false to show Login form by default, allowing immediate sign-in attempts
  const [showRegister, setShowRegister] = useState(false);
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
      <div className="flex flex-col lg:flex-row w-full max-w-6xl bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Left Half: Image and Branding */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gradient-to-br from-blue-500 to-teal-600 relative overflow-hidden">
          {/* Pattern */}
          <div className="absolute inset-0 opacity-10 bg-pattern-grid"></div>

          {/* Image */}
          <img
            src="https://placehold.co/600x800/2980b9/ffffff?text=AirVibe+Drone+in+Flight"
            alt="AirVibe Drone in Flight"
            className="rounded-xl shadow-xl max-w-full h-auto object-cover transform transition-transform duration-500 hover:scale-105"
            onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/600x800/2980b9/ffffff?text=Drone+Image+Error"; }}
          />

          {/* Text Overlay */}
          <div className="absolute bottom-8 left-8 right-8 text-white text-center">
            <h2 className="text-4xl font-extrabold mb-2 drop-shadow-lg flex items-center justify-center">
              {/* Custom Drone SVG icon for unique branding */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-10 h-10 mr-3 text-white"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 7l10 5 10-5" />
                <path d="M12 2v20" />
                <path d="M4 15h16" />
                <path d="M7 12h10" />
                <circle cx="7" cy="12" r="1.5" fill="white" stroke="none" />
                <circle cx="17" cy="12" r="1.5" fill="white" stroke="none" />
                <circle cx="12" cy="7" r="1.5" fill="white" stroke="none" />
                <circle cx="12" cy="17" r="1.5" fill="white" stroke="none" />
              </svg>
             Firnas Air
            </h2>
            <p className="text-lg font-light opacity-90 drop-shadow-md">Connecting you to the skies, in real-time.</p>
          </div>
        </div>

        {/* Right Half: Form Section (Login or Register) */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
          {showRegister ? (
            <RegisterForm onSwitchToLogin={() => setShowRegister(false)} displayMessage={displayMessage} onLoginSuccess={onLoginSuccess} />
          ) : (
            <LoginForm onSwitchToRegister={() => setShowRegister(true)} onLoginSuccess={onLoginSuccess} displayMessage={displayMessage} />
          )}
        </div>
      </div>
    </div>
  );
}