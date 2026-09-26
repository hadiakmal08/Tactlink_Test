import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import { gql, useApolloClient } from '@apollo/client';

const SIGNUP = gql`
  mutation Signup($email: String!, $password: String!) {
    signup(email: $email, password: $password) { token user { id email } }
  }
`;
const LOGIN = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) { token user { id email } }
  }
`;

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const client = useApolloClient();

  // On launch, restore the session from SecureStore (if any).
  useEffect(() => {
    (async () => {
      const savedUser = await SecureStore.getItemAsync('user');
      if (savedUser) setUser(JSON.parse(savedUser));
      setInitializing(false);
    })();
  }, []);

  const applySession = async ({ token, user }) => {
    await SecureStore.setItemAsync('token', token);
    await SecureStore.setItemAsync('user', JSON.stringify(user));
    setUser(user);
  };

  const signup = useCallback(async (email, password) => {
    const { data } = await client.mutate({ mutation: SIGNUP, variables: { email, password } });
    await applySession(data.signup);
  }, [client]);

  const login = useCallback(async (email, password) => {
    const { data } = await client.mutate({ mutation: LOGIN, variables: { email, password } });
    await applySession(data.login);
  }, [client]);

  const logout = useCallback(async () => {
    await SecureStore.deleteItemAsync('token');
    await SecureStore.deleteItemAsync('user');
    await client.clearStore();
    setUser(null);
  }, [client]);

  return (
    <AuthContext.Provider value={{ user, initializing, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
