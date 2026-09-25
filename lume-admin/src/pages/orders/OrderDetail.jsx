import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import AdminLayout from '../../layouts/AdminLayout';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import api from '../../api/axios';

const FLOW = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered'];

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusModal, setStatusModal] = useState(false);
  const [nextStatus, setNextStatus] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    api.get(`/orders/${id}`)
      .then((res) => setOrder(res.data.data))
      .catch(() => toast.error('Failed to load order'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  const openStatusModal = (status) => { setNextStatus(status); setNote(''); setStatusModal(true); };

  const handleUpdateStatus = async () => {
    setSaving(true);
    try {
      await api.put(`/orders/${id}/status`, { status: nextStatus, note });
      toast.success(`Order marked as ${nextStatus}`);
      setStatusModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !order) {
    return (
      <AdminLayout title="Order Detail">
        <div className="text-muted text-sm py-16 text-center">Loading order…</div>
      </AdminLayout>
    );
  }

  const currentIdx = FLOW.indexOf(order.status);
  const isFinal = order.status === 'Delivered' || order.status === 'Cancelled';

  return (
    <AdminLayout title={`Order ${order.orderNumber}`}>
      <button onClick={() => navigate('/orders')} className="flex items-center gap-2 text-sm text-muted hover:text-white mb-4 transition-colors">
        <ArrowLeft size={16} /> Back to Orders
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="panel p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display text-lg">Status</h3>
              <StatusBadge status={order.status} />
            </div>

            {!isFinal && (
              <div className="flex flex-wrap gap-2 mb-5">
                {FLOW.slice(currentIdx + 1).map((s) => (
                  <button key={s} onClick={() => openStatusModal(s)} className="btn-ghost !text-xs">
                    Mark as {s}
                  </button>
                ))}
                <button onClick={() => openStatusModal('Cancelled')} className="btn-danger !text-xs">
                  Cancel Order
                </button>
              </div>
            )}

            <div className="space-y-3">
              {order.statusHistory.map((h, i) => (
                <div key={i} className="flex items-start gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-accent mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">{h.status}</p>
                    <p className="text-xs text-muted">{new Date(h.changedAt).toLocaleString()}{h.note ? ` — ${h.note}` : ''}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="panel overflow-hidden">
            <div className="p-5 border-b border-border"><h3 className="font-display text-lg">Items</h3></div>
            <div className="divide-y divide-border">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center gap-4 p-4">
                  <img src={item.image || 'https://via.placeholder.com/60'} alt={item.name} className="w-14 h-14 rounded-lg object-cover border border-border" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className="text-xs text-muted">Qty {item.qty} × ${item.price.toFixed(2)}</p>
                  </div>
                  <p className="font-medium text-sm">${(item.qty * item.price).toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="panel p-6">
            <h3 className="font-display text-lg mb-4">Customer</h3>
            <p className="text-sm font-medium">{order.user?.firstName} {order.user?.lastName}</p>
            <p className="text-xs text-muted">{order.user?.email}</p>
          </div>

          <div className="panel p-6">
            <h3 className="font-display text-lg mb-4">Shipping Address</h3>
            <p className="text-sm">{order.shippingAddress?.fullName}</p>
            <p className="text-xs text-muted mt-1">
              {order.shippingAddress?.street}, {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zip}, {order.shippingAddress?.country}
            </p>
            <p className="text-xs text-muted mt-1">{order.shippingAddress?.phone}</p>
          </div>

          <div className="panel p-6">
            <h3 className="font-display text-lg mb-4">Payment Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted">Subtotal</span><span>${order.itemsPrice.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-muted">Shipping</span><span>{order.shippingPrice === 0 ? 'Free' : `$${order.shippingPrice.toFixed(2)}`}</span></div>
              {order.discountPrice > 0 && (
                <div className="flex justify-between text-success"><span>Discount ({order.coupon?.code})</span><span>-${order.discountPrice.toFixed(2)}</span></div>
              )}
           <div className="flex justify-between font-display text-base pt-2 border-t border-border mt-2">
  <span className="text-white">Total</span>
  <span className="text-white">${order.totalPrice.toFixed(2)}</span>
</div>
              <div className="flex justify-between text-xs text-muted pt-1">
                <span>Payment Method</span><span>{order.paymentMethod}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal open={statusModal} onClose={() => setStatusModal(false)} title={`Mark as ${nextStatus}`}>
        <div className="space-y-4">
          <div>
            <label className="label">Note (optional)</label>
            <textarea className="input" rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a note for this status change…" />
          </div>
          <button onClick={handleUpdateStatus} disabled={saving} className="btn-primary w-full">
            {saving ? 'Updating…' : `Confirm — Mark as ${nextStatus}`}
          </button>
        </div>
      </Modal>
    </AdminLayout>
  );
}
