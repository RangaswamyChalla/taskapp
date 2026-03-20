import React from 'react';
import { C } from '../../config/theme';

const Metrics = ({ metrics }) => {
  if (!metrics) return null;

  return (
    <div style={styles.metricsRow}>
      {[
        { val: metrics.loc, lbl: 'Lines of Code' },
        { val: metrics.files, lbl: 'Files Created' },
        { val: metrics.eps, lbl: 'API Endpoints' },
        { val: metrics.time, lbl: 'Gen Time' },
      ].map((m, i) => (
        <div key={i} style={styles.mc}>
          <div style={{
            fontFamily: "'Syne', sans-serif", fontSize: '1.8rem', fontWeight: 800,
            background: `linear-gradient(135deg,${C.accent},${C.accent2})`, WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent', marginBottom: 4
          }}>{m.val}</div>
          <div style={{ fontSize: '.6rem', textTransform: 'uppercase', letterSpacing: '.1em', color: C.textDim }}>{m.lbl}</div>
        </div>
      ))}
    </div>
  );
};

const styles = {
  metricsRow: {
    display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 28
  },
  mc: {
    background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: 18, textAlign: 'center'
  }
};

export default Metrics;
