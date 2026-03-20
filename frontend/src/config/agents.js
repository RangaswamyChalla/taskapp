export const AGENTS = [
  { id: 0, name: 'Analyzer', color: '#a78bfa', icon: '🧠', sub: 'NLP + Parsing',
    thoughts: ["Tokenizing requirement blocks...", "Extracting entity definitions...", "Mapping FR→NFR dependencies...", "Identifying auth flows...", "Building semantic graph..."] },
  { id: 1, name: 'Architect', color: '#34d399', icon: '🏗️', sub: 'System Design',
    thoughts: ["Selecting MVC + REST pattern...", "Mapping entities to DB tables...", "Designing API surface...", "Choosing JWT stateless auth...", "Finalizing layer separation..."] },
  { id: 2, name: 'Coder', color: '#fbbf24', icon: '⚡', sub: 'Code Gen',
    thoughts: ["Synthesizing DB schema...", "Generating ORM models...", "Building Express routes...", "Creating React components...", "Wiring axios client..."] },
  { id: 3, name: 'Reviewer', color: '#f87171', icon: '🔍', sub: 'QA + Security',
    thoughts: ["Scanning for SQL injection...", "Checking JWT secret exposure...", "Validating input sanitization...", "Reviewing error handling...", "Confirming CORS security..."] },
  { id: 4, name: 'Deployer', color: '#818cf8', icon: '🚀', sub: 'Config Gen',
    thoughts: ["Generating config files...", "Writing package.json...", "Creating nginx.conf...", "Setting up environment...", "Preparing deployment..."] },
];

export const COMMS = [
  { from: 'ORCHESTRATOR', to: null, color: '#00d4ff', msg: 'Pipeline initiated. SRS received. Dispatching <b>Analyzer</b> agent.' },
  { from: 'ANALYZER', to: 'ORCHESTRATOR', color: '#a78bfa', msg: 'Parsing complete. Detected <b>4 entities</b>, <b>3 auth flows</b>, <b>2 NFRs</b>. Forwarding to Architect.' },
  { from: 'ARCHITECT', to: 'ANALYZER', color: '#34d399', msg: 'Received entity graph. Selecting <b>REST MVC</b> pattern with <b>PostgreSQL</b>. 11 endpoints.' },
  { from: 'ANALYZER', to: 'ARCHITECT', color: '#a78bfa', msg: 'Confirmed. FR-07 audit log → <b>soft delete</b> pattern with <b>deleted_at</b> timestamp.' },
  { from: 'ARCHITECT', to: 'CODER', color: '#34d399', msg: 'Architecture finalized. Blueprint: <b>UUID PKs</b>, <b>sequelize ORM</b>, routes/controllers/middleware.' },
  { from: 'CODER', to: 'ARCHITECT', color: '#fbbf24', msg: 'Blueprint received. Generating DB schema → models → controllers → routes → components.' },
  { from: 'CODER', to: 'REVIEWER', color: '#fbbf24', msg: 'Code generation complete. <b>5 files</b> produced. JWT hardcode flagged — needs env var.' },
  { from: 'REVIEWER', to: 'CODER', color: '#f87171', msg: '⚠️ JWT hardcode patched at <b>server.js:L34</b>. Parameterized query fixed at <b>L12</b>.' },
  { from: 'REVIEWER', to: 'DEPLOYER', color: '#f87171', msg: 'Security review passed. <b>0 critical</b>, <b>0 high</b>, 2 medium patched.' },
  { from: 'DEPLOYER', to: 'ORCHESTRATOR', color: '#818cf8', msg: 'Deployment artifacts: <b>package.json</b>, <b>server.js</b>, <b>nginx.conf</b>, <b>.env.example</b>.' },
  { from: 'ORCHESTRATOR', to: null, color: '#00d4ff', msg: '✅ Pipeline complete. <b>6 files</b>, <b>0 security issues</b>. Deploy-ready.' },
];
