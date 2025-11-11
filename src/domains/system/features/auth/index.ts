/**
 * Authentication feature exports
 * Central export point for all auth-related modules
 */

export { ForgotPasswordForm } from './components/ForgotPasswordForm';
// Components
export { LoginForm } from './components/LoginForm';
export { RegisterForm } from './components/RegisterForm';
export { useForgotPassword } from './hooks/useForgotPassword';
// Hooks
export { useLogin } from './hooks/useLogin';
export { useLogout } from './hooks/useLogout';
export { useRegister } from './hooks/useRegister';
export { ForgotPasswordPage } from './pages/ForgotPasswordPage';
// Pages
export { LoginPage } from './pages/LoginPage';
export { RegisterPage } from './pages/RegisterPage';
export type {
  ChangePasswordFormData,
  ForgotPasswordFormData,
  LoginFormData,
  RegisterFormData,
  ResetPasswordFormData,
} from './schemas/authSchemas';
// Schemas
export {
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from './schemas/authSchemas';
export type { LoginCredentials, RegisterData } from './services/authService';
// Services
export { AUTH_ERROR_CODES, authService, getAuthErrorMessage } from './services/authService';
export type {
  CreateUserProfileData,
  UpdateUserProfileData,
} from './services/userService';
export { userService } from './services/userService';
