import React from 'react';
import { C } from '../../config/theme';
import { TEMPLATES } from '../../config/templates';

const SRSInput = ({ srs, setSrs, apiKey, setApiKey }) => {
  return (
    <div>
      <div style={{ padding: 16, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
          {Object.keys(TEMPLATES).map(k => (
            <div key={k} onClick={() => setSrs(TEMPLATES[k])}
              style={{
                ...styles.chip,
                cursor: 'pointer',
                borderColor: srs === TEMPLATES[k] ? C.accent : C.border,
                color: srs === TEMPLATES[k] ? C.accent : C.textMuted
              }}>
              {k === 'todo' ? 'Task App' : k === 'ecom' ? 'E-Commerce' : k === 'blog' ? 'Blog CMS' : 'Auth SVC'}
            </div>
          ))}
        </div>
        <input
          type="password"
          value={apiKey}
          onChange={e => setApiKey(e.target.value)}
          placeholder="Anthropic API Key"
          style={styles.input}
        />
        <textarea
          value={srs}
          onChange={e => setSrs(e.target.value)}
          placeholder="Paste your SRS document..."
          style={{ ...styles.textarea, minHeight: 180, background: 'transparent' }}
        />
      </div>
    </div>
  );
};

const ConfigPanel = () => {
  const configs = [
    { label: 'Frontend', on: true },
    { label: 'Backend API', on: true },
    { label: 'DB Schema', on: true },
    { label: 'Nginx', on: true },
  ];

  return (
    <div style={{ padding: 16 }}>
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
  chip: {
    fontSize: '.62rem', letterSpacing: '.06em', padding: '4px 10px', borderRadius: 20,
    border: `1px solid ${C.border}`, color: C.textMuted, cursor: 'pointer', transition: 'all .2s',
    background: C.surface2, margin: '3px'
  },
  input: {
    width: '100%', background: C.surface2, border: `1px solid ${C.border}`, color: C.text,
    fontFamily: "'JetBrains Mono', monospace", fontSize: '.65rem', padding: '6px 10px',
    borderRadius: 6, outline: 'none', marginBottom: 8
  },
  textarea: {
    width: '100%', minHeight: 200, background: 'transparent', border: 'none', outline: 'none',
    color: C.text, fontFamily: "'JetBrains Mono', monospace", fontSize: '.72rem',
    lineHeight: 1.8, resize: 'none', padding: 4
  }
};

export { SRSInput, ConfigPanel };
export default SRSInput;
