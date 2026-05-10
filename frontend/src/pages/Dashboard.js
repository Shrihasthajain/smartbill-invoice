import React, { useEffect, useState } from 'react';
import { getInvoices, downloadPDF } from '../utils/api';
import './Dashboard.css';

export default function Dashboard() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getInvoices()
      .then(r => { setInvoices(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const stats = {
    total: invoices.length,
    revenue: invoices.reduce((s, i) => s + (i.grandTotal || 0), 0)
  };

  return (
    <div className="dashboard-wrapper">
      <h1 className="dashboard-title">Dashboard</h1>
      <p className="dashboard-subtitle">Overview of all invoices</p>

      {/* Stat Cards */}
      <div className="stat-grid">
        <div className="stat-card stat-card-green">
          <div className="stat-label">Total Invoices</div>
          <div className="stat-value stat-value-green">{stats.total}</div>
        </div>
        <div className="stat-card stat-card-blue">
          <div className="stat-label">Total Revenue</div>
          <div className="stat-value stat-value-blue">₹{stats.revenue.toFixed(2)}</div>
        </div>
      </div>

      {/* Invoice Table */}
      <div className="table-card">
        <h2 className="table-card-title">All Invoices</h2>

        {loading ? (
          <p className="table-empty">Loading...</p>
        ) : invoices.length === 0 ? (
          <p className="table-empty">No invoices yet. Create your first one!</p>
        ) : (
          <div className="table-scroll">
            <table className="invoice-table">
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Grand Total</th>
                  <th>PDF</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv, i) => (
                  <tr key={inv._id} className={i % 2 === 0 ? 'even' : 'odd'}>
                    <td className="td-invoice-number">{inv.invoiceNumber}</td>
                    <td>{inv.customer?.name}</td>
                    <td className="td-date">
                      {new Date(inv.invoiceDate).toLocaleDateString('en-IN')}
                    </td>
                    <td className="td-total">₹{inv.grandTotal?.toFixed(2)}</td>
                    <td>
                      <a
                        href={downloadPDF(inv._id)}
                        target="_blank"
                        rel="noreferrer"
                        className="pdf-btn"
                      >
                        ⬇ PDF
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}