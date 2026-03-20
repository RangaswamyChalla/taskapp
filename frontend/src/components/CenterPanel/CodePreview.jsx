import React from 'react';
import { C } from '../../config/theme';
import PreviewPanel from './PreviewPanel';

const CodePreview = ({ generatedCode, activeFile, setActiveFile, showOutput }) => {
  if (!showOutput || !generatedCode) return null;

  const fileLabels = {
    frontend: { icon: '⚛️', label: 'App.jsx', path: 'frontend/src/App.jsx' },
    backend: { icon: '⚡', label: 'server.js', path: 'backend/server.js' },
    database: { icon: '🗄️', label: 'schema.sql', path: 'database/schema.sql' },
    nginx: { icon: '🌐', label: 'nginx.conf', path: 'nginx/nginx.conf' },
    env: { icon: '🔑', label: '.env.example', path: '.env.example' },
  };

  const [showPreview, setShowPreview] = React.useState(true);

  return (
    <div style={styles.codeWorkspace}>
      <div style={{ display: 'flex', borderBottom: `1px solid ${C.border}`, overflowX: 'auto' }}>
        <div
          onClick={() => setShowPreview(true)}
          style={{
            padding: '11px 18px', fontSize: '.68rem', letterSpacing: '.05em', cursor: 'pointer',
            whiteSpace: 'nowrap', color: showPreview ? C.accent : C.textMuted,
            borderBottom: `2px solid ${showPreview ? C.accent : 'transparent'}`,
            transition: 'all .2s', display: 'flex', alignItems: 'center', gap: 6
          }}>
          🖥️ Preview
        </div>
        {['frontend', 'backend', 'database', 'nginx', 'env'].map((f) => (
          <div key={f} onClick={() => setShowPreview(false) || setActiveFile(f)}
            style={{
              padding: '11px 18px', fontSize: '.68rem', letterSpacing: '.05em', cursor: 'pointer',
              whiteSpace: 'nowrap', color: !showPreview && activeFile === f ? C.accent : C.textMuted,
              borderBottom: `2px solid ${!showPreview && activeFile === f ? C.accent : 'transparent'}`,
              transition: 'all .2s', display: 'flex', alignItems: 'center', gap: 6
            }}>
            {fileLabels[f].icon} {fileLabels[f].label}
          </div>
        ))}
      </div>

      {showPreview ? (
        <PreviewPanel generatedCode={generatedCode} showPreview={showPreview} />
      ) : (
        <div style={{ padding: 20, overflowX: 'auto', maxHeight: 400, overflowY: 'auto' }}>
          <pre style={{ fontSize: '.7rem', lineHeight: 1.85, margin: 0, color: C.textMuted, whiteSpace: 'pre-wrap' }}>
            {generatedCode[activeFile] || '// No content'}
          </pre>
        </div>
      )}
    </div>
  );
};

const styles = {
  codeWorkspace: {
    background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden', marginBottom: 28
  }
};

export default CodePreview;
