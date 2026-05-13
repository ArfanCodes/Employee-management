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
  { to: '/dashboard',     label: 'Dashboard',   icon: LayoutDashboard },
  { to: '/apply-leave',   label: 'Apply Leave', icon: FileEdit        },
  { to: '/leave-history', label: 'My Leaves',   icon: History         },
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

/* ─── Architectural mark + wordmark ───────────────────────────────────────── */
const Wordmark = () => (
  <Link to="/" className="inline-flex items-center gap-2.5 w-fit">
    <span className="grid grid-cols-2 gap-[2px]" aria-hidden="true">
      <span className="block h-[7px] w-[7px] bg-[#cf7b35]" />
      <span className="block h-[7px] w-[7px] bg-white/15" />
      <span className="block h-[7px] w-[7px] bg-white/15" />
      <span className="block h-[7px] w-[7px] bg-[#cf7b35]" />
    </span>
    <span className="text-[15px] font-medium text-inverse-on-surface tracking-[-0.01em]">
      Auren
    </span>
  </Link>
);

/* ─── Section eyebrow ─────────────────────────────────────────────────────── */
const SectionLabel = ({ children }) => (
  <div className="px-3 flex items-center gap-2.5">
    <span className="text-[9.5px] font-medium tracking-[0.24em] uppercase text-white/35">
      {children}
    </span>
    <span className="flex-1 h-px bg-white/[0.05]" />
  </div>
);

/* ─── Nav item ────────────────────────────────────────────────────────────── */
const NavItem = ({ to, label, icon: Icon, active, onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    aria-current={active ? 'page' : undefined}
    className={`
      relative group flex items-center gap-3 px-3 py-2 rounded-md
      text-[13px] font-medium tracking-[-0.005em]
      transition-[background-color,color] duration-200
      ${active
        ? 'bg-white/[0.05] text-white'
        : 'text-white/55 hover:text-white/90 hover:bg-white/[0.025]'
      }
    `}
  >
    {active && (
      <span className="absolute left-0 top-1.5 bottom-1.5 w-[2px] rounded-r-[2px] bg-[#cf7b35]" />
    )}
    <Icon
      size={15}
      strokeWidth={1.7}
      className={active ? 'text-[#e89255]' : 'text-white/45 group-hover:text-white/75 transition-colors'}
    />
    {label}
  </Link>
);

const Sidebar = ({ mobileOpen, onClose }) => {
  const { user, logout }     = useAuth();
  const { pathname, search } = useLocation();
  const navigate             = useNavigate();

  const links    = user?.role === 'admin' ? adminLinks : employeeLinks;
  const initials = user?.name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) ?? '?';

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/55 backdrop-blur-[2px] z-20 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full w-60 z-30
          bg-[#1b1a17] border-r border-white/[0.05]
          flex flex-col overflow-hidden
          transition-transform duration-300 ease-in-out
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
        `}
      >
        {/* Vertical depth gradient */}
        <div className="absolute inset-0 pointer-events-none
                        bg-gradient-to-b from-white/[0.025] via-transparent to-transparent" />
        {/* Soft right-edge highlight */}
        <div className="absolute top-0 bottom-0 right-0 w-px bg-gradient-to-b from-white/[0.04] via-white/[0.02] to-transparent" />

        {/* Logo */}
        <div className="relative px-5 pt-5 pb-5 border-b border-white/[0.05]">
          <Wordmark />
        </div>

        {/* Nav */}
        <nav className="relative flex-1 pt-5 pb-3 overflow-y-auto">
          <SectionLabel>Workspace</SectionLabel>

          <div className="px-3 mt-2.5 space-y-0.5">
            <NavItem to="/" label="Home" icon={Home}
              active={pathname === '/'} onClick={onClose} />
          </div>

          <div className="mt-5 mb-3 mx-5 h-px bg-white/[0.04]" />

          <SectionLabel>{user?.role === 'admin' ? 'Administration' : 'Time Off'}</SectionLabel>

          <div className="px-3 mt-2.5 space-y-0.5">
            {links.map(({ to, label, icon }) => (
              <NavItem key={to} to={to} label={label} icon={icon}
                active={isLinkActive(to, pathname, search)} onClick={onClose} />
            ))}
          </div>
        </nav>

        {/* User profile + sign out */}
        <div className="relative px-3 pt-4 pb-4 border-t border-white/[0.05]">
          <div className="flex items-center gap-3 px-2 py-1.5">
            <div className="w-9 h-9 rounded-md grid place-items-center flex-shrink-0
                            bg-gradient-to-br from-[#cf7b35] to-[#8a4515]
                            text-white text-[12px] font-semibold tracking-tight
                            shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white/90 text-[13px] font-medium tracking-[-0.005em] truncate">
                {user?.name}
              </p>
              <p className="text-white/35 text-[10.5px] capitalize tracking-[0.16em] uppercase mt-0.5">
                {user?.role}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="mt-2 w-full flex items-center gap-2.5 px-3 py-2 rounded-md
                       text-[12.5px] font-medium tracking-[-0.005em]
                       text-white/55 hover:text-white/95 hover:bg-white/[0.04]
                       transition-colors duration-150"
          >
            <LogOut size={13} strokeWidth={1.7} />
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
