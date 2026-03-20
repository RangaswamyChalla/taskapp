import React from 'react';
import { C } from '../../config/theme';
import { AGENTS } from '../../config/agents';

const AgentStatus = ({ agentStates }) => {
  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
      {AGENTS.map((agent) => {
        const state = agentStates[agent.id];
        return (
          <div key={agent.id} style={{
            ...styles.agentCard, margin: '4px 8px',
            borderColor: state.state === 'running' ? agent.color : state.state === 'done' ? C.accent3 : C.border,
            boxShadow: state.state === 'running' ? `0 0 20px ${agent.color}33` : 'none',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ fontSize: '.72rem', fontWeight: 600, color: agent.color, display: 'flex', alignItems: 'center', gap: 6 }}>
                {agent.icon} {agent.name}
              </div>
              <div style={{
                fontSize: '.6rem', letterSpacing: '.08em', padding: '2px 8px', borderRadius: 4,
                background: state.state === 'running' ? `${agent.color}22` : state.state === 'done' ? 'rgba(16,185,129,.1)' : 'rgba(255,255,255,.04)',
                color: state.state === 'running' ? agent.color : state.state === 'done' ? C.accent3 : C.textDim
              }}>
                {state.state === 'running' ? 'Running' : state.state === 'done' ? 'Done' : 'Idle'}
              </div>
            </div>
            <div style={{ fontSize: '.63rem', color: C.textDim, lineHeight: 1.6 }}>{agent.sub}</div>
            {state.thought && (
              <div style={{ fontSize: '.62rem', color: C.textDim, fontStyle: 'italic', marginTop: 6 }}>{state.thought}</div>
            )}
            <div style={{ height: 2, background: C.border, borderRadius: 1, marginTop: 10, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${state.progress}%`, borderRadius: 1, transition: 'width .5s ease', background: agent.color }} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

const styles = {
  agentCard: {
    border: `1px solid ${C.border}`, borderRadius: 10, padding: 14, transition: 'all .3s', background: C.surface, margin: '8px 12px'
  }
};

export default AgentStatus;
