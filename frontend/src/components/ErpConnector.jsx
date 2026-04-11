import React, { useState, useEffect } from "react";
import { erpApi } from "../utils/api.js";

const ERP_SYSTEMS = [
  { id: "infor_syteline", label: "Infor SyteLine" },
  { id: "oracle", label: "Oracle ERP Cloud" },
  { id: "sap", label: "SAP S/4HANA" }
];

function formatExpiry(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = d - now;
  if (diffMs <= 0) return "Expired";
  const diffH = Math.floor(diffMs / 3600000);
  const diffM = Math.floor((diffMs % 3600000) / 60000);
  if (diffH >= 24) return `Expires ${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  if (diffH > 0) return `Expires in ${diffH}h ${diffM}m`;
  return `Expires in ${diffM}m`;
}

function ConnectionBadge({ status }) {
  if (!status || status === "disconnected") return null;
  const map = {
    connected:  "bg-emerald-100 text-emerald-700",
    expired:    "bg-amber-100 text-amber-700",
    locked:     "bg-red-100 text-red-700",
    error:      "bg-red-100 text-red-700"
  };
  const labels = {
    connected:  "Connected",
    expired:    "Token Expired",
    locked:     "Locked",
    error:      "Error"
  };
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${map[status] ?? "bg-slate-100 text-slate-600"}`}>
      {labels[status] ?? status}
    </span>
  );
}

// ── Add Connection Form ──────────────────────────────────────────────────────

function AddErpForm({ onAdd, onCancel }) {
  const [form, setForm] = useState({
    system: "infor_syteline",
    label: "",
    tenantUrl: "",
    tokenUrl: "",
    clientId: "",
    scope: "",
    erpUsername: "",
    erpPassword: ""
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await erpApi.create(form);
      onAdd(res.data.config);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to add ERP connection.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white p-6 space-y-5">
      <div>
        <h3 className="font-semibold text-slate-800">Add ERP Connection</h3>
        <p className="text-xs text-slate-500 mt-1">
          Your ERP credentials are used once to obtain a secure session token and are never stored.
        </p>
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">ERP System *</label>
          <select value={form.system} onChange={set("system")} className="input w-full">
            {ERP_SYSTEMS.map((s) => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Label</label>
          <input value={form.label} onChange={set("label")} placeholder="e.g. Production" className="input w-full" />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-slate-600 mb-1">Tenant URL *</label>
          <input
            value={form.tenantUrl}
            onChange={set("tenantUrl")}
            required
            placeholder="https://your-tenant.example.com"
            className="input w-full"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-slate-600 mb-1">OAuth 2.0 Token URL *</label>
          <input
            value={form.tokenUrl}
            onChange={set("tokenUrl")}
            required
            placeholder="https://auth.example.com/oauth/token"
            className="input w-full"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Client ID <span className="text-slate-400 font-normal">(if required by your ERP)</span>
          </label>
          <input value={form.clientId} onChange={set("clientId")} placeholder="Optional" className="input w-full" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Scope <span className="text-slate-400 font-normal">(optional)</span>
          </label>
          <input value={form.scope} onChange={set("scope")} placeholder="e.g. openid profile" className="input w-full" />
        </div>
      </div>

      <div className="rounded-lg border border-blue-100 bg-blue-50 p-4 space-y-3">
        <p className="text-xs font-semibold text-blue-800 uppercase tracking-wide">Your ERP Login</p>
        <p className="text-xs text-blue-700">
          Enter your ERP account credentials below. They are transmitted securely to your ERP's
          authentication server to obtain a session token, then immediately discarded — they are
          never saved to this application's database.
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">ERP Username *</label>
            <input
              value={form.erpUsername}
              onChange={set("erpUsername")}
              required
              autoComplete="username"
              placeholder="your.erp.username"
              className="input w-full"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">ERP Password *</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={form.erpPassword}
                onChange={set("erpPassword")}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="input w-full pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3 justify-end">
        <button type="button" onClick={onCancel} className="btn-secondary text-sm">Cancel</button>
        <button type="submit" disabled={saving} className="btn-primary text-sm">
          {saving ? "Connecting…" : "Connect ERP"}
        </button>
      </div>
    </form>
  );
}

// ── Reconnect Form ────────────────────────────────────────────────────────────

function ReconnectForm({ config, onDone, onCancel }) {
  const [form, setForm] = useState({ erpUsername: "", erpPassword: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const sysLabel = ERP_SYSTEMS.find((s) => s.id === config.system)?.label ?? config.system;

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await erpApi.reconnect(config.id, form);
      onDone(res.data.config);
    } catch (err) {
      setError(err.response?.data?.error || "Reconnect failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-amber-200 bg-amber-50 p-5 space-y-4">
      <div>
        <p className="font-semibold text-slate-800">Reconnect: {config.label || sysLabel}</p>
        <p className="text-xs text-slate-500 mt-1">
          Your session token expired. Re-enter your ERP credentials to get a fresh token.
          Credentials are never stored.
        </p>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">ERP Username *</label>
          <input
            value={form.erpUsername}
            onChange={set("erpUsername")}
            required
            autoComplete="username"
            placeholder="your.erp.username"
            className="input w-full"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">ERP Password *</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={form.erpPassword}
              onChange={set("erpPassword")}
              required
              autoComplete="current-password"
              placeholder="••••••••"
              className="input w-full pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-3 justify-end">
        <button type="button" onClick={onCancel} className="btn-secondary text-sm">Cancel</button>
        <button type="submit" disabled={saving} className="btn-primary text-sm">
          {saving ? "Reconnecting…" : "Reconnect"}
        </button>
      </div>
    </form>
  );
}

// ── ERP Connection Card ───────────────────────────────────────────────────────

function ErpCard({ config, onDelete, onTest, onReconnect }) {
  const sysLabel  = ERP_SYSTEMS.find((s) => s.id === config.system)?.label ?? config.system;
  const isExpired = config.connectionStatus === "expired";
  const isLocked  = config.connectionStatus === "locked";
  const needsReconnect = isExpired || isLocked;
  const expiryLabel = formatExpiry(config.tokenExpiresAt);

  const borderColor = isLocked ? "border-red-200" : isExpired ? "border-amber-200" : "border-slate-200";

  return (
    <div className={`rounded-xl border bg-white p-5 shadow-sm space-y-3 ${borderColor}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-slate-800">{config.label || sysLabel}</p>
          <p className="text-xs text-slate-500">{sysLabel} · {config.tenantUrl}</p>
        </div>
        <ConnectionBadge status={config.connectionStatus} />
      </div>

      {isLocked && (
        <div className="rounded-lg bg-red-50 border border-red-100 px-3 py-2 space-y-1">
          <p className="text-xs font-medium text-red-700">
            Temporarily locked after too many failed attempts (NIST AC-7).
          </p>
          {config.failedAuthLockedUntil && (
            <p className="text-xs text-red-600">
              Unlocks at {new Date(config.failedAuthLockedUntil).toLocaleTimeString()}.
            </p>
          )}
        </div>
      )}

      {isExpired && !isLocked && (
        <p className="text-xs text-amber-600 font-medium">
          Session token expired — reconnect to restore access.
        </p>
      )}

      {!needsReconnect && expiryLabel && (
        <p className="text-xs text-slate-400">{expiryLabel}</p>
      )}

      {config.lastTestMessage && !needsReconnect && (
        <p className="text-xs text-slate-500 italic">{config.lastTestMessage}</p>
      )}

      <div className="flex flex-wrap gap-2 pt-1">
        {needsReconnect ? (
          <button
            onClick={() => onReconnect(config)}
            disabled={isLocked}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
              isLocked
                ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                : "bg-amber-500 text-white hover:bg-amber-600"
            }`}
          >
            {isLocked ? "Locked" : "Reconnect"}
          </button>
        ) : (
          <button onClick={() => onTest(config.id)} className="btn-secondary text-xs px-3 py-1.5">
            Test Connection
          </button>
        )}
        <button
          onClick={() => onDelete(config.id)}
          className="text-xs px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
        >
          Remove
        </button>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function ErpConnector() {
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [reconnectConfig, setReconnectConfig] = useState(null);
  const [testingId, setTestingId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    erpApi.list()
      .then((res) => setConfigs(res.data.configs || []))
      .catch(() => setError("Failed to load ERP configurations."))
      .finally(() => setLoading(false));
  }, []);

  const handleAdd = (config) => {
    setConfigs((c) => [config, ...c]);
    setShowAdd(false);
  };

  const handleDelete = async (id) => {
    try {
      await erpApi.remove(id);
      setConfigs((c) => c.filter((cfg) => cfg.id !== id));
    } catch {
      setError("Failed to remove ERP configuration.");
    }
  };

  const handleTest = async (id) => {
    setTestingId(id);
    setError("");
    try {
      const res = await erpApi.test(id);
      setConfigs((c) =>
        c.map((cfg) =>
          cfg.id === id
            ? { ...cfg, lastTestStatus: "ok", lastTestMessage: res.data.message, connectionStatus: "connected" }
            : cfg
        )
      );
    } catch (err) {
      const data = err.response?.data;
      if (data?.tokenExpired) {
        setConfigs((c) =>
          c.map((cfg) => cfg.id === id ? { ...cfg, connectionStatus: "expired" } : cfg)
        );
      } else {
        const msg = data?.error || "Connection test failed.";
        setConfigs((c) =>
          c.map((cfg) =>
            cfg.id === id ? { ...cfg, lastTestStatus: "error", lastTestMessage: msg } : cfg
          )
        );
      }
    } finally {
      setTestingId(null);
    }
  };

  const handleReconnectDone = (updatedConfig) => {
    setConfigs((c) => c.map((cfg) => cfg.id === updatedConfig.id ? updatedConfig : cfg));
    setReconnectConfig(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-800">ERP Connections</h2>
          <p className="text-sm text-slate-500">
            Authenticate with your ERP system to get a secure session token — credentials are never stored
          </p>
        </div>
        {!showAdd && (
          <button onClick={() => setShowAdd(true)} className="btn-primary text-sm">
            + Add Connection
          </button>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {testingId && <p className="text-sm text-blue-600">Testing connection…</p>}

      {showAdd && (
        <AddErpForm onAdd={handleAdd} onCancel={() => setShowAdd(false)} />
      )}

      {reconnectConfig && (
        <ReconnectForm
          config={reconnectConfig}
          onDone={handleReconnectDone}
          onCancel={() => setReconnectConfig(null)}
        />
      )}

      {loading ? (
        <p className="text-sm text-slate-500 py-8 text-center">Loading…</p>
      ) : configs.length === 0 && !showAdd ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
          <p className="text-slate-500 text-sm">No ERP connections configured yet.</p>
          <button onClick={() => setShowAdd(true)} className="mt-3 btn-secondary text-sm">
            Add your first connection
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {configs.map((cfg) => (
            <ErpCard
              key={cfg.id}
              config={cfg}
              onDelete={handleDelete}
              onTest={handleTest}
              onReconnect={setReconnectConfig}
            />
          ))}
        </div>
      )}
    </div>
  );
}
