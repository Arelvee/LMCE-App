import React from 'react';
import Header from '@/components/dashboard/Header';
import Sidebar from '@/components/dashboard/Sidebar';
import Footer from '@/components/dashboard/Footer';

export default function Layout({ children, profilePic, setProfilePic }) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="w-56 bg-green-950 text-slate-50">
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col w-full min-h-screen bg-slate-100">
        {/* Header */}
        <Header profilePic={profilePic} setProfilePic={setProfilePic} /> {/* Pass state to Header */}

        {/* Page Content */}
        <main className="flex-grow p-6">
          {children}
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}
