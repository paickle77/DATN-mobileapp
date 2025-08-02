import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
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
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BASE_URL } from '../../services/api';

const { width, height } = Dimensions.get('window');

// ✅ Thêm type cho route params
type RouteParams = {
  email?: string;
};

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const navigation = useNavigation();
  const route = useRoute();
  const params = route.params as RouteParams;

  // ✅ Tự động điền email từ params khi component mount
  useEffect(() => {
    if (params?.email) {
      setEmail(params.email);
      console.log('📧 Email nhận từ Login:', params.email);
    }
  }, [params?.email]);

  // ✅ Countdown timer
  useEffect(() => {
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

  // ✅ Gửi OTP - sử dụng Account API
  const sendOtp = async () => {
    if (!email.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập email');
      return;
    }

    setLoading(true);
    try {
      // ✅ Chuyển sang Account API
      const res = await axios.post(BASE_URL + '/send-otp', { 
        email: email.trim() 
      });
      
      console.log('✅ Gửi OTP thành công:', res.data);
      
      if (res.data.success) {
        Alert.alert('Thành công', res.data.message || 'OTP đã gửi về email');
        setOtpSent(true);
        setCountdown(60); // Bắt đầu đếm ngược 60 giây
      } else {
        Alert.alert('Lỗi', res.data.message || 'Gửi OTP thất bại');
      }
    } catch (err: any) {
      console.error('❌ Lỗi gửi OTP:', err);
      
      let message = 'Gửi OTP thất bại';
      if (axios.isAxiosError(err)) {
        message = err.response?.data?.message || err.response?.data?.msg || message;
        
        // Xử lý các lỗi cụ thể
        if (err.response?.status === 404) {
          message = 'Email này chưa được đăng ký';
        } else if (err.response?.status === 400) {
          message = err.response.data.message || 'Dữ liệu không hợp lệ';
        }
      }
      Alert.alert('Lỗi', message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Reset password - sử dụng Account API
  const resetPassword = async () => {
    if (!otp.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập mã OTP');
      return;
    }
    
    if (!newPassword.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập mật khẩu mới');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Lỗi', 'Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    setLoading(true);
    try {
      // ✅ Chuyển sang Account API
      const res = await axios.post(BASE_URL + '/reset-password', {
        email: email.trim(),
        otp: otp.trim(),
        newPassword: newPassword.trim(),
      });

      console.log('✅ Reset password thành công:', res.data);

      if (res.data.success) {
        Alert.alert(
          'Thành công', 
          res.data.message || 'Mật khẩu đã được cập nhật',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Login' as never)
            }
          ]
        );
      } else {
        Alert.alert('Lỗi', res.data.message || 'Không thể đặt lại mật khẩu');
      }
    } catch (err: any) {
      console.error('❌ Lỗi reset password:', err);
      
      let message = 'Không đặt lại được mật khẩu';
      if (axios.isAxiosError(err)) {
        message = err.response?.data?.message || err.response?.data?.msg || message;
        
        // Xử lý các lỗi cụ thể
        if (err.response?.status === 400) {
          message = 'OTP không hợp lệ hoặc đã hết hạn';
        }
      }
      Alert.alert('Lỗi', message);
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
                  setCountdown(0);
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
                    editable={!loading}
                  />
                </View>

                {/* ✅ Hiển thị thông tin nếu email được truyền từ Login */}
                {params?.email && (
                  <Text style={styles.helperText}>
                    📧 Email từ màn hình đăng nhập
                  </Text>
                )}

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
                      placeholder="Nhập mã OTP (6 số)"
                      placeholderTextColor="#999"
                      value={otp}
                      onChangeText={setOtp}
                      style={[styles.textInput, { paddingRight: 10 }]}
                      keyboardType="numeric"
                      maxLength={6}
                      editable={!loading}
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
                    editable={!loading}
                  />
                </View>
                <Text style={styles.helperText}>
                  Mật khẩu phải có ít nhất 6 ký tự
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
              Nhớ mật khẩu?{' '}
              <Text
                style={styles.linkText}
                onPress={() => navigation.navigate('Login' as never)}
              >
                Đăng nhập ngay
              </Text>
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