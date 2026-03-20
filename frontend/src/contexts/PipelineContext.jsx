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
  "docker": "complete docker-compose.yml",
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
    if (!apiKey) { alert('Please enter your Anthropic API key'); return; }

    localStorage.setItem('aiden_api_key', apiKey);
    setPipelineActive(true);
    setShowOutput(false);
    setMessages([]);
    setMsgCount(0);
    setAgentStates(AGENTS.map(() => ({ state: 'idle', progress: 0, thought: '' })));
    setFlowNodes([false, false, false, false, false, false]);

    [0, 1, 2, 3, 4].forEach(i => setAgent(i, 'idle', 0, ''));

    const delay = ms => new Promise(r => setTimeout(r, ms));

    setFlow(0, true);
    await delay(300);
    setFlow(0, false);
    setFlowNodes(prev => { const n = [...prev]; n[0] = true; return n; });

    setTimeout(() => {
      setAgent(0, 'running', 20, AGENTS[0].thoughts[0]);
      setFlow(1, true);
      postMsg(COMMS[0]);
    }, 500);

    let thoughtIdx = 1;
    const thoughtInterval = setInterval(() => {
      if (thoughtIdx < AGENTS[0].thoughts.length) {
        setAgent(0, 'running', 20 + thoughtIdx * 20, AGENTS[0].thoughts[thoughtIdx]);
        thoughtIdx++;
      }
    }, 600);

    await delay(2000);
    clearInterval(thoughtInterval);
    setAgent(0, 'done', 100, '');
    setFlow(1, false);
    setFlowNodes(prev => { const n = [...prev]; n[1] = true; return n; });
    postMsg(COMMS[1]);

    setTimeout(() => {
      setAgent(1, 'running', 20, AGENTS[1].thoughts[0]);
      setFlow(2, true);
    }, 2500);

    await delay(3500);
    postMsg(COMMS[2]);
    await delay(600);
    postMsg(COMMS[3]);

    thoughtIdx = 1;
    const archInterval = setInterval(() => {
      if (thoughtIdx < AGENTS[1].thoughts.length) {
        setAgent(1, 'running', 20 + thoughtIdx * 20, AGENTS[1].thoughts[thoughtIdx]);
        thoughtIdx++;
      }
    }, 500);

    await delay(1200);
    clearInterval(archInterval);
    setAgent(1, 'done', 100, '');
    setFlow(2, false);
    setFlowNodes(prev => { const n = [...prev]; n[2] = true; return n; });
    postMsg(COMMS[4]);

    setTimeout(() => {
      setAgent(2, 'running', 10, AGENTS[2].thoughts[0]);
      setFlow(3, true);
      postMsg(COMMS[5]);
    }, 5000);

    thoughtIdx = 1;
    const codeInterval = setInterval(() => {
      if (thoughtIdx < AGENTS[2].thoughts.length) {
        setAgent(2, 'running', 10 + thoughtIdx * 18, AGENTS[2].thoughts[thoughtIdx]);
        thoughtIdx++;
      }
    }, 700);

    let code = null;
    try {
      code = await callAPI(srs, apiKey);
    } catch (e) {
      console.warn('API failed, using fallback:', e.message);
      code = FALLBACK_CODE;
    }

    await delay(2000);
    clearInterval(codeInterval);
    setAgent(2, 'done', 100, '');
    setFlow(3, false);
    setFlowNodes(prev => { const n = [...prev]; n[3] = true; return n; });
    postMsg(COMMS[6]);

    setTimeout(() => {
      setAgent(3, 'running', 20, AGENTS[3].thoughts[0]);
      setFlow(4, true);
    }, 7200);

    thoughtIdx = 1;
    const revInterval = setInterval(() => {
      if (thoughtIdx < AGENTS[3].thoughts.length) {
        setAgent(3, 'running', 20 + thoughtIdx * 18, AGENTS[3].thoughts[thoughtIdx]);
        thoughtIdx++;
      }
    }, 400);

    await delay(900);
    postMsg(COMMS[7]);
    await delay(500);
    clearInterval(revInterval);
    setAgent(3, 'done', 100, '');
    setFlow(4, false);
    setFlowNodes(prev => { const n = [...prev]; n[4] = true; return n; });
    postMsg(COMMS[8]);

    setTimeout(() => {
      setAgent(4, 'running', 20, AGENTS[4].thoughts[0]);
      setFlow(5, true);
    }, 8200);

    thoughtIdx = 1;
    const depInterval = setInterval(() => {
      if (thoughtIdx < AGENTS[4].thoughts.length) {
        setAgent(4, 'running', 20 + thoughtIdx * 18, AGENTS[4].thoughts[thoughtIdx]);
        thoughtIdx++;
      }
    }, 400);

    await delay(1000);
    postMsg(COMMS[9]);
    await delay(600);
    clearInterval(depInterval);
    setAgent(4, 'done', 100, '');
    setFlow(5, false);
    setFlowNodes(prev => { const n = [...prev]; n[5] = true; return n; });
    postMsg(COMMS[10]);

    await delay(500);
    setPipelineActive(false);

    const loc = Object.values(code).join('\n').split('\n').length;
    const eps = (code.backend.match(/app\.(get|post|put|patch|delete)/g) || []).length;
    setMetrics({ loc, files: Object.keys(code).length + 1, eps, time: '~12s' });
    setGeneratedCode(code);
    setShowOutput(true);
  }, [setAgent, setFlow, postMsg, callAPI]);

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
