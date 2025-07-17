import React, { useState } from 'react';
import { User, Mail, Lock, LogIn, UserPlus } from 'lucide-react'; // Icons for forms

// --- LoginForm Component ---
// This component renders the login form.
const LoginForm = ({ onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle login logic here (e.g., send data to Firebase)
    console.log('Login attempt:', { email, password });
    alert('Login functionality not yet implemented.'); // Using alert as a temporary placeholder
  };

  return (
    <form onSubmit={handleSubmit} className="w-full p-8 space-y-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-6">Welcome Back to AirVibe!</h2>
      
      {/* Email Input */}
      <div>
        <label htmlFor="email" className="sr-only">Email address</label>
        <div className="relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mail className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-sky-400 focus:border-sky-400 sm:text-sm"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
      </div>

      {/* Password Input */}
      <div>
        <label htmlFor="password" className="sr-only">Password</label>
        <div className="relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-sky-400 focus:border-sky-400 sm:text-sm"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
      </div>

      {/* Login Button */}
      <div>
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transform transition duration-150 hover:scale-105"
        >
          <LogIn className="w-5 h-5 mr-2" /> Sign In
        </button>
      </div>

      {/* Switch to Register */}
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

// --- RegisterForm Component ---
// This component renders the registration form.
const RegisterForm = ({ onSwitchToLogin }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMatch, setPasswordMatch] = useState(true);

  // Effect to check password match whenever password or confirmPassword changes
  React.useEffect(() => {
    if (password && confirmPassword) {
      setPasswordMatch(password === confirmPassword);
    } else {
      setPasswordMatch(true); // Don't show mismatch until both are typed
    }
  }, [password, confirmPassword]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    // Handle registration logic here (e.g., send data to Firebase)
    console.log('Register attempt:', { username, email, password });
    alert('Registration functionality not yet implemented.'); // Using alert as a temporary placeholder
  };

  return (
    <form onSubmit={handleSubmit} className="w-full p-8 space-y-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-6">Join AirVibe Today!</h2>
      
      {/* Username Input */}
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

      {/* Email Input */}
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

      {/* Password Input */}
      <div>
        <label htmlFor="password-register" className="sr-only">Password</label>
        <div className="relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
          <input
            id="password-register"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            className={`appearance-none block w-full pl-10 pr-3 py-2 border ${!passwordMatch ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-400 focus:border-teal-400 sm:text-sm`}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {!passwordMatch && (
          <p className="mt-2 text-sm text-red-600">Passwords do not match.</p>
        )}
      </div>

      {/* Confirm Password Input */}
      <div>
        <label htmlFor="confirm-password" className="sr-only">Confirm Password</label>
        <div className="relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
          <input
            id="confirm-password"
            name="confirm-password"
            type="password"
            autoComplete="new-password"
            required
            className={`appearance-none block w-full pl-10 pr-3 py-2 border ${!passwordMatch ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-400 focus:border-teal-400 sm:text-sm`}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
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

      {/* Switch to Login */}
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

// --- AuthPage Component (Main Container) ---
// This component manages the state to switch between login and registration forms.
export default function AuthPage() {
  // State to determine which form to display: true for register, false for login
  const [showRegister, setShowRegister] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
      <div className="flex flex-col lg:flex-row w-full max-w-6xl bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Left Half: Image Section */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gradient-to-br from-blue-500 to-teal-600 relative overflow-hidden">
          {/* Background pattern/overlay for visual interest */}
          <div className="absolute inset-0 opacity-10 bg-pattern-grid"></div>
          
          {/* Main Drone Image - A more abstract, flying drone */}
          <img
            src="https://placehold.co/600x800/2980b9/ffffff?text=AirVibe+Drone+in+Flight" // Darker blue background, white text
            alt="AirVibe Drone in Flight"
            className="rounded-xl shadow-xl max-w-full h-auto object-cover transform transition-transform duration-500 hover:scale-105"
            onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/600x800/2980b9/ffffff?text=Drone+Image+Error"; }}
          />
          
          {/* Overlay text with Logo and Custom Drone SVG */}
          <div className="absolute bottom-8 left-8 right-8 text-white text-center">
            <h2 className="text-4xl font-extrabold mb-2 drop-shadow-lg flex items-center justify-center">
              {/* Custom Drone SVG icon - slightly adjusted for visual appeal */}
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
                <path d="M12 2L2 7l10 5 10-5-10-5z" /> {/* Top of drone */}
                <path d="M2 17l10 5 10-5" /> {/* Bottom of drone */}
                <path d="M2 7l10 5 10-5" /> {/* Middle line for perspective */}
                <path d="M12 2v20" /> {/* Vertical support */}
                <path d="M4 15h16" /> {/* Horizontal support */}
                <path d="M7 12h10" /> {/* Another horizontal support */}
                <circle cx="7" cy="12" r="1.5" fill="white" stroke="none" /> {/* Propeller bases */}
                <circle cx="17" cy="12" r="1.5" fill="white" stroke="none" />
                <circle cx="12" cy="7" r="1.5" fill="white" stroke="none" />
                <circle cx="12" cy="17" r="1.5" fill="white" stroke="none" />
              </svg>
              AirVibe
            </h2>
            <p className="text-lg font-light opacity-90 drop-shadow-md">Connecting you to the skies, in real-time.</p>
          </div>
        </div>

        {/* Right Half: Form Section */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
          {showRegister ? (
            <RegisterForm onSwitchToLogin={() => setShowRegister(false)} />
          ) : (
            <LoginForm onSwitchToRegister={() => setShowRegister(true)} />
          )}
        </div>
      </div>
    </div>
  );
}

