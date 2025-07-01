"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import lettuceImage from "/public/bgcover.jpg";
import Logo from "/public/logo.png";

export default function AuthPage() {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);
    
    if (isLoginMode) {
      // Login logic
      try {
        const response = await fetch('/api/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            username: formData.username,
            password: formData.password
          })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Login failed');
        }
        
        // Store user in session
        sessionStorage.setItem('currentUser', JSON.stringify(data.user));
        setSuccess('Login successful! Redirecting...');
        
        // Redirect to dashboard
        setTimeout(() => {
          router.push("/main/home/overview");
        }, 1500);
      } catch (err) {
        setError(err.message || "Login failed. Please check your credentials.");
        console.error("Login error:", err);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Registration logic
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords don't match");
        setIsSubmitting(false);
        return;
      }
      
      try {
        // Send registration request
        const response = await fetch('/api/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: formData.email,
            username: formData.username,
            password: formData.password,
            firstName: formData.firstName,
            lastName: formData.lastName
          })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Registration failed');
        }
        
        // Store user in session
        sessionStorage.setItem('currentUser', JSON.stringify({
          id: data.userId,
          username: formData.username,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email
        }));
        
        setSuccess('Registration successful! You can now login.');
        
        // Clear form
        setFormData({
          email: '',
          username: '',
          password: '',
          confirmPassword: '',
          firstName: '',
          lastName: ''
        });
        
        // Switch to login mode
        setTimeout(() => {
          setIsLoginMode(true);
          setSuccess('');
        }, 3000);
      } catch (err) {
        setError(err.message || "Registration failed. Please try again.");
        console.error("Registration error:", err);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className='flex min-h-screen'>
      {/* Left Side - Image Section */}
      <div className="flex-1 relative hidden md:block">
        <Image
          src={lettuceImage}
          alt="Lettuce Vertical Farming IOT"
          fill
          style={{ objectFit: 'cover' }}
          priority
        />
        <div className="absolute inset-0 bg-black opacity-30"></div>
      </div>

      {/* Right Side - Auth Section */}
      <div className="flex items-center justify-center w-full md:w-1/2 lg:w-1/3 bg-gradient-to-b from-white to-green-50 p-4 sm:p-8">
        <div className="w-full max-w-md">
          {/* Glass Blur Container */}
          <div className="backdrop-blur-lg bg-white/70 p-8 rounded-2xl shadow-xl border border-white/50">
            {/* Logo Section */}
            <div className="flex justify-center mb-6">
              <Image
                src={Logo}
                alt="Lettuce Logo"
                width={100}
                height={100}
                className="object-contain"
              />
            </div>

            {/* Title */}
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center text-green-900">
              {isLoginMode ? 'Login to Your Account' : 'Create New Account'}
            </h2>
            
            {/* Status Messages */}
            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg">
                {success}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className='w-full space-y-4'>
              {/* Registration-only fields */}
              {!isLoginMode && (
                <>
                  <div>
                    <label className='block text-gray-700 text-sm font-medium mb-2' htmlFor='email'>
                      Email
                    </label>
                    <input
                      type='email'
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className='w-full py-3 px-4 rounded-lg bg-white/80 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all'
                      placeholder="Enter your email"
                      required={!isLoginMode}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className='block text-gray-700 text-sm font-medium mb-2' htmlFor='firstName'>
                        First Name
                      </label>
                      <input
                        type='text'
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        className='w-full py-3 px-4 rounded-lg bg-white/80 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all'
                        placeholder="First Name"
                        required={!isLoginMode}
                      />
                    </div>
                    <div>
                      <label className='block text-gray-700 text-sm font-medium mb-2' htmlFor='lastName'>
                        Last Name
                      </label>
                      <input
                        type='text'
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        className='w-full py-3 px-4 rounded-lg bg-white/80 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all'
                        placeholder="Last Name"
                        required={!isLoginMode}
                      />
                    </div>
                  </div>
                </>
              )}
              
              {/* Common fields */}
              <div>
                <label className='block text-gray-700 text-sm font-medium mb-2' htmlFor='username'>
                  Username
                </label>
                <input
                  type='text'
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className='w-full py-3 px-4 rounded-lg bg-white/80 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all'
                  placeholder={isLoginMode ? "Enter your username" : "Create a username"}
                  required
                />
              </div>
              
              <div>
                <label className='block text-gray-700 text-sm font-medium mb-2' htmlFor='password'>
                  Password
                  {!isLoginMode && (
                    <span className="text-xs text-gray-500 ml-1">(min. 8 characters)</span>
                  )}
                </label>
                <input
                  type='password'
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className='w-full py-3 px-4 rounded-lg bg-white/80 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all'
                  placeholder={isLoginMode ? "Enter your password" : "Create a password"}
                  minLength={isLoginMode ? undefined : "8"}
                  required
                />
              </div>
              
              {/* Registration-only field */}
              {!isLoginMode && (
                <div>
                  <label className='block text-gray-700 text-sm font-medium mb-2' htmlFor='confirmPassword'>
                    Confirm Password
                  </label>
                  <input
                    type='password'
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className='w-full py-3 px-4 rounded-lg bg-white/80 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all'
                    placeholder="Confirm your password"
                    required
                  />
                </div>
              )}
              
              {/* Submit Button */}
              <button 
                type='submit' 
                disabled={isSubmitting}
                className={`w-full bg-gradient-to-r from-green-700 to-green-900 hover:from-green-600 hover:to-green-800 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {isLoginMode ? 'Logging in...' : 'Creating account...'}
                  </span>
                ) : (
                  isLoginMode ? 'Login' : 'Create Account'
                )}
              </button>
              
              {/* Toggle between login/register */}
              <div className="text-center mt-4">
                <p className="text-sm text-gray-600">
                  {isLoginMode ? "Don't have an account?" : "Already have an account?"}{' '}
                  <button 
                    type="button"
                    onClick={toggleMode}
                    className="text-green-600 hover:text-green-800 font-medium"
                  >
                    {isLoginMode ? 'Register here' : 'Login here'}
                  </button>
                </p>
              </div>
              
              {/* Forgot password only in login mode */}
              {isLoginMode && (
                <div className="text-center mt-2">
                  <Link 
                    href="/forgot-password" 
                    className='text-sm text-green-600 hover:text-green-800'
                  >
                    Forgot Password?
                  </Link>
                </div>
              )}
            </form>
          </div>
          
          {/* Footer */}
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>© {new Date().getFullYear()} LMCE IoT Web App. All rights reserved.</p>
            <p className="mt-1">
              <Link href="/privacy" className="hover:text-green-600 transition-colors">Privacy Policy</Link> |{' '}
              <Link href="/terms" className="hover:text-green-600 transition-colors">Terms of Service</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}