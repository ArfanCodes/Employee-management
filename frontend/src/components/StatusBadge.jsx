const config = {
  pending:   { dot: 'bg-amber-400',   pill: 'bg-amber-50 border-amber-200 text-amber-700',   label: 'Pending'   },
  approved:  { dot: 'bg-emerald-400', pill: 'bg-emerald-50 border-emerald-200 text-emerald-700', label: 'Approved'  },
  rejected:  { dot: 'bg-rose-400',    pill: 'bg-rose-50 border-rose-200 text-rose-700',       label: 'Rejected'  },
  cancelled: { dot: 'bg-slate-400',   pill: 'bg-slate-50 border-slate-200 text-slate-500',    label: 'Cancelled' },
};

const StatusBadge = ({ status }) => {
  const c = config[status] ?? config.cancelled;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${c.pill}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${c.dot}`} />
      {c.label}
    </span>
  );
};

export default StatusBadge;
