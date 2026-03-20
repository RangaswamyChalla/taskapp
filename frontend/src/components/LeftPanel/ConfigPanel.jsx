import React from 'react';
import { C } from '../../config/theme';

const ConfigPanel = () => {
  const configs = [
    { label: 'Frontend', on: true },
    { label: 'Backend API', on: true },
    { label: 'DB Schema', on: true },
    { label: 'Docker', on: true },
  ];

  return (
    <div style={styles.panelBody}>
      <div style={{ fontSize: '.63rem', color: C.textDim, marginBottom: 10, letterSpacing: '.08em' }}>CONFIGURATION</div>
      {configs.map((c, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '.7rem', marginBottom: 8 }}>
          <span style={{ color: C.textMuted }}>{c.label}</span>
          <div style={{ width: 28, height: 16, background: c.on ? C.accent : C.border, borderRadius: 8, position: 'relative', cursor: 'pointer' }}>
            <div style={{ position: 'absolute', top: 2, left: c.on ? 12 : 2, width: 12, height: 12, borderRadius: '50%', background: '#fff', transition: '.2s' }} />
          </div>
        </div>
      ))}
    </div>
  );
};

const styles = {
  panelBody: {
    flex: 1, overflowY: 'auto', padding: 16
  }
};

export default ConfigPanel;
