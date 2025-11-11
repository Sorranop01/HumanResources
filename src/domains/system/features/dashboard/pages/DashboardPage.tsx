import { Alert, Space } from 'antd';
import type { FC } from 'react';
import { useAuth } from '@/domains/system/features/auth/hooks/useAuth';
import { DashboardStats } from '../components/DashboardStats';
import { QuickActions } from '../components/QuickActions';
import { RecentActivities } from '../components/RecentActivities';
import { WelcomeSection } from '../components/WelcomeSection';
import { useDashboardStats } from '../hooks/useDashboardStats';

/**
 * Main dashboard page
 */
export const DashboardPage: FC = () => {
  const { user } = useAuth();
  const { data: stats, isLoading, isError, error } = useDashboardStats();

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Welcome Section */}
        <WelcomeSection user={user} />

        {/* Error Alert */}
        {isError && (
          <Alert
            message="เกิดข้อผิดพลาด"
            description={
              error instanceof Error ? error.message : 'ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง'
            }
            type="error"
            showIcon
            closable
          />
        )}

        {/* Dashboard Statistics */}
        <DashboardStats stats={stats} isLoading={isLoading} />

        {/* Quick Actions */}
        <QuickActions userRole={user?.role} />

        {/* Recent Activities */}
        <RecentActivities />
      </Space>
    </div>
  );
};
