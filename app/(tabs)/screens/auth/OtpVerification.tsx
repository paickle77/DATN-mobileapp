import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient'; // hoặc react-native-linear-gradient
import { useNavigation } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons'; // hoặc thư viện icon khác
import { BASE_URL } from '../../services/api';

const { width, height } = Dimensions.get('window');

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigator = useNavigation();
  const [countdown, setCountdown] = useState(0);


  const sendOtp = async () => {
    setLoading(true);
    try {
      const res = await axios.post(BASE_URL + '/users/send-otp', { email });
      Alert.alert('Thành công', 'OTP đã gửi về email');
      setOtpSent(true);
      setCountdown(60); // Bắt đầu đếm ngược 60 giây
    } catch (err) {
      Alert.alert('Lỗi', err.response?.data?.msg || 'Gửi OTP thất bại');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (countdown === 0) return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [countdown]);

  const resetPassword = async () => {
    setLoading(true);
    try {
      const res = await axios.post(BASE_URL+'/users/reset-password', {
        otp,
        newPassword,
      });
      Alert.alert('Thành công', 'Mật khẩu đã cập nhật');
      navigator.navigate('Login'); // Chuyển hướng về
    } catch (err) {
      Alert.alert('Lỗi', err.response?.data?.msg || 'Không đặt lại được mật khẩu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Icon name="lock-outline" size={40} color="#fff" />
            </View>
            <Text style={styles.title}>
              {otpSent ? 'Xác thực OTP' : 'Quên mật khẩu'}
            </Text>
            <Text style={styles.subtitle}>
              {otpSent 
                ? 'Nhập mã OTP và mật khẩu mới'
                : 'Nhập email để nhận mã xác thực'
              }
            </Text>
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            {/* Back Button */}
            {otpSent && (
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => {
                  setOtpSent(false);
                  setOtp('');
                  setNewPassword('');
                }}
              >
                <Icon name="arrow-back" size={20} color="#666" />
                <Text style={styles.backButtonText}>Quay lại</Text>
              </TouchableOpacity>
            )}

            {!otpSent ? (
              /* Email Input Phase */
              <View style={styles.inputSection}>
                <Text style={styles.label}>Email đăng ký</Text>
                <View style={styles.inputContainer}>
                  <Icon name="email" size={20} color="#999" style={styles.inputIcon} />
                  <TextInput
                    placeholder="Nhập email của bạn"
                    placeholderTextColor="#999"
                    value={email}
                    onChangeText={setEmail}
                    style={styles.textInput}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>

                <TouchableOpacity
                  onPress={sendOtp}
                  disabled={!email || loading || countdown > 0}
                  style={[
                    styles.primaryButton,
                    (!email || loading || countdown > 0) && styles.disabledButton
                  ]}
                >
                  <LinearGradient
                    colors={
                      (!email || loading || countdown > 0)
                        ? ['#ccc', '#999']
                        : ['#667eea', '#764ba2']
                    }
                    style={styles.buttonGradient}
                  >
                    {loading && <Icon name="refresh" size={20} color="#fff" style={styles.loadingIcon} />}
                    <Text style={styles.buttonText}>
                      {loading
                        ? 'Đang gửi...'
                        : countdown > 0
                        ? `Gửi lại sau ${countdown}s`
                        : 'Gửi mã OTP'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>

              </View>
            ) : (
              /* OTP and Password Phase */
              <View style={styles.inputSection}>
                <Text style={styles.label}>Mã OTP</Text>
                <View style={[styles.inputContainer, { justifyContent: 'space-between' }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    <Icon name="security" size={20} color="#999" style={styles.inputIcon} />
                    <TextInput
                      placeholder="Nhập mã OTP"
                      placeholderTextColor="#999"
                      value={otp}
                      onChangeText={setOtp}
                      style={[styles.textInput, { paddingRight: 10 }]}
                      keyboardType="numeric"
                      maxLength={6}
                    />
                  </View>

                  <TouchableOpacity
                    onPress={sendOtp}
                    disabled={countdown > 0 || loading}
                  >
                    <Text style={[
                      styles.resendText,
                      (countdown > 0 || loading) && { color: '#aaa' }
                    ]}>
                      {countdown > 0 ? `${countdown}s` : 'Gửi lại'}
                    </Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.helperText}>
                  Mã OTP đã được gửi đến {email}
                </Text>

                <Text style={styles.label}>Mật khẩu mới</Text>
                <View style={styles.inputContainer}>
                  <Icon name="lock" size={20} color="#999" style={styles.inputIcon} />
                  <TextInput
                    placeholder="Nhập mật khẩu mới"
                    placeholderTextColor="#999"
                    value={newPassword}
                    onChangeText={setNewPassword}
                    style={styles.textInput}
                    secureTextEntry
                  />
                </View>
                <Text style={styles.helperText}>
                  Mật khẩu phải có ít nhất 8 ký tự
                </Text>

                <TouchableOpacity
                  onPress={resetPassword}
                  disabled={!otp || !newPassword || loading}
                  style={[
                    styles.primaryButton,
                    (!otp || !newPassword || loading) && styles.disabledButton
                  ]}
                >
                  <LinearGradient
                    colors={(!otp || !newPassword || loading) ? ['#ccc', '#999'] : ['#4CAF50', '#45a049']}
                    style={styles.buttonGradient}
                  >
                    {loading && <Icon name="refresh" size={20} color="#fff" style={styles.loadingIcon} />}
                    <Text style={styles.buttonText}>
                      {loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Nhớ mật khẩu? {' '}
                <Text style={styles.linkText}>Đăng nhập ngay</Text>
              </Text>
            </View>
          </View>

          {/* Security Notice */}
          <View style={styles.securityNotice}>
            <Icon name="security" size={16} color="#fff" />
            <Text style={styles.securityText}>
              Thông tin của bạn được bảo mật và mã hóa
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButtonText: {
    marginLeft: 8,
    color: '#666',
    fontSize: 16,
  },
  inputSection: {
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 15,
    backgroundColor: '#f8f9fa',
    marginBottom: 8,
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    paddingVertical: 15,
    fontSize: 16,
    color: '#333',
  },
  resendText: {
    color: '#667eea',
    fontWeight: '600',
    fontSize: 14,
  },

  helperText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 20,
  },
  primaryButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingIcon: {
    marginRight: 8,
    transform: [{ rotate: '360deg' }], // Animation sẽ cần thêm Animated API
  },
  footer: {
    marginTop: 25,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#666',
  },
  linkText: {
    color: '#667eea',
    fontWeight: '600',
  },
  securityNotice: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  securityText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    marginLeft: 5,
  },
});

export default ForgotPasswordScreen;