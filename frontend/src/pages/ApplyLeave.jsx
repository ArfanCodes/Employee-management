import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plane, Thermometer, Baby, UserCheck, DollarSign, MoreHorizontal, CheckCircle, Send } from 'lucide-react';
import api from '../services/api';

const TYPES = [
  { value: 'annual',    label: 'Annual',    icon: Plane,          accent: 'text-primary',       bg: 'bg-primary/8',       border: 'border-primary/30'   },
  { value: 'sick',      label: 'Sick',      icon: Thermometer,    accent: 'text-rose-600',      bg: 'bg-rose-50',         border: 'border-rose-200'     },
  { value: 'maternity', label: 'Maternity', icon: Baby,           accent: 'text-pink-600',      bg: 'bg-pink-50',         border: 'border-pink-200'     },
  { value: 'paternity', label: 'Paternity', icon: UserCheck,      accent: 'text-sky-600',       bg: 'bg-sky-50',          border: 'border-sky-200'      },
  { value: 'unpaid',    label: 'Unpaid',    icon: DollarSign,     accent: 'text-amber-600',     bg: 'bg-amber-50',        border: 'border-amber-200'    },
  { value: 'other',     label: 'Other',     icon: MoreHorizontal, accent: 'text-on-surface-variant', bg: 'bg-surface-container', border: 'border-outline-variant/40' },
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
  const navigate               = useNavigate();

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
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-12 text-center"
        >
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle size={32} className="text-emerald-600" />
          </div>
          <h2 className="text-xl font-semibold text-on-surface mb-2">Application Submitted</h2>
          <p className="text-on-surface-variant text-sm mb-8">
            Your leave request has been submitted and is pending admin review.
          </p>
          <div className="flex gap-3 justify-center">
            <Link
              to="/leave-history"
              className="bg-primary text-on-primary px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary-container transition-colors"
            >
              View History
            </Link>
            <button
              onClick={() => { setSuccess(false); setForm({ leave_type: '', start_date: '', end_date: '', reason: '' }); }}
              className="border border-outline-variant/40 text-on-surface-variant px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-surface-container transition-colors"
            >
              Apply Again
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link to="/dashboard"
          className="text-on-surface-variant hover:text-on-surface transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-on-surface tracking-tight">Apply for Leave</h1>
          <p className="text-on-surface-variant text-sm mt-0.5">Fill in the details to submit a request</p>
        </div>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-6 sm:p-8">
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg mb-6 text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-7">

          {/* Leave Type Cards */}
          <div>
            <label className="block text-xs font-semibold tracking-widest uppercase text-on-surface-variant mb-3">
              Leave Type
            </label>
            <div className="grid grid-cols-3 gap-3">
              {TYPES.map(({ value, label, icon: Icon, accent, bg, border }) => {
                const selected = form.leave_type === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, leave_type: value }))}
                    className={`
                      flex flex-col items-center gap-2 p-4 rounded-xl border-2 text-center transition-all duration-150
                      ${selected
                        ? `${bg} ${border} ring-2 ring-offset-1 ring-primary/40`
                        : 'border-outline-variant/30 hover:border-outline-variant hover:bg-surface-container'
                      }
                    `}
                  >
                    <Icon size={20} className={selected ? accent : 'text-on-surface-variant/50'} />
                    <span className={`text-xs font-semibold ${selected ? accent : 'text-on-surface-variant'}`}>
                      {label}
                    </span>
                  </button>
                );
              })}
            </div>
            {!form.leave_type && (
              <p className="text-xs text-on-surface-variant/60 mt-2">Select a leave type above</p>
            )}
          </div>

          {/* Dates */}
          <div>
            <label className="block text-xs font-semibold tracking-widest uppercase text-on-surface-variant mb-3">
              Date Range
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-on-surface-variant mb-1.5 font-medium">Start Date</label>
                <input
                  type="date" name="start_date" value={form.start_date}
                  onChange={set('start_date')} required min={today}
                  className="w-full border border-outline-variant/40 rounded-lg px-3.5 py-3 text-sm
                             text-on-surface bg-surface
                             focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
                             transition-all appearance-none"
                />
              </div>
              <div>
                <label className="block text-xs text-on-surface-variant mb-1.5 font-medium">End Date</label>
                <input
                  type="date" name="end_date" value={form.end_date}
                  onChange={set('end_date')} required min={form.start_date || today}
                  className="w-full border border-outline-variant/40 rounded-lg px-3.5 py-3 text-sm
                             text-on-surface bg-surface
                             focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
                             transition-all appearance-none"
                />
              </div>
            </div>
            <AnimatePresence>
              {duration && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-xs text-primary font-semibold mt-2"
                >
                  {duration} day{duration !== 1 ? 's' : ''} selected
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Reason */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold tracking-widest uppercase text-on-surface-variant">
                Reason
              </label>
              <span className="text-xs text-on-surface-variant/60">{form.reason.length}/500</span>
            </div>
            <textarea
              name="reason" value={form.reason}
              onChange={set('reason')} required
              rows={4} maxLength={500}
              placeholder="Briefly describe why you need this leave…"
              className="w-full border border-outline-variant/40 rounded-lg px-3.5 py-2.5 text-sm resize-none
                         text-on-surface bg-surface placeholder:text-on-surface-variant/40
                         focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={loading || !form.leave_type}
              className="flex-1 bg-primary text-on-primary py-2.5 rounded-lg font-semibold text-sm
                         hover:bg-primary-container disabled:opacity-50 transition-all
                         hover:-translate-y-0.5 active:scale-[0.98]
                         flex items-center justify-center gap-2"
            >
              {loading ? (
                <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Submitting…</>
              ) : (
                <><Send size={15} /> Submit Application</>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-5 border border-outline-variant/40 text-on-surface-variant py-2.5 rounded-lg text-sm font-semibold hover:bg-surface-container transition-colors"
            >
              Cancel
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default ApplyLeave;
