import bcrypt from 'bcryptjs';
import { GraphQLError } from 'graphql';
import { db } from './db.js';
import { signToken, requireUser } from './auth.js';

const badInput = (message) =>
  new GraphQLError(message, { extensions: { code: 'BAD_USER_INPUT' } });

const publicUser = (u) => ({ id: u.id, email: u.email });

export const resolvers = {
  Query: {
    me: (_, __, ctx) => {
      if (!ctx.userId) return null;
      const user = db.findUserById(ctx.userId);
      return user ? publicUser(user) : null;
    },
    todos: (_, __, ctx) => db.todosForUser(requireUser(ctx)),
  },

  Mutation: {
    signup: async (_, { email, password }) => {
      const normalized = email.trim().toLowerCase();
      if (!/^\S+@\S+\.\S+$/.test(normalized)) throw badInput('Enter a valid email.');
      if (password.length < 6) throw badInput('Password must be at least 6 characters.');
      if (db.findUserByEmail(normalized)) throw badInput('Email is already registered.');

      const user = db.createUser({
        email: normalized,
        passwordHash: await bcrypt.hash(password, 10),
      });
      return { token: signToken(user.id), user: publicUser(user) };
    },

    login: async (_, { email, password }) => {
      const user = db.findUserByEmail(email.trim().toLowerCase());
      // Same message for "no user" and "wrong password" (don't leak which emails exist).
      if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
        throw new GraphQLError('Invalid email or password.', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }
      return { token: signToken(user.id), user: publicUser(user) };
    },

    createTodo: (_, { title }, ctx) => {
      const userId = requireUser(ctx);
      const clean = title.trim();
      if (!clean) throw badInput('Title cannot be empty.');
      return db.createTodo(userId, clean);
    },

    toggleTodo: (_, { id }, ctx) => {
      const todo = db.toggleTodo(requireUser(ctx), id);
      if (!todo) throw new GraphQLError('Todo not found.', { extensions: { code: 'NOT_FOUND' } });
      return todo;
    },

    deleteTodo: (_, { id }, ctx) => {
      const deleted = db.deleteTodo(requireUser(ctx), id);
      if (!deleted) throw new GraphQLError('Todo not found.', { extensions: { code: 'NOT_FOUND' } });
      return true;
    },
  },
};
