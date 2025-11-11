/**
 * Authentication feature exports
 * Central export point for all auth-related modules
 */

// Components
export { ForgotPasswordForm } from './components/ForgotPasswordForm';
export { LoginForm } from './components/LoginForm';
export { RegisterForm } from './components/RegisterForm';

// Hooks
export { useForgotPassword } from './hooks/useForgotPassword';
export { useLogin } from './hooks/useLogin';
export { useLogout } from './hooks/useLogout';
export { useRegister } from './hooks/useRegister';

// Pages
export { ForgotPasswordPage } from './pages/ForgotPasswordPage';
export { LoginPage } from './pages/LoginPage';
export { RegisterPage } from './pages/RegisterPage';

// Schemas
export type {
  ChangePasswordFormData,
  ForgotPasswordFormData,
  LoginFormData,
  RegisterFormData,
  ResetPasswordFormData,
} from './schemas/authSchemas';
export {
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from './schemas/authSchemas';

// Services
export type { LoginCredentials, RegisterData } from './services/authService';
export { AUTH_ERROR_CODES, authService, getAuthErrorMessage } from './services/authService';
export type {
  CreateUserProfileData,
  UpdateUserProfileData,
} from './services/userService';
export { userService } from './services/userService';

// Types
export type {
  PasswordResetTokenDocument,
  UserActivityLogDocument,
  UserDocument,
  UserFirestoreDocument,
  UserSessionDocument,
  WithDates,
} from './types/firestoreTypes';
