import React, { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import AdminLayout from '../../layouts/AdminLayout';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import api from '../../api/axios';

const emptyForm = { title: '', subtitle: '', discountLabel: '', category: '', startsAt: '', endsAt: '', isActive: true };

function toLocalInput(dt) {
  if (!dt) return '';
  const d = new Date(dt);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

export default function DealList() {
  const [rows, setRows] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    api.get('/deals').then((res) => setRows(res.data.data)).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); api.get('/categories/admin/all').then((res) => setCategories(res.data.data)); }, [load]);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (d) => {
    setEditing(d);
    setForm({
      title: d.title, subtitle: d.subtitle || '', discountLabel: d.discountLabel || '',
      category: d.category?._id || '', startsAt: toLocalInput(d.startsAt), endsAt: toLocalInput(d.endsAt), isActive: d.isActive,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = { ...form, category: form.category || null };
    try {
      if (editing) {
        await api.put(`/deals/${editing._id}`, payload);
        toast.success('Deal updated');
      } else {
        await api.post('/deals', payload);
        toast.success('Deal created');
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
      await api.delete(`/deals/${deleteTarget._id}`);
      toast.success('Deal deleted');
      load();
    } catch {
      toast.error('Delete failed');
    }
  };

  const columns = [
    { key: 'title', label: 'Title', render: (d) => (
      <div><p className="font-medium">{d.title}</p><p className="text-xs text-muted">{d.discountLabel}</p></div>
    ) },
    { key: 'category', label: 'Category', render: (d) => d.category?.name || 'All products' },
    { key: 'window', label: 'Window', render: (d) => `${new Date(d.startsAt).toLocaleDateString()} — ${new Date(d.endsAt).toLocaleDateString()}` },
    { key: 'live', label: 'Live Now', render: (d) => {
      const now = new Date();
      const live = d.isActive && now >= new Date(d.startsAt) && now <= new Date(d.endsAt);
      return <span className={`badge ${live ? 'bg-success/15 text-success' : 'bg-surface2 text-muted'}`}>{live ? 'Live' : 'Not Live'}</span>;
    } },
    { key: 'actions', label: '', render: (d) => (
      <div className="flex gap-2 justify-end">
        <button onClick={() => openEdit(d)} className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-muted hover:text-accent hover:border-accent"><Pencil size={14} /></button>
        <button onClick={() => setDeleteTarget(d)} className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-muted hover:text-danger hover:border-danger"><Trash2 size={14} /></button>
      </div>
    ) },
  ];

  return (
    <AdminLayout title="Deals">
      <DataTable
        columns={columns}
        rows={rows}
        loading={loading}
        emptyMessage="No deals yet."
        headerActions={<button className="btn-primary" onClick={openCreate}><Plus size={16} /> Add Deal</button>}
      />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Deal' : 'Add Deal'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Title</label>
            <input required className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Up to 40% off select lighting" />
          </div>
          <div>
            <label className="label">Subtitle</label>
            <input className="input" value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} />
          </div>
          <div>
            <label className="label">Discount Label</label>
            <input className="input" value={form.discountLabel} onChange={(e) => setForm({ ...form, discountLabel: e.target.value })} placeholder="Up to 40% off" />
          </div>
          <div>
            <label className="label">Category (optional — leave blank for all products)</label>
            <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              <option value="">All products</option>
              {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Starts At</label>
              <input required type="datetime-local" className="input" value={form.startsAt} onChange={(e) => setForm({ ...form, startsAt: e.target.value })} />
            </div>
            <div>
              <label className="label">Ends At</label>
              <input required type="datetime-local" className="input" value={form.endsAt} onChange={(e) => setForm({ ...form, endsAt: e.target.value })} />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="accent-[#c9a36a] w-4 h-4" />
            Active
          </label>
          <button type="submit" disabled={saving} className="btn-primary w-full">{saving ? 'Saving…' : editing ? 'Update Deal' : 'Create Deal'}</button>
        </form>
      </Modal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete Deal" message={`Delete "${deleteTarget?.title}"?`} />
    </AdminLayout>
  );
}
