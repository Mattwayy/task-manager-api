import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTasks, createTask, deleteTask, updateTask } from '../api/tasks';
import { logoutUser } from '../api/auth';

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const loadTasks = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getTasks();
      setTasks(data || []);
    } catch (err) {
      setError(err.message);
      if (err.message?.includes('token')) {
        logoutUser();
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      await createTask({ title });
      setTitle('');
      loadTasks();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleToggle = async (task) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    try {
      await updateTask(task.id, { status: newStatus });
      loadTasks();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteTask(id);
      loadTasks();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>Мои задачи</h1>
        <button onClick={handleLogout} style={styles.logoutBtn}>Выйти</button>
      </div>

      <form onSubmit={handleCreate} style={styles.form}>
        <input
          type="text"
          placeholder="Новая задача..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={styles.input}
        />
        <button type="submit" style={styles.addBtn}>Добавить</button>
      </form>

      {error && <p style={styles.error}>{error}</p>}
      {loading && <p>Загрузка...</p>}

      <ul style={styles.list}>
        {tasks.map((task) => (
          <li key={task.id} style={styles.item}>
            <input
              type="checkbox"
              checked={task.status === 'completed'}
              onChange={() => handleToggle(task)}
            />
            <span style={{
              flex: 1,
              textDecoration: task.status === 'completed' ? 'line-through' : 'none',
            }}>
              {task.title}
            </span>
            <button onClick={() => handleDelete(task.id)} style={styles.deleteBtn}>×</button>
          </li>
        ))}
      </ul>

      {!loading && tasks.length === 0 && <p>Пока нет задач</p>}
    </div>
  );
}

const styles = {
  container: { maxWidth: 600, margin: '40px auto', padding: 20, fontFamily: 'sans-serif' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  form: { display: 'flex', gap: 8, marginBottom: 20 },
  input: { flex: 1, padding: 10, fontSize: 16, border: '1px solid #ccc', borderRadius: 4 },
  addBtn: { padding: '10px 20px', background: '#007bff', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' },
  logoutBtn: { padding: '6px 12px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' },
  deleteBtn: { background: 'transparent', border: 'none', color: '#dc3545', fontSize: 20, cursor: 'pointer' },
  list: { listStyle: 'none', padding: 0 },
  item: { display: 'flex', alignItems: 'center', gap: 10, padding: 10, borderBottom: '1px solid #eee' },
  error: { color: 'red' },
};
