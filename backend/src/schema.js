export const typeDefs = `#graphql
  type User {
    id: ID!
    email: String!
  }

  type Todo {
    id: ID!
    title: String!
    completed: Boolean!
    createdAt: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Query {
    me: User
    todos: [Todo!]!
  }

  type Mutation {
    signup(email: String!, password: String!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    createTodo(title: String!): Todo!
    toggleTodo(id: ID!): Todo!
    deleteTodo(id: ID!): Boolean!
  }
`;
