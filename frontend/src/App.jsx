import React, { useState } from 'react';
import { C } from './config/theme';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { PipelineProvider, usePipeline } from './contexts/PipelineContext';
import { useTasks } from './hooks/useTasks';
import TopBar from './components/TopBar';
import SRSInput from './components/LeftPanel/SRSInput';
import ConfigPanel from './components/LeftPanel/ConfigPanel';
import FlowDiagram from './components/CenterPanel/FlowDiagram';
import CommsPanel from './components/CenterPanel/CommsPanel';
import Metrics from './components/CenterPanel/Metrics';
import CodePreview from './components/CenterPanel/CodePreview';
import AgentStatus from './components/RightPanel/AgentStatus';
import TaskList from './components/TaskManager/TaskList';

const styles = {
  app: {
    background: C.bg, color: C.text, minHeight: '100vh', fontFamily: "'JetBrains Mono', monospace", position: 'relative'
  },
  gridBg: {
    position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
    backgroundImage: `linear-gradient(rgba(0,212,255,.025) 1px,transparent 1px), linear-gradient(90deg,rgba(0,212,255,.025) 1px,transparent 1px)`,
    backgroundSize: '48px 48px',
  },
  orb1: {
    position: 'fixed', pointerEvents: 'none', zIndex: 0, borderRadius: '50%', width: 800, height: 800,
    top: -300, right: -200, background: 'radial-gradient(circle,rgba(0,212,255,.04) 0%,transparent 65%)'
  },
  orb2: {
    position: 'fixed', pointerEvents: 'none', zIndex: 0, borderRadius: '50%', width: 600, height: 600,
    bottom: -200, left: -150, background: 'radial-gradient(circle,rgba(124,58,237,.04) 0%,transparent 65%)'
  },
  workspace: {
    display: 'grid', gridTemplateColumns: '340px 1fr 340px', minHeight: '100vh', paddingTop: 56, position: 'relative', zIndex: 5
  },
  leftPanel: {
    borderRight: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column',
    height: 'calc(100vh - 56px)', position: 'sticky', top: 56, overflow: 'hidden'
  },
  rightPanel: {
    borderLeft: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column',
    height: 'calc(100vh - 56px)', position: 'sticky', top: 56, overflow: 'hidden'
  },
  mainContent: { overflowY: 'auto', padding: 32 },
  panelHead: {
    padding: '14px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex',
    alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,.015)', flexShrink: 0
  },
  launchBtn: {
    margin: 16, padding: 14,
    background: `linear-gradient(135deg,rgba(0,212,255,.1),rgba(124,58,237,.1))`,
    border: '1px solid rgba(0,212,255,.25)', borderRadius: 10, color: C.accent,
    fontFamily: "'JetBrains Mono', monospace", fontSize: '.78rem', fontWeight: 600,
    letterSpacing: '.1em', cursor: 'pointer', transition: 'all .3s',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10
  },
};

function AppContent() {
  const [srs, setSrs] = useState('');
  const [apiKey, setApiKey] = useState(localStorage.getItem('aiden_api_key') || '');
  const [activeTab, setActiveTab] = useState('pipeline');
  const [showOutput, setShowOutput] = useState(false);

  const { user, login } = useAuth();
  const { pipelineActive, agentStates, flowNodes, messages, msgCount, generatedCode, metrics, activeFile, setActiveFile, launchPipeline } = usePipeline();
  const { tasks, filter, setFilter, createTask, updateTask, deleteTask } = useTasks(user);

  const handleLaunch = () => launchPipeline(srs, apiKey);

  return (
    <div style={styles.app}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@300;400;500;600&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
        @keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: .3; } }
        @keyframes rot { to { transform: rotate(360deg); } }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #30363d; border-radius: 2px; }
      `}</style>

      <div style={styles.gridBg} />
      <div style={styles.orb1} />
      <div style={styles.orb2} />

      <TopBar activeTab={activeTab} setActiveTab={setActiveTab} setShowOutput={setShowOutput} />

      <div style={styles.workspace}>
        {/* Left Panel */}
        <div style={styles.leftPanel}>
          <div style={styles.panelHead}>
            <div style={{ fontSize: '.68rem', letterSpacing: '.12em', textTransform: 'uppercase', color: C.textMuted, display: 'flex', alignItems: 'center', gap: 8 }}>
              📄 SRS Input
            </div>
            <span style={{ fontSize: '.6rem', color: C.textDim }}>v1.0</span>
          </div>

          <SRSInput srs={srs} setSrs={setSrs} apiKey={apiKey} setApiKey={setApiKey} />
          <ConfigPanel />

          <button onClick={handleLaunch} disabled={pipelineActive} style={styles.launchBtn}>
            {pipelineActive && (
              <div style={{ width: 14, height: 14, border: '2px solid rgba(0,212,255,.3)', borderTopColor: C.accent, borderRadius: '50%', animation: 'rot .6s linear infinite' }} />
            )}
            <span>{pipelineActive ? 'RUNNING...' : '⚡ LAUNCH PIPELINE'}</span>
          </button>
        </div>

        {/* Center - Main Content */}
        <div style={styles.mainContent}>
          {activeTab === 'pipeline' && (
            <>
              <FlowDiagram flowNodes={flowNodes} agentStates={agentStates} />
              <CommsPanel messages={messages} msgCount={msgCount} />
              <Metrics metrics={metrics} />
              <CodePreview generatedCode={generatedCode} activeFile={activeFile} setActiveFile={setActiveFile} showOutput={showOutput} />
            </>
          )}

          {activeTab === 'agents' && (
            <div>
              <div style={{ fontSize: '.65rem', letterSpacing: '.12em', textTransform: 'uppercase', color: C.textMuted, marginBottom: 16 }}>
                🤖 Agent Status
              </div>
              {agentStates.map((state, i) => (
                <div key={i} style={{ border: `1px solid ${C.border}`, borderRadius: 10, padding: 14, marginBottom: 8, background: C.surface }}>
                  <div style={{ fontSize: '.72rem', fontWeight: 600, color: C.text }}>Agent {i + 1}</div>
                  <div style={{ fontSize: '.63rem', color: C.textDim, marginTop: 4 }}>
                    {state.state === 'running' ? 'Running' : state.state === 'done' ? 'Done' : 'Idle'}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'output' && (
            <CodePreview generatedCode={generatedCode} activeFile={activeFile} setActiveFile={setActiveFile} showOutput={true} />
          )}

          {/* Task Manager */}
          {user && (
            <div style={{ marginTop: 32 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, borderBottom: `1px solid ${C.border}`, paddingBottom: 16 }}>
                <h2 style={{ fontSize: '1.2rem', color: C.text }}>Tasks</h2>
                <span style={{ color: C.textMuted }}>Welcome, {user.name}</span>
              </div>
              <TaskList
                tasks={tasks}
                filter={filter}
                setFilter={setFilter}
                onUpdate={updateTask}
                onDelete={deleteTask}
                onCreate={createTask}
              />
            </div>
          )}
        </div>

        {/* Right Panel */}
        <div style={styles.rightPanel}>
          <div style={styles.panelHead}>
            <div style={{ fontSize: '.68rem', letterSpacing: '.12em', textTransform: 'uppercase', color: C.textMuted, display: 'flex', alignItems: 'center', gap: 8 }}>
              🤖 Agent Status
            </div>
            <span style={{ fontSize: '.6rem', color: C.textDim }}>
              {agentStates.filter(s => s.state === 'running').length}/5 active
            </span>
          </div>
          <AgentStatus agentStates={agentStates} />

          {!user && (
            <div style={{ padding: '16px 12px', borderTop: `1px solid ${C.border}`, marginTop: 8 }}>
              <div style={{ fontSize: '.63rem', color: C.textDim, marginBottom: 12, letterSpacing: '.08em' }}>DEMO TASK MANAGER</div>
              <button onClick={login} style={{
                width: '100%', padding: '10px',
                background: `linear-gradient(135deg,rgba(0,212,255,.1),rgba(124,58,237,.1))`,
                border: `1px solid rgba(0,212,255,.25)`, borderRadius: 8, color: C.accent, cursor: 'pointer',
                fontFamily: "'JetBrains Mono', monospace", fontSize: '.72rem', letterSpacing: '.06em'
              }}>
                Sign In (Demo)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <PipelineProvider>
        <AppContent />
      </PipelineProvider>
    </AuthProvider>
  );
}
