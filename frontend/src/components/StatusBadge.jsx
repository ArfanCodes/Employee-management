const config = {
  pending:   { dot: 'bg-amber-400',   pill: 'bg-amber-50 border-amber-200/60 text-amber-700',     label: 'Pending'   },
  approved:  { dot: 'bg-emerald-500', pill: 'bg-emerald-50 border-emerald-200/60 text-emerald-700', label: 'Approved'  },
  rejected:  { dot: 'bg-rose-400',    pill: 'bg-rose-50 border-rose-200/60 text-rose-700',         label: 'Rejected'  },
  cancelled: { dot: 'bg-outline-variant', pill: 'bg-surface-container border-outline-variant/40 text-on-surface-variant', label: 'Cancelled' },
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
