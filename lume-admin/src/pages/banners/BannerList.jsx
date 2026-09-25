import React, { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Trash2, ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import AdminLayout from '../../layouts/AdminLayout';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import api from '../../api/axios';

const emptyForm = { title: '', subtitle: '', ctaLabel: 'Shop Now', ctaLink: '/shop.html', placement: 'hero', sortOrder: 0, isActive: true };

export default function BannerList() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    api.get('/banners/admin/all').then((res) => setRows(res.data.data)).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setFile(null); setModalOpen(true); };
  const openEdit = (b) => {
    setEditing(b);
    setForm({ title: b.title, subtitle: b.subtitle || '', ctaLabel: b.ctaLabel, ctaLink: b.ctaLink, placement: b.placement, sortOrder: b.sortOrder, isActive: b.isActive });
    setFile(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editing && !file) return toast.error('Banner image is required');
    setSaving(true);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (file) fd.append('image', file);
    try {
      if (editing) {
        await api.put(`/banners/${editing._id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Banner updated');
      } else {
        await api.post('/banners', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Banner created');
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
      await api.delete(`/banners/${deleteTarget._id}`);
      toast.success('Banner deleted');
      load();
    } catch {
      toast.error('Delete failed');
    }
  };

  return (
    <AdminLayout title="Banners">
      <div className="flex justify-end mb-4">
        <button className="btn-primary" onClick={openCreate}><Plus size={16} /> Add Banner</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="text-muted text-sm py-10 col-span-full text-center">Loading…</div>
        ) : rows.length === 0 ? (
          <div className="text-muted text-sm py-10 col-span-full text-center">No banners yet.</div>
        ) : rows.map((b) => (
          <div key={b._id} className="panel overflow-hidden">
            <div className="aspect-[16/9] bg-surface2 flex items-center justify-center overflow-hidden">
              {b.image?.url ? <img src={b.image.url} alt={b.title} className="w-full h-full object-cover" /> : <ImageIcon size={28} className="text-muted" />}
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-display text-base">{b.title}</h3>
                <span className={`badge ${b.isActive ? 'bg-success/15 text-success' : 'bg-surface2 text-muted'}`}>{b.isActive ? 'Active' : 'Hidden'}</span>
              </div>
              <p className="text-xs text-muted mb-3 capitalize">{b.placement} placement</p>
              <div className="flex gap-2">
                <button onClick={() => openEdit(b)} className="btn-ghost flex-1 !py-1.5 !text-xs"><Pencil size={13} /> Edit</button>
                <button onClick={() => setDeleteTarget(b)} className="btn-danger flex-1 !py-1.5 !text-xs"><Trash2 size={13} /> Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Banner' : 'Add Banner'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Title</label>
            <input required className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <label className="label">Subtitle</label>
            <input className="input" value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">CTA Label</label>
              <input className="input" value={form.ctaLabel} onChange={(e) => setForm({ ...form, ctaLabel: e.target.value })} />
            </div>
            <div>
              <label className="label">CTA Link</label>
              <input className="input" value={form.ctaLink} onChange={(e) => setForm({ ...form, ctaLink: e.target.value })} placeholder="/shop.html" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Placement</label>
              <select className="input" value={form.placement} onChange={(e) => setForm({ ...form, placement: e.target.value })}>
                <option value="hero">Hero</option>
                <option value="category-strip">Category Strip</option>
                <option value="promo">Promo</option>
              </select>
            </div>
            <div>
              <label className="label">Sort Order</label>
              <input type="number" className="input" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="label">Banner Image {editing && '(leave blank to keep current)'}</label>
            <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} className="input" />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="accent-[#c9a36a] w-4 h-4" />
            Active
          </label>
          <button type="submit" disabled={saving} className="btn-primary w-full">{saving ? 'Saving…' : editing ? 'Update Banner' : 'Create Banner'}</button>
        </form>
      </Modal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete Banner" message={`Delete "${deleteTarget?.title}"?`} />
    </AdminLayout>
  );
}
