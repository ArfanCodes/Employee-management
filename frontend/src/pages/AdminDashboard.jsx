import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Clock, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import api from '../services/api';

const ease = [0.16, 1, 0.3, 1];

const fmt = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
const daysBetween = (s, e) => Math.round((new Date(e) - new Date(s)) / 86400000) + 1;
const mkInitials = (name) =>
  name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) ?? '?';

const AVATAR_TONES = [
  'from-[#cf7b35] to-[#8a4515]',
  'from-[#8a6f4b] to-[#4a3d2b]',
  'from-[#615d54] to-[#2a2722]',
  'from-[#a07246] to-[#5e3f22]',
  'from-[#b89270] to-[#6b4e2f]',
];
const avatarTone = (name) => AVATAR_TONES[(name?.charCodeAt(0) ?? 0) % AVATAR_TONES.length];

const TONE = {
  neutral: { num: 'text-on-surface',  icon: 'text-on-surface-variant/55' },
  amber:   { num: 'text-amber-700',   icon: 'text-amber-600/75' },
  emerald: { num: 'text-emerald-700', icon: 'text-emerald-600/75' },
  rose:    { num: 'text-rose-700',    icon: 'text-rose-500/75' },
};

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item      = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.45, ease } } };

/* ─── Inline avatar ───────────────────────────────────────────────────────── */
const SIZE_CLASS = { sm: 'w-8 h-8 text-[11px]', md: 'w-10 h-10 text-[12px]' };
const Avatar = ({ name, size = 'sm' }) => (
  <div className={`${SIZE_CLASS[size]} rounded-md grid place-items-center flex-shrink-0
                   bg-gradient-to-br ${avatarTone(name)}
                   text-white font-semibold tracking-tight
                   shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]`}>
    {mkInitials(name)}
  </div>
);

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
      setStats(s.data); setLeaves(l.data); setEmployees(e.data);
    } catch (err) {
      console.error('Admin fetch error:', err);
    } finally {
      fetchLock.current = false;
      if (showSpinner) setLoading(false);
      if (showSyncBar) setSyncing(false);
    }
  }, []);

  useEffect(() => { fetchAll({ showSpinner: true }); }, [fetchAll]);

  useEffect(() => {
    const onVisible = () => { if (!document.hidden) fetchAll({ showSyncBar: true }); };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [fetchAll]);

  const handleApprove = async (id) => {
    setActionId(id);
    setLeaves(prev => prev.map(l => l.id === id ? { ...l, status: 'approved' } : l));
    setStats(prev => prev ? {
      ...prev,
      pending_requests:  Math.max(0, prev.pending_requests - 1),
      approved_requests: prev.approved_requests + 1,
    } : prev);
    try {
      await api.patch(`/admin/leaves/${id}/approve`);
      fetchAll({ showSyncBar: true });
    } catch {
      alert('Failed to approve leave.');
      fetchAll({ showSyncBar: true });
    } finally { setActionId(null); }
  };

  const handleReject = async () => {
    const id = rejectModal.id;
    const reason = rejectionReason;
    setActionId(id);
    setRejectModal({ open: false, id: null });
    setRejection('');
    setLeaves(prev => prev.map(l => l.id === id ? { ...l, status: 'rejected', rejection_reason: reason } : l));
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
    } finally { setActionId(null); }
  };

  const statCards = stats ? [
    { label: 'Employees', value: stats.total_employees,   icon: Users,       tone: 'neutral' },
    { label: 'Pending',   value: stats.pending_requests,  icon: Clock,       tone: 'amber'   },
    { label: 'Approved',  value: stats.approved_requests, icon: CheckCircle, tone: 'emerald' },
    { label: 'Rejected',  value: stats.rejected_requests, icon: XCircle,     tone: 'rose'    },
  ] : [];

  return (
    <div className="max-w-[1280px] mx-auto">

      {/* ── Page header ── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease }}
        className="mb-10 flex items-end justify-between gap-6 flex-wrap"
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2.5 mb-3">
            <span className="h-px w-7 bg-primary/60" />
            <span className="text-[10px] font-medium tracking-[0.22em] uppercase text-on-surface-variant/65">
              Administration
            </span>
          </div>
          <h1 className="text-[30px] sm:text-[34px] font-medium tracking-[-0.025em] text-on-surface leading-[1.05]">
            Admin overview
          </h1>
          <p className="mt-2 text-[14px] text-on-surface-variant">
            Manage leave requests and review the workforce.
          </p>
        </div>

        <button
          onClick={() => fetchAll({ showSyncBar: true })}
          disabled={syncing}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-md
                     border border-outline-variant/40 bg-surface-container-lowest/60
                     text-[11.5px] font-medium tracking-[0.04em] text-on-surface-variant
                     hover:text-on-surface hover:border-outline-variant/60 hover:bg-surface-container-lowest
                     transition-colors disabled:opacity-50"
        >
          <RefreshCw size={12} strokeWidth={1.8} className={syncing ? 'animate-spin' : ''} />
          {syncing ? 'Syncing' : 'Refresh'}
        </button>
      </motion.div>

      {loading ? (
        <div className="flex justify-center py-24">
          <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* ── Stat strip ── */}
          <motion.div
            variants={container} initial="hidden" animate="show"
            className="grid grid-cols-2 lg:grid-cols-4 gap-px rounded-xl
                       border border-outline-variant/40 bg-outline-variant/25 overflow-hidden mb-10"
          >
            {statCards.map(({ label, value, icon: Icon, tone }) => {
              const t = TONE[tone];
              return (
                <motion.div key={label} variants={item}
                  className="relative bg-surface-container-lowest p-6 transition-colors duration-300 hover:bg-surface-container-lowest/70"
                >
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-[10px] font-medium tracking-[0.22em] uppercase text-on-surface-variant/65">
                      {label}
                    </span>
                    <Icon size={13} strokeWidth={1.6} className={t.icon} />
                  </div>
                  <div className={`text-[34px] font-medium tracking-[-0.03em] leading-none ${t.num}`}>
                    {value ?? <span className="text-on-surface-variant/30">—</span>}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* ── Tabs ── */}
          <div className="mb-5 inline-flex items-center gap-1 p-1 rounded-lg
                          border border-outline-variant/40 bg-surface-container/40">
            {[{ key: 'leaves', label: 'Leave requests' }, { key: 'employees', label: 'Employees' }].map(({ key, label }) => {
              const active = activeTab === key;
              return (
                <button key={key}
                  onClick={() => setSearchParams({ tab: key })}
                  className={`relative px-4 py-1.5 rounded-md text-[12.5px] font-medium tracking-[-0.005em] transition-colors duration-200
                    ${active ? 'text-on-surface' : 'text-on-surface-variant/70 hover:text-on-surface'}`}
                >
                  {active && (
                    <motion.span
                      layoutId="admin-tab-pill"
                      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                      className="absolute inset-0 rounded-md bg-surface-container-lowest border border-outline-variant/40
                                 shadow-[0_1px_0_rgba(27,26,23,0.04)]"
                    />
                  )}
                  <span className="relative z-10">{label}</span>
                </button>
              );
            })}
          </div>

          {/* ── Leave Requests ── */}
          {activeTab === 'leaves' && (
            <motion.section
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease }}
              className="relative rounded-xl border border-outline-variant/40 bg-surface-container-lowest
                         shadow-[0_1px_0_rgba(27,26,23,0.04)] overflow-hidden"
            >
              <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-on-surface/10 to-transparent" />

              {/* Mobile */}
              <div className="sm:hidden divide-y divide-outline-variant/20">
                {leaves.length === 0 && (
                  <p className="py-14 text-center text-on-surface-variant/65 text-[13px]">No leave requests found.</p>
                )}
                {leaves.map(leave => (
                  <div key={leave.id} className="p-5 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar name={leave.employee_name} size="sm" />
                        <div className="min-w-0">
                          <p className="font-medium text-on-surface text-[13.5px] truncate">{leave.employee_name}</p>
                          <p className="text-on-surface-variant text-[11.5px] truncate">{leave.department}</p>
                        </div>
                      </div>
                      <StatusBadge status={leave.status} />
                    </div>
                    <div className="flex items-center justify-between text-[12px]">
                      <span className="capitalize font-medium text-on-surface-variant bg-surface-container/60 px-2 py-0.5 rounded">
                        {leave.leave_type}
                      </span>
                      <span className="text-on-surface-variant">{fmt(leave.start_date)} → {fmt(leave.end_date)} · {daysBetween(leave.start_date, leave.end_date)}d</span>
                    </div>
                    {leave.reason && <p className="text-[12px] text-on-surface-variant truncate">{leave.reason}</p>}
                    {leave.status === 'pending' && (
                      <div className="flex gap-2 pt-1">
                        <button onClick={() => handleApprove(leave.id)} disabled={!!actionId}
                          className="flex-1 bg-emerald-700 text-white py-2 rounded-md text-[12px] font-semibold tracking-[0.05em] hover:bg-emerald-800 disabled:opacity-40 transition-colors">
                          Approve
                        </button>
                        <button onClick={() => setRejectModal({ open: true, id: leave.id })} disabled={!!actionId}
                          className="flex-1 bg-surface-container border border-outline-variant/40 text-on-surface-variant py-2 rounded-md text-[12px] font-semibold tracking-[0.05em] hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 disabled:opacity-40 transition-colors">
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Desktop */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-outline-variant/30">
                      {['Employee', 'Type', 'Dates', 'Reason', 'Status', 'Actions'].map(h => (
                        <th key={h} className="px-6 py-4 text-left text-[10px] font-medium tracking-[0.2em] uppercase text-on-surface-variant/65">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {leaves.length === 0 && (
                      <tr><td colSpan={6} className="px-6 py-14 text-center text-on-surface-variant/65 text-[13px]">
                        No leave requests found.
                      </td></tr>
                    )}
                    {leaves.map(leave => (
                      <tr key={leave.id} className="border-b border-outline-variant/15 hover:bg-surface-container/35 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar name={leave.employee_name} size="sm" />
                            <div className="min-w-0">
                              <p className="font-medium text-[13.5px] text-on-surface tracking-[-0.005em]">{leave.employee_name}</p>
                              <p className="text-on-surface-variant text-[11.5px] mt-0.5">{leave.department}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="capitalize text-[12.5px] font-medium text-on-surface-variant px-2 py-0.5 rounded
                                           bg-surface-container/60 border border-outline-variant/30">
                            {leave.leave_type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-[12.5px] font-medium text-on-surface">{fmt(leave.start_date)} → {fmt(leave.end_date)}</p>
                          <p className="text-[11.5px] text-on-surface-variant/85 mt-0.5">
                            {daysBetween(leave.start_date, leave.end_date)} day{daysBetween(leave.start_date, leave.end_date) !== 1 ? 's' : ''}
                          </p>
                        </td>
                        <td className="px-6 py-4 max-w-[200px]">
                          <span className="block truncate text-[12.5px] text-on-surface-variant" title={leave.reason}>
                            {leave.reason || '—'}
                          </span>
                        </td>
                        <td className="px-6 py-4"><StatusBadge status={leave.status} /></td>
                        <td className="px-6 py-4">
                          {leave.status === 'pending' && (
                            <div className="flex gap-2">
                              <button onClick={() => handleApprove(leave.id)} disabled={!!actionId}
                                className="px-3 py-1.5 rounded-md text-[11.5px] font-semibold tracking-[0.05em]
                                           bg-emerald-700 text-white hover:bg-emerald-800
                                           disabled:opacity-40 transition-colors">
                                Approve
                              </button>
                              <button onClick={() => setRejectModal({ open: true, id: leave.id })} disabled={!!actionId}
                                className="px-3 py-1.5 rounded-md text-[11.5px] font-semibold tracking-[0.05em]
                                           bg-surface-container border border-outline-variant/40 text-on-surface-variant
                                           hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200
                                           disabled:opacity-40 transition-colors">
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
            </motion.section>
          )}

          {/* ── Employees ── */}
          {activeTab === 'employees' && (
            <motion.section
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease }}
              className="relative rounded-xl border border-outline-variant/40 bg-surface-container-lowest
                         shadow-[0_1px_0_rgba(27,26,23,0.04)] overflow-hidden"
            >
              <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-on-surface/10 to-transparent" />

              <div className="sm:hidden divide-y divide-outline-variant/20">
                {employees.length === 0 && (
                  <p className="py-14 text-center text-on-surface-variant/65 text-[13px]">No employees found.</p>
                )}
                {employees.map(emp => (
                  <div key={emp.id} className="flex items-center gap-3 p-5">
                    <Avatar name={emp.name} size="md" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[13.5px] text-on-surface truncate">{emp.name}</p>
                      <p className="text-on-surface-variant text-[11.5px] truncate">{emp.email}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-[12px] font-medium text-on-surface-variant">{emp.department || '—'}</p>
                      <p className="text-[11px] text-on-surface-variant/60 mt-0.5">
                        {new Date(emp.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-outline-variant/30">
                      {['Employee', 'Department', 'Joined'].map(h => (
                        <th key={h} className="px-6 py-4 text-left text-[10px] font-medium tracking-[0.2em] uppercase text-on-surface-variant/65">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {employees.length === 0 && (
                      <tr><td colSpan={3} className="px-6 py-14 text-center text-on-surface-variant/65 text-[13px]">
                        No employees found.
                      </td></tr>
                    )}
                    {employees.map(emp => (
                      <tr key={emp.id} className="border-b border-outline-variant/15 hover:bg-surface-container/35 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar name={emp.name} size={8} />
                            <div className="min-w-0">
                              <p className="font-medium text-[13.5px] text-on-surface tracking-[-0.005em]">{emp.name}</p>
                              <p className="text-on-surface-variant text-[11.5px] mt-0.5">{emp.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-[12.5px] text-on-surface-variant">{emp.department || '—'}</td>
                        <td className="px-6 py-4 text-[12px] text-on-surface-variant">
                          {new Date(emp.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.section>
          )}
        </>
      )}

      {/* ── Reject Modal ── */}
      <AnimatePresence>
        {rejectModal.open && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#1b1a17]/60 backdrop-blur-sm flex items-center justify-center z-50 px-4"
            onClick={(e) => e.target === e.currentTarget && setRejectModal({ open: false, id: null })}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0, y: 8 }} animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0 }} transition={{ duration: 0.22, ease }}
              className="relative rounded-xl border border-outline-variant/40 bg-surface-container-lowest
                         p-7 w-full max-w-md shadow-[0_30px_80px_-30px_rgba(27,26,23,0.45)]"
            >
              <div className="absolute inset-x-7 top-0 h-px bg-gradient-to-r from-transparent via-on-surface/10 to-transparent" />

              <div className="flex items-start gap-3 mb-5">
                <div className="w-10 h-10 grid place-items-center rounded-md
                                bg-rose-50 border border-rose-200/60 flex-shrink-0">
                  <AlertCircle size={17} className="text-rose-600" strokeWidth={1.7} />
                </div>
                <div>
                  <h3 className="text-[15.5px] font-medium tracking-[-0.01em] text-on-surface">Reject request</h3>
                  <p className="text-on-surface-variant text-[12.5px] mt-0.5">Optionally include a reason for the employee.</p>
                </div>
              </div>
              <textarea
                value={rejectionReason} onChange={e => setRejection(e.target.value)}
                rows={3} placeholder="e.g. Insufficient annual leave balance…" maxLength={300}
                className="w-full rounded-md border border-outline-variant/40 bg-surface
                           px-3.5 py-2.5 text-[13.5px] text-on-surface placeholder:text-on-surface-variant/45
                           focus:outline-none focus:ring-[3px] focus:ring-rose-400/15 focus:border-rose-400/60
                           resize-none transition-[border-color,box-shadow]"
              />
              <p className="text-[11px] text-on-surface-variant/65 text-right mt-1.5">{rejectionReason.length}/300</p>
              <div className="flex gap-3 mt-5">
                <button
                  onClick={() => { setRejectModal({ open: false, id: null }); setRejection(''); }}
                  className="flex-1 px-4 py-2.5 rounded-md border border-outline-variant/40 bg-surface-container/40
                             text-[12.5px] font-semibold tracking-[0.04em] text-on-surface-variant
                             hover:bg-surface-container hover:text-on-surface transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  className="flex-1 px-4 py-2.5 rounded-md bg-rose-700 text-white
                             text-[12.5px] font-semibold tracking-[0.04em]
                             hover:bg-rose-800 transition-colors
                             shadow-[0_8px_24px_-12px_rgba(225,29,72,0.6)]"
                >
                  Confirm reject
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
