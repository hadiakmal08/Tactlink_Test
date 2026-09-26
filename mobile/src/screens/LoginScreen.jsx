import { useState } from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { useAuth } from '../lib/auth';
import { errorMessage } from '../lib/errorMessage';

export default function LoginScreen() {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, signup } = useAuth();

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') await login(email.trim(), password);
      else await signup(email.trim(), password);
      // Navigation is automatic: App.jsx swaps stacks once `user` is set.
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.logo}>
          <Text style={styles.logoText}>✓</Text>
        </View>
        <Text style={styles.title}>{mode === 'login' ? 'Welcome back' : 'Create account'}</Text>
        <Text style={styles.subtitle}>
          {mode === 'login' ? 'Log in to see your to-dos.' : 'Takes less than a minute.'}
        </Text>

        <View style={styles.card}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="you@example.com"
            placeholderTextColor="#94a3b8"
          />
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="At least 6 characters"
            placeholderTextColor="#94a3b8"
          />

          {!!error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <Pressable
            style={[styles.button, loading && { opacity: 0.6 }]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Sign up'}
            </Text>
          </Pressable>
        </View>

        <Pressable onPress={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}>
          <Text style={styles.switchText}>
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <Text style={styles.switchLink}>{mode === 'login' ? 'Sign up' : 'Log in'}</Text>
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: 24, backgroundColor: '#f8fafc' },
  logo: {
    width: 52, height: 52, borderRadius: 16, backgroundColor: '#4f46e5',
    alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: 14,
  },
  logoText: { color: 'white', fontSize: 22, fontWeight: '700' },
  title: { fontSize: 24, fontWeight: '700', color: '#0f172a', textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#64748b', textAlign: 'center', marginTop: 4, marginBottom: 24 },
  card: {
    backgroundColor: 'white', borderRadius: 20, padding: 22,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 16, shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  label: { fontSize: 13, fontWeight: '600', color: '#334155', marginBottom: 6, marginTop: 12 },
  input: {
    borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: '#0f172a',
  },
  errorBox: { backgroundColor: '#fef2f2', borderColor: '#fecaca', borderWidth: 1, borderRadius: 12, padding: 10, marginTop: 14 },
  errorText: { color: '#dc2626', fontSize: 13 },
  button: {
    backgroundColor: '#4f46e5', borderRadius: 12, paddingVertical: 14,
    alignItems: 'center', marginTop: 20,
  },
  buttonText: { color: 'white', fontSize: 15, fontWeight: '700' },
  switchText: { textAlign: 'center', color: '#64748b', marginTop: 20, fontSize: 13 },
  switchLink: { color: '#4f46e5', fontWeight: '600' },
});
