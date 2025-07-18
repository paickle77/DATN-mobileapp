import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { styles } from './styles';

interface Props {
  goBack: () => void;
  openModal: () => void;
}

const DeleteAccount = ({ goBack, openModal }: Props) => {
  const [deletePassword, setDeletePassword] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDeleteAccount = () => {
    if (!confirmDelete) {
      alert('Vui lòng xác nhận bạn muốn xóa tài khoản!');
      return;
    }
    if (!deletePassword) {
      alert('Vui lòng nhập mật khẩu để xác nhận!');
      return;
    }
    openModal();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#222" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Xóa tài khoản</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.warningContainer}>
          <Feather name="alert-triangle" size={32} color="#FF6B6B" />
          <Text style={styles.warningTitle}>Cảnh báo!</Text>
          <Text style={styles.warningText}>
            Việc xóa tài khoản sẽ không thể hoàn tác. Tất cả dữ liệu của bạn sẽ bị xóa vĩnh viễn, bao gồm:
          </Text>
          <Text style={styles.warningList}>
• Thông tin cá nhân{"\n"}
• Lịch sử hoạt động{"\n"}
• Cài đặt và tuý chọn{"\n"}
• Tất cả dữ liệu liên quan
          </Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.inputLabel}>Nhập mật khẩu để xác nhận</Text>
          <TextInput
            style={styles.input}
            placeholder="Mật khẩu của bạn"
            secureTextEntry
            value={deletePassword}
            onChangeText={setDeletePassword}
          />

          <View style={styles.checkboxContainer}>
            <TouchableOpacity
              style={styles.checkbox}
              onPress={() => setConfirmDelete(!confirmDelete)}
            >
              {confirmDelete && <Feather name="check" size={16} color="#fff" />}
            </TouchableOpacity>
            <Text style={styles.checkboxText}>
              Tôi hiểu rằng việc này không thể hoàn tác và muốn xóa tài khoản vĩnh viễn
            </Text>
          </View>

          <TouchableOpacity style={styles.dangerButton} onPress={handleDeleteAccount}>
            <Text style={styles.dangerButtonText}>Xóa tài khoản vĩnh viễn</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default DeleteAccount;
