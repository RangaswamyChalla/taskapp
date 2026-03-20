import React, { useState } from 'react';
import { C } from '../../config/theme';

const TaskForm = ({ onSubmit }) => {
  const [form, setForm] = useState({ title: '', priority: 'medium', due_date: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
    setForm({ title: '', priority: 'medium', due_date: '' });
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
      <input
        value={form.title}
        onChange={e => setForm({ ...form, title: e.target.value })}
        placeholder="Task title"
        required
        style={{ flex: 1, padding: '10px 12px', background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 6, color: C.text, outline: 'none' }}
      />
      <select
        value={form.priority}
        onChange={e => setForm({ ...form, priority: e.target.value })}
        style={{ padding: '10px 12px', background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 6, color: C.text }}
      >
        {['low', 'medium', 'high', 'urgent'].map(p => <option key={p}>{p}</option>)}
      </select>
      <input
        type="date"
        value={form.due_date}
        onChange={e => setForm({ ...form, due_date: e.target.value })}
        style={{ padding: '10px 12px', background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 6, color: C.text }}
      />
      <button type="submit" style={{ padding: '10px 20px', background: C.accent3, color: '#000', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>
        Add
      </button>
    </form>
  );
};

export default TaskForm;
