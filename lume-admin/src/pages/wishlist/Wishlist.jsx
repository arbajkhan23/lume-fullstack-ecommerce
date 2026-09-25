import React, { useCallback, useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import AdminLayout from '../../layouts/AdminLayout';
import DataTable from '../../components/DataTable';
import api from '../../api/axios';

export default function Wishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchWishlist = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/admin/wishlist');
      setWishlist(response.data.data || []);
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to load wishlist';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const columns = [
    { key: 'product', label: 'Product', render: (row) => (
      <div className="flex items-center gap-3 min-w-[220px]">
        <div className="w-12 h-12 rounded-lg bg-surface2 overflow-hidden shrink-0">
          {row.product.image && <img src={row.product.image} alt={row.product.name} className="w-full h-full object-cover" />}
        </div>
        <div><p className="font-medium">{row.product.name}</p><p className="text-xs text-muted">${Number(row.product.price).toFixed(2)}</p></div>
      </div>
    ) },
    { key: 'customer', label: 'Customer', render: (row) => row.customer ? (
      <div><p className="font-medium">{row.customer.name || 'Unnamed customer'}</p><p className="text-xs text-muted">{row.customer.email}</p></div>
    ) : 'Unknown customer' },
    { key: 'price', label: 'Price', render: (row) => `$${Number(row.product.price).toFixed(2)}` },
    { key: 'addedAt', label: 'Date Added', render: (row) => new Date(row.addedAt).toLocaleDateString() },
  ];

  return (
    <AdminLayout title="Wishlist">
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-muted text-sm">Products saved by customers</p>
        </div>
        <button onClick={fetchWishlist} className="btn-ghost">
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {!loading && error && (
        <div className="panel p-5 mb-4 border-danger/40">
          <p className="text-danger font-medium">{error}</p>
          <button onClick={fetchWishlist} className="btn-primary mt-3">Try Again</button>
        </div>
      )}

      <DataTable
        columns={columns}
        rows={wishlist}
        loading={loading}
        emptyMessage="No customers have added products to their wishlist yet."
      />
    </AdminLayout>
  );
}