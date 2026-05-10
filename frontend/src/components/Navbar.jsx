import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Don't render navbar on login/register pages (user is null)
  if (!user) return null;

  return (
    <nav className="bg-blue-700 text-white shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo — takes the user to their dashboard, not the public homepage */}
        <Link
          to={user.role === 'admin' ? '/admin' : '/dashboard'}
          className="text-xl font-bold tracking-wide"
        >
          LeaveMS
        </Link>

        {/* Navigation links — different per role */}
        <div className="flex items-center gap-5">
          {user.role === 'employee' && (
            <>
              <Link to="/dashboard"     className="text-sm hover:text-blue-200">Dashboard</Link>
              <Link to="/apply-leave"   className="text-sm hover:text-blue-200">Apply Leave</Link>
              <Link to="/leave-history" className="text-sm hover:text-blue-200">My Leaves</Link>
            </>
          )}

          {user.role === 'admin' && (
            <Link to="/admin" className="text-sm hover:text-blue-200">Admin Panel</Link>
          )}

          <span className="text-sm text-blue-200 hidden sm:block">
            {user.name} &bull; {user.role}
          </span>

          <button
            onClick={handleLogout}
            className="bg-white text-blue-700 px-3 py-1 rounded text-sm font-medium hover:bg-blue-50"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
