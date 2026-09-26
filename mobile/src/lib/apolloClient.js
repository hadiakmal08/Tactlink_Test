// Apollo Client wired to the same GraphQL backend as the web app.
// - Auth token is attached from SecureStore on every request.
// - The cache is persisted to AsyncStorage, so the to-do list still shows
//   (read-only) when the app opens with no network - the offline bonus.
import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persistCache } from 'apollo3-cache-persist';
import * as SecureStore from 'expo-secure-store';

const GRAPHQL_URL = process.env.EXPO_PUBLIC_GRAPHQL_URL;

const httpLink = createHttpLink({ uri: GRAPHQL_URL });

const authLink = setContext(async (_, { headers }) => {
  const token = await SecureStore.getItemAsync('token');
  return {
    headers: {
      ...headers,
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
  };
});

// Surfaces GraphQL/network errors in one place for easier debugging.
const errorLink = onError(({ graphQLErrors, networkError }) => {
  graphQLErrors?.forEach((e) => console.warn('[GraphQL error]', e.message));
  if (networkError) console.warn('[Network error]', networkError.message);
});

const cache = new InMemoryCache();

export const client = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache,
  defaultOptions: {
    // Show cached data immediately, then refresh from the network -
    // this is what lets the list render while offline.
    watchQuery: { fetchPolicy: 'cache-and-network' },
  },
});

export async function initCachePersistence() {
  await persistCache({
    cache,
    storage: AsyncStorage,
    maxSize: 1048576, // 1MB is plenty for a to-do list
  });
}
