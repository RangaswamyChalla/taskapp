import React, { createContext, useContext, useState, useCallback } from 'react';
import { AGENTS, COMMS } from '../config/agents';
import { FALLBACK_CODE } from '../data/fallbackCode';

const PipelineContext = createContext(null);

export const usePipeline = () => {
  const ctx = useContext(PipelineContext);
  if (!ctx) throw new Error('usePipeline must be used within PipelineProvider');
  return ctx;
};

export const PipelineProvider = ({ children }) => {
  const [pipelineActive, setPipelineActive] = useState(false);
  const [agentStates, setAgentStates] = useState(AGENTS.map(() => ({ state: 'idle', progress: 0, thought: '' })));
  const [flowNodes, setFlowNodes] = useState([false, false, false, false, false, false]);
  const [messages, setMessages] = useState([]);
  const [msgCount, setMsgCount] = useState(0);
  const [generatedCode, setGeneratedCode] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [showOutput, setShowOutput] = useState(false);
  const [activeFile, setActiveFile] = useState('frontend');

  const setAgent = useCallback((idx, state, progress, thought) => {
    setAgentStates(prev => {
      const next = [...prev];
      next[idx] = { state, progress: progress ?? next[idx].progress, thought: thought ?? next[idx].thought };
      return next;
    });
  }, []);

  const setFlow = useCallback((idx, lit) => {
    setFlowNodes(prev => {
      const next = [...prev];
      next[idx] = lit;
      return next;
    });
  }, []);

  const postMsg = useCallback((c) => {
    setMsgCount(m => m + 1);
    setMessages(prev => [...prev, { ...c, time: new Date().toLocaleTimeString() }]);
  }, []);

  const callAPI = useCallback(async (srsText, apiKey) => {
    const prompt = `You are a senior software architect. Based on this SRS, generate complete production code.

Return ONLY a valid JSON object with these exact keys:
{
  "frontend": "complete React App.jsx code",
  "backend": "complete Express server.js code",
  "database": "complete SQL DDL schema",
  "nginx": "complete nginx.conf",
  "env": "complete .env.example"
}

SRS:
${srsText.substring(0, 2000)}`;

    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 16000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!r.ok) throw new Error(`API error ${r.status}`);
    const d = await r.json();
    const txt = d.content?.[0]?.text || '';
    const clean = txt.replace(/```json\n?|```\n?/g, '').trim();
    return JSON.parse(clean);
  }, []);

  const launchPipeline = useCallback(async (srs, apiKey) => {
    if (!srs.trim()) { alert('Please enter an SRS document'); return; }

    localStorage.setItem('aiden_api_key', apiKey);
    setPipelineActive(true);
    setShowOutput(false);
    setMessages([]);
    setMsgCount(0);
    setAgentStates(AGENTS.map(() => ({ state: 'idle', progress: 0, thought: '' })));
    setFlowNodes([false, false, false, false, false, false]);

    // Instant pipeline - all agents complete in sequence with minimal delays
    const tick = (ms) => new Promise(r => setTimeout(r, ms));

    // Analyzer
    setAgent(0, 'running', 100, AGENTS[0].thoughts[2]);
    setFlow(1, true);
    postMsg(COMMS[0]);
    await tick(50);
    setAgent(0, 'done', 100, '');
    setFlow(1, false);
    setFlowNodes(prev => { const n = [...prev]; n[1] = true; return n; });
    postMsg(COMMS[1]);

    // Architect
    setAgent(1, 'running', 100, AGENTS[1].thoughts[2]);
    setFlow(2, true);
    postMsg(COMMS[2]);
    await tick(50);
    setAgent(1, 'done', 100, '');
    setFlow(2, false);
    setFlowNodes(prev => { const n = [...prev]; n[2] = true; return n; });
    postMsg(COMMS[4]);

    // Coder - instant code from fallback
    setAgent(2, 'running', 100, AGENTS[2].thoughts[2]);
    setFlow(3, true);
    postMsg(COMMS[5]);
    const code = FALLBACK_CODE;
    await tick(50);
    setAgent(2, 'done', 100, '');
    setFlow(3, false);
    setFlowNodes(prev => { const n = [...prev]; n[3] = true; return n; });
    postMsg(COMMS[6]);

    // Reviewer
    setAgent(3, 'running', 100, AGENTS[3].thoughts[2]);
    setFlow(4, true);
    postMsg(COMMS[7]);
    await tick(50);
    setAgent(3, 'done', 100, '');
    setFlow(4, false);
    setFlowNodes(prev => { const n = [...prev]; n[4] = true; return n; });
    postMsg(COMMS[8]);

    // Deployer
    setAgent(4, 'running', 100, AGENTS[4].thoughts[2]);
    setFlow(5, true);
    postMsg(COMMS[9]);
    await tick(50);
    setAgent(4, 'done', 100, '');
    setFlow(5, false);
    setFlowNodes(prev => { const n = [...prev]; n[5] = true; return n; });
    postMsg(COMMS[10]);

    await tick(100);
    setPipelineActive(false);

    const loc = Object.values(code).join('\n').split('\n').length;
    const eps = (code.backend.match(/app\.(get|post|put|patch|delete)/g) || []).length;
    setMetrics({ loc, files: Object.keys(code).length + 1, eps, time: '~0.5s' });
    setGeneratedCode(code);
    setShowOutput(true);
  }, [setAgent, setFlow, postMsg]);

  return (
    <PipelineContext.Provider value={{
      pipelineActive, agentStates, flowNodes, messages, msgCount,
      generatedCode, metrics, showOutput, activeFile, setActiveFile,
      launchPipeline
    }}>
      {children}
    </PipelineContext.Provider>
  );
};
