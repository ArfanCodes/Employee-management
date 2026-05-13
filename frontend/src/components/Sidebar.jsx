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
  { to: '/dashboard',     label: 'Dashboard',     icon: LayoutDashboard },
  { to: '/apply-leave',   label: 'Apply Leave',   icon: FileEdit        },
  { to: '/leave-history', label: 'My Leaves',     icon: History         },
];

const adminLinks = [
  { to: '/admin',               label: 'Overview',       icon: LayoutDashboard },
  { to: '/admin?tab=leaves',    label: 'Leave Requests', icon: ClipboardList   },
  { to: '/admin?tab=employees', label: 'Employees',      icon: Users           },
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
  const navigate             = useNavigate();

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
          className="fixed inset-0 bg-black/60 z-20 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full w-60 bg-inverse-surface flex flex-col z-30
          transition-transform duration-300 ease-in-out
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
        `}
      >
        {/* Logo */}
        <div className="px-6 py-5 border-b border-white/10">
          <span className="text-lg font-bold text-primary-fixed tracking-tight">LeaveMS</span>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <Link
            to="/"
            onClick={onClose}
            className={`
              flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150
              ${pathname === '/'
                ? 'bg-white/8 text-primary-fixed border-l-4 border-primary pl-2'
                : 'text-secondary-fixed-dim hover:text-inverse-on-surface hover:bg-white/5'
              }
            `}
          >
            <Home size={17} />
            Home
          </Link>

          <div className="my-2 border-t border-white/10" />

          {links.map(({ to, label, icon: Icon }) => {
            const active = isLinkActive(to, pathname, search);
            return (
              <Link
                key={to}
                to={to}
                onClick={onClose}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150
                  ${active
                    ? 'bg-white/8 text-primary-fixed border-l-4 border-primary pl-2'
                    : 'text-secondary-fixed-dim hover:text-inverse-on-surface hover:bg-white/5'
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
        <div className="px-3 py-4 border-t border-white/10 space-y-2">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg">
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-on-primary text-xs font-bold flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-inverse-on-surface text-sm font-semibold truncate">{user?.name}</p>
              <p className="text-secondary-fixed-dim text-xs capitalize">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                       text-rose-400 hover:text-rose-300 hover:bg-rose-500/10
                       border border-rose-500/20 hover:border-rose-500/30
                       transition-all duration-150"
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
