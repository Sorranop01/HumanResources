/**
 * Positions Feature - Public API
 * Export all public components, hooks, types, and services
 */

export { OrgChart } from './components/OrgChart';
export { PositionCard } from './components/PositionCard';
export { PositionFilters } from './components/PositionFilters';
export { PositionForm } from './components/PositionForm';
// Components
export { PositionTable } from './components/PositionTable';
export { useCreatePosition } from './hooks/useCreatePosition';
export { useDeletePosition } from './hooks/useDeletePosition';
export { useOrgChart } from './hooks/useOrgChart';
export { usePosition } from './hooks/usePosition';
export { usePositionStats } from './hooks/usePositionStats';

// Hooks
export { usePositions } from './hooks/usePositions';
export { useUpdatePosition } from './hooks/useUpdatePosition';
export { OrgChartPage } from './pages/OrgChartPage';
export { PositionCreatePage } from './pages/PositionCreatePage';
export { PositionDetailPage } from './pages/PositionDetailPage';
export { PositionEditPage } from './pages/PositionEditPage';
// Pages
export { PositionListPage } from './pages/PositionListPage';
export type {
  CreatePositionInput,
  PositionFiltersType,
  PositionFormInput,
  UpdatePositionInput,
} from './schemas';
// Schemas
export {
  CreatePositionSchema,
  JobDescriptionSchema,
  PositionFiltersSchema,
  PositionFormSchema,
  PositionLevelSchema,
  PositionSchema,
  PositionStatusSchema,
  SalaryRangeSchema,
  UpdatePositionSchema,
} from './schemas';
// Services
export { positionKeys, positionService } from './services/positionService';
// Types
export type {
  JobDescription,
  OrgChartNode,
  Position,
  PositionFilters,
  PositionLevel,
  PositionStats,
  PositionStatus,
  SalaryRange,
} from './types';
