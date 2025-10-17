// Validasi Nomor Handphone
export const validatePhoneNumber = (inputNumber: string): boolean => {
  const phoneNumberRegex = /^\d{8,15}$/;
  return phoneNumberRegex.test(inputNumber);
};

// Validate email
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate password
export const validatePassword = (password: string): boolean => {
  const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{6,})/;
  return passwordRegex.test(password);
};
