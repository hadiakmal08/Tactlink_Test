import { useState } from 'react';
import {
  View, Text, TextInput, Pressable, FlatList, StyleSheet, ActivityIndicator,
} from 'react-native';
import { gql, useQuery, useMutation } from '@apollo/client';
import NetInfo from '@react-native-community/netinfo';
import { useEffect } from 'react';
import { useAuth } from '../lib/auth';
import { errorMessage } from '../lib/errorMessage';
import ConfirmModal from '../components/ConfirmModal';

const TODOS = gql`query { todos { id title completed createdAt } }`;
const CREATE = gql`
  mutation Create($title: String!) { createTodo(title: $title) { id title completed createdAt } }
`;
const TOGGLE = gql`
  mutation Toggle($id: ID!) { toggleTodo(id: $id) { id title completed createdAt } }
`;
const DELETE = gql`mutation Delete($id: ID!) { deleteTodo(id: $id) }`;

export default function TodosScreen() {
  const { user, logout } = useAuth();
  const [title, setTitle] = useState('');
  const [pendingDelete, setPendingDelete] = useState(null);
  const [isOffline, setIsOffline] = useState(false);
  const [banner, setBanner] = useState('');

  const { data, loading, error, refetch } = useQuery(TODOS, {
    // Read from the persisted cache first so the list shows instantly,
    // even before (or without) a network connection.
    fetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: true,
  });

  useEffect(() => {
    const unsub = NetInfo.addEventListener((state) => setIsOffline(!state.isConnected));
    return unsub;
  }, []);

  const [createTodo, { loading: adding }] = useMutation(CREATE, {
    update(cache, { data }) {
      const existing = cache.readQuery({ query: TODOS });
      cache.writeQuery({
        query: TODOS,
        data: { todos: [data.createTodo, ...(existing?.todos ?? [])] },
      });
    },
    onError: (e) => setBanner(errorMessage(e)),
  });

  const [toggleTodo] = useMutation(TOGGLE, {
    optimisticResponse: (vars) => ({
      toggleTodo: {
        __typename: 'Todo',
        id: vars.id,
        title: todos.find((t) => t.id === vars.id)?.title ?? '',
        completed: !todos.find((t) => t.id === vars.id)?.completed,
        createdAt: todos.find((t) => t.id === vars.id)?.createdAt ?? '',
      },
    }),
    onError: (e) => { setBanner(errorMessage(e)); refetch(); },
  });

  const [deleteTodo] = useMutation(DELETE, {
    update(cache, _result, { variables }) {
      const existing = cache.readQuery({ query: TODOS });
      cache.writeQuery({
        query: TODOS,
        data: { todos: (existing?.todos ?? []).filter((t) => t.id !== variables.id) },
      });
    },
    onError: (e) => { setBanner(errorMessage(e)); refetch(); },
  });

  const todos = data?.todos ?? [];
  const remaining = todos.filter((t) => !t.completed).length;

  const handleAdd = () => {
    if (!title.trim() || isOffline) return;
    createTodo({ variables: { title: title.trim() } });
    setTitle('');
  };

  const confirmDelete = () => {
    deleteTodo({ variables: { id: pendingDelete.id } });
    setPendingDelete(null);
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>My To-Dos</Text>
          <Text style={styles.headerEmail} numberOfLines={1}>{user?.email}</Text>
        </View>
        <Pressable style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutText}>Log out</Text>
        </Pressable>
      </View>

      {isOffline && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineText}>You're offline — showing your last saved list</Text>
        </View>
      )}
      {!!banner && !isOffline && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>{banner}</Text>
        </View>
      )}

      <View style={styles.addRow}>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="What needs doing?"
          placeholderTextColor="#94a3b8"
          onSubmitEditing={handleAdd}
          returnKeyType="done"
        />
        <Pressable
          style={[styles.addBtn, (adding || !title.trim() || isOffline) && { opacity: 0.5 }]}
          onPress={handleAdd}
          disabled={adding || !title.trim() || isOffline}
        >
          <Text style={styles.addBtnText}>Add</Text>
        </Pressable>
      </View>

      {loading && todos.length === 0 ? (
        <ActivityIndicator style={{ marginTop: 30 }} color="#4f46e5" />
      ) : todos.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>📝</Text>
          <Text style={styles.emptyTitle}>Nothing here yet</Text>
          <Text style={styles.emptySubtitle}>Add your first task above.</Text>
        </View>
      ) : (
        <FlatList
          data={todos}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 16 }}
          ListFooterComponent={
            <Text style={styles.footerText}>{remaining} of {todos.length} remaining</Text>
          }
          renderItem={({ item }) => (
            <View style={styles.row}>
              <Pressable
                onPress={() => toggleTodo({ variables: { id: item.id } })}
                style={[styles.checkbox, item.completed && styles.checkboxChecked]}
              >
                {item.completed && <Text style={styles.checkmark}>✓</Text>}
              </Pressable>
              <Text
                style={[styles.rowText, item.completed && styles.rowTextDone]}
                numberOfLines={2}
              >
                {item.title}
              </Text>
              <Pressable onPress={() => setPendingDelete(item)} style={styles.deleteBtn}>
                <Text style={styles.deleteIcon}>🗑</Text>
              </Pressable>
            </View>
          )}
        />
      )}

      <ConfirmModal
        visible={!!pendingDelete}
        title="Delete this task?"
        message={pendingDelete ? `"${pendingDelete.title}" will be removed permanently.` : ''}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f8fafc', paddingHorizontal: 16, paddingTop: 8 },
  header: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'white',
    borderRadius: 16, padding: 14, marginTop: 8, marginBottom: 12,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 1,
  },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#0f172a' },
  headerEmail: { fontSize: 12, color: '#64748b', marginTop: 2 },
  logoutBtn: { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7 },
  logoutText: { fontSize: 12, fontWeight: '600', color: '#475569' },
  offlineBanner: { backgroundColor: '#fef3c7', borderRadius: 10, padding: 10, marginBottom: 10 },
  offlineText: { color: '#92400e', fontSize: 12, fontWeight: '500', textAlign: 'center' },
  errorBanner: { backgroundColor: '#fef2f2', borderRadius: 10, padding: 10, marginBottom: 10 },
  errorBannerText: { color: '#dc2626', fontSize: 12, textAlign: 'center' },
  addRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  input: {
    flex: 1, backgroundColor: 'white', borderWidth: 1, borderColor: '#cbd5e1',
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11, fontSize: 15, color: '#0f172a',
  },
  addBtn: { backgroundColor: '#4f46e5', borderRadius: 12, paddingHorizontal: 18, justifyContent: 'center' },
  addBtnText: { color: 'white', fontWeight: '700', fontSize: 14 },
  empty: { alignItems: 'center', marginTop: 60 },
  emptyEmoji: { fontSize: 30, marginBottom: 8 },
  emptyTitle: { fontSize: 15, fontWeight: '600', color: '#334155' },
  emptySubtitle: { fontSize: 13, color: '#94a3b8', marginTop: 4 },
  row: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'white',
    borderRadius: 12, padding: 12, marginBottom: 8, gap: 10,
  },
  checkbox: {
    width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#cbd5e1',
    alignItems: 'center', justifyContent: 'center',
  },
  checkboxChecked: { backgroundColor: '#4f46e5', borderColor: '#4f46e5' },
  checkmark: { color: 'white', fontSize: 12, fontWeight: '700' },
  rowText: { flex: 1, fontSize: 14, color: '#1e293b' },
  rowTextDone: { color: '#94a3b8', textDecorationLine: 'line-through' },
  deleteBtn: { padding: 6 },
  deleteIcon: { fontSize: 16 },
  footerText: { textAlign: 'center', color: '#94a3b8', fontSize: 12, marginTop: 4, marginBottom: 12 },
});
