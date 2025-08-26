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
  
  const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Email không hợp lệ (ví dụ: ten@gmail.com)' };
  }
  
  return { isValid: true, error: '' };
};

// Validate password strength
export const validatePassword = (password: string): ValidationResult => {
  if (!password.trim()) {
    return { isValid: false, error: 'Mật khẩu không được để trống' };
  }
  
  const passwordRegex = /^\S{6,}$/;
  if (!passwordRegex.test(password)) {
    return { isValid: false, error: 'Mật khẩu phải có ít nhất 6 ký tự và không chứa khoảng trắng' };
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
    return { isValid: false, error: 'Tên không được để trống' };
  }
  
  const nameRegex = /^[A-Za-zÀ-ỹ\s]{2,50}$/;
  if (!nameRegex.test(fullName.trim())) {
    return { isValid: false, error: 'Tên không hợp lệ (chỉ chứa chữ cái, tiếng Việt, độ dài 2–50 ký tự)' };
  }
  
  return { isValid: true, error: '' };
};

// Validate Vietnamese phone number
export const validatePhone = (phone: string): ValidationResult => {
  if (!phone.trim()) {
    return { isValid: false, error: 'Số điện thoại không được để trống' };
  }
  
  const phoneRegex = /^(0[3|5|7|8|9][0-9]{8}|(\+84)[3|5|7|8|9][0-9]{8})$/;
  if (!phoneRegex.test(phone)) {
    return { isValid: false, error: 'Số điện thoại không hợp lệ (phải theo chuẩn Việt Nam: 03,05,07,08,09)' };
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

// Hàm validate form tổng thể theo yêu cầu
export const validateForm = (input: {
  name: string;
  password: string;
  email: string;
  phone: string;
}): { valid: boolean; message?: string } => {
  const { name, password, email, phone } = input;

  // Validate name
  const nameValidation = validateFullName(name);
  if (!nameValidation.isValid) {
    return { valid: false, message: nameValidation.error };
  }

  // Validate password
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    return { valid: false, message: passwordValidation.error };
  }

  // Validate email
  const emailValidation = validateEmail(email);
  if (!emailValidation.isValid) {
    return { valid: false, message: emailValidation.error };
  }

  // Validate phone
  const phoneValidation = validatePhone(phone);
  if (!phoneValidation.isValid) {
    return { valid: false, message: phoneValidation.error };
  }

  return { valid: true };
};