// AWS Lambda entry point (Function URL, payload format v2).
// Same schema/resolvers/auth as the local server - only the "wrapper" differs.
import { ApolloServer } from '@apollo/server';
import {
  startServerAndCreateLambdaHandler,
  handlers,
} from '@as-integrations/aws-lambda';
import { typeDefs } from './schema.js';
import { resolvers } from './resolvers.js';
import { getUserIdFromHeader } from './auth.js';

const server = new ApolloServer({
  typeDefs,
  resolvers,
  includeStacktraceInErrorResponses: false,
});

export const handler = startServerAndCreateLambdaHandler(
  server,
  handlers.createAPIGatewayProxyEventV2RequestHandler(),
  {
    context: async ({ event }) => ({
      // Lambda lower-cases header names
      userId: getUserIdFromHeader(event.headers?.authorization),
    }),
  },
);
