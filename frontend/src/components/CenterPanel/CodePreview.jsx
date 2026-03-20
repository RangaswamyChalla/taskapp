import React from 'react';
import { C } from '../../config/theme';

const CodePreview = ({ generatedCode, activeFile, setActiveFile, showOutput }) => {
  if (!showOutput || !generatedCode) return null;

  const fileLabels = {
    frontend: { icon: '⚛️', label: 'App.jsx', path: 'frontend/src/App.jsx' },
    backend: { icon: '⚡', label: 'server.js', path: 'backend/server.js' },
    database: { icon: '🗄️', label: 'schema.sql', path: 'database/schema.sql' },
    docker: { icon: '🐳', label: 'docker-compose.yml', path: 'docker-compose.yml' },
    env: { icon: '🔑', label: '.env.example', path: '.env.example' },
  };

  return (
    <div style={styles.codeWorkspace}>
      <div style={{ display: 'flex', borderBottom: `1px solid ${C.border}`, overflowX: 'auto' }}>
        {['frontend', 'backend', 'database', 'docker', 'env'].map((f) => (
          <div key={f} onClick={() => setActiveFile(f)}
            style={{
              padding: '11px 18px', fontSize: '.68rem', letterSpacing: '.05em', cursor: 'pointer',
              whiteSpace: 'nowrap', color: activeFile === f ? C.accent : C.textMuted,
              borderBottom: `2px solid ${activeFile === f ? C.accent : 'transparent'}`,
              transition: 'all .2s', display: 'flex', alignItems: 'center', gap: 6
            }}>
            {fileLabels[f].icon} {fileLabels[f].label}
          </div>
        ))}
      </div>
      <div style={{ padding: 20, overflowX: 'auto', maxHeight: 400, overflowY: 'auto' }}>
        <pre style={{ fontSize: '.7rem', lineHeight: 1.85, margin: 0, color: C.textMuted, whiteSpace: 'pre-wrap' }}>
          {generatedCode[activeFile] || '// No content'}
        </pre>
      </div>
    </div>
  );
};

const styles = {
  codeWorkspace: {
    background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden', marginBottom: 28
  }
};

export default CodePreview;
