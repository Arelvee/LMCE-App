"use client";  // Client-side component for handling user input

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
export default function ProfileSettings() {
  const [firstName, setFirstName] = useState('Aaron');
  const [lastName, setLastName] = useState('Graham');
  const [email, setEmail] = useState('aarong@gmail.com');
  const [profilePic, setProfilePic] = useState('/profilepic.jpg'); // Default profile picture
  const router = useRouter();

  // Handle image upload
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePic(e.target.result); // Use a unique URL to force refresh
        console.log("New profile picture set:", e.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      alert('Please upload a valid image file');
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle profile update logic here
    console.log('Profile updated:', { firstName, lastName, email, profilePic });
  };



  // Handle logout
  const handleLogout = () => {
    // Clear any user-related state or cookies if necessary
    // Then redirect to the login page
    router.push("/"); // Update this path as per your routing structure
  };

  return (

    <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-sm relative">
      {/* Card Header with Gradient */}
      <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-r from-green-900 to-blue-500 rounded-t-lg"></div>

      {/* Profile Picture */}
      <div className="flex justify-center mb-4">
        <div className="relative">
          <img
            src={profilePic}
            alt="Profile"
            className="w-28 h-28 rounded-full border-4 border-white shadow-md object-cover"
          />
          <label
            htmlFor="profilePic"
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
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5v14" />
            </svg>
          </label>
          <input
            type="file"
            id="profilePic"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>
      </div>
      {/* Profile Form */}
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {/* First Name Input */}
        <div>
          <label htmlFor="firstName" className="sr-only">First Name</label>
          <input
            type="text"
            id="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-center"
            placeholder="First Name"
          />
        </div>

        {/* Last Name Input */}
        <div>
          <label htmlFor="lastName" className="sr-only">Last Name</label>
          <input
            type="text"
            id="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-center"
            placeholder="Last Name"
          />
        </div>

        {/* Email Input */}
        <div>
          <label htmlFor="email" className="sr-only">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-center"
            placeholder="Email"
          />
        </div>

        {/* Change Password Button */}
        <div className="flex justify-center">
          <button
            type="button"
            className="bg-green-900 text-white w-full py-2 px-2 rounded-lg shadow-md hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
          >
            <span>Change Password</span>

          </button>
        </div>

        {/* Logout Button */}
        {/* Logout Button */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleLogout} // Add the logout function here
            className="text-red-600 w-full py-3 rounded-xl border border-green-950 shadow-md hover:bg-blue-50 transition-colors flex items-center justify-center space-x-3"
          >
            <span>Logout</span>
          </button>
        </div>
      </form>
    </div>
  );
}
