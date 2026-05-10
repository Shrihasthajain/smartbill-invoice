import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getItems, createInvoice, downloadPDF } from '../utils/api';
import './NewInvoice.css';

const calcRow = (item) => {
  const qty = Number(item.quantity) || 0;
  const price = Number(item.basePrice) || 0;
  const gst = Number(item.gstPercent) || 0;
  const discVal = Number(item.discountValue) || 0;

  const base = price * qty;
  const discount = item.discountType === 'percent'
    ? base * (discVal / 100)
    : discVal;
  const afterDiscount = base - discount;
  const gstAmount = afterDiscount * (gst / 100);
  const rowTotal = afterDiscount + gstAmount;

  return {
    discount:  Number(discount.toFixed(2)),
    gstAmount: Number(gstAmount.toFixed(2)),
    rowTotal:  Number(rowTotal.toFixed(2))
  };
};

export default function NewInvoice() {
  const [items, setItems] = useState([]);
  const [customer, setCustomer] = useState({ name: '', phone: '', email: '', address: '' });
  const [lineItems, setLineItems] = useState([]);
  const [savedInvoiceId, setSavedInvoiceId] = useState(null);
  const [saving, setSaving] = useState(false);

  const today = new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
  const invoicePreview = `INV-${new Date().getFullYear()}-XXXX`;

  useEffect(() => {
    getItems()
      .then(r => setItems(r.data))
      .catch(() => toast.error('Failed to load items'));
  }, []);

  const addLineItem = () => {
    setLineItems([...lineItems, {
      itemId: '', itemName: '', variant: '',
      basePrice: 0, quantity: 1,
      gstPercent: 5, discountType: 'percent', discountValue: 0
    }]);
  };

  const updateLineItem = (i, field, value) => {
    const updated = [...lineItems];
    if (field === 'itemId') {
      const found = items.find(it => it._id === value);
      if (found) {
        updated[i] = {
          ...updated[i],
          itemId: found._id,
          itemName: found.name,
          basePrice: Number(found.basePrice),
          variant: found.variants?.length
            ? `${found.variants[0].name}: ${found.variants[0].value}`
            : ''
        };
      }
    } else {
      updated[i] = { ...updated[i], [field]: value };
    }
    setLineItems(updated);
  };

  const removeLineItem = (i) => setLineItems(lineItems.filter((_, idx) => idx !== i));

  // Live summary
  const summary = lineItems.reduce((acc, item) => {
    const { discount, gstAmount, rowTotal } = calcRow(item);
    const base = Number(item.basePrice) * Number(item.quantity);
    return {
      subtotal:      acc.subtotal      + base,
      totalDiscount: acc.totalDiscount + discount,
      totalGST:      acc.totalGST      + gstAmount,
      grandTotal:    acc.grandTotal    + rowTotal
    };
  }, { subtotal: 0, totalDiscount: 0, totalGST: 0, grandTotal: 0 });

  const handleSave = async () => {
    if (!customer.name || !customer.phone || !customer.email || !customer.address)
      return toast.error('Please fill all customer details');
    if (lineItems.length === 0)
      return toast.error('Please add at least one item');
    if (lineItems.some(item => !item.itemId))
      return toast.error('Please select an item from dropdown for all rows');

    setSaving(true);
    try {
      const payload = {
        customer,
        lineItems: lineItems.map(item => {
          const { discount, rowTotal } = calcRow(item);
          return {
            itemId:        item.itemId,
            itemName:      item.itemName,
            variant:       item.variant || '',
            basePrice:     Number(item.basePrice),
            quantity:      Number(item.quantity),
            gstPercent:    Number(item.gstPercent),
            discountType:  item.discountType,
            discountValue: Number(item.discountValue),
            rowTotal:      Number(rowTotal),
            discount:      Number(discount)
          };
        }),
        subtotal:      Number(summary.subtotal.toFixed(2)),
        totalDiscount: Number(summary.totalDiscount.toFixed(2)),
        totalGST:      Number(summary.totalGST.toFixed(2)),
        grandTotal:    Number(summary.grandTotal.toFixed(2))
      };

      const res = await createInvoice(payload);
      setSavedInvoiceId(res.data._id);
      toast.success('Invoice saved successfully!');
    } catch (err) {
      console.error('Save error:', err.response?.data);
      toast.error(err.response?.data?.message || 'Failed to save invoice');
    }
    setSaving(false);
  };

  return (
    <div className="invoice-wrapper">
      <h1 className="invoice-title">New Invoice</h1>
      <p className="invoice-subtitle">Fill in details to create a new invoice</p>

      {/* Invoice Meta */}
      <div className="inv-card">
        <h2 className="inv-card-title">📋 Invoice Details</h2>
        <div className="inv-grid-2">
          <div>
            <span className="inv-label">Invoice Number</span>
            <div className="inv-input inv-input-readonly">{invoicePreview}</div>
          </div>
          <div>
            <span className="inv-label">Invoice Date</span>
            <div className="inv-input inv-input-date">{today}</div>
          </div>
        </div>
      </div>

      {/* Customer Details */}
      <div className="inv-card">
        <h2 className="inv-card-title">👤 Customer Details</h2>
        <div className="inv-grid-2">
          <div>
            <label className="inv-label">Full Name *</label>
            <input
              className="inv-input"
              placeholder="John"
              value={customer.name}
              onChange={e => setCustomer({ ...customer, name: e.target.value })}
            />
          </div>
          <div>
            <label className="inv-label">Phone Number *</label>
            <input
              className="inv-input"
              placeholder="+91 9623456747"
              value={customer.phone}
              onChange={e => setCustomer({ ...customer, phone: e.target.value })}
            />
          </div>
          <div>
            <label className="inv-label">Email ID *</label>
            <input
              className="inv-input"
              placeholder="john@example.com"
              value={customer.email}
              onChange={e => setCustomer({ ...customer, email: e.target.value })}
            />
          </div>
          <div>
            <label className="inv-label">Billing Address *</label>
            <textarea
              className="inv-input inv-textarea"
              placeholder="5th Floor, Tech Park, Bangalore..."
              value={customer.address}
              onChange={e => setCustomer({ ...customer, address: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Line Items */}
      <div className="inv-card">
        <div className="lineitems-header">
          <h2 className="inv-card-title" style={{ margin: 0 }}>🧾 Line Items</h2>
          <button className="inv-btn inv-btn-green" onClick={addLineItem}>+ Add Item</button>
        </div>

        {lineItems.length === 0 ? (
          <div className="lineitems-empty">
            No items added yet. Click "+ Add Item" to start.
          </div>
        ) : (
          <div className="table-scroll">
            <table className="lineitems-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Variant</th>
                  <th>Qty</th>
                  <th>Price (₹)</th>
                  <th>GST %</th>
                  <th>Discount</th>
                  <th>Type</th>
                  <th>Row Total</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {lineItems.map((item, i) => {
                  const { rowTotal } = calcRow(item);
                  return (
                    <tr key={i}>
                      <td>
                        <select
                          className="inv-input td-select"
                          value={item.itemId}
                          onChange={e => updateLineItem(i, 'itemId', e.target.value)}
                        >
                          <option value="">-- Select --</option>
                          {items.map(it => (
                            <option key={it._id} value={it._id}>{it.name}</option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <input
                          className="inv-input td-variant"
                          value={item.variant}
                          onChange={e => updateLineItem(i, 'variant', e.target.value)}
                          placeholder="Variant"
                        />
                      </td>
                      <td>
                        <input
                          className="inv-input td-qty"
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={e => updateLineItem(i, 'quantity', e.target.value)}
                        />
                      </td>
                      <td className="row-total">₹{Number(item.basePrice).toFixed(2)}</td>
                      <td>
                        <select
                          className="inv-input td-gst"
                          value={item.gstPercent}
                          onChange={e => updateLineItem(i, 'gstPercent', e.target.value)}
                        >
                          {[0, 5, 12, 18, 28].map(g => (
                            <option key={g} value={g}>{g}%</option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <input
                          className="inv-input td-disc"
                          type="number"
                          min="0"
                          value={item.discountValue}
                          onChange={e => updateLineItem(i, 'discountValue', e.target.value)}
                        />
                      </td>
                      <td>
                        <select
                          className="inv-input td-type"
                          value={item.discountType}
                          onChange={e => updateLineItem(i, 'discountType', e.target.value)}
                        >
                          <option value="percent">% Percent</option>
                          <option value="absolute">₹ Fixed</option>
                        </select>
                      </td>
                      <td className="row-total">₹{rowTotal.toFixed(2)}</td>
                      <td>
                        <button
                          className="inv-btn inv-btn-red"
                          onClick={() => removeLineItem(i)}
                        >✕</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Summary */}
        {lineItems.length > 0 && (
          <div className="summary-wrap">
            <div className="summary-box">
              <div className="summary-row">
                <span className="summary-row-label">Subtotal</span>
                <span className="summary-row-value">₹{summary.subtotal.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span className="summary-row-label">Total Discount</span>
                <span className="summary-row-value summary-row-red">- ₹{summary.totalDiscount.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span className="summary-row-label">Total GST</span>
                <span className="summary-row-value summary-row-blue">+ ₹{summary.totalGST.toFixed(2)}</span>
              </div>
              <div className="summary-total">
                <span className="summary-total-label">Grand Total</span>
                <span className="summary-total-value">₹{summary.grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="inv-actions">
        <button
          className="inv-btn inv-btn-green"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Saving...' : '💾 Save Invoice'}
        </button>

        {savedInvoiceId && (
          <a
            href={downloadPDF(savedInvoiceId)}
            target="_blank"
            rel="noreferrer"
            className="inv-btn inv-btn-blue"
          >
            ⬇ Download PDF
          </a>
        )}
      </div>

      {savedInvoiceId && (
        <p className="inv-success-msg">
          ✅ Invoice saved! Click "Download PDF" to get your PDF.
        </p>
      )}
    </div>
  );
}