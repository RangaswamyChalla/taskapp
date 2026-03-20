import React, { useState } from 'react';
import { C } from '../../config/theme';

const TaskForm = ({ onSubmit }) => {
  const [form, setForm] = useState({ title: '', priority: 'medium', due_date: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setLoading(true);
    try {
      await onSubmit(form);
      setForm({ title: '', priority: 'medium', due_date: '' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
      <input
        value={form.title}
        onChange={e => setForm({ ...form, title: e.target.value })}
        placeholder="Task title"
        required
        disabled={loading}
        style={{ flex: 1, padding: '10px 12px', background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 6, color: C.text, outline: 'none' }}
      />
      <select
        value={form.priority}
        onChange={e => setForm({ ...form, priority: e.target.value })}
        disabled={loading}
        style={{ padding: '10px 12px', background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 6, color: C.text }}
      >
        {['low', 'medium', 'high', 'urgent'].map(p => <option key={p}>{p}</option>)}
      </select>
      <input
        type="date"
        value={form.due_date}
        onChange={e => setForm({ ...form, due_date: e.target.value })}
        disabled={loading}
        style={{ padding: '10px 12px', background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 6, color: C.text }}
      />
      <button type="submit" disabled={loading} style={{ padding: '10px 20px', background: loading ? C.textDim : C.accent3, color: '#000', border: 'none', borderRadius: 6, cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 600 }}>
        {loading ? 'Adding...' : 'Add'}
      </button>
    </form>
  );
};

export default TaskForm;
