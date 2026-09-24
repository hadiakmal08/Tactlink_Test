import 'dotenv/config';
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { typeDefs } from './schema.js';
import { resolvers } from './resolvers.js';
import { getUserIdFromHeader } from './auth.js';

const server = new ApolloServer({
  typeDefs,
  resolvers,
  // Don't leak stack traces to clients in production.
  includeStacktraceInErrorResponses: process.env.NODE_ENV !== 'production',
});

const port = Number(process.env.PORT) || 4000;

const { url } = await startStandaloneServer(server, {
  listen: { port },
  // Runs on every request: turns the JWT into ctx.userId for the resolvers.
  context: async ({ req }) => ({
    userId: getUserIdFromHeader(req.headers.authorization),
  }),
});

console.log(`GraphQL server ready at ${url}`);
