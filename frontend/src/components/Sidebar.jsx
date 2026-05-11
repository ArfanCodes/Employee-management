import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  FileEdit,
  History,
  ClipboardList,
  Users,
  LogOut,
  Home,
} from 'lucide-react';

const employeeLinks = [
  { to: '/dashboard',     label: 'Dashboard',      icon: LayoutDashboard },
  { to: '/apply-leave',   label: 'Apply Leave',    icon: FileEdit        },
  { to: '/leave-history', label: 'My Leaves',      icon: History         },
];

// Admin sidebar items use query params to switch tabs inside /admin
const adminLinks = [
  { to: '/admin',               label: 'Overview',        icon: LayoutDashboard },
  { to: '/admin?tab=leaves',    label: 'Leave Requests',  icon: ClipboardList   },
  { to: '/admin?tab=employees', label: 'Employees',       icon: Users           },
];

const isLinkActive = (to, pathname, search) => {
  const [path, query] = to.split('?');
  if (path !== pathname) return false;
  if (!query) return !search || search === '';
  return search === `?${query}`;
};

const Sidebar = ({ mobileOpen, onClose }) => {
  const { user, logout } = useAuth();
  const { pathname, search } = useLocation();
  const navigate            = useNavigate();

  const links    = user?.role === 'admin' ? adminLinks : employeeLinks;
  const initials = user?.name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) ?? '?';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full w-60 bg-slate-900 flex flex-col z-30
          transition-transform duration-300 ease-in-out
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
        `}
      >
        {/* Logo */}
        <div className="px-6 py-5 border-b border-slate-800">
          <span className="text-lg font-bold gradient-text">LeaveMS</span>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <Link
            to="/"
            onClick={onClose}
            className={`
              flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
              ${pathname === '/' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800'}
            `}
          >
            <Home size={17} />
            Home
          </Link>
          <div className="my-2 border-t border-slate-800" />
          {links.map(({ to, label, icon: Icon }) => {
            const active = isLinkActive(to, pathname, search);
            return (
              <Link
                key={to}
                to={to}
                onClick={onClose}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
                  ${active
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }
                `}
              >
                <Icon size={17} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* User card + logout */}
        <div className="px-3 py-4 border-t border-slate-800 space-y-2">
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl">
            <div className="w-9 h-9 rounded-full gradient-bg flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-semibold truncate">{user?.name}</p>
              <p className="text-slate-400 text-xs capitalize">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-rose-400 hover:text-white hover:bg-rose-500/20 border border-rose-500/20 hover:border-rose-500/40 transition-all duration-150"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
