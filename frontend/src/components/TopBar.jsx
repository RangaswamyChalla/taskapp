import React from 'react';
import { C } from '../config/theme';

const TopBar = ({ activeTab, setActiveTab, setShowOutput }) => {
  return (
    <div style={styles.topbar}>
      <div style={styles.logo}>
        <div style={styles.logoMark}>AI</div>
        <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '.95rem' }}>
          AIDEN <span style={{ color: C.textMuted, fontWeight: 400 }}>v2 / Multi-Agent Code Synthesis</span>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 4 }}>
        {['pipeline', 'agents', 'output'].map(tab => (
          <div key={tab} onClick={() => { setActiveTab(tab); if (tab === 'output') setShowOutput(true); }}
            style={{
              fontSize: '.68rem', letterSpacing: '.08em', textTransform: 'uppercase', padding: '6px 16px',
              borderRadius: 6, cursor: 'pointer', color: activeTab === tab ? C.accent : C.textMuted,
              background: activeTab === tab ? 'rgba(0,212,255,.06)' : 'transparent',
              border: `1px solid ${activeTab === tab ? 'rgba(0,212,255,.15)' : 'transparent'}`,
              transition: 'all .2s',
            }}>
            {tab}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6, fontSize: '.65rem', letterSpacing: '.08em',
          padding: '5px 12px', borderRadius: 20, background: 'rgba(16,185,129,.08)',
          border: `1px solid rgba(16,185,129,.2)`, color: C.accent3
        }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.accent3, animation: 'blink 2s infinite' }} />
          5 Agents Ready
        </div>
      </div>
    </div>
  );
};

const styles = {
  topbar: {
    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, height: 56,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 32px', background: 'rgba(6,8,16,.85)', backdropFilter: 'blur(20px)',
    borderBottom: `1px solid ${C.border}`
  },
  logo: { display: 'flex', alignItems: 'center', gap: 12 },
  logoMark: {
    width: 32, height: 32, borderRadius: 8,
    background: `linear-gradient(135deg,${C.accent},${C.accent2})`,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '.85rem', fontWeight: 800, color: '#000', fontFamily: "'Syne', sans-serif"
  }
};

export default TopBar;
