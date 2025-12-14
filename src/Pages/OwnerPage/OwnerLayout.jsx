import { Outlet } from 'react-router-dom';
import NavbarOwner from '../../components/NavbarOwner';
import SidebarOwner from '../../components/SidebarOwner';

const OwnerLayout = () => {
  return (
    <div className="min-h-screen bg-white">
      <NavbarOwner />
      <SidebarOwner />

      <main className="ml-48 mt-16 p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default OwnerLayout;
