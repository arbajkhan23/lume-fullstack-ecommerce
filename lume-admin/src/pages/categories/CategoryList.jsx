import React, { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Trash2, ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import AdminLayout from '../../layouts/AdminLayout';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import api from '../../api/axios';

const emptyForm = { name: '', description: '', sortOrder: 0, isActive: true };

export default function CategoryList() {
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
    api.get('/categories/admin/all')
      .then((res) => setRows(res.data.data))
      .catch(() => toast.error('Failed to load categories'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setFile(null); setModalOpen(true); };
  const openEdit = (c) => {
    setEditing(c);
    setForm({ name: c.name, description: c.description || '', sortOrder: c.sortOrder || 0, isActive: c.isActive });
    setFile(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (file) fd.append('image', file);

    try {
      if (editing) {
        await api.put(`/categories/${editing._id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Category updated');
      } else {
        await api.post('/categories', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Category created');
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
      await api.delete(`/categories/${deleteTarget._id}`);
      toast.success('Category deleted');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed — it may still have products');
    }
  };

  return (
    <AdminLayout title="Categories">
      <div className="flex justify-end mb-4">
        <button className="btn-primary" onClick={openCreate}><Plus size={16} /> Add Category</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="text-muted text-sm py-10 col-span-full text-center">Loading…</div>
        ) : rows.length === 0 ? (
          <div className="text-muted text-sm py-10 col-span-full text-center">No categories yet.</div>
        ) : rows.map((c) => (
          <div key={c._id} className="panel overflow-hidden">
            <div className="aspect-video bg-surface2 flex items-center justify-center overflow-hidden">
              {c.image?.url ? (
                <img src={c.image.url} alt={c.name} className="w-full h-full object-cover" />
              ) : (
                <ImageIcon size={28} className="text-muted" />
              )}
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-display text-lg">{c.name}</h3>
                <span className={`badge ${c.isActive ? 'bg-success/15 text-success' : 'bg-surface2 text-muted'}`}>
                  {c.isActive ? 'Active' : 'Hidden'}
                </span>
              </div>
              <p className="text-xs text-muted mb-3">{c.productCount || 0} products</p>
              <div className="flex gap-2">
                <button onClick={() => openEdit(c)} className="btn-ghost flex-1 !py-1.5 !text-xs"><Pencil size={13} /> Edit</button>
                <button onClick={() => setDeleteTarget(c)} className="btn-danger flex-1 !py-1.5 !text-xs"><Trash2 size={13} /> Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Category' : 'Add Category'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Name</label>
            <input required className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Lighting" />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Sort Order</label>
              <input type="number" className="input" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} />
            </div>
            <div className="flex items-end pb-2">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="accent-[#c9a36a] w-4 h-4" />
                Active
              </label>
            </div>
          </div>
          <div>
            <label className="label">Category Image</label>
            <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} className="input" />
          </div>
          <button type="submit" disabled={saving} className="btn-primary w-full">
            {saving ? 'Saving…' : editing ? 'Update Category' : 'Create Category'}
          </button>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Category"
        message={`Delete "${deleteTarget?.name}"? Categories still linked to products can't be removed.`}
      />
    </AdminLayout>
  );
}
