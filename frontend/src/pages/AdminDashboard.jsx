import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Clock, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import api from '../services/api';

const fmt = (d) =>
  new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

const daysBetween = (s, e) =>
  Math.round((new Date(e) - new Date(s)) / 86400000) + 1;

const mkInitials = (name) =>
  name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) ?? '?';

const COLORS = [
  'from-indigo-500 to-violet-500', 'from-emerald-500 to-teal-500',
  'from-rose-500 to-pink-500',     'from-amber-500 to-orange-500',
  'from-sky-500 to-blue-500',
];
const avatarColor = (name) => COLORS[(name?.charCodeAt(0) ?? 0) % COLORS.length];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const cardItem   = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

const AdminDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'leaves';

  const [stats, setStats]         = useState(null);
  const [leaves, setLeaves]       = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [syncing, setSyncing]     = useState(false);
  const [actionId, setActionId]   = useState(null);
  const [rejectModal, setRejectModal] = useState({ open: false, id: null });
  const [rejectionReason, setRejection] = useState('');

  // Lock prevents concurrent fetches from racing each other
  const fetchLock = useRef(false);

  const fetchAll = useCallback(async ({ showSpinner = false, showSyncBar = false } = {}) => {
    if (fetchLock.current) return;
    fetchLock.current = true;
    if (showSpinner) setLoading(true);
    if (showSyncBar) setSyncing(true);
    try {
      const [s, l, e] = await Promise.all([
        api.get('/admin/dashboard/stats'),
        api.get('/admin/leaves'),
        api.get('/admin/employees'),
      ]);
      setStats(s.data);
      setLeaves(l.data);
      setEmployees(e.data);
    } catch (err) {
      console.error('Admin fetch error:', err);
    } finally {
      fetchLock.current = false;
      if (showSpinner) setLoading(false);
      if (showSyncBar) setSyncing(false);
    }
  }, []);

  // Initial load
  useEffect(() => { fetchAll({ showSpinner: true }); }, [fetchAll]);

  // Refresh when the tab regains focus — no timers, no race conditions
  useEffect(() => {
    const onVisible = () => {
      if (!document.hidden) fetchAll({ showSyncBar: true });
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [fetchAll]);

  const handleApprove = async (id) => {
    setActionId(id);
    // 1. Instant optimistic update
    setLeaves(prev => prev.map(l => l.id === id ? { ...l, status: 'approved' } : l));
    setStats(prev => prev ? {
      ...prev,
      pending_requests:  Math.max(0, prev.pending_requests - 1),
      approved_requests: prev.approved_requests + 1,
    } : prev);
    try {
      // 2. Persist to backend
      await api.patch(`/admin/leaves/${id}/approve`);
      // 3. Silent sync to confirm real DB state
      fetchAll({ showSyncBar: true });
    } catch {
      alert('Failed to approve leave.');
      fetchAll({ showSyncBar: true }); // revert optimistic update
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async () => {
    const id = rejectModal.id;
    const reason = rejectionReason;
    setActionId(id);
    // 1. Close modal and optimistically update
    setRejectModal({ open: false, id: null });
    setRejection('');
    setLeaves(prev => prev.map(l => l.id === id
      ? { ...l, status: 'rejected', rejection_reason: reason }
      : l
    ));
    setStats(prev => prev ? {
      ...prev,
      pending_requests:  Math.max(0, prev.pending_requests - 1),
      rejected_requests: prev.rejected_requests + 1,
    } : prev);
    try {
      await api.patch(`/admin/leaves/${id}/reject`, { rejection_reason: reason });
      fetchAll({ showSyncBar: true });
    } catch {
      alert('Failed to reject leave.');
      fetchAll({ showSyncBar: true });
    } finally {
      setActionId(null);
    }
  };

  const statCards = stats ? [
    { label: 'Total Employees', value: stats.total_employees,   icon: Users,       iconBg: 'bg-indigo-100', iconColor: 'text-indigo-600', num: 'text-indigo-600' },
    { label: 'Pending',         value: stats.pending_requests,  icon: Clock,       iconBg: 'bg-amber-100',  iconColor: 'text-amber-600',  num: 'text-amber-600'  },
    { label: 'Approved',        value: stats.approved_requests, icon: CheckCircle, iconBg: 'bg-emerald-100',iconColor: 'text-emerald-600',num: 'text-emerald-600'},
    { label: 'Rejected',        value: stats.rejected_requests, icon: XCircle,     iconBg: 'bg-rose-100',   iconColor: 'text-rose-500',   num: 'text-rose-500'   },
  ] : [];

  return (
    <div className="max-w-6xl mx-auto">

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Admin Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Manage leave requests and view employee activity</p>
        </div>
        <button
          onClick={() => fetchAll({ showSyncBar: true })}
          disabled={syncing}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 border border-slate-200 px-3 py-2 rounded-xl hover:bg-slate-50 transition-all disabled:opacity-40"
        >
          <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
          {syncing ? 'Syncing…' : 'Refresh'}
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* ── Stat cards ── */}
          <motion.div variants={container} initial="hidden" animate="show"
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
          >
            {statCards.map(({ label, value, icon: Icon, iconBg, iconColor, num }) => (
              <motion.div key={label} variants={cardItem}
                className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className={`text-3xl font-bold ${num}`}>{value ?? '—'}</p>
                    <p className="text-slate-500 text-sm mt-0.5 font-medium">{label}</p>
                  </div>
                  <div className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <Icon size={20} className={iconColor} />
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* ── Tabs (synced with sidebar URL) ── */}
          <div className="flex gap-1 p-1 bg-slate-100 rounded-xl w-fit mb-6">
            {[{ key: 'leaves', label: 'Leave Requests' }, { key: 'employees', label: 'Employees' }].map(({ key, label }) => (
              <button key={key} onClick={() => setSearchParams({ tab: key })}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150 ${
                  activeTab === key ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* ── Leave Requests table ── */}
          {activeTab === 'leaves' && (
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-xs text-slate-400 uppercase tracking-wide">
                      {['Employee', 'Type', 'Dates', 'Reason', 'Status', 'Actions'].map(h => (
                        <th key={h} className="px-5 py-3.5 text-left font-semibold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {leaves.length === 0 && (
                      <tr><td colSpan={6} className="px-5 py-12 text-center text-slate-400">No leave requests found.</td></tr>
                    )}
                    {leaves.map(leave => (
                      <tr key={leave.id} className="hover:bg-indigo-50/30 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${avatarColor(leave.employee_name)} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                              {mkInitials(leave.employee_name)}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-800">{leave.employee_name}</p>
                              <p className="text-slate-400 text-xs">{leave.department}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 capitalize text-slate-600 font-medium">{leave.leave_type}</td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <p className="text-slate-700 text-xs font-medium">{fmt(leave.start_date)} → {fmt(leave.end_date)}</p>
                          <p className="text-slate-400 text-xs mt-0.5">{daysBetween(leave.start_date, leave.end_date)} day{daysBetween(leave.start_date, leave.end_date) !== 1 ? 's' : ''}</p>
                        </td>
                        <td className="px-5 py-4 max-w-[180px]">
                          <span className="block truncate text-slate-500 text-xs" title={leave.reason}>{leave.reason}</span>
                        </td>
                        <td className="px-5 py-4"><StatusBadge status={leave.status} /></td>
                        <td className="px-5 py-4">
                          {leave.status === 'pending' && (
                            <div className="flex gap-2">
                              <button onClick={() => handleApprove(leave.id)} disabled={!!actionId}
                                className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-emerald-700 disabled:opacity-40 transition-colors">
                                Approve
                              </button>
                              <button onClick={() => setRejectModal({ open: true, id: leave.id })} disabled={!!actionId}
                                className="bg-rose-50 text-rose-600 border border-rose-200 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-rose-100 disabled:opacity-40 transition-colors">
                                Reject
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Employees table ── */}
          {activeTab === 'employees' && (
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-xs text-slate-400 uppercase tracking-wide">
                      {['Employee', 'Department', 'Joined'].map(h => (
                        <th key={h} className="px-5 py-3.5 text-left font-semibold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {employees.length === 0 && (
                      <tr><td colSpan={3} className="px-5 py-12 text-center text-slate-400">No employees found.</td></tr>
                    )}
                    {employees.map(emp => (
                      <tr key={emp.id} className="hover:bg-indigo-50/30 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${avatarColor(emp.name)} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                              {mkInitials(emp.name)}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-800">{emp.name}</p>
                              <p className="text-slate-400 text-xs">{emp.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-slate-600">{emp.department || '—'}</td>
                        <td className="px-5 py-4 text-slate-400 text-xs">
                          {new Date(emp.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Reject Modal ── */}
      <AnimatePresence>
        {rejectModal.open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4"
            onClick={(e) => e.target === e.currentTarget && setRejectModal({ open: false, id: null })}
          >
            <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }} transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <AlertCircle size={20} className="text-rose-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Reject Leave Request</h3>
                  <p className="text-slate-500 text-xs mt-0.5">Optionally provide a reason for the employee</p>
                </div>
              </div>
              <textarea value={rejectionReason} onChange={e => setRejection(e.target.value)}
                rows={3} placeholder="e.g. Insufficient annual leave balance…" maxLength={300}
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm resize-none focus:outline-none focus:ring-4 focus:ring-rose-100 focus:border-rose-400 transition-all placeholder:text-slate-300"
              />
              <p className="text-xs text-slate-400 text-right mt-1">{rejectionReason.length}/300</p>
              <div className="flex gap-3 mt-4">
                <button onClick={() => { setRejectModal({ open: false, id: null }); setRejection(''); }}
                  className="flex-1 border border-slate-200 text-slate-600 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
                <button onClick={handleReject}
                  className="flex-1 bg-rose-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-rose-700 transition-colors">
                  Confirm Reject
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;
