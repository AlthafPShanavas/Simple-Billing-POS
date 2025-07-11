import React, { useState, useRef, useEffect } from 'react';
import './App.css';
import './darkmode.css';
import SettingsModal from './SettingsModal';
import { registerShortcuts } from './shortcuts';

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

function getInitialBranding() {
  const saved = localStorage.getItem('decode_branding');
  return saved ? JSON.parse(saved) : {
    shopName: 'DECODE',
    address: 'Palace Road, Opposite Kohinoor Pump, Changanacherry',
    mobile: '9995545144',
    logo: '',
    footer: 'Thank you for shopping with DECODE!'
  };
}

function App() {
  const [branding, setBranding] = useState(getInitialBranding());
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('decode_darkmode') === '1');
  const [showSettings, setShowSettings] = useState(false);
  const itemNameRef = useRef(null);
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
      <div className={`header${darkMode ? ' dark-mode' : ''}`} style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:6,position:'relative'}}>

          <div style={{position:'absolute',top:10,right:18,display:'flex',gap:10}}>
            <button
              onClick={()=>setDarkMode(dm=>!dm)}
              title={darkMode?"Switch to Light Mode":"Switch to Dark Mode"}
              style={{fontSize:20,padding:'6px 14px',borderRadius:8,cursor:'pointer'}}
            >{darkMode ? '🌙' : '☀️'}</button>
            <button
              onClick={()=>setShowSettings(true)}
              title="Shop Settings"
              style={{fontSize:20,padding:'6px 14px',borderRadius:8,cursor:'pointer'}}
            >⚙️</button>
          </div>
        {branding.logo && <img src={branding.logo} alt="Logo" style={{height:48,marginBottom:4}} />}
        <span className="decode-title">{branding.shopName}</span>
        <div className="decode-desc">The clothing destination</div>
      </div>
      <nav className="main-nav">
        <ul>
          <li className={tab==='billing' ? 'active' : ''} onClick={()=>setTab('billing')}>
            <span role="img" aria-label="Billing">🧾</span> Billing
          </li>
          <li className={tab==='reports' ? 'active' : ''} onClick={()=>setTab('reports')}>
            <span role="img" aria-label="Reports">📊</span> Reports
          </li>
        </ul>
      </nav>
      <div className="app-centered-wrapper">
        {tab === 'billing' && (
          <div className="billing-app">
          <div className="bill-header-print">
            <div className="bill-title">BILL</div>
            {branding.logo && <img src={branding.logo} alt="Logo" style={{height:48,margin:'0 auto 4px auto',display:'block'}} />}
            <div className="shop-name">{branding.shopName}</div>
            <div className="shop-address">{branding.address}<br />Mob: {branding.mobile}</div>
            <hr className="bill-separator-print" />
          </div>
          <div className="no-print" style={{ width: '100%', marginBottom: 16, textAlign: 'center' }}>
            <div style={{ fontWeight: 700, fontSize: '1.12rem', color: '#3a7bd5', letterSpacing: 1 }}>{branding.shopName}</div>
            <div style={{ fontSize: '0.95rem', color: '#666' }}>{branding.address}<br />Mob: {branding.mobile}</div>
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
                    <th className="idx-col">#</th>
                    <th className="item-col">Item</th>
                    <th className="num-col">Price</th>
                    <th className="num-col">Discount</th>
                    <th className="num-col">Tax</th>
                    <th className="num-col">Qty</th>
                    <th className="num-col">Total</th>
                    <th className="no-print">Remove</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="idx-col">{idx + 1}</td>
                      <td className="item-col">{item.name}</td>
                      <td className="num-col">Rs.{item.price.toFixed(2)}</td>
                      <td className="num-col">Rs.{item.discount.toFixed(2)}</td>
                      <td className="num-col">Rs.{item.tax.toFixed(2)}</td>
                      <td className="num-col">{item.quantity}</td>
                      <td className="num-col">Rs.{(
                        item.price * item.quantity -
                        item.discount * item.quantity +
                        item.tax * item.quantity
                      ).toFixed(2)}</td>
                      <td className="no-print">
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
              <div className="bill-footer-print">Thank you for shopping with DECODE!</div>
              <div style={{ marginBottom: 12 }}>
                <input
                  type="tel"
                  placeholder="Customer WhatsApp Number (with country code)"
                  value={customerPhone}
                  onChange={e => setCustomerPhone(e.target.value)}
                  style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
                />
              </div>
              <div className="actions" style={{gap:24,marginTop:10}}>
                <button className={`print${darkMode ? ' dark-mode' : ''}`} onClick={printBill} style={{fontSize:18,padding:'14px 28px',borderRadius:10}}>Print Bill</button>
                <button className={`whatsapp${darkMode ? ' dark-mode' : ''}`} onClick={sendWhatsApp} disabled={!customerPhone} style={{fontSize:18,padding:'14px 28px',borderRadius:10}}>Send via WhatsApp</button>
                <button className={`clear${darkMode ? ' dark-mode' : ''}`} onClick={clearBill} style={{fontSize:18,padding:'14px 28px',borderRadius:10}}>Clear Bill</button>
              </div>

              <SettingsModal show={showSettings} onClose={()=>setShowSettings(false)} branding={branding} setBranding={setBranding} />
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
      </div>
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
