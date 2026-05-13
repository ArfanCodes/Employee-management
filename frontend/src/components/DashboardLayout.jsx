import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';

const Wordmark = () => (
  <Link to="/" className="inline-flex items-center gap-2">
    <span className="grid grid-cols-2 gap-[2px]" aria-hidden="true">
      <span className="block h-[6px] w-[6px] bg-[#cf7b35]" />
      <span className="block h-[6px] w-[6px] bg-white/15" />
      <span className="block h-[6px] w-[6px] bg-white/15" />
      <span className="block h-[6px] w-[6px] bg-[#cf7b35]" />
    </span>
    <span className="text-[14px] font-medium text-inverse-on-surface tracking-[-0.01em]">
      Auren
    </span>
  </Link>
);

const DashboardLayout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface flex relative">
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="flex-1 md:ml-60 flex flex-col min-h-screen">

        {/* Mobile top bar */}
        <div className="md:hidden sticky top-0 z-10 flex items-center px-4 py-3
                        bg-[#1b1a17] border-b border-white/[0.06]">
          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation"
            className="text-white/65 hover:text-white transition-colors"
          >
            <Menu size={20} />
          </button>
          <span className="ml-3">
            <Wordmark />
          </span>
        </div>

        {/* Soft top fade for the canvas */}
        <div className="hidden md:block absolute top-0 left-60 right-0 h-24
                        bg-gradient-to-b from-[#efeae0] to-transparent pointer-events-none z-0" />

        <main className="relative flex-1 px-4 sm:px-6 lg:px-10 py-6 sm:py-10 lg:py-12 z-[1]">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
