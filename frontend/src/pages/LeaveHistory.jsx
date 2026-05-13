import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History, RefreshCw } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import api from '../services/api';

const ease = [0.16, 1, 0.3, 1];

const FILTERS = ['All', 'Pending', 'Approved', 'Rejected', 'Cancelled'];

const fmt = (d) =>
  new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const daysBetween = (start, end) => {
  const diff = new Date(end) - new Date(start);
  return Math.round(diff / (1000 * 60 * 60 * 24)) + 1;
};

const LeaveHistory = () => {
  const [leaves, setLeaves]               = useState([]);
  const [loading, setLoading]             = useState(true);
  const [syncing, setSyncing]             = useState(false);
  const [filter, setFilter]               = useState('All');
  const [cancelConfirm, setCancelConfirm] = useState(null);
  const [cancellingId, setCancellingId]   = useState(null);
  const fetchLock                         = useRef(false);

  const fetchLeaves = useCallback(async ({ showSpinner = false, showSyncBar = false } = {}) => {
    if (fetchLock.current) return;
    fetchLock.current = true;
    if (showSpinner) setLoading(true);
    if (showSyncBar) setSyncing(true);
    try {
      const res = await api.get('/leave/my-leaves');
      setLeaves(res.data);
    } catch (err) {
      console.error('Error fetching leaves:', err);
    } finally {
      fetchLock.current = false;
      if (showSpinner) setLoading(false);
      if (showSyncBar) setSyncing(false);
    }
  }, []);

  useEffect(() => { fetchLeaves({ showSpinner: true }); }, [fetchLeaves]);

  useEffect(() => {
    const onVisible = () => { if (!document.hidden) fetchLeaves({ showSyncBar: true }); };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [fetchLeaves]);

  const handleCancel = async (id) => {
    setCancellingId(id);
    setLeaves(prev => prev.map(l => l.id === id ? { ...l, status: 'cancelled' } : l));
    setCancelConfirm(null);
    try {
      await api.patch(`/leave/cancel/${id}`);
      fetchLeaves({ showSyncBar: true });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel request.');
      fetchLeaves({ showSyncBar: true });
    } finally {
      setCancellingId(null);
    }
  };

  const filtered = filter === 'All'
    ? leaves
    : leaves.filter(l => l.status === filter.toLowerCase());

  return (
    <div className="max-w-[1180px] mx-auto">

      {/* ── Page header ── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease }}
        className="mb-10 flex items-end justify-between gap-6 flex-wrap"
      >
        <div>
          <div className="flex items-center gap-2.5 mb-3">
            <span className="h-px w-7 bg-primary/60" />
            <span className="text-[10px] font-medium tracking-[0.22em] uppercase text-on-surface-variant/65">
              Archive
            </span>
          </div>
          <h1 className="text-[30px] sm:text-[34px] font-medium tracking-[-0.025em] text-on-surface leading-[1.05]">
            Leave history
          </h1>
          <p className="mt-2 text-[14px] text-on-surface-variant">
            All your past and current leave requests.
          </p>
        </div>
        <button
          onClick={() => fetchLeaves({ showSyncBar: true })}
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

      {/* ── Filter chips ── */}
      <div className="mb-6 inline-flex items-center gap-1 p-1 rounded-lg
                      border border-outline-variant/40 bg-surface-container/40 flex-wrap">
        {FILTERS.map(f => {
          const active = filter === f;
          const count  = f === 'All' ? leaves.length : leaves.filter(l => l.status === f.toLowerCase()).length;
          return (
            <button key={f}
              onClick={() => setFilter(f)}
              className={`relative px-3.5 py-1.5 rounded-md text-[12.5px] font-medium tracking-[-0.005em] transition-colors duration-200
                ${active ? 'text-on-surface' : 'text-on-surface-variant/75 hover:text-on-surface'}`}
            >
              {active && (
                <motion.span
                  layoutId="history-filter-pill"
                  transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  className="absolute inset-0 rounded-md bg-surface-container-lowest border border-outline-variant/40
                             shadow-[0_1px_0_rgba(27,26,23,0.04)]"
                />
              )}
              <span className="relative z-10 inline-flex items-center gap-1.5">
                {f}
                <span className={`text-[10px] tabular-nums ${active ? 'text-on-surface-variant' : 'text-on-surface-variant/55'}`}>
                  {count}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-outline-variant/40 bg-surface-container-lowest py-16 text-center">
          <div className="inline-grid place-items-center w-12 h-12 rounded-md border border-outline-variant/40 bg-surface-container/50 mb-3">
            <History size={18} strokeWidth={1.6} className="text-on-surface-variant/50" />
          </div>
          <p className="text-on-surface font-medium text-[14px]">
            No {filter !== 'All' ? filter.toLowerCase() : ''} requests found
          </p>
          <p className="text-on-surface-variant text-[12.5px] mt-1">
            Your history will appear here.
          </p>
        </div>
      ) : (
        <motion.section
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease }}
          className="relative rounded-xl border border-outline-variant/40 bg-surface-container-lowest
                     shadow-[0_1px_0_rgba(27,26,23,0.04)] overflow-hidden"
        >
          <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-on-surface/10 to-transparent" />

          {/* Mobile cards */}
          <div className="sm:hidden divide-y divide-outline-variant/20">
            {filtered.map(leave => (
              <div key={leave.id} className="p-5 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-on-surface capitalize text-[13.5px] tracking-[-0.005em]">
                    {leave.leave_type} leave
                  </span>
                  <StatusBadge status={leave.status} />
                </div>
                <div className="flex items-center justify-between text-[12px] text-on-surface-variant">
                  <span>{fmt(leave.start_date)} <span className="text-on-surface-variant/40 mx-1">→</span> {fmt(leave.end_date)}</span>
                  <span>{daysBetween(leave.start_date, leave.end_date)}d</span>
                </div>
                {leave.reason && (
                  <p className="text-[12px] text-on-surface-variant truncate">{leave.reason}</p>
                )}
                {leave.rejection_reason && (
                  <p className="text-[12px] text-rose-700 italic">"{leave.rejection_reason}"</p>
                )}
                {leave.status === 'pending' && (
                  cancelConfirm === leave.id ? (
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-[12px] text-on-surface-variant">Cancel this request?</span>
                      <button onClick={() => handleCancel(leave.id)} disabled={cancellingId === leave.id}
                        className="text-[12px] font-semibold text-rose-700 hover:text-rose-800 disabled:opacity-50">
                        {cancellingId === leave.id ? 'Cancelling…' : 'Yes'}
                      </button>
                      <button onClick={() => setCancelConfirm(null)}
                        className="text-[12px] text-on-surface-variant hover:text-on-surface">No</button>
                    </div>
                  ) : (
                    <button onClick={() => setCancelConfirm(leave.id)}
                      className="text-[11.5px] font-semibold tracking-[0.04em] text-on-surface-variant
                                 hover:text-rose-700 hover:border-rose-200/60 hover:bg-rose-50
                                 border border-outline-variant/40 px-2.5 py-1 rounded-md transition-colors">
                      Cancel request
                    </button>
                  )
                )}
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-outline-variant/30">
                  {['Type', 'Dates', 'Duration', 'Reason', 'Status', 'Action'].map(h => (
                    <th key={h} className="px-6 py-4 text-left text-[10px] font-medium tracking-[0.2em] uppercase text-on-surface-variant/65">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(leave => (
                  <tr key={leave.id} className="border-b border-outline-variant/15 hover:bg-surface-container/35 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-medium text-[13.5px] text-on-surface capitalize tracking-[-0.005em]">
                        {leave.leave_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[12.5px] text-on-surface-variant">
                      {fmt(leave.start_date)} <span className="text-on-surface-variant/40 mx-1">→</span> {fmt(leave.end_date)}
                    </td>
                    <td className="px-6 py-4 text-[12.5px] text-on-surface-variant tabular-nums">
                      {daysBetween(leave.start_date, leave.end_date)} day{daysBetween(leave.start_date, leave.end_date) !== 1 ? 's' : ''}
                    </td>
                    <td className="px-6 py-4 max-w-[220px]">
                      <span className="block truncate text-[12.5px] text-on-surface-variant" title={leave.reason}>
                        {leave.reason || '—'}
                      </span>
                      {leave.rejection_reason && (
                        <p className="text-[11.5px] text-rose-700 mt-0.5 italic">"{leave.rejection_reason}"</p>
                      )}
                    </td>
                    <td className="px-6 py-4"><StatusBadge status={leave.status} /></td>
                    <td className="px-6 py-4">
                      {leave.status === 'pending' && (
                        cancelConfirm === leave.id ? (
                          <div className="flex items-center gap-2">
                            <span className="text-[11.5px] text-on-surface-variant">Sure?</span>
                            <button onClick={() => handleCancel(leave.id)} disabled={cancellingId === leave.id}
                              className="text-[11.5px] font-semibold text-rose-700 hover:text-rose-800 disabled:opacity-50 transition-colors">
                              {cancellingId === leave.id ? 'Cancelling' : 'Yes'}
                            </button>
                            <button onClick={() => setCancelConfirm(null)}
                              className="text-[11.5px] text-on-surface-variant hover:text-on-surface transition-colors">
                              No
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => setCancelConfirm(leave.id)}
                            className="text-[11.5px] font-semibold tracking-[0.04em] text-on-surface-variant
                                       hover:text-rose-700 hover:border-rose-200/60 hover:bg-rose-50
                                       border border-outline-variant/40 px-2.5 py-1 rounded-md transition-colors">
                            Cancel
                          </button>
                        )
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.section>
      )}
    </div>
  );
};

export default LeaveHistory;
