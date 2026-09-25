import React, { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import AdminLayout from '../../layouts/AdminLayout';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import api from '../../api/axios';

const emptyForm = {
  code: '', description: '', discountType: 'percentage', discountValue: '',
  minOrderValue: 0, maxDiscountAmount: '', usageLimit: '', expiresAt: '', isActive: true,
};

export default function CouponList() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    api.get('/coupons').then((res) => setRows(res.data.data)).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (c) => {
    setEditing(c);
    setForm({
      code: c.code, description: c.description || '', discountType: c.discountType,
      discountValue: c.discountValue, minOrderValue: c.minOrderValue,
      maxDiscountAmount: c.maxDiscountAmount ?? '', usageLimit: c.usageLimit ?? '',
      expiresAt: c.expiresAt?.slice(0, 10) || '', isActive: c.isActive,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      discountValue: Number(form.discountValue),
      minOrderValue: Number(form.minOrderValue) || 0,
      maxDiscountAmount: form.maxDiscountAmount ? Number(form.maxDiscountAmount) : null,
      usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
    };
    try {
      if (editing) {
        await api.put(`/coupons/${editing._id}`, payload);
        toast.success('Coupon updated');
      } else {
        await api.post('/coupons', payload);
        toast.success('Coupon created');
      }
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/coupons/${deleteTarget._id}`);
      toast.success('Coupon deleted');
      load();
    } catch {
      toast.error('Delete failed');
    }
  };

  const columns = [
    { key: 'code', label: 'Code', render: (c) => <span className="font-mono font-medium text-accent">{c.code}</span> },
    { key: 'discount', label: 'Discount', render: (c) => c.discountType === 'percentage' ? `${c.discountValue}%` : `$${c.discountValue}` },
    { key: 'usage', label: 'Usage', render: (c) => `${c.usedCount}${c.usageLimit ? ` / ${c.usageLimit}` : ''}` },
    { key: 'expires', label: 'Expires', render: (c) => new Date(c.expiresAt).toLocaleDateString() },
    { key: 'status', label: 'Status', render: (c) => (
      <span className={`badge ${c.isActive ? 'bg-success/15 text-success' : 'bg-surface2 text-muted'}`}>{c.isActive ? 'Active' : 'Inactive'}</span>
    ) },
    { key: 'actions', label: '', render: (c) => (
      <div className="flex gap-2 justify-end">
        <button onClick={() => openEdit(c)} className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-muted hover:text-accent hover:border-accent"><Pencil size={14} /></button>
        <button onClick={() => setDeleteTarget(c)} className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-muted hover:text-danger hover:border-danger"><Trash2 size={14} /></button>
      </div>
    ) },
  ];

  return (
    <AdminLayout title="Coupons">
      <DataTable
        columns={columns}
        rows={rows}
        loading={loading}
        emptyMessage="No coupons yet."
        headerActions={<button className="btn-primary" onClick={openCreate}><Plus size={16} /> Add Coupon</button>}
      />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Coupon' : 'Add Coupon'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Coupon Code</label>
            <input required className="input font-mono" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="LUME10" />
          </div>
          <div>
            <label className="label">Description</label>
            <input className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="10% off first order" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Discount Type</label>
              <select className="input" value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value })}>
                <option value="percentage">Percentage</option>
                <option value="flat">Flat Amount</option>
              </select>
            </div>
            <div>
              <label className="label">Discount Value</label>
              <input required type="number" className="input" value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Min Order Value</label>
              <input type="number" className="input" value={form.minOrderValue} onChange={(e) => setForm({ ...form, minOrderValue: e.target.value })} />
            </div>
            <div>
              <label className="label">Max Discount (cap)</label>
              <input type="number" className="input" value={form.maxDiscountAmount} onChange={(e) => setForm({ ...form, maxDiscountAmount: e.target.value })} placeholder="Optional" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Usage Limit</label>
              <input type="number" className="input" value={form.usageLimit} onChange={(e) => setForm({ ...form, usageLimit: e.target.value })} placeholder="Unlimited" />
            </div>
            <div>
              <label className="label">Expires On</label>
              <input required type="date" className="input" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="accent-[#c9a36a] w-4 h-4" />
            Active
          </label>
          <button type="submit" disabled={saving} className="btn-primary w-full">{saving ? 'Saving…' : editing ? 'Update Coupon' : 'Create Coupon'}</button>
        </form>
      </Modal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete Coupon" message={`Delete "${deleteTarget?.code}"?`} />
    </AdminLayout>
  );
}
