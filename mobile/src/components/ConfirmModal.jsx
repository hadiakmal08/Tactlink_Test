import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';

export default function ConfirmModal({ visible, title, message, confirmLabel = 'Delete', onConfirm, onCancel }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.row}>
            <Pressable style={styles.cancelBtn} onPress={onCancel}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable style={styles.confirmBtn} onPress={onConfirm}>
              <Text style={styles.confirmText}>{confirmLabel}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(15,23,42,0.45)', justifyContent: 'center', padding: 24 },
  card: { backgroundColor: 'white', borderRadius: 20, padding: 22 },
  title: { fontSize: 17, fontWeight: '700', color: '#0f172a' },
  message: { marginTop: 6, fontSize: 14, color: '#64748b' },
  row: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 18, gap: 8 },
  cancelBtn: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10 },
  cancelText: { color: '#475569', fontSize: 14, fontWeight: '500' },
  confirmBtn: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, backgroundColor: '#dc2626' },
  confirmText: { color: 'white', fontSize: 14, fontWeight: '600' },
});
