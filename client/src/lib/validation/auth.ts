import * as Yup from 'yup';

const usernameSeparators = '._-';
const usernameAllowedPattern = /^[a-z0-9._-]+$/;
const usernameEdgeSeparatorPattern = /^[._-]|[._-]$/;
const usernameDoubleSeparatorPattern = /[._-]{2}/;
const printableAsciiNoWhitespacePattern = /^[!-~]+$/;

export const usernameValidation = Yup.string()
  .required('Username is required')
  .min(3, 'Username must be at least 3 characters')
  .max(32, 'Username must be at most 32 characters')
  .matches(
    usernameAllowedPattern,
    `Username may only contain lowercase letters, numbers, and separators ${usernameSeparators}`
  )
  .test(
    'no-edge-separator',
    'Username cannot start or end with a separator',
    (value) => !value || !usernameEdgeSeparatorPattern.test(value)
  )
  .test(
    'no-double-separator',
    'Username cannot contain consecutive separators',
    (value) => !value || !usernameDoubleSeparatorPattern.test(value)
  );

export const emailValidation = Yup.string()
  .required('Email is required')
  .email('Invalid email format');

export const passwordValidation = Yup.string()
  .required('Password is required')
  .min(8, 'Password must be at least 8 characters')
  .max(72, 'Password must be at most 72 characters')
  .matches(
    printableAsciiNoWhitespacePattern,
    'Password may only contain printable ASCII characters and cannot contain whitespace'
  );

export const signInValidationSchema = Yup.object({
  email: emailValidation,
  password: passwordValidation,
});

export const signUpValidationSchema = Yup.object({
  username: usernameValidation,
  email: emailValidation,
  password: passwordValidation,
});

// Display name validation for edit profile
// Printable ASCII (33-126) + allows space (32), min 3 max 32 chars
const printableAsciiWithSpacePattern = /^[ -~]+$/;

export const displayNameValidation = Yup.string()
  .required('Display name is required')
  .min(3, 'Display name must be at least 3 characters')
  .max(32, 'Display name must be at most 32 characters')
  .matches(
    printableAsciiWithSpacePattern,
    'Display name can only contain letters, numbers, symbols, and spaces'
  );

export const editProfileValidationSchema = Yup.object({
  username: usernameValidation,
  displayName: displayNameValidation,
});
