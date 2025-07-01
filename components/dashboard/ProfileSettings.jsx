"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfileSettings() {
  const [user, setUser] = useState({
    id: '',
    firstName: '',
    lastName: '',
    email: '',
    profilePic: '/profilepic.jpg'
  });
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const fileInputRef = useRef(null);
  const router = useRouter();

  // Load user data from session storage
  useEffect(() => {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    if (currentUser) {
      setUser({
        id: currentUser.id,
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        email: currentUser.email,
        profilePic: currentUser.profilePic || '/profilepic.jpg'
      });
    }
    setLoading(false);
  }, []);

  // Handle image upload
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setError('Image size exceeds 2MB limit');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const newProfilePic = e.target.result;
        
        // Update user state
        setUser(prev => ({...prev, profilePic: newProfilePic}));
        
        // Update session storage
        const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
        if (currentUser) {
          currentUser.profilePic = newProfilePic;
          sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
        }
        
        setSuccess('Profile picture updated!');
        setTimeout(() => setSuccess(''), 3000);
      };
      reader.readAsDataURL(file);
    } else {
      setError('Please upload a valid image file (JPEG, PNG)');
    }
  };

  // Trigger file input when label is clicked
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle profile form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsUpdating(true);
    
    try {
      // Send update request without profilePic to avoid large payloads
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Profile update failed');
      }
      
      // Update session storage
      const updatedUser = { ...user };
      sessionStorage.setItem('currentUser', JSON.stringify(updatedUser));
      
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || "Profile update failed. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle password change
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError('');
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("New passwords don't match");
      return;
    }
    
    try {
      const response = await fetch('/api/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: user.id,
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Password change failed');
      }
      
      setSuccess('Password changed successfully!');
      setShowPasswordModal(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || "Password change failed. Please try again.");
    }
  };

  // Handle logout
  const handleLogout = () => {
    sessionStorage.removeItem('currentUser');
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 p-4 flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Success/Error messages */}
          {success && (
            <div className="fixed top-4 left-1/2 transform -translate-x-1/2 w-4/5 max-w-sm bg-green-100 text-green-800 px-4 py-2 rounded-lg text-center animate-fadeIn z-50">
              {success}
            </div>
          )}
          {error && (
            <div className="fixed top-4 left-1/2 transform -translate-x-1/2 w-4/5 max-w-sm bg-red-100 text-red-700 px-4 py-2 rounded-lg text-center animate-fadeIn z-50">
              {error}
            </div>
          )}
          
          {/* Card Header with Gradient */}
          <div className="h-32 bg-gradient-to-r from-green-900 to-blue-500"></div>
          
          {/* Profile Picture */}
          <div className="flex justify-center -mt-16 mb-4">
            <div className="relative group">
              <img
                src={user.profilePic}
                alt="Profile"
                className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover"
              />
              <button 
                onClick={triggerFileInput}
                className="absolute bottom-0 right-0 w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white cursor-pointer hover:bg-blue-700 transition"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                  className="w-4 h-4"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
          </div>
          
          {/* Profile Form */}
          <div className="px-5 pb-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="firstName">
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    value={user.firstName}
                    onChange={(e) => setUser({...user, firstName: e.target.value})}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="lastName">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    value={user.lastName}
                    onChange={(e) => setUser({...user, lastName: e.target.value})}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="email">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={user.email}
                  onChange={(e) => setUser({...user, email: e.target.value})}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="bg-green-900 text-white w-full py-2.5 rounded-lg hover:bg-green-800 transition-colors flex items-center justify-center disabled:opacity-70"
                >
                  {isUpdating ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Updating...
                    </>
                  ) : 'Update Profile'}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(true)}
                  className="bg-blue-100 text-blue-800 py-2.5 rounded-lg border border-blue-200 hover:bg-blue-200 transition-colors flex items-center justify-center text-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  Password
                </button>
                
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-red-600 py-2.5 rounded-lg border border-red-200 hover:bg-red-50 transition-colors flex items-center justify-center text-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                  </svg>
                  Logout
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      
      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg p-5 w-full max-w-sm">
            <div className="flex justify-between items-center mb-4 pb-2 border-b">
              <h3 className="text-lg font-bold text-gray-800">Change Password</h3>
              <button 
                onClick={() => {
                  setShowPasswordModal(false);
                  setError('');
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-gray-700 text-sm mb-1" htmlFor="currentPassword">
                  Current Password
                </label>
                <input
                  type="password"
                  id="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm mb-1" htmlFor="newPassword">
                  New Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg"
                  minLength="8"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm mb-1" htmlFor="confirmPassword">
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-2 bg-green-900 text-white rounded-lg hover:bg-green-800"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}