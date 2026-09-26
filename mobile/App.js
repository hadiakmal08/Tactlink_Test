import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { ApolloProvider } from '@apollo/client';
import { client, initCachePersistence } from './src/lib/apolloClient';
import { AuthProvider } from './src/lib/auth';
import Navigation from './src/Navigation';

export default function App() {
  const [cacheReady, setCacheReady] = useState(false);

  useEffect(() => {
    initCachePersistence().finally(() => setCacheReady(true));
  }, []);

  if (!cacheReady) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <ApolloProvider client={client}>
        <AuthProvider>
          <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
            <Navigation />
          </SafeAreaView>
        </AuthProvider>
      </ApolloProvider>
      <StatusBar style="dark" />
    </SafeAreaProvider>
  );
}
