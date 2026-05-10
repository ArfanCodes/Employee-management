import { useState } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';

const DashboardLayout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="flex-1 md:ml-60 flex flex-col min-h-screen">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center px-4 py-3 bg-white border-b border-slate-200 sticky top-0 z-10">
          <button
            onClick={() => setMobileOpen(true)}
            className="text-slate-500 hover:text-slate-700 transition-colors"
          >
            <Menu size={22} />
          </button>
          <span className="ml-3 text-base font-bold gradient-text">LeaveMS</span>
        </div>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
