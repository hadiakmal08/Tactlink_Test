import { createContext, useContext, useState, useCallback } from 'react';
import { gql } from './graphql';

const AuthContext = createContext(null);

const SIGNUP = `mutation Signup($email: String!, $password: String!) {
  signup(email: $email, password: $password) { token user { id email } }
}`;
const LOGIN = `mutation Login($email: String!, $password: String!) {
  login(email: $email, password: $password) { token user { id email } }
}`;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const applySession = ({ token, user }) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);
  };

  const signup = useCallback(async (email, password) => {
    const data = await gql(SIGNUP, { email, password });
    applySession(data.signup);
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await gql(LOGIN, { email, password });
    applySession(data.login);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
