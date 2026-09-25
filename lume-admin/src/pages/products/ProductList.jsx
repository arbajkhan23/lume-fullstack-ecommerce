import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import AdminLayout from '../../layouts/AdminLayout';
import DataTable from '../../components/DataTable';
import ConfirmDialog from '../../components/ConfirmDialog';
import api from '../../api/axios';

export default function ProductList() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ totalPages: 1 });
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    api
      .get('/products/admin/all', { params: { q: search || undefined, page, limit: 10 } })
      .then((res) => {
        setRows(res.data.data);
        setMeta(res.data.meta);
      })
      .catch(() => toast.error('Failed to load products'))
      .finally(() => setLoading(false));
  }, [search, page]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async () => {
    try {
      await api.delete(`/products/${deleteTarget._id}`);
      toast.success('Product deleted');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const columns = [
    {
      key: 'image', label: '', render: (p) => (
        <img
          src={p.images?.[0]?.url || 'https://via.placeholder.com/60'}
          alt={p.name}
          className="w-11 h-11 rounded-lg object-cover border border-border"
        />
      ),
    },
    { key: 'name', label: 'Product', render: (p) => (
      <div>
        <p className="font-medium text-white">{p.name}</p>
        <p className="text-xs text-muted">{p.category?.name}</p>
      </div>
    ) },
    { key: 'price', label: 'Price', render: (p) => (
      <div>
        <span>${p.price.toFixed(2)}</span>
        {p.oldPrice && <span className="text-muted line-through text-xs ml-2">${p.oldPrice.toFixed(2)}</span>}
      </div>
    ) },
    { key: 'stock', label: 'Stock', render: (p) => (
      <span className={p.stock === 0 ? 'text-danger' : p.stock <= 5 ? 'text-warning' : 'text-white'}>
        {p.stock}
      </span>
    ) },
    { key: 'status', label: 'Status', render: (p) => (
      <span className={`badge ${p.isActive ? 'bg-success/15 text-success' : 'bg-surface2 text-muted'}`}>
        {p.isActive ? 'Active' : 'Hidden'}
      </span>
    ) },
    { key: 'actions', label: '', render: (p) => (
      <div className="flex items-center gap-2 justify-end">
        <button onClick={() => window.open(`https://arbajkhan23.github.io/lumesite/product-details.html?id=${p._id}`, '_blank')} className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-muted hover:text-accent hover:border-accent transition-colors" aria-label="View on storefront">
          <Eye size={14} />
        </button>
        <button onClick={() => navigate(`/products/${p._id}/edit`)} className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-muted hover:text-accent hover:border-accent transition-colors" aria-label="Edit">
          <Pencil size={14} />
        </button>
        <button onClick={() => setDeleteTarget(p)} className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-muted hover:text-danger hover:border-danger transition-colors" aria-label="Delete">
          <Trash2 size={14} />
        </button>
      </div>
    ) },
  ];

  return (
    <AdminLayout title="Products">
      <DataTable
        columns={columns}
        rows={rows}
        loading={loading}
        searchValue={search}
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        searchPlaceholder="Search products or SKU…"
        page={page}
        totalPages={meta.totalPages}
        onPageChange={setPage}
        emptyMessage="No products yet — add your first one."
        headerActions={
          <button className="btn-primary" onClick={() => navigate('/products/new')}>
            <Plus size={16} /> Add Product
          </button>
        }
      />
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Product"
        message={`Delete "${deleteTarget?.name}"? This cannot be undone.`}
      />
    </AdminLayout>
  );
}
