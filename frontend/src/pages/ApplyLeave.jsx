import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plane, Thermometer, Baby, UserCheck, DollarSign, MoreHorizontal, CheckCircle, Send } from 'lucide-react';
import api from '../services/api';

const ease = [0.16, 1, 0.3, 1];

const TYPES = [
  { value: 'annual',    label: 'Annual',    icon: Plane          },
  { value: 'sick',      label: 'Sick',      icon: Thermometer    },
  { value: 'maternity', label: 'Maternity', icon: Baby           },
  { value: 'paternity', label: 'Paternity', icon: UserCheck      },
  { value: 'unpaid',    label: 'Unpaid',    icon: DollarSign     },
  { value: 'other',     label: 'Other',     icon: MoreHorizontal },
];

const daysBetween = (start, end) => {
  if (!start || !end) return null;
  const diff = new Date(end) - new Date(start);
  if (diff < 0) return null;
  return Math.round(diff / (1000 * 60 * 60 * 24)) + 1;
};

const ApplyLeave = () => {
  const [form, setForm]       = useState({ leave_type: '', start_date: '', end_date: '', reason: '' });
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate              = useNavigate();

  const today    = new Date().toISOString().split('T')[0];
  const duration = daysBetween(form.start_date, form.end_date);
  const set      = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/leave/apply', form);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit leave application.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-lg mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0,  filter: 'blur(0px)' }}
          transition={{ duration: 0.55, ease }}
          className="relative rounded-xl border border-outline-variant/40 bg-surface-container-lowest
                     p-12 text-center shadow-[0_1px_0_rgba(27,26,23,0.04)] overflow-hidden"
        >
          <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-on-surface/10 to-transparent" />
          <div className="inline-grid place-items-center w-14 h-14 rounded-md
                          bg-emerald-50 border border-emerald-200/50 mb-5">
            <CheckCircle size={26} strokeWidth={1.6} className="text-emerald-700" />
          </div>
          <h2 className="text-[20px] font-medium tracking-[-0.015em] text-on-surface mb-2">
            Application submitted
          </h2>
          <p className="text-on-surface-variant text-[13.5px] mb-8 max-w-xs mx-auto">
            Your request is pending admin review. You will see status updates in your history.
          </p>
          <div className="flex gap-3 justify-center">
            <Link
              to="/leave-history"
              className="px-5 py-2.5 rounded-md bg-primary text-on-primary
                         text-[12px] font-semibold tracking-[0.06em] uppercase
                         hover:bg-primary-container transition-colors
                         shadow-[0_8px_24px_-12px_rgba(177,90,28,0.55)]"
            >
              View history
            </Link>
            <button
              onClick={() => { setSuccess(false); setForm({ leave_type: '', start_date: '', end_date: '', reason: '' }); }}
              className="px-5 py-2.5 rounded-md border border-outline-variant/40 bg-surface-container/40
                         text-[12px] font-semibold tracking-[0.06em] uppercase text-on-surface-variant
                         hover:bg-surface-container hover:text-on-surface transition-colors"
            >
              Apply again
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease }}
        className="mb-10"
      >
        <Link to="/dashboard"
          className="inline-flex items-center gap-1.5 text-[12px] font-medium tracking-[0.04em] text-on-surface-variant hover:text-on-surface transition-colors mb-6">
          <ArrowLeft size={13} strokeWidth={1.8} />
          Back to dashboard
        </Link>
        <div className="flex items-center gap-2.5 mb-3">
          <span className="h-px w-7 bg-primary/60" />
          <span className="text-[10px] font-medium tracking-[0.22em] uppercase text-on-surface-variant/65">
            New request
          </span>
        </div>
        <h1 className="text-[30px] sm:text-[34px] font-medium tracking-[-0.025em] text-on-surface leading-[1.05]">
          Apply for leave
        </h1>
        <p className="mt-2 text-[14px] text-on-surface-variant">
          Submit a time-off request for admin review.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.05, ease }}
        className="relative rounded-xl border border-outline-variant/40 bg-surface-container-lowest
                   shadow-[0_1px_0_rgba(27,26,23,0.04)] p-7 sm:p-9 overflow-hidden"
      >
        <div className="absolute inset-x-7 top-0 h-px bg-gradient-to-r from-transparent via-on-surface/10 to-transparent" />

        {error && (
          <div className="mb-6 px-3.5 py-3 rounded-md bg-rose-50 border border-rose-200/55 text-rose-800 text-[13px] font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* Leave Type Cards */}
          <div>
            <label className="block text-[10px] font-medium tracking-[0.22em] uppercase text-on-surface-variant/65 mb-3">
              Leave type
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {TYPES.map(({ value, label, icon: Icon }) => {
                const selected = form.leave_type === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, leave_type: value }))}
                    className={`relative flex flex-col items-center gap-2 px-3 py-4 rounded-md border text-center transition-all duration-200
                      ${selected
                        ? 'border-primary/55 bg-primary/[0.04] shadow-[0_0_0_3px_rgba(177,90,28,0.06)]'
                        : 'border-outline-variant/40 bg-surface-container/35 hover:bg-surface-container hover:border-outline-variant/60'}`}
                  >
                    <Icon size={16} strokeWidth={1.7}
                      className={selected ? 'text-primary' : 'text-on-surface-variant/60'} />
                    <span className={`text-[11.5px] font-medium tracking-[-0.005em]
                      ${selected ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                      {label}
                    </span>
                  </button>
                );
              })}
            </div>
            {!form.leave_type && (
              <p className="text-[11.5px] text-on-surface-variant/55 mt-2.5">Select a leave type above.</p>
            )}
          </div>

          {/* Dates */}
          <div>
            <label className="block text-[10px] font-medium tracking-[0.22em] uppercase text-on-surface-variant/65 mb-3">
              Date range
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11.5px] text-on-surface-variant/75 mb-1.5 font-medium">Start</label>
                <input
                  type="date" name="start_date" value={form.start_date}
                  onChange={set('start_date')} required min={today}
                  className="w-full rounded-md border border-outline-variant/40 bg-surface
                             px-3.5 py-2.5 text-[13.5px] text-on-surface
                             focus:outline-none focus:ring-[3px] focus:ring-primary/15 focus:border-primary/55
                             transition-[border-color,box-shadow] appearance-none"
                />
              </div>
              <div>
                <label className="block text-[11.5px] text-on-surface-variant/75 mb-1.5 font-medium">End</label>
                <input
                  type="date" name="end_date" value={form.end_date}
                  onChange={set('end_date')} required min={form.start_date || today}
                  className="w-full rounded-md border border-outline-variant/40 bg-surface
                             px-3.5 py-2.5 text-[13.5px] text-on-surface
                             focus:outline-none focus:ring-[3px] focus:ring-primary/15 focus:border-primary/55
                             transition-[border-color,box-shadow] appearance-none"
                />
              </div>
            </div>
            <AnimatePresence>
              {duration && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-[11.5px] font-medium tracking-[0.04em] text-primary mt-2.5"
                >
                  {duration} day{duration !== 1 ? 's' : ''} selected
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Reason */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label className="block text-[10px] font-medium tracking-[0.22em] uppercase text-on-surface-variant/65">
                Reason
              </label>
              <span className="text-[11px] text-on-surface-variant/55 tabular-nums">{form.reason.length}/500</span>
            </div>
            <textarea
              name="reason" value={form.reason}
              onChange={set('reason')} required
              rows={4} maxLength={500}
              placeholder="Briefly describe why you need this leave…"
              className="w-full rounded-md border border-outline-variant/40 bg-surface
                         px-3.5 py-3 text-[13.5px] text-on-surface placeholder:text-on-surface-variant/45
                         focus:outline-none focus:ring-[3px] focus:ring-primary/15 focus:border-primary/55
                         transition-[border-color,box-shadow] resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading || !form.leave_type}
              className="group flex-1 py-3 rounded-md bg-primary text-on-primary
                         text-[12px] font-semibold tracking-[0.08em] uppercase
                         flex items-center justify-center gap-2
                         shadow-[0_8px_24px_-12px_rgba(177,90,28,0.55)]
                         hover:bg-primary-container hover:shadow-[0_12px_32px_-12px_rgba(207,123,53,0.55)]
                         active:translate-y-[1px]
                         disabled:opacity-50 disabled:cursor-not-allowed
                         transition-[box-shadow,transform,background-color]"
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Submitting
                </>
              ) : (
                <>
                  <Send size={13} strokeWidth={2}
                    className="transition-transform duration-300 group-hover:translate-x-0.5" />
                  Submit application
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-5 rounded-md border border-outline-variant/40 bg-surface-container/40
                         text-[12px] font-semibold tracking-[0.08em] uppercase text-on-surface-variant
                         hover:bg-surface-container hover:text-on-surface transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ApplyLeave;
