import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import AdminLayout from '../../layouts/AdminLayout';
import DataTable from '../../components/DataTable';
import api from '../../api/axios';

export default function CustomerList() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ totalPages: 1 });

  const load = useCallback(() => {
    setLoading(true);
    api.get('/users', { params: { q: search || undefined, page, limit: 10 } })
      .then((res) => { setRows(res.data.data); setMeta(res.data.meta); })
      .catch(() => toast.error('Failed to load customers'))
      .finally(() => setLoading(false));
  }, [search, page]);

  useEffect(() => { load(); }, [load]);

  const toggleStatus = async (u) => {
    try {
      await api.put(`/users/${u._id}/status`, { isActive: !u.isActive });
      toast.success(u.isActive ? 'Customer deactivated' : 'Customer activated');
      load();
    } catch {
      toast.error('Update failed');
    }
  };

  const columns = [
    { key: 'name', label: 'Customer', render: (u) => (
      <div>
        <p className="font-medium">{u.firstName} {u.lastName}</p>
        <p className="text-xs text-muted">{u.email}</p>
      </div>
    ) },
    { key: 'phone', label: 'Phone', render: (u) => u.phone || '—' },
    { key: 'orders', label: 'Orders', render: (u) => u.orderCount },
    { key: 'spent', label: 'Total Spent', render: (u) => `$${u.totalSpent.toFixed(2)}` },
    { key: 'joined', label: 'Joined', render: (u) => new Date(u.createdAt).toLocaleDateString() },
    { key: 'status', label: 'Status', render: (u) => (
      <button onClick={() => toggleStatus(u)} className={`badge cursor-pointer ${u.isActive ? 'bg-success/15 text-success' : 'bg-danger/15 text-danger'}`}>
        {u.isActive ? 'Active' : 'Deactivated'}
      </button>
    ) },
    { key: 'actions', label: '', render: (u) => (
      <button onClick={() => navigate(`/customers/${u._id}`)} className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-muted hover:text-accent hover:border-accent transition-colors">
        <Eye size={14} />
      </button>
    ) },
  ];

  return (
    <AdminLayout title="Customers">
      <DataTable
        columns={columns}
        rows={rows}
        loading={loading}
        searchValue={search}
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        searchPlaceholder="Search by name or email…"
        page={page}
        totalPages={meta.totalPages}
        onPageChange={setPage}
        emptyMessage="No customers yet."
      />
    </AdminLayout>
  );
}
