// Tiny data layer: in-memory arrays, optionally persisted to a JSON file.
// Every function here is the ONLY place that touches storage, so swapping to
// lowdb / DynamoDB / MySQL later means editing this file only.
import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

const FILE = process.env.DB_FILE || path.join(process.cwd(), 'data', 'db.json');
// File persistence is off automatically on AWS Lambda (read-only filesystem),
// or manually with PERSIST=false.
const PERSIST =
  process.env.PERSIST !== 'false' && !process.env.AWS_LAMBDA_FUNCTION_NAME;

let data = { users: [], todos: [] };

if (PERSIST && fs.existsSync(FILE)) {
  try {
    data = JSON.parse(fs.readFileSync(FILE, 'utf8'));
  } catch {
    console.warn('Could not read db file, starting empty.');
  }
}

function save() {
  if (!PERSIST) return;
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

export const db = {
  findUserByEmail: (email) => data.users.find((u) => u.email === email) ?? null,
  findUserById: (id) => data.users.find((u) => u.id === id) ?? null,

  createUser({ email, passwordHash }) {
    const user = { id: randomUUID(), email, passwordHash };
    data.users.push(user);
    save();
    return user;
  },

  // Todos are ALWAYS looked up together with userId -> this is the user scoping.
  todosForUser: (userId) =>
    data.todos
      .filter((t) => t.userId === userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),

  findTodo: (userId, id) =>
    data.todos.find((t) => t.id === id && t.userId === userId) ?? null,

  createTodo(userId, title) {
    const todo = {
      id: randomUUID(),
      userId,
      title,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    data.todos.push(todo);
    save();
    return todo;
  },

  toggleTodo(userId, id) {
    const todo = db.findTodo(userId, id);
    if (!todo) return null;
    todo.completed = !todo.completed;
    save();
    return todo;
  },

  deleteTodo(userId, id) {
    const before = data.todos.length;
    data.todos = data.todos.filter((t) => !(t.id === id && t.userId === userId));
    const deleted = data.todos.length < before;
    if (deleted) save();
    return deleted;
  },
};
