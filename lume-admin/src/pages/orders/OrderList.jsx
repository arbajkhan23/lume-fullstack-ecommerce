import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import AdminLayout from '../../layouts/AdminLayout';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import api from '../../api/axios';

const STATUSES = ['All', 'Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

export default function OrderList() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ totalPages: 1 });

  const load = useCallback(() => {
    setLoading(true);
    api.get('/orders', { params: { q: search || undefined, status: status === 'All' ? undefined : status, page, limit: 10 } })
      .then((res) => { setRows(res.data.data); setMeta(res.data.meta); })
      .catch(() => toast.error('Failed to load orders'))
      .finally(() => setLoading(false));
  }, [search, status, page]);

  useEffect(() => { load(); }, [load]);

  const columns = [
    { key: 'orderNumber', label: 'Order #', render: (o) => <span className="font-medium">{o.orderNumber}</span> },
    { key: 'customer', label: 'Customer', render: (o) => o.user ? `${o.user.firstName} ${o.user.lastName || ''}` : '—' },
    { key: 'items', label: 'Items', render: (o) => o.items.length },
    { key: 'total', label: 'Total', render: (o) => `$${o.totalPrice.toFixed(2)}` },
    { key: 'payment', label: 'Payment', render: (o) => (
      <span className={`badge ${o.isPaid ? 'bg-success/15 text-success' : 'bg-warning/15 text-warning'}`}>
        {o.isPaid ? 'Paid' : 'Unpaid'}
      </span>
    ) },
    { key: 'status', label: 'Status', render: (o) => <StatusBadge status={o.status} /> },
    { key: 'date', label: 'Date', render: (o) => new Date(o.createdAt).toLocaleDateString() },
    { key: 'actions', label: '', render: (o) => (
      <button onClick={() => navigate(`/orders/${o._id}`)} className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-muted hover:text-accent hover:border-accent transition-colors">
        <Eye size={14} />
      </button>
    ) },
  ];

  return (
    <AdminLayout title="Orders">
      <div className="flex flex-wrap gap-2 mb-4">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => { setStatus(s); setPage(1); }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-colors ${status === s ? 'bg-accent text-black border-accent' : 'bg-surface border-border text-muted hover:text-white'}`}
          >
            {s}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        loading={loading}
        searchValue={search}
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        searchPlaceholder="Search by order number…"
        page={page}
        totalPages={meta.totalPages}
        onPageChange={setPage}
        emptyMessage="No orders found."
      />
    </AdminLayout>
  );
}
