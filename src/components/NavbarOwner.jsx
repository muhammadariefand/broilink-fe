import React from 'react';

const NavbarOwner = ({ userName = 'Ahmad Dhani', userEmail = 'ahmaddhani@gmail.com' }) => {
  return (
    <header className="bg-white border-b border-gray-200 px-8 py-4 flex justify-end items-center sticky top-0 z-90">
      <div className="flex items-center gap-4">
        <div className="flex flex-col items-end gap-0.5">
          <span className="text-sm font-semibold text-black">{userName}</span>
          <span className="text-xs text-gray-600">{userEmail}</span>
        </div>
        <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
          <svg width="40" height="40" viewBox="0 0 40 40">
            <circle cx="20" cy="20" r="20" fill="#e0e0e0"/>
            <circle cx="20" cy="15" r="6" fill="#999"/>
            <path d="M8 34c0-6.6 5.4-12 12-12s12 5.4 12 12" fill="#999"/>
          </svg>
        </div>
      </div>
    </header>
  );
};

export default NavbarOwner;