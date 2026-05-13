import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileEdit, History, Clock, CheckCircle, XCircle, CalendarDays, RefreshCw, ArrowUpRight, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import api from '../services/api';

const ease = [0.16, 1, 0.3, 1];

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

const fmt = (d) =>
  new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const mkStatCards = (leaves) => [
  { label: 'Total',    value: leaves.length,                                       icon: CalendarDays, tone: 'neutral' },
  { label: 'Pending',  value: leaves.filter(l => l.status === 'pending').length,   icon: Clock,        tone: 'amber'   },
  { label: 'Approved', value: leaves.filter(l => l.status === 'approved').length,  icon: CheckCircle,  tone: 'emerald' },
  { label: 'Rejected', value: leaves.filter(l => l.status === 'rejected').length,  icon: XCircle,      tone: 'rose'    },
];

const TONE = {
  neutral: { num: 'text-on-surface',  icon: 'text-on-surface-variant/55' },
  amber:   { num: 'text-amber-700',   icon: 'text-amber-600/75' },
  emerald: { num: 'text-emerald-700', icon: 'text-emerald-600/75' },
  rose:    { num: 'text-rose-700',    icon: 'text-rose-500/75' },
};

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item      = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.45, ease } } };

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

  useEffect(() => { fetchLeaves({ showSpinner: true }); }, [fetchLeaves]);

  useEffect(() => {
    const onVisible = () => { if (!document.hidden) fetchLeaves({ showSyncBar: true }); };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [fetchLeaves]);

  const cards = mkStatCards(leaves);

  return (
    <div className="max-w-[1180px] mx-auto">

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
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              {user?.department ? ` · ${user.department}` : ''}
            </span>
          </div>
          <h1 className="text-[30px] sm:text-[34px] font-medium tracking-[-0.025em] text-on-surface leading-[1.05]">
            {getGreeting()}, {user?.name?.split(' ')[0]}
          </h1>
          <p className="mt-2 text-[14px] text-on-surface-variant">
            Here is the state of your time off.
          </p>
        </div>

        <button
          onClick={() => fetchLeaves({ showSyncBar: true })}
          disabled={syncing}
          className="group inline-flex items-center gap-2 px-3 py-2 rounded-md
                     border border-outline-variant/40 bg-surface-container-lowest/60
                     text-[11.5px] font-medium tracking-[0.04em] text-on-surface-variant
                     hover:text-on-surface hover:border-outline-variant/60 hover:bg-surface-container-lowest
                     transition-colors disabled:opacity-50"
        >
          <RefreshCw size={12} strokeWidth={1.8} className={syncing ? 'animate-spin' : ''} />
          {syncing ? 'Syncing' : 'Refresh'}
        </button>
      </motion.div>

      {/* ── Stat strip ── */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 lg:grid-cols-4 gap-px rounded-xl
                   border border-outline-variant/40 bg-outline-variant/25 overflow-hidden mb-10"
      >
        {cards.map(({ label, value, icon: Icon, tone }) => {
          const t = TONE[tone];
          return (
            <motion.div key={label} variants={item}
              className="relative bg-surface-container-lowest p-6 group transition-colors duration-300 hover:bg-surface-container-lowest/70"
            >
              <div className="flex items-center justify-between mb-5">
                <span className="text-[10px] font-medium tracking-[0.22em] uppercase text-on-surface-variant/65">
                  {label}
                </span>
                <Icon size={13} strokeWidth={1.6} className={t.icon} />
              </div>
              <div className={`text-[34px] font-medium tracking-[-0.03em] leading-none ${t.num}`}>
                {loading ? <span className="text-on-surface-variant/30">—</span> : value}
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* ── Quick actions ── */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid sm:grid-cols-2 gap-4 mb-10"
      >
        <motion.div variants={item}>
          <Link
            to="/apply-leave"
            className="group relative block rounded-xl overflow-hidden h-full
                       bg-[#1b1a17] text-inverse-on-surface p-6
                       transition-all duration-300 hover:-translate-y-[1px]
                       shadow-[0_1px_0_rgba(27,26,23,0.04),0_12px_28px_-18px_rgba(27,26,23,0.5)]
                       hover:shadow-[0_1px_0_rgba(27,26,23,0.04),0_20px_40px_-18px_rgba(27,26,23,0.6)]"
          >
            <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
            <div className="absolute -top-20 -right-20 w-[280px] h-[280px] rounded-full
                            bg-[radial-gradient(ellipse_at_center,rgba(232,146,85,0.18),transparent_60%)]
                            pointer-events-none" />
            <div className="relative flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2.5 mb-3">
                  <span className="h-px w-6 bg-[#cf7b35]/65" />
                  <span className="text-[10px] font-medium tracking-[0.22em] uppercase text-white/55">
                    Primary action
                  </span>
                </div>
                <p className="text-[18px] font-medium tracking-[-0.015em] text-white">Apply for leave</p>
                <p className="text-white/45 text-[13px] mt-1">Submit a new time-off request.</p>
              </div>
              <div className="w-10 h-10 grid place-items-center rounded-md
                              border border-white/[0.1] bg-white/[0.04]
                              group-hover:border-white/[0.18] transition-colors">
                <FileEdit size={16} strokeWidth={1.7} className="text-[#e89255]" />
              </div>
            </div>
            <div className="relative mt-7 inline-flex items-center gap-1.5 text-[12.5px] font-medium text-white/85">
              Start request
              <ArrowRight size={12} strokeWidth={2.2}
                className="transition-transform duration-300 group-hover:translate-x-0.5" />
            </div>
          </Link>
        </motion.div>

        <motion.div variants={item}>
          <Link
            to="/leave-history"
            className="group relative block rounded-xl overflow-hidden h-full
                       bg-surface-container-lowest border border-outline-variant/40 p-6
                       transition-all duration-300 hover:-translate-y-[1px] hover:border-outline-variant/60
                       shadow-[0_1px_0_rgba(27,26,23,0.04)]
                       hover:shadow-[0_1px_0_rgba(27,26,23,0.04),0_12px_28px_-18px_rgba(27,26,23,0.2)]"
          >
            <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-on-surface/10 to-transparent" />
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2.5 mb-3">
                  <span className="h-px w-6 bg-on-surface/30" />
                  <span className="text-[10px] font-medium tracking-[0.22em] uppercase text-on-surface-variant/65">
                    Archive
                  </span>
                </div>
                <p className="text-[18px] font-medium tracking-[-0.015em] text-on-surface">View history</p>
                <p className="text-on-surface-variant text-[13px] mt-1">Past and current requests.</p>
              </div>
              <div className="w-10 h-10 grid place-items-center rounded-md
                              border border-outline-variant/40 bg-surface-container/50
                              group-hover:border-outline-variant/60 transition-colors">
                <History size={16} strokeWidth={1.7} className="text-on-surface-variant" />
              </div>
            </div>
            <div className="mt-7 inline-flex items-center gap-1.5 text-[12.5px] font-medium text-on-surface">
              Open archive
              <ArrowUpRight size={12} strokeWidth={2.2}
                className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </div>
          </Link>
        </motion.div>
      </motion.div>

      {/* ── Recent requests panel ── */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease }}
        className="relative rounded-xl border border-outline-variant/40 bg-surface-container-lowest
                   shadow-[0_1px_0_rgba(27,26,23,0.04)] overflow-hidden"
      >
        <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-on-surface/10 to-transparent" />

        <div className="flex items-center justify-between px-6 py-5 border-b border-outline-variant/25">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="h-px w-5 bg-primary/60" />
              <span className="text-[10px] font-medium tracking-[0.22em] uppercase text-on-surface-variant/65">
                Recent
              </span>
            </div>
            <h2 className="text-[15.5px] font-medium tracking-[-0.01em] text-on-surface">
              Latest requests
            </h2>
          </div>
          <Link
            to="/leave-history"
            className="group inline-flex items-center gap-1 text-[12.5px] font-medium text-on-surface-variant hover:text-on-surface transition-colors"
          >
            View all
            <ArrowRight size={11} strokeWidth={2.2}
              className="transition-transform duration-300 group-hover:translate-x-0.5" />
          </Link>
        </div>

        {loading ? (
          <div className="py-14 text-center text-on-surface-variant/65 text-[13px]">Loading…</div>
        ) : leaves.length === 0 ? (
          <div className="py-16 text-center">
            <div className="inline-grid place-items-center w-12 h-12 rounded-md border border-outline-variant/40 bg-surface-container/50 mb-3">
              <CalendarDays size={18} strokeWidth={1.6} className="text-on-surface-variant/50" />
            </div>
            <p className="text-on-surface font-medium text-[14px]">No leave requests yet</p>
            <Link to="/apply-leave"
              className="inline-flex items-center gap-1 mt-3 text-[12.5px] font-medium text-primary hover:text-primary-container transition-colors">
              Apply for your first leave
              <ArrowRight size={11} strokeWidth={2.2} />
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-outline-variant/20">
            {leaves.slice(0, 5).map(leave => (
              <li key={leave.id}
                className="group flex items-center justify-between px-6 py-4 hover:bg-surface-container/40 transition-colors">
                <div className="min-w-0 flex-1">
                  <p className="text-[13.5px] font-medium text-on-surface capitalize tracking-[-0.005em]">
                    {leave.leave_type} leave
                  </p>
                  <p className="text-[12px] text-on-surface-variant/85 mt-0.5">
                    {fmt(leave.start_date)} <span className="text-on-surface-variant/40 mx-1">→</span> {fmt(leave.end_date)}
                  </p>
                </div>
                <StatusBadge status={leave.status} />
              </li>
            ))}
          </ul>
        )}
      </motion.section>
    </div>
  );
};

export default EmployeeDashboard;
