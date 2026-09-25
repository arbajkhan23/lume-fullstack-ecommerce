import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import AdminLayout from '../../layouts/AdminLayout';
import StatusBadge from '../../components/StatusBadge';
import api from '../../api/axios';

export default function CustomerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/users/${id}`)
      .then((res) => setData(res.data.data))
      .catch(() => toast.error('Failed to load customer'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading || !data) {
    return (
      <AdminLayout title="Customer Detail">
        <div className="text-muted text-sm py-16 text-center">Loading customer…</div>
      </AdminLayout>
    );
  }

  const { user, orders } = data;
  const totalSpent = orders.filter((o) => o.isPaid).reduce((sum, o) => sum + o.totalPrice, 0);

  return (
    <AdminLayout title="Customer Detail">
      <button onClick={() => navigate('/customers')} className="flex items-center gap-2 text-sm text-muted hover:text-white mb-4 transition-colors">
        <ArrowLeft size={16} /> Back to Customers
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="panel p-6">
          <div className="w-16 h-16 rounded-full bg-accent/15 border border-accent/30 flex items-center justify-center text-accent text-xl font-display mb-4">
            {user.firstName?.charAt(0)?.toUpperCase()}
          </div>
          <h3 className="font-display text-lg">{user.firstName} {user.lastName}</h3>
          <p className="text-sm text-muted mb-4">{user.email}</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted">Phone</span><span>{user.phone || '—'}</span></div>
            <div className="flex justify-between"><span className="text-muted">Joined</span><span>{new Date(user.createdAt).toLocaleDateString()}</span></div>
            <div className="flex justify-between"><span className="text-muted">Total Orders</span><span>{orders.length}</span></div>
            <div className="flex justify-between"><span className="text-muted">Total Spent</span><span className="text-accent font-medium">${totalSpent.toFixed(2)}</span></div>
          </div>
        </div>

        <div className="lg:col-span-2 panel overflow-hidden">
          <div className="p-5 border-b border-border"><h3 className="font-display text-lg">Order History</h3></div>
          <div className="overflow-x-auto">
            <table className="table-shell">
              <thead>
                <tr><th>Order #</th><th>Items</th><th>Total</th><th>Status</th><th>Date</th></tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr><td colSpan={5} className="text-center text-muted py-10">No orders yet.</td></tr>
                ) : orders.map((o) => (
                  <tr key={o._id} className="cursor-pointer" onClick={() => navigate(`/orders/${o._id}`)}>
                    <td className="font-medium">{o.orderNumber}</td>
                    <td>{o.items.length}</td>
                    <td>${o.totalPrice.toFixed(2)}</td>
                    <td><StatusBadge status={o.status} /></td>
                    <td className="text-muted">{new Date(o.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
