import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View, TextInput, Modal } from 'react-native';
import { X } from 'lucide-react-native';

export const Button = ({ title, onPress, icon: Icon, variant = 'primary', style, size='md' }) => {
  const baseStyles = [styles.btn, style];
  if (variant === 'primary') baseStyles.push(styles.btnPrimary);
  else if (variant === 'secondary') baseStyles.push(styles.btnSecondary);
  else if (variant === 'danger') baseStyles.push(styles.btnDanger);

  return (
    <TouchableOpacity style={baseStyles} onPress={onPress}>
      {Icon && <Icon size={size === 'sm' ? 16 : 20} color={variant === 'secondary' ? '#334155' : 'white'} style={{marginRight: 6}} />}
      <Text style={[styles.btnText, variant === 'secondary' && styles.btnTextSecondary]}>{title}</Text>
    </TouchableOpacity>
  );
};

export const Input = (props) => (
  <TextInput
    {...props}
    style={[styles.input, props.style]}
    placeholderTextColor="#94a3b8"
  />
);

export const AppModal = ({ visible, onClose, title, children }) => (
  <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{title}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <X size={24} color="#64748b" />
          </TouchableOpacity>
        </View>
        <View style={styles.modalBody}>
          {children}
        </View>
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  btnPrimary: { backgroundColor: '#4f46e5', shadowColor: '#4f46e5', shadowOpacity: 0.3, shadowRadius: 5, elevation: 4 },
  btnSecondary: { backgroundColor: 'white', borderWidth: 1, borderColor: '#e2e8f0' },
  btnDanger: { backgroundColor: '#ef4444' },
  btnText: { color: 'white', fontWeight: '700', fontSize: 14 },
  btnTextSecondary: { color: '#334155' },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#0f172a',
  },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: 'white', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: 40, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#0f172a' },
  closeBtn: { padding: 4 },
  modalBody: { padding: 20 }
});
