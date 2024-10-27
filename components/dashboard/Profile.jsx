"use client";
import Link from 'next/link';
import React, { useState } from 'react';
import ProfileSettings from './ProfileSettings';

export default function Profile({ profilePic, setProfilePic }) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="relative">
      {/* Profile Picture */}
      <button onClick={() => setShowMenu(!showMenu)}>
        <img
          src={profilePic} // Display the dynamic profile picture
          alt="Profile"
          className="w-8 h-8 rounded-full object-cover"
        />
      </button>

      {/* Dropdown Menu */}
      {showMenu && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-2 z-5">
          <ProfileSettings profilePic={profilePic} setProfilePic={setProfilePic} />
        </div>
      )}
    </div>
  );
}
