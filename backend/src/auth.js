import jwt from 'jsonwebtoken';
import { GraphQLError } from 'graphql';

const SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
if (!process.env.JWT_SECRET) {
  console.warn('JWT_SECRET not set - using an insecure development secret.');
}

export const signToken = (userId) =>
  jwt.sign({ sub: userId }, SECRET, { expiresIn: '7d' });

// Reads "Authorization: Bearer <token>" and returns the user id, or null.
export function getUserIdFromHeader(header) {
  if (!header?.startsWith('Bearer ')) return null;
  try {
    return jwt.verify(header.slice(7), SECRET).sub;
  } catch {
    return null; // expired / tampered token -> treated as logged out
  }
}

export function requireUser(context) {
  if (!context.userId) {
    throw new GraphQLError('You must be logged in.', {
      extensions: { code: 'UNAUTHENTICATED' },
    });
  }
  return context.userId;
}
