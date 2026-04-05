import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

/**
 * Main Layout Shell for authenticated pages.
 * Handles responsive sidebar/header alignment and animations.
 */
const AppShell: React.FC = () => {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* 1. Sidebar (Fixed width) */}
      <Sidebar />

      {/* 2. Content Area (Flexible width + Scrollable) */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-8 animate-fade-in">
          <div className="max-w-[1600px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppShell;
