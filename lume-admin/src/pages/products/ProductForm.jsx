import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { X, UploadCloud, ArrowLeft } from 'lucide-react';
import AdminLayout from '../../layouts/AdminLayout';
import api from '../../api/axios';

const emptyForm = {
  name: '',
  category: '',
  price: '',
  oldPrice: '',
  stock: '',
  sku: '',
  description: '',
  features: '', // newline-separated in the UI, split into array on submit
  isFeatured: false,
  isTrending: false,
  isActive: true,
};

export default function ProductForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyForm);
  const [categories, setCategories] = useState([]);
  const [existingImages, setExistingImages] = useState([]); // [{url, publicId}]
  const [removeIds, setRemoveIds] = useState([]);
  const [newFiles, setNewFiles] = useState([]); // File[]
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    api.get('/categories/admin/all').then((res) => setCategories(res.data.data));
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    api.get(`/products/${id}`).then((res) => {
      const p = res.data.data;
      setForm({
        name: p.name,
        category: p.category?._id || p.category,
        price: p.price,
        oldPrice: p.oldPrice ?? '',
        stock: p.stock,
        sku: p.sku || '',
        description: p.description,
        features: (p.features || []).join('\n'),
        isFeatured: p.isFeatured,
        isTrending: p.isTrending,
        isActive: p.isActive,
      });
      setExistingImages(p.images || []);
      setLoading(false);
    });
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleFiles = (e) => {
    const files = Array.from(e.target.files || []);
    setNewFiles((prev) => [...prev, ...files].slice(0, 6));
  };

  const toggleRemoveExisting = (publicId) => {
    setRemoveIds((prev) => (prev.includes(publicId) ? prev.filter((x) => x !== publicId) : [...prev, publicId]));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.category) return toast.error('Please select a category');

    setSaving(true);
    const fd = new FormData();
    fd.append('name', form.name);
    fd.append('category', form.category);
    fd.append('price', form.price);
    if (form.oldPrice) fd.append('oldPrice', form.oldPrice);
    fd.append('stock', form.stock);
    fd.append('sku', form.sku);
    fd.append('description', form.description);
    fd.append('features', form.features);
    fd.append('isFeatured', form.isFeatured);
    fd.append('isTrending', form.isTrending);
    fd.append('isActive', form.isActive);
    newFiles.forEach((file) => fd.append('images', file));
    removeIds.forEach((rid) => fd.append('removeImageIds', rid));

    try {
      if (isEdit) {
        await api.put(`/products/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Product updated');
      } else {
        await api.post('/products', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Product created');
      }
      navigate('/products');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title={isEdit ? 'Edit Product' : 'Add Product'}>
        <div className="text-muted text-sm py-16 text-center">Loading product…</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={isEdit ? 'Edit Product' : 'Add Product'}>
      <button onClick={() => navigate('/products')} className="flex items-center gap-2 text-sm text-muted hover:text-white mb-4 transition-colors">
        <ArrowLeft size={16} /> Back to Products
      </button>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="panel p-6 space-y-4">
            <h3 className="font-display text-lg mb-2">Basic Information</h3>
            <div>
              <label className="label">Product Name</label>
              <input required name="name" value={form.name} onChange={handleChange} className="input" placeholder="Aalto Table Lamp" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Category</label>
                <select required name="category" value={form.category} onChange={handleChange} className="input">
                  <option value="">Select category</option>
                  {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">SKU (optional)</label>
                <input name="sku" value={form.sku} onChange={handleChange} className="input" placeholder="LUME-LMP-001" />
              </div>
            </div>
            <div>
              <label className="label">Description</label>
              <textarea required name="description" value={form.description} onChange={handleChange} rows={4} className="input" placeholder="A soft, sculptural table lamp with..." />
            </div>
            <div>
              <label className="label">Features (one per line)</label>
              <textarea name="features" value={form.features} onChange={handleChange} rows={4} className="input" placeholder={'Hand-finished ceramic base\nNatural linen shade'} />
            </div>
          </div>

          <div className="panel p-6 space-y-4">
            <h3 className="font-display text-lg mb-2">Images</h3>
            {existingImages.length > 0 && (
              <div className="flex flex-wrap gap-3">
                {existingImages.map((img) => (
                  <div key={img.publicId} className={`relative w-20 h-20 rounded-lg overflow-hidden border ${removeIds.includes(img.publicId) ? 'border-danger opacity-40' : 'border-border'}`}>
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => toggleRemoveExisting(img.publicId)} className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 flex items-center justify-center text-white">
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <label className="flex flex-col items-center justify-center gap-2 border border-dashed border-border rounded-lg py-8 cursor-pointer hover:border-accent transition-colors">
              <UploadCloud size={22} className="text-muted" />
              <span className="text-sm text-muted">Click to upload up to 6 images</span>
              <input type="file" multiple accept="image/*" onChange={handleFiles} className="hidden" />
            </label>
            {newFiles.length > 0 && (
              <div className="flex flex-wrap gap-3">
                {newFiles.map((f, i) => (
                  <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-accent/50">
                    <img src={URL.createObjectURL(f)} alt="" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setNewFiles((prev) => prev.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 flex items-center justify-center text-white">
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="panel p-6 space-y-4">
            <h3 className="font-display text-lg mb-2">Pricing &amp; Stock</h3>
            <div>
              <label className="label">Price ($)</label>
              <input required type="number" step="0.01" min="0" name="price" value={form.price} onChange={handleChange} className="input" />
            </div>
            <div>
              <label className="label">Compare-at Price (optional)</label>
              <input type="number" step="0.01" min="0" name="oldPrice" value={form.oldPrice} onChange={handleChange} className="input" placeholder="Leave blank if not on sale" />
            </div>
            <div>
              <label className="label">Stock Quantity</label>
              <input required type="number" min="0" name="stock" value={form.stock} onChange={handleChange} className="input" />
            </div>
          </div>

          <div className="panel p-6 space-y-3">
            <h3 className="font-display text-lg mb-2">Visibility</h3>
            <label className="flex items-center justify-between text-sm">
              Featured on homepage
              <input type="checkbox" name="isFeatured" checked={form.isFeatured} onChange={handleChange} className="accent-[#c9a36a] w-4 h-4" />
            </label>
            <label className="flex items-center justify-between text-sm">
              Show in Trending
              <input type="checkbox" name="isTrending" checked={form.isTrending} onChange={handleChange} className="accent-[#c9a36a] w-4 h-4" />
            </label>
            <label className="flex items-center justify-between text-sm">
              Active (visible on storefront)
              <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} className="accent-[#c9a36a] w-4 h-4" />
            </label>
          </div>

          <button type="submit" disabled={saving} className="btn-primary w-full">
            {saving ? 'Saving…' : isEdit ? 'Update Product' : 'Create Product'}
          </button>
        </div>
      </form>
    </AdminLayout>
  );
}
