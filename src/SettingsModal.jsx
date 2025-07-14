import React, { useState } from 'react';

export default function SettingsModal({ show, onClose, branding, setBranding }) {
  const [localBranding, setLocalBranding] = useState(branding);

  const handleChange = e => {
    const { name, value } = e.target;
    setLocalBranding({ ...localBranding, [name]: value });
  };

  const handleLogoChange = e => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = ev => setLocalBranding({ ...localBranding, logo: ev.target.result });
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    setBranding(localBranding);
    localStorage.setItem('decode_branding', JSON.stringify(localBranding));
    onClose();
  };

  if (!show) return null;
  return (
    <div className="settings-modal-overlay">
      <div className="settings-modal">
        <h2>Shop Branding</h2>
        <label>Shop Name:
          <input name="shopName" value={localBranding.shopName} onChange={handleChange} autoFocus={false} />
        </label>
        <label>Address:
          <textarea name="address" value={localBranding.address} onChange={handleChange} autoFocus={false} />
        </label>
        <label>Mobile:
          <input name="mobile" value={localBranding.mobile} onChange={handleChange} autoFocus={false} />
        </label>
        <label>Logo:
          <input type="file" accept="image/*" onChange={handleLogoChange} />
          {localBranding.logo && <img src={localBranding.logo} alt="Logo" style={{height:50,marginTop:8}} />}
        </label>
        <label>Footer Note:
          <input name="footer" value={localBranding.footer} onChange={handleChange} autoFocus={false} />
        </label>
        <label>From Email (for sending bills):
          <input name="fromEmail" value={localBranding.fromEmail || ''} onChange={handleChange} placeholder="Enter sender email" autoFocus={false} />
        </label>
        <div className="settings-actions">
          <button onClick={handleSave}>Save</button>
          <button onClick={onClose} className="secondary">Cancel</button>
        </div>
      </div>
    </div>
  );
}
