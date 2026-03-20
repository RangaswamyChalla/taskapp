import React from 'react';
import { C } from '../../config/theme';

const CommsPanel = ({ messages, msgCount }) => {
  return (
    <div style={styles.commsPanel}>
      <div style={{ ...styles.panelHead, borderBottom: `1px solid ${C.border}` }}>
        <span style={{ fontSize: '.68rem', letterSpacing: '.1em', textTransform: 'uppercase', color: C.textMuted, display: 'flex', alignItems: 'center', gap: 8 }}>
          💬 Agent Inter-Communication
        </span>
        <span style={{ fontSize: '.62rem', color: C.textDim }}>{msgCount} messages</span>
      </div>
      <div style={styles.commsBody}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: C.textDim, fontSize: '.7rem' }}>
            Agent communications will appear here during pipeline execution
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, animation: 'fadeUp .3s ease' }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '.75rem', fontWeight: 700, background: `${m.color}22`, color: m.color, border: `1px solid ${m.color}33`
            }}>
              {m.from.slice(0, 2)}
            </div>
            <div style={{ flex: 1, background: C.surface2, border: `1px solid ${C.border}22`, borderRadius: '0 10px 10px 10px', padding: '10px 14px' }}>
              <div style={{ fontSize: '.6rem', letterSpacing: '.08em', textTransform: 'uppercase', fontWeight: 600, color: m.color, marginBottom: 4 }}>
                {m.from}{m.to ? ` → ${m.to}` : ''}
              </div>
              <div style={{ fontSize: '.7rem', color: C.textMuted, lineHeight: 1.7 }} dangerouslySetInnerHTML={{ __html: m.msg }} />
              <div style={{ fontSize: '.58rem', color: C.textDim, marginTop: 4 }}>{m.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  commsPanel: {
    background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, marginBottom: 28, overflow: 'hidden'
  },
  commsBody: {
    padding: 16, maxHeight: 300, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10
  },
  panelHead: {
    padding: '14px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    background: 'rgba(255,255,255,.015)', flexShrink: 0
  }
};

export default CommsPanel;
