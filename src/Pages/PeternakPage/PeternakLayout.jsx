import React from 'react';
import NavbarPeternak from '../../components/NavbarPeternak';
import SidebarPeternak from '../../components/SidebarPeternak';
import { Outlet } from 'react-router-dom';

export default function PeternakLayout() {
  return (
    <div className="min-h-screen bg-white">
      <NavbarPeternak />
      <SidebarPeternak />

      <main className="ml-48 mt-16 p-6">
        <Outlet />
      </main>
    </div>
  );
}
