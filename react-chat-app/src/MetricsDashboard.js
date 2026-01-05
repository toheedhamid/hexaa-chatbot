import React, { useEffect, useState } from 'react';

// Simple dashboard that either embeds a published Google Sheet or renders a chart
// from a JSON endpoint (e.g., a Google Sheets "published as CSV/JSON" URL).
function MetricsDashboard() {
  const sheetEmbedUrl = process.env.REACT_APP_METRICS_SHEET_EMBED || '';
  const metricsJsonUrl = process.env.REACT_APP_METRICS_JSON_URL || '';

  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadMetrics = async () => {
      if (!metricsJsonUrl) return;
      setIsLoading(true);
      setError('');
      try {
        const res = await fetch(metricsJsonUrl);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setRows(data);
      } catch (err) {
        setError(`Failed to load metrics: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };
    loadMetrics();
  }, [metricsJsonUrl]);

  const totals = rows.reduce(
    (acc, row) => {
      acc.total += 1;
      if (row.was_escalated) acc.escalated += 1;
      if (row.feedback_sentiment === 'positive') acc.positive += 1;
      if (row.feedback_sentiment === 'negative') acc.negative += 1;
      return acc;
    },
    { total: 0, escalated: 0, positive: 0, negative: 0 }
  );

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: '#e2e8f0', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '48px 20px' }}>
        <header style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontSize: '30px', margin: 0 }}>Analytics Dashboard</h1>
            <p style={{ margin: '6px 0', color: '#cbd5e1' }}>Visualize chatbot metrics coming from the Google Sheet log.</p>
          </div>
          <a href="/" style={{ color: '#38bdf8', textDecoration: 'none', fontWeight: 600 }}>← Back to chat</a>
        </header>

        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginBottom: '20px' }}>
          <MetricCard label="Total events" value={totals.total} />
          <MetricCard label="Escalated" value={totals.escalated} />
          <MetricCard label="Positive feedback" value={totals.positive} />
          <MetricCard label="Negative feedback" value={totals.negative} />
        </section>

        {sheetEmbedUrl ? (
          <div style={{ background: '#0b1221', border: '1px solid #1f2a44', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 12px 30px rgba(0,0,0,0.35)' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #1f2a44', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong>Google Sheet (live)</strong>
              <span style={{ color: '#94a3b8', fontSize: '13px' }}>Embed provided via REACT_APP_METRICS_SHEET_EMBED</span>
            </div>
            <iframe
              title="metrics-sheet"
              src={sheetEmbedUrl}
              style={{ width: '100%', height: '520px', border: 'none' }}
              loading="lazy"
            />
          </div>
        ) : (
          <div style={{ background: '#0b1221', border: '1px solid #1f2a44', borderRadius: '12px', padding: '16px' }}>
            <p style={{ color: '#cbd5e1' }}>
              Set <code style={{ background: '#1f2a44', padding: '2px 6px', borderRadius: '4px' }}>REACT_APP_METRICS_SHEET_EMBED</code> with a published Google Sheet embed URL to view live data here.
            </p>
          </div>
        )}

        {metricsJsonUrl ? (
          <div style={{ marginTop: '20px', background: '#0b1221', border: '1px solid #1f2a44', borderRadius: '12px', padding: '16px' }}>
            <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong>Recent events</strong>
              {isLoading && <span style={{ color: '#94a3b8', fontSize: '13px' }}>Loading…</span>}
              {error && <span style={{ color: '#f87171', fontSize: '13px' }}>{error}</span>}
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                  <tr style={{ textAlign: 'left', background: '#11182b' }}>
                    <Th>timestamp</Th>
                    <Th>conversation_id</Th>
                    <Th>intent</Th>
                    <Th>was_escalated</Th>
                    <Th>feedback_sentiment</Th>
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(0, 50).map((row, idx) => (
                    <tr key={idx} style={{ borderTop: '1px solid #1f2a44' }}>
                      <Td>{row.timestamp}</Td>
                      <Td>{row.conversation_id}</Td>
                      <Td>{row.intent}</Td>
                      <Td>{String(row.was_escalated)}</Td>
                      <Td>{row.feedback_sentiment || '-'}</Td>
                    </tr>
                  ))}
                  {rows.length === 0 && (
                    <tr>
                      <Td colSpan="5" style={{ textAlign: 'center', color: '#94a3b8' }}>
                        {isLoading ? 'Loading…' : 'No data yet'}
                      </Td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function MetricCard({ label, value }) {
  return (
    <div style={{ background: '#0b1221', border: '1px solid #1f2a44', borderRadius: '12px', padding: '16px', boxShadow: '0 12px 30px rgba(0,0,0,0.25)' }}>
      <div style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '6px' }}>{label}</div>
      <div style={{ fontSize: '28px', fontWeight: 700 }}>{value}</div>
    </div>
  );
}

function Th({ children }) {
  return (
    <th style={{ padding: '10px 8px', borderBottom: '1px solid #1f2a44', color: '#cbd5e1', fontWeight: 600 }}>
      {children}
    </th>
  );
}

function Td({ children, colSpan }) {
  return (
    <td colSpan={colSpan} style={{ padding: '8px', color: '#e2e8f0' }}>
      {children}
    </td>
  );
}

export default MetricsDashboard;






