import React from 'react';

const STATUS_STYLES = {
  Pending: 'bg-warning/15 text-warning',
  Confirmed: 'bg-info/15 text-info',
  Processing: 'bg-accent/15 text-accent',
  Shipped: 'bg-info/15 text-info',
  Delivered: 'bg-success/15 text-success',
  Cancelled: 'bg-danger/15 text-danger',
};

export default function StatusBadge({ status }) {
  return <span className={`badge ${STATUS_STYLES[status] || 'bg-surface2 text-muted'}`}>{status}</span>;
}
