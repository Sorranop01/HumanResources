/**
 * Employee Feature - Public API
 * Export all public components, hooks, and utilities
 */

// Components

export { EmployeeCard } from './components/EmployeeCard';
export { EmployeeFilters as EmployeeFiltersComponent } from './components/EmployeeFilters';
export { EmployeeForm } from './components/EmployeeForm';
export { EmployeeStats } from './components/EmployeeStats';
export { EmployeeTable } from './components/EmployeeTable';

// Hooks

export { useCreateEmployee } from './hooks/useCreateEmployee';
export { useDeleteEmployee } from './hooks/useDeleteEmployee';
export { useEmployee } from './hooks/useEmployee';
export {
  useDeleteEmployeeDocument,
  useUploadEmployeeDocument,
} from './hooks/useEmployeeDocuments';
export { useEmployees } from './hooks/useEmployees';
export { useUpdateEmployee } from './hooks/useUpdateEmployee';

// Pages

export { EmployeeCreatePage } from './pages/EmployeeCreatePage';
export { EmployeeDetailPage } from './pages/EmployeeDetailPage';
export { EmployeeEditPage } from './pages/EmployeeEditPage';
export { EmployeeListPage } from './pages/EmployeeListPage';

// Schemas & Validation Types

export type {
  CreateEmployeeInput,
  EmployeeFilters as EmployeeFiltersType,
  EmployeeFormInput,
  UpdateEmployeeInput,
} from './schemas';
export {
  CreateEmployeeSchema,
  EmployeeFiltersSchema,
  EmployeeFormSchema,
  EmployeeSchema,
  EmployeeStatusSchema,
  formDataToCreateInput,
  safeValidateEmployee,
  UpdateEmployeeSchema,
  validateEmployee,
} from './schemas';

// Services

export { employeeKeys, employeeService } from './services/employeeService';

// Types

export type { Employee, EmployeeStatus } from './types';
