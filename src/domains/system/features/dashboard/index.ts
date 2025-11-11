/**
 * Dashboard feature exports
 */

export { DashboardStats } from './components/DashboardStats';
export { QuickActions } from './components/QuickActions';
export { RecentActivities } from './components/RecentActivities';
// Components
export { WelcomeSection } from './components/WelcomeSection';
// Hooks
export { dashboardKeys, useDashboardStats } from './hooks/useDashboardStats';
// Pages
export { DashboardPage } from './pages/DashboardPage';

// Types
export type {
  DashboardData,
  DashboardStats as DashboardStatsType,
  QuickAction,
  RecentActivity,
} from './types/dashboard.types';
