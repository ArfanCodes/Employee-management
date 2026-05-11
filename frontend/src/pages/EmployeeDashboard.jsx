import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileEdit, History, Clock, CheckCircle, XCircle, CalendarDays, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import api from '../services/api';

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

const fmt = (d) =>
  new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const statCards = (leaves) => [
  {
    label: 'Total Requests',
    value: leaves.length,
    icon: CalendarDays,
    iconBg: 'bg-indigo-100',
    iconColor: 'text-indigo-600',
    numColor: 'text-indigo-600',
    bg: 'bg-white',
  },
  {
    label: 'Pending',
    value: leaves.filter(l => l.status === 'pending').length,
    icon: Clock,
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    numColor: 'text-amber-600',
    bg: 'bg-white',
  },
  {
    label: 'Approved',
    value: leaves.filter(l => l.status === 'approved').length,
    icon: CheckCircle,
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    numColor: 'text-emerald-600',
    bg: 'bg-white',
  },
  {
    label: 'Rejected',
    value: leaves.filter(l => l.status === 'rejected').length,
    icon: XCircle,
    iconBg: 'bg-rose-100',
    iconColor: 'text-rose-500',
    numColor: 'text-rose-500',
    bg: 'bg-white',
  },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const item      = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

const EmployeeDashboard = () => {
  const { user }              = useAuth();
  const [leaves, setLeaves]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const fetchLock             = useRef(false);

  const fetchLeaves = useCallback(async ({ showSpinner = false, showSyncBar = false } = {}) => {
    if (fetchLock.current) return;
    fetchLock.current = true;
    if (showSpinner) setLoading(true);
    if (showSyncBar) setSyncing(true);
    try {
      const res = await api.get('/leave/my-leaves');
      setLeaves(res.data);
    } catch (err) {
      console.error('Failed to fetch leaves:', err);
    } finally {
      fetchLock.current = false;
      if (showSpinner) setLoading(false);
      if (showSyncBar) setSyncing(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaves({ showSpinner: true });
  }, [fetchLeaves]);

  useEffect(() => {
    const onVisible = () => { if (!document.hidden) fetchLeaves({ showSyncBar: true }); };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [fetchLeaves]);

  const cards = statCards(leaves);

  return (
    <div className="max-w-5xl mx-auto">

      {/* ── Welcome Banner ── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative rounded-2xl overflow-hidden mb-8 bg-gradient-to-br from-indigo-600 via-indigo-600 to-violet-600 shadow-lg shadow-indigo-200"
      >
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, white 0%, transparent 60%)' }} />
        <div className="relative px-6 py-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-indigo-200 text-sm font-medium mb-1">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              {user?.department ? ` · ${user.department}` : ''}
            </p>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {getGreeting()}, {user?.name?.split(' ')[0]}!
            </h1>
            <p className="text-indigo-200 text-sm mt-1">Here's your leave overview for today.</p>
          </div>
          <button
            onClick={() => fetchLeaves({ showSyncBar: true })}
            disabled={syncing}
            className="flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold text-indigo-100 hover:text-white bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-2 rounded-xl transition-all disabled:opacity-50"
          >
            <RefreshCw size={13} className={syncing ? 'animate-spin' : ''} />
            {syncing ? 'Syncing…' : 'Refresh'}
          </button>
        </div>
      </motion.div>

      {/* ── Stats ── */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
      >
        {cards.map(({ label, value, icon: Icon, iconBg, iconColor, numColor }) => (
          <motion.div
            key={label}
            variants={item}
            className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 relative overflow-hidden group"
          >
            <div className="absolute inset-x-0 top-0 h-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity gradient-bg" />
            <div className="flex items-start justify-between">
              <div>
                <p className={`text-3xl font-bold ${numColor}`}>
                  {loading ? '—' : value}
                </p>
                <p className="text-slate-500 text-sm mt-0.5 font-medium">{label}</p>
              </div>
              <div className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                <Icon size={20} className={iconColor} />
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Quick actions ── */}
      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        <Link
          to="/apply-leave"
          className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl p-6 text-white hover:opacity-95 hover:-translate-y-0.5 transition-all duration-200 group"
        >
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-3">
            <FileEdit size={20} className="text-white" />
          </div>
          <p className="font-bold text-lg">Apply for Leave</p>
          <p className="text-indigo-200 text-sm mt-1">Submit a new leave request</p>
        </Link>

        <Link
          to="/leave-history"
          className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
        >
          <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center mb-3">
            <History size={20} className="text-indigo-600" />
          </div>
          <p className="font-bold text-lg text-slate-900">View History</p>
          <p className="text-slate-500 text-sm mt-1">All your past and current requests</p>
        </Link>
      </div>

      {/* ── Recent requests ── */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800">Recent Requests</h2>
          <Link to="/leave-history" className="text-indigo-600 text-sm font-medium hover:underline">
            View all →
          </Link>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 text-sm">Loading…</div>
        ) : leaves.length === 0 ? (
          <div className="py-14 text-center">
            <CalendarDays size={32} className="text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No leave requests yet</p>
            <Link to="/apply-leave" className="text-indigo-600 text-sm hover:underline mt-1 inline-block">
              Apply for your first leave →
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {leaves.slice(0, 5).map(leave => (
              <div key={leave.id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors">
                <div>
                  <p className="text-sm font-semibold text-slate-800 capitalize">{leave.leave_type} Leave</p>
                  <p className="text-xs text-slate-400 mt-0.5">{fmt(leave.start_date)} → {fmt(leave.end_date)}</p>
                </div>
                <StatusBadge status={leave.status} />
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default EmployeeDashboard;
