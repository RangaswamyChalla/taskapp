import React, { useMemo } from 'react';
import { C } from '../../config/theme';

const PreviewPanel = ({ generatedCode, showPreview }) => {
  const iframeContent = useMemo(() => {
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0d1117; color: #e6edf3; min-height: 100vh; padding: 20px; }
    #root { max-width: 800px; margin: 0 auto; }
    button { background: linear-gradient(135deg, #00d4ff, #7c3aed); color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: 600; }
    button:hover { opacity: 0.9; }
    button:disabled { opacity: 0.5; cursor: not-allowed; }
    input, select { background: #161b22; border: 1px solid #30363d; color: #e6edf3; padding: 8px 12px; border-radius: 6px; margin: 0 4px; }
    input:focus, select:focus { outline: 1px solid #00d4ff; }
    ul { list-style: none; padding: 0; }
    li { background: #161b22; padding: 12px 16px; margin: 8px 0; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; border: 1px solid #21262d; }
    li:hover { border-color: #30363d; }
    h1 { margin-bottom: 20px; color: #00d4ff; }
    form { display: flex; gap: 8px; margin-bottom: 20px; flex-wrap: wrap; }
    input[type="text"] { flex: 1; min-width: 200px; }
    .todo { background: #21262d; color: #7d8590; }
    .in_progress { background: #1f4a68; color: #58a6ff; }
    .review { background: #6e40c9; color: #a78bfa; }
    .done { background: #1a4731; color: #3fb950; }
    .priority-low { color: #7d8590; }
    .priority-medium { color: #58a6ff; }
    .priority-high { color: #f59e0b; }
    .priority-urgent { color: #ef4444; }
    .error { color: #ef4444; padding: 8px; background: rgba(239,68,68,0.1); border-radius: 6px; margin: 8px 0; }
    .success { color: #3fb950; padding: 8px; background: rgba(63,185,80,0.1); border-radius: 6px; margin: 8px 0; }
    .loading { text-align: center; padding: 20px; color: #7d8590; }
    .empty { text-align: center; padding: 40px; color: #484f58; }
    .login-box { max-width: 400px; margin: 60px auto; padding: 30px; background: #161b22; border-radius: 12px; border: 1px solid #21262d; }
    .login-box input { width: 100%; margin-bottom: 12px; }
    .login-box button { width: 100%; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel">
    const API_URL = 'http://localhost:3001';

    const App = () => {
      const [user, setUser] = React.useState(null);
      const [token, setToken] = React.useState(localStorage.getItem('preview_token') || null);
      const [tasks, setTasks] = React.useState([]);
      const [form, setForm] = React.useState({ title: '', priority: 'medium' });
      const [filter, setFilter] = React.useState('all');
      const [loading, setLoading] = React.useState(false);
      const [error, setError] = React.useState('');
      const [success, setSuccess] = React.useState('');
      const [loginForm, setLoginForm] = React.useState({ email: 'demo@app.com', password: 'demo123' });

      React.useEffect(() => {
        if (token) {
          const savedUser = localStorage.getItem('preview_user');
          if (savedUser) {
            setUser(JSON.parse(savedUser));
            fetchTasks();
          }
        }
      }, [token]);

      const showMsg = (msg, type = 'error') => {
        if (type === 'error') setError(msg);
        else setSuccess(msg);
        setTimeout(() => { setError(''); setSuccess(''); }, 3000);
      };

      const login = async (e) => {
        if (e) e.preventDefault();
        setLoading(true);
        setError('');
        try {
          const res = await fetch(API_URL + '/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(loginForm)
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Login failed');
          setToken(data.token);
          setUser(data.user);
          localStorage.setItem('preview_token', data.token);
          localStorage.setItem('preview_user', JSON.stringify(data.user));
          showMsg('Logged in!', 'success');
          fetchTasks();
        } catch (err) {
          showMsg(err.message);
        } finally {
          setLoading(false);
        }
      };

      const logout = () => {
        setUser(null);
        setToken(null);
        setTasks([]);
        localStorage.removeItem('preview_token');
        localStorage.removeItem('preview_user');
      };

      const fetchTasks = async () => {
        if (!token) return;
        setLoading(true);
        try {
          const res = await fetch(API_URL + '/tasks', {
            headers: { 'Authorization': 'Bearer ' + token }
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Failed to fetch');
          setTasks(data.tasks || []);
        } catch (err) {
          if (err.message !== 'Failed to fetch') showMsg(err.message);
        } finally {
          setLoading(false);
        }
      };

      const createTask = async (e) => {
        e.preventDefault();
        if (!form.title.trim()) return;
        setLoading(true);
        try {
          const res = await fetch(API_URL + '/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
            body: JSON.stringify(form)
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Failed to create');
          showMsg('Task created!', 'success');
          setForm({ title: '', priority: 'medium' });
          fetchTasks();
        } catch (err) {
          showMsg(err.message);
        } finally {
          setLoading(false);
        }
      };

      const updateTask = async (id, updates) => {
        try {
          const res = await fetch(API_URL + '/tasks/' + id, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
            body: JSON.stringify(updates)
          });
          if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || 'Update failed');
          }
          fetchTasks();
        } catch (err) {
          showMsg(err.message);
        }
      };

      const deleteTask = async (id) => {
        if (!confirm('Delete this task?')) return;
        try {
          const res = await fetch(API_URL + '/tasks/' + id, {
            method: 'DELETE',
            headers: { 'Authorization': 'Bearer ' + token }
          });
          if (!res.ok) throw new Error('Failed to delete');
          showMsg('Task deleted', 'success');
          fetchTasks();
        } catch (err) {
          showMsg(err.message);
        }
      };

      if (!user) {
        return (
          <div className="login-box">
            <h1>🔐 Sign In</h1>
            {error && <div className="error">{error}</div>}
            {success && <div className="success">{success}</div>}
            <form onSubmit={login}>
              <input type="email" value={loginForm.email} onChange={e => setLoginForm({...loginForm, email: e.target.value})} placeholder="Email" />
              <input type="password" value={loginForm.password} onChange={e => setLoginForm({...loginForm, password: e.target.value})} placeholder="Password" />
              <button type="submit" disabled={loading}>{loading ? 'Please wait...' : 'Sign In'}</button>
            </form>
            <button onClick={() => login()} style={{ marginTop: 8, background: '#21262d', fontSize: '0.85rem' }}>Quick Demo Login</button>
          </div>
        );
      }

      const filteredTasks = filter === 'all' ? tasks : tasks.filter(t => t.status === filter);

      return (
        <div>
          <div className="header">
            <h1>📋 Task Manager</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: '0.85rem', color: '#7d8590' }}>Hi, {user.name}</span>
              <button onClick={logout} style={{ padding: '6px 12px', fontSize: '0.8rem', background: '#21262d' }}>Logout</button>
            </div>
          </div>
          {error && <div className="error">{error}</div>}
          {success && <div className="success">{success}</div>}
          <form onSubmit={createTask}>
            <input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Task title..." />
            <select value={form.priority} onChange={e => setForm({...form, priority: e.target.value})}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
            <button type="submit" disabled={loading}>Add Task</button>
          </form>
          <div style={{ marginBottom: 16 }}>
            <span style={{ marginRight: 8, color: '#7d8590' }}>Filter:</span>
            {['all', 'todo', 'in_progress', 'review', 'done'].map(s => (
              <button key={s} onClick={() => setFilter(s)} style={{ marginRight: 4, background: filter === s ? '#00d4ff' : '#21262d', color: filter === s ? '#000' : '#7d8590', padding: '6px 12px', fontSize: '0.8rem' }}>{s.replace('_', ' ')}</button>
            ))}
          </div>
          {loading ? <div className="loading">Loading...</div> : filteredTasks.length === 0 ? <div className="empty">No tasks yet!</div> : (
            <ul>{filteredTasks.map(task => (
              <li key={task.id}>
                <span style={{ fontWeight: 500 }}>{task.title}</span>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span className={'priority-' + task.priority} style={{ fontSize: '0.75rem' }}>{task.priority}</span>
                  <select value={task.status} onChange={e => updateTask(task.id, { status: e.target.value })} style={{ fontSize: '0.75rem' }}>
                    <option value="todo">Todo</option>
                    <option value="in_progress">In Progress</option>
                    <option value="review">Review</option>
                    <option value="done">Done</option>
                  </select>
                  <button onClick={() => deleteTask(task.id)} style={{ padding: '4px 8px', fontSize: '0.7rem', background: '#ef4444' }}>✕</button>
                </div>
              </li>
            ))}</ul>
          )}
          <p style={{ marginTop: 20, color: '#484f58', fontSize: '0.75rem' }}>💡 Live preview - connects to backend at {API_URL}</p>
        </div>
      );
    };
    ReactDOM.createRoot(document.getElementById('root')).render(<App />);
  </script>
</body>
</html>
    `;
    return html;
  }, []);

  if (!showPreview) return null;

  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden', marginBottom: 28 }}>
      <div style={{ padding: '12px 16px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(0,212,255,.05)' }}>
        <span style={{ fontSize: '.68rem', color: C.accent, letterSpacing: '.08em' }}>🖥️ LIVE PREVIEW</span>
        <span style={{ fontSize: '.6rem', color: C.textDim }}>(Interactive - connects to localhost:3001)</span>
      </div>
      <iframe srcDoc={iframeContent} style={{ width: '100%', height: 550, border: 'none', background: '#0d1117' }} title="App Preview" sandbox="allow-scripts allow-same-origin allow-forms allow-popups" />
    </div>
  );
};

export default PreviewPanel;
