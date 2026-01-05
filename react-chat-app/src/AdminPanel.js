import React, { useState } from 'react';

function AdminPanel({ baseUrl }) {
  const [webhookBase, setWebhookBase] = useState(baseUrl);
  const [adminToken, setAdminToken] = useState('');
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const triggerReindex = async () => {
    setStatus('');
    setIsLoading(true);
    try {
      const res = await fetch(`${webhookBase}/webhook/reindex-now`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(adminToken ? { 'X-Admin-Token': adminToken } : {})
        },
        body: JSON.stringify({ source: 'admin-panel' })
      });

      let message = res.ok ? 'Re-index triggered.' : `Failed: ${res.status} ${res.statusText}`;
      try {
        const data = await res.json();
        if (data?.message) {
          message = data.message;
        }
      } catch (parseErr) {
        // ignore JSON parse errors; fall back to status text
      }

      setStatus(message);
    } catch (error) {
      setStatus(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif', minHeight: '100vh', background: '#0f172a', color: '#e2e8f0' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '48px 24px' }}>
        <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>Admin Panel</h1>
        <p style={{ marginBottom: '24px', color: '#cbd5e1' }}>
          Hidden page for operators to trigger an immediate knowledge base re-index.
        </p>

        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <label style={{ fontWeight: 600 }}>
            Webhook base URL
            <input
              type="text"
              value={webhookBase}
              onChange={(e) => setWebhookBase(e.target.value)}
              style={{ width: '100%', marginTop: '6px', padding: '10px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#e2e8f0' }}
            />
          </label>

          <label style={{ fontWeight: 600 }}>
            Admin token header (X-Admin-Token)
            <input
              type="password"
              value={adminToken}
              onChange={(e) => setAdminToken(e.target.value)}
              placeholder="Optional, but recommended"
              style={{ width: '100%', marginTop: '6px', padding: '10px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#e2e8f0' }}
            />
          </label>

          <button
            onClick={triggerReindex}
            disabled={isLoading}
            style={{
              marginTop: '4px',
              padding: '12px 16px',
              borderRadius: '8px',
              border: 'none',
              background: isLoading ? '#475569' : '#22c55e',
              color: '#0b1727',
              fontWeight: 700,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'background 0.15s ease'
            }}
          >
            {isLoading ? 'Triggering…' : 'Re-index Knowledge Base'}
          </button>

          {status && (
            <div style={{ marginTop: '8px', padding: '10px 12px', background: '#0f172a', borderRadius: '8px', border: '1px solid #334155', color: '#cbd5e1' }}>
              {status}
            </div>
          )}

          <div style={{ fontSize: '13px', color: '#94a3b8' }}>
            Tip: lock this route behind VPN or basic auth in production and require the X-Admin-Token header.
          </div>
        </div>

        <div style={{ marginTop: '24px' }}>
          <a href="/" style={{ color: '#38bdf8', textDecoration: 'none' }}>← Back to chat</a>
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;






