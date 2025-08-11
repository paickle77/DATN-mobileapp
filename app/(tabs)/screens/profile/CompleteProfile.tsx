import { Ionicons } from '@expo/vector-icons';
import { NavigationProp, useRoute } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { RegisterAuthService } from '../../services/RegisterAuthService';
import { validateCompleteProfileForm } from '../../utils/validation';

// Danh sách các tùy chọn giới tính
const GENDER_OPTIONS = [
  { value: 'nam', label: 'Nam' },
  { value: 'nữ', label: 'Nữ' },
  { value: 'khác', label: 'Khác' }
];

type RootStackParamList = {
  CompleteProfile: {
    account_id: string; // ✅ SỬA: Đổi từ id thành account_id
  };
  Address: {
    account_id: string;
    fullName?: string;
    phone?: string;
    gender?: string;
    avatar?: string;
    profile_id?: string; // ✅ THÊM: Thêm profile_id vào params
  };
};

export default function CompleteProfile() {
  const route = useRoute();
  const { account_id } = route.params as { account_id: string }; // ✅ SỬA: Đổi từ id
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  // State cho form
  const [avatar, setAvatar] = useState<string | null>(null);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('');
  const [showGenderModal, setShowGenderModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarBase64, setAvatarBase64] = useState(''); // ✅ THÊM: Lưu base64 của avatar

  const [errors, setErrors] = useState({
    fullName: '',
    phone: '',
    gender: '',
  });

  // ✅ SỬA: Load thông tin user hiện tại (nếu có)
  useEffect(() => {
    const loadUserData = async () => {
      if (!account_id) return;

      try {
        setIsLoadingUser(true);

        // ✅ Gọi API mới để lấy user theo account_id
        const user = await RegisterAuthService.getUserByAccountId(account_id);

        // Nếu user đã có profile thì load data
        if (user) {
          setFullName(user.name || '');
          setPhone(user.phone || '');
          setGender(user.gender || '');

          if (user.avatar && user.avatar !== 'avatarmacdinh.png') {
            const avatarUrl = RegisterAuthService.getAvatarUrl(user.avatar);
            setAvatar(avatarUrl);
          }

          console.log('✅ Đã load thông tin user:', user._id);
        } else {
          console.log('ℹ️ User chưa có profile, sẽ tạo mới');
        }
      } catch (error) {
        console.error('❌ Lỗi khi lấy thông tin user:', error);
        // Không hiển thị alert ở đây vì có thể là user mới chưa có thông tin
      } finally {
        setIsLoadingUser(false);
      }
    };

    loadUserData();
  }, [account_id]);

  // Chọn ảnh từ thư viện
  const pickImage = async () => {
    try {
      // Yêu cầu quyền truy cập thư viện ảnh
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Thông báo', 'Cần cấp quyền truy cập thư viện ảnh để chọn avatar');
        return;
      }

      // Mở picker để chọn ảnh từ thư viện
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
        exif: false,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0];
        setAvatar(selectedImage.uri);
        setAvatarBase64(selectedImage.base64 ?? ''); // ✅ Lưu base64
        setIsUploadingAvatar(false); // ✅ Không cần upload ngay

        console.log('✅ Đã chọn ảnh:', selectedImage.uri);
      }
    } catch (error) {
      console.error('❌ Lỗi khi chọn ảnh:', error);
      Alert.alert('Lỗi', 'Không thể chọn ảnh. Vui lòng thử lại.');
    }
  };

  // Xử lý chọn giới tính
  const handleGenderSelect = (selectedGender: string) => {
    setGender(selectedGender);
    setShowGenderModal(false);
    // Xóa lỗi khi người dùng chọn giới tính
    if (errors.gender) {
      setErrors(prev => ({ ...prev, gender: '' }));
    }
  };

  // ✅ SỬA: Xử lý submit form
  const handleSubmit = async () => {
    // Reset lỗi trước khi validate
    setErrors({
      fullName: '',
      phone: '',
      gender: '',
    });

    // Gọi validation từ file utils
    const validation = validateCompleteProfileForm(fullName.trim(), phone.trim(), gender);

    // Nếu có lỗi, hiển thị lỗi và dừng
    if (!validation.isValid) {
      setErrors({
        fullName: validation.errors.fullName || '',
        phone: validation.errors.phone || '',
        gender: validation.errors.gender || '',
      });
      return;
    }

    setIsLoading(true);

    try {
      // Format phone number
      const formattedPhone = RegisterAuthService.formatPhoneNumber(phone.trim());

      // ✅ Tạo hồ sơ với account_id
      const user = await RegisterAuthService.createUserProfile(account_id, {
        name: fullName.trim(),
        phone: formattedPhone,
        gender,
        avatar: avatarBase64 || undefined // ✅ Gửi base64 thay vì URI
      });

      console.log('✅ Tạo hồ sơ thành công cho account_id:', account_id);
      console.log('✅ User ID mới:', user._id);

      Alert.alert(
        'Thành công',
        'Tạo hồ sơ thành công',
        [
          {
            text: 'OK',
            onPress: () => {
              // ✅ Chuyển đến màn hình tiếp theo với account_id
              navigation.navigate('Address', {
                account_id: account_id,
                profile_id: user._id,
                fullName,
                phone: formattedPhone,
                gender,
                avatar: avatar ?? undefined,
              });
            }
          }
        ]
      );

    } catch (error) {
      console.error('❌ Lỗi khi tạo hồ sơ:', error);

      if (error instanceof Error) {
        Alert.alert('Lỗi', error.message);
      } else {
        Alert.alert('Lỗi', 'Không thể tạo hồ sơ');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Render avatar
  const renderAvatar = () => {
    if (avatar) {
      return <Image source={{ uri: avatar }} style={styles.avatar} />;
    } else {
      return (
        <View style={styles.avatarPlaceholder}>
          <Image
            source={require('../../../../assets/images/avatarmacdinh.png')}
            style={styles.avatar}
          />
        </View>
      );
    }
  };

  if (isLoadingUser) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#6B4F35" />
        <Text style={styles.loadingText}>Đang tải thông tin...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Nút quay lại */}
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backIcon}>
        <Ionicons name="arrow-back-circle-outline" size={30} color="#000" />
      </TouchableOpacity>

      <Text style={styles.title}>Hoàn thiện hồ sơ của bạn</Text>
      <Text style={styles.subtitle}>
        Đừng lo, chỉ bạn mới có thể nhìn thấy dữ liệu cá nhân này. Không ai khác có thể truy cập.
      </Text>

      {/* Avatar & nút chọn ảnh */}
      <TouchableOpacity
        style={styles.avatarContainer}
        onPress={pickImage}
        disabled={isLoading || isUploadingAvatar}
      >
        {renderAvatar()}
        <View style={styles.editIconContainer}>
          {isUploadingAvatar ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="pencil" size={20} color="#fff" />
          )}
        </View>
      </TouchableOpacity>

      {/* Input Họ tên */}
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, errors.fullName ? styles.inputError : null]}
          placeholder="Họ tên"
          placeholderTextColor="#999"
          value={fullName}
          onChangeText={(text) => {
            setFullName(text);
            // Xóa lỗi khi người dùng bắt đầu nhập
            if (errors.fullName) {
              setErrors(prev => ({ ...prev, fullName: '' }));
            }
          }}
          editable={!isLoading}
        />
        {errors.fullName ? <Text style={styles.errorText}>{errors.fullName}</Text> : null}
      </View>

      {/* Input Số điện thoại */}
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, errors.phone ? styles.inputError : null]}
          placeholder="Số điện thoại (VD: 0987654321)"
          placeholderTextColor="#999"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={(text) => {
            setPhone(text);
            // Xóa lỗi khi người dùng bắt đầu nhập
            if (errors.phone) {
              setErrors(prev => ({ ...prev, phone: '' }));
            }
          }}
          editable={!isLoading}
        />
        {errors.phone ? <Text style={styles.errorText}>{errors.phone}</Text> : null}
      </View>

      {/* Chọn Giới tính */}
      <View style={styles.inputContainer}>
        <TouchableOpacity
          style={[styles.pickerContainer, errors.gender ? styles.inputError : null]}
          onPress={() => setShowGenderModal(true)}
          disabled={isLoading}
        >
          <Text style={[styles.pickerText, gender ? { color: '#333' } : { color: '#999' }]}>
            {gender ? GENDER_OPTIONS.find(option => option.value === gender)?.label : 'Lựa chọn giới tính'}
          </Text>
          <Ionicons name="chevron-down" size={20} color="#999" />
        </TouchableOpacity>
        {errors.gender ? <Text style={styles.errorText}>{errors.gender}</Text> : null}
      </View>

      {/* Nút Hoàn thành hồ sơ */}
      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={isLoading}
      >
        {isLoading ? (
          <View style={styles.buttonContent}>
            <ActivityIndicator size="small" color="#fff" style={styles.buttonLoader} />
            <Text style={styles.buttonText}>Đang xử lý...</Text>
          </View>
        ) : (
          <Text style={styles.buttonText}>Hoàn thành hồ sơ</Text>
        )}
      </TouchableOpacity>

      {/* Modal chọn giới tính */}
      <Modal
        visible={showGenderModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowGenderModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Chọn giới tính</Text>

            {GENDER_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={styles.radioOption}
                onPress={() => handleGenderSelect(option.value)}
              >
                <View style={styles.radioButton}>
                  {gender === option.value && <View style={styles.radioButtonSelected} />}
                </View>
                <Text style={styles.radioText}>{option.label}</Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setShowGenderModal(false)}
            >
              <Text style={styles.modalCancelText}>Hủy</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 30,
    backgroundColor: '#fff',
  },
  backIcon: {
    marginTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    alignSelf: 'center',
    marginTop: 10,
    color: '#333',
  },
  subtitle: {
    textAlign: 'center',
    color: '#555',
    marginVertical: 15,
    fontSize: 14,
  },
  avatarContainer: {
    alignSelf: 'center',
    marginVertical: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#6B4F35',
    borderRadius: 12,
    padding: 4,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 25,
    paddingHorizontal: 20,
    backgroundColor: '#f9f9f9',
    color: '#333',
  },
  inputError: {
    borderColor: '#ff6b6b',
    borderWidth: 2,
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 12,
    marginTop: 5,
    marginLeft: 20,
  },
  pickerContainer: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#f9f9f9',
    justifyContent: 'space-between',
  },
  pickerText: {
    fontSize: 16,
  },
  button: {
    backgroundColor: '#6B4F35',
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonLoader: {
    marginRight: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  // Styles cho Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: '80%',
    maxWidth: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#6B4F35',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#6B4F35',
  },
  radioText: {
    fontSize: 16,
    color: '#333',
  },
  modalCancelButton: {
    marginTop: 20,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    color: '#666',
  },
});