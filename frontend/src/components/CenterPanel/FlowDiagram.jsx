import React from 'react';
import { C } from '../../config/theme';
import { AGENTS } from '../../config/agents';

const FlowDiagram = ({ flowNodes, agentStates }) => {
  return (
    <div style={styles.flowDiagram}>
      <div style={{ position: 'absolute', top: 16, right: 20, fontSize: '.58rem', letterSpacing: '.2em', color: C.textDim }}>
        AGENT PIPELINE
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 0, overflowX: 'auto', paddingBottom: 4 }}>
        {/* SRS Node */}
        <div style={{
          flexShrink: 0, background: C.surface2, border: `1px solid ${flowNodes[0] ? C.accent : C.border}`,
          borderRadius: 10, padding: '14px 18px', textAlign: 'center', transition: 'all .4s',
          boxShadow: flowNodes[0] ? `0 0 20px rgba(0,212,255,.12)` : 'none',
        }}>
          <div style={{ fontSize: '1.4rem', marginBottom: 6 }}>📄</div>
          <div style={{ fontSize: '.63rem', fontWeight: 600, color: C.textMuted }}>SRS Input</div>
          <div style={{ fontSize: '.55rem', color: C.textDim, marginTop: 2 }}>Requirements</div>
        </div>
        <div style={{ width: 32, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          <div style={{ height: 1, width: '100%', background: `linear-gradient(90deg,${C.border},${C.accent2},${C.border})` }} />
          <span style={{ position: 'absolute', right: 2, fontSize: '.5rem', color: C.accent2 }}>▸</span>
        </div>

        {/* Agent Nodes */}
        {AGENTS.map((agent, i) => (
          <React.Fragment key={agent.id}>
            <div style={{
              flexShrink: 0, background: C.surface2, border: `1px solid ${flowNodes[i + 1] ? agent.color : C.border}`,
              borderRadius: 10, padding: '14px 18px', textAlign: 'center', transition: 'all .4s', minWidth: 110,
              boxShadow: flowNodes[i + 1] ? `0 0 20px ${agent.color}33` : 'none',
              transform: flowNodes[i + 1] ? 'translateY(-3px)' : 'none',
            }}>
              <div style={{ fontSize: '1.4rem', marginBottom: 6 }}>{agent.icon}</div>
              <div style={{ fontSize: '.63rem', fontWeight: 600, color: C.textMuted }}>{agent.name}</div>
              <div style={{ fontSize: '.55rem', color: C.textDim, marginTop: 2 }}>{agent.sub}</div>
            </div>
            {i < 4 && (
              <div style={{ width: 32, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                <div style={{
                  height: 1, width: '100%', background: flowNodes[i + 1] ? `linear-gradient(90deg,${C.accent3},${C.accent})` : `linear-gradient(90deg,${C.border},${C.accent2},${C.border})`,
                  transition: 'all 1s',
                }} />
                <span style={{ position: 'absolute', right: 2, fontSize: '.5rem', color: C.accent2 }}>▸</span>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

const styles = {
  flowDiagram: {
    background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 28, marginBottom: 28, position: 'relative', overflow: 'hidden'
  }
};

export default FlowDiagram;
