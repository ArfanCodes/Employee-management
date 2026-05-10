import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History, AlertCircle, RefreshCw } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import api from '../services/api';

const FILTERS = ['All', 'Pending', 'Approved', 'Rejected', 'Cancelled'];

const fmt = (d) =>
  new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const daysBetween = (start, end) => {
  const diff = new Date(end) - new Date(start);
  return Math.round(diff / (1000 * 60 * 60 * 24)) + 1;
};

const LeaveHistory = () => {
  const [leaves, setLeaves]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [syncing, setSyncing]         = useState(false);
  const [filter, setFilter]           = useState('All');
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
    <div className="max-w-5xl mx-auto">

      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Leave History</h1>
          <p className="text-slate-500 text-sm mt-1">All your past and current leave requests</p>
        </div>
        <button
          onClick={() => fetchLeaves({ showSyncBar: true })}
          disabled={syncing}
          className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-indigo-600 border border-slate-200 hover:border-indigo-300 px-3 py-1.5 rounded-lg transition-all disabled:opacity-50"
        >
          <RefreshCw size={13} className={syncing ? 'animate-spin' : ''} />
          {syncing ? 'Syncing…' : 'Refresh'}
        </button>
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-2 mb-6">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all border ${
              filter === f
                ? 'gradient-bg text-white border-transparent shadow-sm'
                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            {f}
            {f !== 'All' && (
              <span className={`ml-1.5 text-xs ${filter === f ? 'text-indigo-200' : 'text-slate-400'}`}>
                {leaves.filter(l => l.status === f.toLowerCase()).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl py-16 text-center">
          <History size={36} className="text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-semibold">No {filter !== 'All' ? filter.toLowerCase() : ''} requests found</p>
          <p className="text-slate-400 text-sm mt-1">Your leave history will appear here</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">

          {/* Mobile cards */}
          <div className="sm:hidden divide-y divide-slate-100">
            {filtered.map(leave => (
              <div key={leave.id} className="p-4 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-slate-800 capitalize text-sm">{leave.leave_type} Leave</span>
                  <StatusBadge status={leave.status} />
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>{fmt(leave.start_date)} → {fmt(leave.end_date)}</span>
                  <span>{daysBetween(leave.start_date, leave.end_date)} day{daysBetween(leave.start_date, leave.end_date) !== 1 ? 's' : ''}</span>
                </div>
                {leave.reason && (
                  <p className="text-xs text-slate-400 truncate">{leave.reason}</p>
                )}
                {leave.rejection_reason && (
                  <p className="text-xs text-rose-500 italic">"{leave.rejection_reason}"</p>
                )}
                {leave.status === 'pending' && (
                  cancelConfirm === leave.id ? (
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-xs text-slate-500">Cancel this request?</span>
                      <button onClick={() => handleCancel(leave.id)} disabled={cancellingId === leave.id}
                        className="text-xs font-semibold text-rose-600 hover:text-rose-800 disabled:opacity-50">
                        {cancellingId === leave.id ? 'Cancelling…' : 'Yes'}
                      </button>
                      <button onClick={() => setCancelConfirm(null)}
                        className="text-xs text-slate-400 hover:text-slate-600">No</button>
                    </div>
                  ) : (
                    <button onClick={() => setCancelConfirm(leave.id)}
                      className="text-xs font-semibold text-slate-400 hover:text-rose-600 border border-slate-200 hover:border-rose-200 px-3 py-1.5 rounded-lg transition-colors">
                      Cancel Request
                    </button>
                  )
                )}
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs text-slate-400 uppercase tracking-wide">
                  <th className="px-5 py-3.5 text-left font-semibold">Type</th>
                  <th className="px-5 py-3.5 text-left font-semibold">Dates</th>
                  <th className="px-5 py-3.5 text-left font-semibold">Duration</th>
                  <th className="px-5 py-3.5 text-left font-semibold">Reason</th>
                  <th className="px-5 py-3.5 text-left font-semibold">Status</th>
                  <th className="px-5 py-3.5 text-left font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(leave => (
                  <tr key={leave.id} className="hover:bg-indigo-50/30 transition-colors">
                    <td className="px-5 py-4">
                      <span className="font-semibold text-slate-800 capitalize">{leave.leave_type}</span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-slate-600 text-xs">
                      {fmt(leave.start_date)} → {fmt(leave.end_date)}
                    </td>
                    <td className="px-5 py-4 text-slate-500 text-xs">
                      {daysBetween(leave.start_date, leave.end_date)} day{daysBetween(leave.start_date, leave.end_date) !== 1 ? 's' : ''}
                    </td>
                    <td className="px-5 py-4 max-w-[200px]">
                      <span className="block truncate text-slate-500 text-xs" title={leave.reason}>{leave.reason}</span>
                      {leave.rejection_reason && (
                        <p className="text-xs text-rose-500 mt-0.5 italic">"{leave.rejection_reason}"</p>
                      )}
                    </td>
                    <td className="px-5 py-4"><StatusBadge status={leave.status} /></td>
                    <td className="px-5 py-4">
                      {leave.status === 'pending' && (
                        cancelConfirm === leave.id ? (
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs text-slate-500">Sure?</span>
                            <button onClick={() => handleCancel(leave.id)} disabled={cancellingId === leave.id}
                              className="text-xs font-semibold text-rose-600 hover:text-rose-800 disabled:opacity-50 transition-colors">
                              {cancellingId === leave.id ? 'Cancelling…' : 'Yes'}
                            </button>
                            <button onClick={() => setCancelConfirm(null)}
                              className="text-xs text-slate-400 hover:text-slate-600 transition-colors">No</button>
                          </div>
                        ) : (
                          <button onClick={() => setCancelConfirm(leave.id)}
                            className="text-xs font-semibold text-slate-400 hover:text-rose-600 transition-colors border border-slate-200 hover:border-rose-200 px-2.5 py-1 rounded-lg">
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
        </div>
      )}
    </div>
  );
};

export default LeaveHistory;
