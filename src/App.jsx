import React, { useState } from 'react';
import './App.css';

// Utility to get start-of-day for a date
function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}
// Utility to get start-of-week (Monday)
function startOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  return new Date(d.setDate(diff));
}
// Utility to get start-of-month
function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}
// Utility to get start-of-year
function startOfYear(date) {
  return new Date(date.getFullYear(), 0, 1);
}

function saveBillToStorage(bill) {
  const bills = JSON.parse(localStorage.getItem('decode_bills') || '[]');
  bills.push(bill);
  localStorage.setItem('decode_bills', JSON.stringify(bills));
}

function getBillsFromStorage() {
  return JSON.parse(localStorage.getItem('decode_bills') || '[]');
}


function generateBillNumber() {
  // Simple random bill number (for demo)
  return 'DC' + Math.floor(100000 + Math.random() * 900000);
}

function App() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({
    name: '',
    price: '',
    discount: '',
    tax: '',
    quantity: '1',
  });
  const [customerPhone, setCustomerPhone] = useState('');
  const [billNo] = useState(generateBillNumber());
  const [billDate] = useState(new Date());
  const [tab, setTab] = useState('billing'); // 'billing' or 'reports'
  const [reportType, setReportType] = useState('daily'); // daily, weekly, monthly, yearly
  const [reportDate, setReportDate] = useState(() => {
    const d = new Date();
    return d.toISOString().slice(0,10);
  });
  const [bills, setBills] = useState(getBillsFromStorage());

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const removeItem = idx => {
    setItems(items.filter((_, i) => i !== idx));
  };

  const clearBill = () => {
    setItems([]);
    setForm({ name: '', price: '', discount: '', tax: '', quantity: '1' });
    setCustomerPhone('');
  };

  const addItem = (e) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.quantity) return;
    setItems([
      ...items,
      {
        ...form,
        price: parseFloat(form.price),
        discount: parseFloat(form.discount) || 0,
        tax: parseFloat(form.tax) || 0,
        quantity: parseInt(form.quantity, 10),
      },
    ]);
    setForm({ name: '', price: '', discount: '', tax: '', quantity: '1' });
  };

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const totalDiscount = items.reduce(
    (sum, item) => sum + item.discount * item.quantity,
    0
  );
  const totalTax = items.reduce(
    (sum, item) => sum + item.tax * item.quantity,
    0
  );
  const grandTotal = subtotal - totalDiscount + totalTax;

  const printBill = () => {
    // Save bill before printing
    if (items.length) {
      saveBillToStorage({
        billNo,
        billDate: billDate.toISOString(),
        items,
        subtotal,
        totalDiscount,
        totalTax,
        grandTotal,
      });
      setBills(getBillsFromStorage());
    }
    window.print();
  };

  const sendWhatsApp = () => {
    if (items.length) {
      saveBillToStorage({
        billNo,
        billDate: billDate.toISOString(),
        items,
        subtotal,
        totalDiscount,
        totalTax,
        grandTotal,
      });
      setBills(getBillsFromStorage());
    }
    let billText = `Textile Shop Bill\n`;
    billText += `----------------------\n`;
    items.forEach((item, idx) => {
      billText += `${idx + 1}. ${item.name} x${item.quantity} - Rs.${item.price} each`;
      if (item.discount) billText += `, Discount: Rs.${item.discount}`;
      if (item.tax) billText += `, Tax: Rs.${item.tax}`;
      billText += "\n";
    });
    billText += `----------------------\n`;
    billText += `Subtotal: Rs.${subtotal.toFixed(2)}\n`;
    billText += `Discount: Rs.${totalDiscount.toFixed(2)}\n`;
    billText += `Tax: Rs.${totalTax.toFixed(2)}\n`;
    billText += `Total: Rs.${grandTotal.toFixed(2)}\n`;
    
    const url = `https://wa.me/${customerPhone}?text=${encodeURIComponent(billText)}`;
    window.open(url, "_blank");
  };

  return (
    <>
      <div className="header" style={{display:'flex',alignItems:'center',justifyContent:'center',gap:12}}>
        <span className="decode-title">DECODE</span>
        <span style={{fontWeight:700,letterSpacing:2,marginLeft:8}}>Textile Shop Billing</span>
      </div>
      <div className="tab-bar">
        <button className={tab==='billing'?"tab-active":""} onClick={()=>setTab('billing')}>Billing</button>
        <button className={tab==='reports'?"tab-active":""} onClick={()=>setTab('reports')}>Reports</button>
      </div>
      {tab === 'billing' && (
        <div className="billing-app">
          <div style={{ width: '100%', marginBottom: 16, textAlign: 'center' }}>
            <div style={{ fontWeight: 700, fontSize: '1.12rem', color: '#3a7bd5', letterSpacing: 1 }}>DECODE</div>
            <div style={{ fontSize: '0.95rem', color: '#666' }}>palace road, changanacherry, 686101</div>
          </div>
          <div style={{ width: '100%', marginBottom: 10, display: 'flex', justifyContent: 'space-between', fontSize: '0.98rem', color: '#444' }}>
            <span>Bill No: <strong>{billNo}</strong></span>
            <span>Date: <strong>{billDate.toLocaleDateString()} {billDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong></span>
          </div>
          <form onSubmit={addItem} className="item-form">
            <input
              name="name"
              placeholder="Item Name"
              value={form.name}
              onChange={handleChange}
              required
            />
            <input
              name="price"
              type="number"
              placeholder="Price (Rs)"
              value={form.price}
              onChange={handleChange}
              required
              min="0"
            />
            <input
              name="discount"
              type="number"
              placeholder="Discount (Rs)"
              value={form.discount}
              onChange={handleChange}
              min="0"
            />
            <input
              name="tax"
              type="number"
              placeholder="Tax (Rs)"
              value={form.tax}
              onChange={handleChange}
              min="0"
            />
            <input
              name="quantity"
              type="number"
              placeholder="Qty"
              value={form.quantity}
              onChange={handleChange}
              required
              min="1"
            />
            <button type="submit">Add Item</button>
          </form>
          {items.length > 0 && (
            <>
              <table className="bill-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Item</th>
                    <th>Price</th>
                    <th>Discount</th>
                    <th>Tax</th>
                    <th>Qty</th>
                    <th>Total</th>
                    <th>Remove</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr key={idx}>
                      <td>{idx + 1}</td>
                      <td>{item.name}</td>
                      <td>Rs.{item.price.toFixed(2)}</td>
                      <td>Rs.{item.discount.toFixed(2)}</td>
                      <td>Rs.{item.tax.toFixed(2)}</td>
                      <td>{item.quantity}</td>
                      <td>Rs.{(
                        item.price * item.quantity -
                        item.discount * item.quantity +
                        item.tax * item.quantity
                      ).toFixed(2)}</td>
                      <td>
                        <button className="remove-btn" title="Remove Item" onClick={() => removeItem(idx)}>&#128465;</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="summary">
                <div>Subtotal: Rs.{subtotal.toFixed(2)}</div>
                <div>Discount: Rs.{totalDiscount.toFixed(2)}</div>
                <div>Tax: Rs.{totalTax.toFixed(2)}</div>
                <div><strong>Total: Rs.{grandTotal.toFixed(2)}</strong></div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <input
                  type="tel"
                  placeholder="Customer WhatsApp Number (with country code)"
                  value={customerPhone}
                  onChange={e => setCustomerPhone(e.target.value)}
                  style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
                />
              </div>
              <div className="actions">
                <button className="print" onClick={printBill}>Print Bill</button>
                <button className="whatsapp" onClick={sendWhatsApp} disabled={!customerPhone}>Send via WhatsApp</button>
                <button className="clear" onClick={clearBill}>Clear Bill</button>
              </div>
            </>
          )}
          <div className="footer">
            Thank you for shopping with <b>DECODE</b>!<br />
            <span style={{ fontSize: '0.95rem', color: '#aaa' }}>Style. Comfort. Value.</span>
          </div>
        </div>
      )}
      {tab === 'reports' && (
        <div className="reports-app">
          <div className="reports-controls">
            <select value={reportType} onChange={e=>setReportType(e.target.value)}>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
            <input type="date" value={reportDate} onChange={e=>setReportDate(e.target.value)} style={{marginLeft:8}} />
          </div>
          <ReportsTable bills={bills} reportType={reportType} reportDate={reportDate} />
        </div>
      )}
    </>
  );
}

function ReportsTable({ bills, reportType, reportDate }) {
  // Parse selected date
  const selected = new Date(reportDate);
  let start, end;
  if (reportType === 'daily') {
    start = startOfDay(selected);
    end = new Date(start); end.setDate(end.getDate()+1);
  } else if (reportType === 'weekly') {
    start = startOfWeek(selected);
    end = new Date(start); end.setDate(end.getDate()+7);
  } else if (reportType === 'monthly') {
    start = startOfMonth(selected);
    end = new Date(start.getFullYear(), start.getMonth()+1, 1);
  } else if (reportType === 'yearly') {
    start = startOfYear(selected);
    end = new Date(start.getFullYear()+1, 0, 1);
  }
  // Filter bills by date
  const filtered = bills.filter(bill => {
    const d = new Date(bill.billDate);
    return d >= start && d < end;
  });
  const total = filtered.reduce((sum, bill) => sum + (bill.grandTotal || 0), 0);
  return (
    <div style={{marginTop:20}}>
      <h3 style={{marginBottom:8}}>Report: {reportType.charAt(0).toUpperCase()+reportType.slice(1)} ({filtered.length} bills)</h3>
      <table className="bill-table">
        <thead>
          <tr>
            <th>Bill No</th>
            <th>Date/Time</th>
            <th>Items</th>
            <th>Subtotal</th>
            <th>Discount</th>
            <th>Tax</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((bill, idx) => (
            <tr key={idx}>
              <td>{bill.billNo}</td>
              <td>{new Date(bill.billDate).toLocaleString()}</td>
              <td>{bill.items.map(i=>i.name+" x"+i.quantity).join(", ")}</td>
              <td>Rs.{bill.subtotal.toFixed(2)}</td>
              <td>Rs.{bill.totalDiscount.toFixed(2)}</td>
              <td>Rs.{bill.totalTax.toFixed(2)}</td>
              <td><b>Rs.{bill.grandTotal.toFixed(2)}</b></td>
            </tr>
          ))}
          {filtered.length===0 && <tr><td colSpan={7} style={{textAlign:'center'}}>No bills found.</td></tr>}
        </tbody>
      </table>
      <div style={{marginTop:10,fontWeight:700}}>Total: Rs.{total.toFixed(2)}</div>
    </div>
  );
}

export default App;
