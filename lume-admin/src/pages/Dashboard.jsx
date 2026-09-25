import React, { useEffect, useState } from 'react';
import { DollarSign, ShoppingBag, Users, Package, AlertTriangle, Clock } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import AdminLayout from '../layouts/AdminLayout';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import api from '../api/axios';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard')
      .then((res) => setStats(res.data.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !stats) {
    return (
      <AdminLayout title="Dashboard">
        <div className="text-muted text-sm py-16 text-center">Loading dashboard…</div>
      </AdminLayout>
    );
  }

  const chartData = stats.revenueByDay.map((d) => ({
    date: d._id.slice(5), // MM-DD
    revenue: Math.round(d.revenue),
  }));

  return (
    <AdminLayout title="Dashboard">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={DollarSign} label="Total Revenue" value={`$${stats.totalRevenue.toFixed(2)}`} accent sub="All-time, paid orders" />
        <StatCard icon={ShoppingBag} label="Total Orders" value={stats.totalOrders} sub={`${stats.todayOrders} today`} />
        <StatCard icon={Users} label="Customers" value={stats.totalCustomers} />
        <StatCard icon={Package} label="Products" value={stats.totalProducts} sub={`${stats.lowStockCount} low stock`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2 panel p-5">
          <h3 className="font-display text-lg mb-4">Revenue — Last 30 Days</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#28282c" />
              <XAxis dataKey="date" stroke="#8a8a92" fontSize={12} />
              <YAxis stroke="#8a8a92" fontSize={12} />
              <Tooltip
                contentStyle={{ background: '#141416', border: '1px solid #28282c', borderRadius: 8, fontSize: 13 }}
                labelStyle={{ color: '#fff' }}
              />
              <Line type="monotone" dataKey="revenue" stroke="#c9a36a" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="panel p-5">
          <h3 className="font-display text-lg mb-4">Attention Needed</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-surface2">
              <Clock size={18} className="text-warning flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">{stats.pendingOrders} pending orders</p>
                <p className="text-xs text-muted">Awaiting confirmation</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-surface2">
              <AlertTriangle size={18} className="text-danger flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">{stats.lowStockCount} low-stock products</p>
                <p className="text-xs text-muted">5 units or fewer remaining</p>
              </div>
            </div>
          </div>

          <h4 className="text-xs uppercase tracking-wider text-muted font-medium mt-6 mb-3">Top Products</h4>
          <div className="space-y-2">
            {stats.topProducts.map((p) => (
              <div key={p._id} className="flex items-center justify-between text-sm">
                <span className="truncate max-w-[140px]">{p.name}</span>
                <span className="text-muted">{p.unitsSold} sold</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="panel overflow-hidden">
        <div className="p-5 border-b border-border">
          <h3 className="font-display text-lg">Recent Orders</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="table-shell">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentOrders.map((o) => (
                <tr key={o._id}>
                  <td className="font-medium">{o.orderNumber}</td>
                  <td>{o.user ? `${o.user.firstName} ${o.user.lastName || ''}` : '—'}</td>
                  <td>${o.totalPrice.toFixed(2)}</td>
                  <td><StatusBadge status={o.status} /></td>
                  <td className="text-muted">{new Date(o.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
