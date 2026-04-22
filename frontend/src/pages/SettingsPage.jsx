import React, { useMemo, useState } from 'react';
import api from '../services/api';

const DEFAULT_MODULE_ORDER = 'dashboard,category-intelligence,supplier-intelligence,opportunity-intelligence,watchlist';

export default function SettingsPage() {
  const [moduleOrder, setModuleOrder] = useState(DEFAULT_MODULE_ORDER);
  const [autoPrioritizeHighMargin, setAutoPrioritizeHighMargin] = useState(true);
  const [showProfitSignals, setShowProfitSignals] = useState(true);
  const [message, setMessage] = useState('');

  const parsedModules = useMemo(
    () => moduleOrder.split(',').map((x) => x.trim()).filter(Boolean),
    [moduleOrder]
  );

  const save = async () => {
    setMessage('');
    try {
      await api.put('/settings', {
        moduleOrder: parsedModules,
        profitabilityPreferences: {
          autoPrioritizeHighMargin,
          showProfitSignals
        }
      });
      setMessage('Settings saved.');
    } catch (err) {
      setMessage(err?.response?.data?.message || 'Could not save settings right now.');
    }
  };

  return (
    <div className="card">
      <h1>Settings</h1>
      <p>Personalize module order and profitability defaults for cleaner demos.</p>
      <label htmlFor="moduleOrder">Module order (comma-separated)</label>
      <input
        id="moduleOrder"
        value={moduleOrder}
        onChange={(e) => setModuleOrder(e.target.value)}
      />

      <label>
        <input
          type="checkbox"
          checked={autoPrioritizeHighMargin}
          onChange={(e) => setAutoPrioritizeHighMargin(e.target.checked)}
        />
        Auto-prioritize high-margin opportunities
      </label>

      <label>
        <input
          type="checkbox"
          checked={showProfitSignals}
          onChange={(e) => setShowProfitSignals(e.target.checked)}
        />
        Show profitability indicators across pages
      </label>

      <p className="muted">Modules detected: {parsedModules.length || 0}</p>
      {message ? <p className="muted">{message}</p> : null}
      <button className="btn" onClick={save}>Save</button>
    </div>
  );
}
