import { History, Bell, Settings, Plus } from 'lucide-react';
import React from 'react';
import SearchInput from './SearchInput';
import Profile from './Profile';

export default function Header({ profilePic, setProfilePic }) {
  return (
    <div className="bg-gray-100 h-14 flex items-center justify-between px-8 shadow-md">
      <div className='flex items-center gap-4'>
        <div className="relative group">
          <button>
            <History className="w-6 h-6 hover:text-gray-500" />
          </button>
          <span className="absolute left-1/2 transform -translate-x-1/2 top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-xs rounded py-1 px-2">
            Recent Activities
          </span>
        </div>
        <SearchInput />
      </div>
      <div className='flex items-center gap-6'>
        <div className="relative group">
          <button className="text-white bg-[#098000] hover:bg-[#664d00] focus:ring-4 focus:ring-green-300 rounded-lg p-2">
            <Plus className='w-4 h-4' />
          </button>
          <span className="absolute left-1/2 transform -translate-x-1/2 top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-xs rounded py-1 px-2">
            Export Report
          </span>
        </div>
        <div className="h-6 border-r border-gray-300"></div>
        <div className="relative group">
          <button>
            <Bell className="w-6 h-6 hover:text-gray-500" />
          </button>
          <span className="absolute left-1/2 transform -translate-x-1/2 top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-xs rounded py-1 px-2">
            Notifications
          </span>
        </div>
        <div className="relative group">
          <button>
            <Settings className="w-6 h-6 hover:text-gray-500" />
          </button>
          <span className="absolute left-1/2 transform -translate-x-1/2 top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-xs rounded py-1 px-2">
            Settings
          </span>
        </div>
        
        <Profile profilePic={profilePic} setProfilePic={setProfilePic} />
      </div>
    </div>
  );
}
