import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { gql } from '../lib/graphql';
import { useAuth } from '../lib/auth';
import ConfirmDialog from '../components/ConfirmDialog';

const TODOS = `query { todos { id title completed createdAt } }`;
const CREATE = `mutation Create($title: String!) {
  createTodo(title: $title) { id title completed createdAt }
}`;
const TOGGLE = `mutation Toggle($id: ID!) {
  toggleTodo(id: $id) { id title completed createdAt }
}`;
const DELETE = `mutation Delete($id: ID!) { deleteTodo(id: $id) }`;

export default function Todos() {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [adding, setAdding] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null); // todo being confirmed
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const load = async () => {
    try {
      const data = await gql(TODOS);
      setTodos(data.todos);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setAdding(true);
    setError('');
    try {
      const data = await gql(CREATE, { title: title.trim() });
      setTodos((prev) => [data.createTodo, ...prev]);
      setTitle('');
    } catch (err) {
      setError(err.message);
    } finally {
      setAdding(false);
    }
  };

  const handleToggle = async (id) => {
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
    try {
      await gql(TOGGLE, { id });
    } catch (err) {
      setError(err.message);
      load();
    }
  };

  const confirmDelete = async () => {
    const id = pendingDelete.id;
    setPendingDelete(null);
    const prev = todos;
    setTodos((p) => p.filter((t) => t.id !== id));
    try {
      await gql(DELETE, { id });
    } catch (err) {
      setError(err.message);
      setTodos(prev);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const remaining = useMemo(() => todos.filter((t) => !t.completed).length, [todos]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/40 px-4 py-8 sm:py-12">
      <div className="mx-auto w-full max-w-md">
        {/* Header card */}
        <div className="mb-5 flex items-center justify-between rounded-2xl bg-white/80 backdrop-blur-sm border border-slate-200/80 px-5 py-4 shadow-sm">
          <div className="min-w-0">
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">My To-Dos</h1>
            <p className="truncate text-xs text-slate-500">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="shrink-0 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
          >
            Log out
          </button>
        </div>

        {/* Add form */}
        <form onSubmit={handleAdd} className="mb-4 flex gap-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What needs doing?"
            className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
          />
          <button
            type="submit"
            disabled={adding || !title.trim()}
            className="shrink-0 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition hover:brightness-105 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
          >
            Add
          </button>
        </form>

        {error && (
          <p className="mb-4 rounded-xl border border-red-100 bg-red-50 px-3.5 py-2.5 text-sm text-red-600">
            {error}
          </p>
        )}

        {/* List card */}
        <div className="rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm overflow-hidden">
          {loading ? (
            <div className="space-y-2 p-4">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-11 animate-pulse rounded-lg bg-slate-100" />
              ))}
            </div>
          ) : todos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-2xl">
                📝
              </div>
              <p className="text-sm font-medium text-slate-700">Nothing here yet</p>
              <p className="mt-1 text-xs text-slate-400">Add your first task above to get started.</p>
            </div>
          ) : (
            <>
              <ul className="divide-y divide-slate-100">
                {todos.map((todo) => (
                  <li
                    key={todo.id}
                    className="group flex items-center gap-3 px-4 py-3 transition hover:bg-slate-50/80 animate-[slideUp_0.2s_ease-out]"
                  >
                    <button
                      onClick={() => handleToggle(todo.id)}
                      aria-label={todo.completed ? 'Mark as not done' : 'Mark as done'}
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 text-[11px] font-bold transition ${
                        todo.completed
                          ? 'border-indigo-600 bg-indigo-600 text-white'
                          : 'border-slate-300 text-transparent hover:border-indigo-400'
                      }`}
                    >
                      ✓
                    </button>
                    <span
                      className={`min-w-0 flex-1 truncate text-sm transition ${
                        todo.completed ? 'text-slate-400 line-through' : 'text-slate-800'
                      }`}
                    >
                      {todo.title}
                    </span>
                    <button
                      onClick={() => setPendingDelete(todo)}
                      aria-label="Delete task"
                      className="shrink-0 rounded-lg p-1.5 text-slate-300 opacity-0 transition hover:bg-red-50 hover:text-red-600 group-hover:opacity-100 focus:opacity-100"
                    >
                      🗑
                    </button>
                  </li>
                ))}
              </ul>
              <div className="border-t border-slate-100 px-4 py-2.5 text-center text-xs text-slate-400">
                {remaining} of {todos.length} remaining
              </div>
            </>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={!!pendingDelete}
        title="Delete this task?"
        message={pendingDelete ? `"${pendingDelete.title}" will be removed permanently.` : ''}
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
