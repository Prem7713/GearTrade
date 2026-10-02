'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, X, Save, Loader2 } from 'lucide-react';

const CONDITIONS = [
  'USED', 'REFURBISHED', 'RECONDITIONED', 'OPEN_BOX',
  'OEM_USED', 'GENUINE_USED', 'AFTERMARKET_USED', 'DAMAGED',
];

const CONDITION_LABELS: Record<string, string> = {
  USED: 'Used', REFURBISHED: 'Refurbished', RECONDITIONED: 'Reconditioned',
  OPEN_BOX: 'Open Box', OEM_USED: 'OEM Used', GENUINE_USED: 'Genuine Used',
  AFTERMARKET_USED: 'Aftermarket Used', DAMAGED: 'Damaged / For Parts',
};

const VEHICLE_TYPES = ['CAR', 'BIKE', 'BOTH'];

interface Brand { id: string; name: string; vehicleType: string; }
interface VehicleModel { id: string; name: string; brandId: string; }
interface Category { id: string; name: string; vehicleType: string; }

export default function AddProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<VehicleModel[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>(['']);
  const [compatibleModels, setCompatibleModels] = useState<string[]>([]);
  const [selectedBrandForCompat, setSelectedBrandForCompat] = useState('');
  const [availableModelsForCompat, setAvailableModelsForCompat] = useState<VehicleModel[]>([]);

  const [form, setForm] = useState({
    name: '', slug: '', description: '', sku: '',
    price: '', mrp: '', minimumOfferPrice: '',
    stock: '1', condition: 'USED', conditionDescription: '',
    cosmeticCondition: '', functionalCondition: '',
    vehicleType: 'CAR', brandId: '', categoryId: '',
    partNumber: '', oemNumber: '', manufacturer: '',
    location: '', warrantyMonths: '0',
    isReturnable: true, allowBargain: true,
    specifications: '{}', isFeatured: false,
  });

  useEffect(() => {
    Promise.all([
      fetch('/api/vehicles').then(r => r.json()),
      fetch('/api/admin/categories').then(r => r.json()),
    ]).then(([vh, cats]) => {
      setBrands(vh.brands || []);
      setModels(vh.models || []);
      setCategories(cats.categories || []);
    });
  }, []);

  useEffect(() => {
    if (selectedBrandForCompat) {
      setAvailableModelsForCompat(models.filter(m => m.brandId === selectedBrandForCompat));
    } else {
      setAvailableModelsForCompat([]);
    }
  }, [selectedBrandForCompat, models]);

  const filteredBrands = brands.filter(b =>
    form.vehicleType === 'BOTH' || b.vehicleType === form.vehicleType || b.vehicleType === 'BOTH'
  );
  const filteredCategories = categories.filter(c =>
    form.vehicleType === 'BOTH' || c.vehicleType === form.vehicleType || c.vehicleType === 'BOTH'
  );

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setForm(prev => ({ ...prev, [name]: val }));
    if (name === 'name' && !form.slug) {
      setForm(prev => ({
        ...prev, name: value,
        slug: value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      }));
    }
  }

  function addImageUrl() { setImageUrls(prev => [...prev, '']); }
  function removeImageUrl(i: number) { setImageUrls(prev => prev.filter((_, idx) => idx !== i)); }
  function updateImageUrl(i: number, val: string) {
    setImageUrls(prev => prev.map((url, idx) => idx === i ? val : url));
  }

  function toggleCompatModel(modelId: string) {
    setCompatibleModels(prev =>
      prev.includes(modelId) ? prev.filter(id => id !== modelId) : [...prev, modelId]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price),
        mrp: form.mrp ? parseFloat(form.mrp) : undefined,
        minimumOfferPrice: form.minimumOfferPrice ? parseFloat(form.minimumOfferPrice) : undefined,
        stock: parseInt(form.stock),
        warrantyMonths: parseInt(form.warrantyMonths),
        images: imageUrls.filter(u => u.trim()),
        compatibleModelIds: compatibleModels,
        specifications: (() => { try { return JSON.parse(form.specifications); } catch { return {}; } })(),
      };
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create product');
      router.push('/admin/products');
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/products" className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Add New Part</h1>
          <p className="text-slate-400 text-sm">Create a new product listing</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white border-b border-slate-700 pb-3">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Product Name *</label>
              <input name="name" value={form.name} onChange={handleChange} required
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:border-orange-500 focus:outline-none"
                placeholder="e.g. Hyundai Creta Headlight Assembly" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">URL Slug *</label>
              <input name="slug" value={form.slug} onChange={handleChange} required
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:border-orange-500 focus:outline-none"
                placeholder="hyundai-creta-headlight-assembly" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Description *</label>
            <textarea name="description" value={form.description} onChange={handleChange} required rows={4}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:border-orange-500 focus:outline-none resize-none"
              placeholder="Detailed product description..." />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">SKU</label>
              <input name="sku" value={form.sku} onChange={handleChange}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:border-orange-500 focus:outline-none"
                placeholder="GT-HYU-HL-001" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Part Number</label>
              <input name="partNumber" value={form.partNumber} onChange={handleChange}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:border-orange-500 focus:outline-none"
                placeholder="OEM Part Number" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">OEM Number</label>
              <input name="oemNumber" value={form.oemNumber} onChange={handleChange}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:border-orange-500 focus:outline-none"
                placeholder="OEM Number" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Manufacturer</label>
              <input name="manufacturer" value={form.manufacturer} onChange={handleChange}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:border-orange-500 focus:outline-none"
                placeholder="Hyundai, Bosch, Denso..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Location / Warehouse</label>
              <input name="location" value={form.location} onChange={handleChange}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:border-orange-500 focus:outline-none"
                placeholder="Mumbai Warehouse A" />
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white border-b border-slate-700 pb-3">Pricing & Stock</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Selling Price (₹) *</label>
              <input name="price" value={form.price} onChange={handleChange} required type="number" min="0" step="0.01"
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:border-orange-500 focus:outline-none"
                placeholder="7500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">MRP / Orig Price (₹)</label>
              <input name="mrp" value={form.mrp} onChange={handleChange} type="number" min="0" step="0.01"
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:border-orange-500 focus:outline-none"
                placeholder="12000" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Min Offer Price (₹)</label>
              <input name="minimumOfferPrice" value={form.minimumOfferPrice} onChange={handleChange} type="number" min="0" step="0.01"
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:border-orange-500 focus:outline-none"
                placeholder="5000" />
              <p className="text-xs text-slate-500 mt-1">Auto-accept if offer ≥ this</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Stock Qty *</label>
              <input name="stock" value={form.stock} onChange={handleChange} required type="number" min="0"
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:border-orange-500 focus:outline-none"
                placeholder="1" />
            </div>
          </div>
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="allowBargain" checked={form.allowBargain as boolean}
                onChange={handleChange} className="w-4 h-4 accent-orange-500" />
              <span className="text-sm text-slate-300">Allow Bargaining</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="isReturnable" checked={form.isReturnable as boolean}
                onChange={handleChange} className="w-4 h-4 accent-orange-500" />
              <span className="text-sm text-slate-300">Returnable</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="isFeatured" checked={form.isFeatured as boolean}
                onChange={handleChange} className="w-4 h-4 accent-orange-500" />
              <span className="text-sm text-slate-300">Featured Product</span>
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Warranty (months)</label>
            <input name="warrantyMonths" value={form.warrantyMonths} onChange={handleChange} type="number" min="0"
              className="w-full max-w-xs bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:border-orange-500 focus:outline-none"
              placeholder="0" />
          </div>
        </div>

        {/* Condition */}
        <div className="bg-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white border-b border-slate-700 pb-3">Condition</h2>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Condition *</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {CONDITIONS.map(c => (
                <label key={c} className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                  form.condition === c ? 'border-orange-500 bg-orange-500/10' : 'border-slate-600 hover:border-slate-500'
                }`}>
                  <input type="radio" name="condition" value={c} checked={form.condition === c} onChange={handleChange} className="accent-orange-500" />
                  <span className="text-sm text-slate-200">{CONDITION_LABELS[c]}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Condition Description</label>
              <textarea name="conditionDescription" value={form.conditionDescription} onChange={handleChange} rows={2}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:border-orange-500 focus:outline-none resize-none text-sm"
                placeholder="Describe overall condition..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Cosmetic Condition</label>
              <textarea name="cosmeticCondition" value={form.cosmeticCondition} onChange={handleChange} rows={2}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:border-orange-500 focus:outline-none resize-none text-sm"
                placeholder="Scratches, dents, paint..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Functional Condition</label>
              <textarea name="functionalCondition" value={form.functionalCondition} onChange={handleChange} rows={2}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:border-orange-500 focus:outline-none resize-none text-sm"
                placeholder="Working condition, tested..." />
            </div>
          </div>
        </div>

        {/* Vehicle & Category */}
        <div className="bg-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white border-b border-slate-700 pb-3">Vehicle & Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Vehicle Type *</label>
              <select name="vehicleType" value={form.vehicleType} onChange={handleChange}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:border-orange-500 focus:outline-none">
                {VEHICLE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Brand</label>
              <select name="brandId" value={form.brandId} onChange={handleChange}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:border-orange-500 focus:outline-none">
                <option value="">Select Brand</option>
                {filteredBrands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Category</label>
              <select name="categoryId" value={form.categoryId} onChange={handleChange}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:border-orange-500 focus:outline-none">
                <option value="">Select Category</option>
                {filteredCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          {/* Compatible Models */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Compatible Vehicle Models</label>
            <div className="flex gap-3 mb-3">
              <select value={selectedBrandForCompat} onChange={e => setSelectedBrandForCompat(e.target.value)}
                className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:border-orange-500 focus:outline-none text-sm">
                <option value="">Filter by brand...</option>
                {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            {availableModelsForCompat.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {availableModelsForCompat.map(m => (
                  <label key={m.id} className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs border cursor-pointer transition-colors ${
                    compatibleModels.includes(m.id) ? 'bg-orange-500 border-orange-500 text-white' : 'border-slate-600 text-slate-300 hover:border-orange-400'
                  }`}>
                    <input type="checkbox" checked={compatibleModels.includes(m.id)} onChange={() => toggleCompatModel(m.id)} className="sr-only" />
                    {m.name}
                  </label>
                ))}
              </div>
            )}
            {compatibleModels.length > 0 && (
              <p className="text-xs text-orange-400 mt-2">{compatibleModels.length} model(s) selected</p>
            )}
          </div>
        </div>

        {/* Images */}
        <div className="bg-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white border-b border-slate-700 pb-3">Product Images</h2>
          <p className="text-sm text-slate-400">Add image URLs (Unsplash, CDN, etc.)</p>
          <div className="space-y-2">
            {imageUrls.map((url, i) => (
              <div key={i} className="flex gap-2">
                <input value={url} onChange={e => updateImageUrl(i, e.target.value)}
                  className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:border-orange-500 focus:outline-none text-sm"
                  placeholder="https://images.unsplash.com/..." />
                {i > 0 && (
                  <button type="button" onClick={() => removeImageUrl(i)}
                    className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button type="button" onClick={addImageUrl}
            className="flex items-center gap-2 text-sm text-orange-400 hover:text-orange-300 transition-colors">
            <Plus className="w-4 h-4" /> Add Another Image
          </button>
        </div>

        {/* Specifications */}
        <div className="bg-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white border-b border-slate-700 pb-3">Technical Specifications (JSON)</h2>
          <textarea name="specifications" value={form.specifications} onChange={handleChange} rows={5}
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:border-orange-500 focus:outline-none font-mono text-sm resize-none"
            placeholder='{"material": "OEM Plastic", "warranty": "No warranty", "fitment": "Direct fit"}' />
          <p className="text-xs text-slate-500">Enter as valid JSON object</p>
        </div>

        {/* Submit */}
        <div className="flex gap-3 justify-end">
          <Link href="/admin/products"
            className="px-6 py-2.5 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors">
            Cancel
          </Link>
          <button type="submit" disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {loading ? 'Saving...' : 'Create Product'}
          </button>
        </div>
      </form>
    </div>
  );
}
