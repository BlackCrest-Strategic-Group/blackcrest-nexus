import React, { useState } from 'react';
import api from '../services/api';

export default function SettingsPage() {
  const [moduleOrder, setModuleOrder] = useState('dashboard,category-intelligence,supplier-intelligence,opportunity-intelligence,watchlist');
  const save = async () => {
    await api.put('/settings', { moduleOrder: moduleOrder.split(',').map((x) => x.trim()) });
    alert('Settings saved');
  };
  return <div className="card"><h1>Settings</h1><p>Personalize module order.</p><input value={moduleOrder} onChange={(e)=>setModuleOrder(e.target.value)} /><button className="btn" onClick={save}>Save</button></div>;
}
