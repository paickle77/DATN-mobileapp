// utils/validation.ts

export interface ValidationResult {
  isValid: boolean;
  error: string;
}

export interface FormErrors {
  [key: string]: string;
}

// Validate email format
export const validateEmail = (email: string): ValidationResult => {
  if (!email.trim()) {
    return { isValid: false, error: 'Email không được để trống' };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Email không đúng định dạng' };
  }
  
  return { isValid: true, error: '' };
};

// Validate password strength
export const validatePassword = (password: string): ValidationResult => {
  if (!password.trim()) {
    return { isValid: false, error: 'Mật khẩu không được để trống' };
  }
  
  if (password.length < 6) {
    return { isValid: false, error: 'Mật khẩu phải có ít nhất 6 ký tự' };
  }
  
  return { isValid: true, error: '' };
};

// Validate confirm password
export const validateConfirmPassword = (password: string, confirmPassword: string): ValidationResult => {
  if (!confirmPassword.trim()) {
    return { isValid: false, error: 'Vui lòng nhập lại mật khẩu' };
  }
  
  if (password !== confirmPassword) {
    return { isValid: false, error: 'Mật khẩu không khớp' };
  }
  
  return { isValid: true, error: '' };
};

// Validate full name
export const validateFullName = (fullName: string): ValidationResult => {
  if (!fullName.trim()) {
    return { isValid: false, error: 'Họ tên không được để trống' };
  }
  
  if (fullName.trim().length < 2) {
    return { isValid: false, error: 'Họ tên phải có ít nhất 2 ký tự' };
  }
  
  return { isValid: true, error: '' };
};

// Validate Vietnamese phone number
export const validatePhone = (phone: string): ValidationResult => {
  if (!phone.trim()) {
    return { isValid: false, error: 'Số điện thoại không được để trống' };
  }
  
  const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
  if (!phoneRegex.test(phone)) {
    return { isValid: false, error: 'Số điện thoại không đúng định dạng (VD: 0987654321)' };
  }
  
  return { isValid: true, error: '' };
};

// Validate gender selection
export const validateGender = (gender: string): ValidationResult => {
  if (!gender) {
    return { isValid: false, error: 'Vui lòng chọn giới tính' };
  }
  
  const validGenders = ['nam', 'nữ', 'khác'];
  if (!validGenders.includes(gender.toLowerCase())) {
    return { isValid: false, error: 'Giới tính không hợp lệ' };
  }
  
  return { isValid: true, error: '' };
};

// Validate Đăng nhập
export const validateLoginForm = (email: string, password: string): { isValid: boolean; errors: FormErrors } => {
  const errors: FormErrors = {};
  let isValid = true;

  const emailValidation = validateEmail(email);
  if (!emailValidation.isValid) {
    errors.email = emailValidation.error;
    isValid = false;
  }

  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    errors.password = passwordValidation.error;
    isValid = false;
  }

  return { isValid, errors };
};

// Validate Đăng kí
export const validateRegisterForm = (
  email: string, 
  password: string, 
  confirmPassword: string,
  agree: boolean
): { isValid: boolean; errors: FormErrors } => {
  const errors: FormErrors = {};
  let isValid = true;

  const emailValidation = validateEmail(email);
  if (!emailValidation.isValid) {
    errors.email = emailValidation.error;
    isValid = false;
  }

  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    errors.password = passwordValidation.error;
    isValid = false;
  }

  const confirmPasswordValidation = validateConfirmPassword(password, confirmPassword);
  if (!confirmPasswordValidation.isValid) {
    errors.confirmPassword = confirmPasswordValidation.error;
    isValid = false;
  }

  if (!agree) {
    errors.agree = 'Vui lòng đồng ý với điều khoản và điều kiện';
    isValid = false;
  }

  return { isValid, errors };
};

// Validate thêm hồ sơ 
export const validateCompleteProfileForm = (
  fullName: string,
  phone: string,
  gender: string
): { isValid: boolean; errors: FormErrors } => {
  const errors: FormErrors = {};
  let isValid = true;

  const fullNameValidation = validateFullName(fullName);
  if (!fullNameValidation.isValid) {
    errors.fullName = fullNameValidation.error;
    isValid = false;
  }

  const phoneValidation = validatePhone(phone);
  if (!phoneValidation.isValid) {
    errors.phone = phoneValidation.error;
    isValid = false;
  }

  const genderValidation = validateGender(gender);
  if (!genderValidation.isValid) {
    errors.gender = genderValidation.error;
    isValid = false;
  }

  return { isValid, errors };
};