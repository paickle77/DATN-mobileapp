import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface NoteSectionProps {
  note: string;
  onNoteChange: (text: string) => void;
}

const NoteSection: React.FC<NoteSectionProps> = ({ note, onNoteChange }) => {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Ionicons name="chatbubble-outline" size={20} color="#e74c3c" />
        <Text style={styles.sectionTitle}>Lời nhắn cho người bán</Text>
      </View>
      <TextInput
        style={styles.noteInput}
        placeholder="Ghi chú đơn hàng (tùy chọn)"
        value={note}
        onChangeText={onNoteChange}
        multiline
        maxLength={200}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    backgroundColor: '#fff',
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginLeft: 8,
  },
  noteInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
    backgroundColor: '#fff',
  },
});

export default NoteSection;