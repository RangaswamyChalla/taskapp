import { useState, useCallback, useEffect } from 'react';
import API from '../services/api';

export const useTasks = (user) => {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState('');

  const fetchTasks = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await API.get('/tasks');
      setTasks(data.tasks || []);
    } catch (e) {
      console.error('Failed to fetch tasks:', e);
      setTasks([]);
    }
  }, [user]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const createTask = async (form) => {
    setError('');
    try {
      await API.post('/tasks', form);
      await fetchTasks();
    } catch (err) {
      setError('Failed to create task');
    }
  };

  const updateTask = async (id, updates) => {
    setError('');
    try {
      await API.patch('/tasks/' + id, updates);
      await fetchTasks();
    } catch (err) {
      setError('Update failed');
    }
  };

  const deleteTask = async (id) => {
    setError('');
    try {
      await API.delete('/tasks/' + id);
      await fetchTasks();
    } catch (err) {
      setError('Delete failed');
    }
  };

  const filteredTasks = filter === 'all' ? tasks : tasks.filter(t => t.status === filter);

  return {
    tasks: filteredTasks,
    allTasks: tasks,
    filter,
    setFilter,
    error,
    createTask,
    updateTask,
    deleteTask,
    fetchTasks
  };
};
