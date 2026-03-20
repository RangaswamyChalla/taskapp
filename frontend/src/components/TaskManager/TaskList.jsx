import React from 'react';
import { C } from '../../config/theme';
import TaskForm from './TaskForm';

const TaskList = ({ tasks, filter, setFilter, onUpdate, onDelete, onCreate }) => {
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 24 }}>
      <TaskForm onSubmit={onCreate} />

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {['all', 'todo', 'in_progress', 'review', 'done'].map(s => (
          <button key={s} onClick={() => setFilter(s)} style={{
            padding: '6px 14px', cursor: 'pointer', fontWeight: filter === s ? 'bold' : 'normal',
            background: filter === s ? C.accent : 'transparent', color: filter === s ? '#000' : C.textMuted,
            border: `1px solid ${filter === s ? C.accent : C.border}`, borderRadius: 20
          }}>
            {s.replace('_', ' ')}
          </button>
        ))}
      </div>

      <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {tasks.map(t => (
          <li key={t.id} style={{
            padding: 14, border: `1px solid ${C.border}`, borderRadius: 8, display: 'flex', gap: 12, alignItems: 'center', background: C.surface2
          }}>
            <span style={{ flex: 1, fontWeight: 500, color: C.text }}>{t.title}</span>
            <span style={{
              fontSize: 11, padding: '3px 8px', borderRadius: 4,
              background: t.priority === 'urgent' ? C.danger : t.priority === 'high' ? C.accent4 : C.surface3,
              color: t.priority === 'urgent' || t.priority === 'high' ? '#fff' : C.textMuted
            }}>{t.priority}</span>
            <select
              value={t.status}
              onChange={e => onUpdate(t.id, { status: e.target.value })}
              style={{ padding: '6px 10px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 4, color: C.text }}
            >
              {['todo', 'in_progress', 'review', 'done'].map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
            </select>
            <button onClick={() => onDelete(t.id)} style={{ color: C.danger, background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem' }}>x</button>
          </li>
        ))}
        {tasks.length === 0 && (
          <li style={{ textAlign: 'center', color: C.textDim, padding: 40 }}>No tasks yet</li>
        )}
      </ul>
    </div>
  );
};

export default TaskList;
