import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getItems, createItem, updateItem, deleteItem } from '../utils/api';
import './Items.css';

const empty = { name: '', description: '', basePrice: '', variants: [{ name: '', value: '' }] };

export default function Items() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = () => getItems().then(r => setItems(r.data));
  useEffect(() => { load(); }, []);

  const handleVariantChange = (i, field, val) => {
    const v = [...form.variants];
    v[i][field] = val;
    setForm({ ...form, variants: v });
  };

  const addVariant = () =>
    setForm({ ...form, variants: [...form.variants, { name: '', value: '' }] });

  const removeVariant = (i) =>
    setForm({ ...form, variants: form.variants.filter((_, idx) => idx !== i) });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.basePrice) return toast.error('Name and price are required');
    setLoading(true);
    try {
      const data = {
        ...form,
        basePrice: parseFloat(form.basePrice),
        variants: form.variants.filter(v => v.name && v.value)
      };
      if (editId) {
        await updateItem(editId, data);
        toast.success('Item updated!');
      } else {
        await createItem(data);
        toast.success('Item created!');
      }
      setForm(empty);
      setEditId(null);
      load();
    } catch {
      toast.error('Something went wrong');
    }
    setLoading(false);
  };

  const handleEdit = (item) => {
    setForm({
      name: item.name,
      description: item.description,
      basePrice: item.basePrice,
      variants: item.variants.length ? item.variants : [{ name: '', value: '' }]
    });
    setEditId(item._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this item?')) return;
    await deleteItem(id);
    toast.success('Deleted');
    load();
  };

  return (
    <div className="items-wrapper">
      <h1 className="items-title">Item Management</h1>
      <p className="items-subtitle">Add and manage your inventory items</p>

      <div className="form-card">
        <h2 className="form-card-title">
          {editId ? '✏️ Edit Item' : '➕ Add New Item'}
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Item Name *</label>
              <input
                className="form-input"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Vegetable Salad"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Base Price (₹) *</label>
              <input
                className="form-input"
                type="number"
                value={form.basePrice}
                onChange={e => setForm({ ...form, basePrice: e.target.value })}
                placeholder="e.g. 250"
              />
            </div>
          </div>

          <div className="form-full">
            <label className="form-label">Description</label>
            <textarea
              className="form-input form-textarea"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Item description"
            />
          </div>

          <div className="variants-section">
            <div className="variants-header">
              <label className="form-label" style={{ margin: 0 }}>Variants (optional)</label>
              <button
                type="button"
                onClick={addVariant}
                className="btn btn-blue btn-sm"
              >
                + Add Variant
              </button>
            </div>

            {form.variants.map((v, i) => (
              <div key={i} className="variant-row">
                <input
                  className="form-input"
                  placeholder="e.g. Size"
                  value={v.name}
                  onChange={e => handleVariantChange(i, 'name', e.target.value)}
                />
                <input
                  className="form-input"
                  placeholder="e.g. Large"
                  value={v.value}
                  onChange={e => handleVariantChange(i, 'value', e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => removeVariant(i)}
                  className="btn btn-red btn-xs"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-green"
              disabled={loading}
            >
              {loading ? 'Saving...' : editId ? 'Update Item' : 'Add Item'}
            </button>
            {editId && (
              <button
                type="button"
                className="btn btn-gray"
                onClick={() => { setForm(empty); setEditId(null); }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Items List */}
      <div className="list-card">
        <h2 className="list-card-title">All Items ({items.length})</h2>

        {items.length === 0 ? (
          <p className="items-empty">No items yet. Add your first item above!</p>
        ) : (
          <div className="items-grid">
            {items.map(item => (
              <div key={item._id} className="item-card">
                <div className="item-card-header">
                  <span className="item-name">{item.name}</span>
                  <span className="item-price">₹{item.basePrice}</span>
                </div>

                <p className="item-desc">{item.description}</p>

                {item.variants.length > 0 && (
                  <div className="item-variants">
                    {item.variants.map((v, i) => (
                      <span key={i} className="variant-badge">
                        {v.name}: {v.value}
                      </span>
                    ))}
                  </div>
                )}

                <div className="item-actions">
                  <button
                    className="btn btn-blue btn-sm"
                    onClick={() => handleEdit(item)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-red btn-sm"
                    onClick={() => handleDelete(item._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}