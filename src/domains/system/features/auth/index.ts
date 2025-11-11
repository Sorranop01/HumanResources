/**
 * Authentication feature exports
 * Central export point for all auth-related modules
 */

// Components
export { LoginForm } from './components/LoginForm';
export { RegisterForm } from './components/RegisterForm';
export { ForgotPasswordForm } from './components/ForgotPasswordForm';

// Pages
export { LoginPage } from './pages/LoginPage';
export { RegisterPage } from './pages/RegisterPage';
export { ForgotPasswordPage } from './pages/ForgotPasswordPage';

// Hooks
export { useLogin } from './hooks/useLogin';
export { useRegister } from './hooks/useRegister';
export { useLogout } from './hooks/useLogout';
export { useForgotPassword } from './hooks/useForgotPassword';

// Services
export { authService, getAuthErrorMessage, AUTH_ERROR_CODES } from './services/authService';
export { userService } from './services/userService';
export type { LoginCredentials, RegisterData } from './services/authService';
export type {
  CreateUserProfileData,
  UpdateUserProfileData,
} from './services/userService';

// Schemas
export {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from './schemas/authSchemas';
export type {
  LoginFormData,
  RegisterFormData,
  ForgotPasswordFormData,
  ResetPasswordFormData,
  ChangePasswordFormData,
} from './schemas/authSchemas';
