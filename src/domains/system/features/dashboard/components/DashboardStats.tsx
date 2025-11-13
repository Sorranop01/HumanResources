import {
  ApartmentOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  DollarOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Card, Col, Row, Spin, Statistic } from 'antd';
import type { FC } from 'react';
import type { DashboardStats as DashboardStatsType } from '../types/dashboard.types';

interface DashboardStatsProps {
  stats: DashboardStatsType | undefined;
  isLoading: boolean;
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  suffix?: string | undefined;
  precision?: number | undefined;
}

/**
 * Individual stat card component
 */
const StatCard: FC<StatCardProps> = ({ title, value, icon, color, suffix, precision = 0 }) => {
  return (
    <Card>
      <Statistic
        title={title}
        value={value}
        prefix={<span style={{ color, fontSize: '24px', marginRight: '8px' }}>{icon}</span>}
        suffix={suffix}
        precision={precision}
        valueStyle={{ color: '#262626' }}
      />
    </Card>
  );
};

/**
 * Dashboard statistics component
 */
export const DashboardStats: FC<DashboardStatsProps> = ({ stats, isLoading }) => {
  if (isLoading) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '48px 0' }}>
          <Spin size="large" tip="กำลังโหลดข้อมูล...">
            <div style={{ minHeight: 100 }} />
          </Spin>
        </div>
      </Card>
    );
  }

  if (!stats) {
    return null;
  }

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} sm={12} lg={8}>
        <StatCard
          title="พนักงานทั้งหมด"
          value={stats.totalEmployees}
          icon={<TeamOutlined />}
          color="#1890ff"
          suffix="คน"
        />
      </Col>
      <Col xs={24} sm={12} lg={8}>
        <StatCard
          title="พนักงานที่ทำงาน"
          value={stats.activeEmployees}
          icon={<UserOutlined />}
          color="#52c41a"
          suffix="คน"
        />
      </Col>
      <Col xs={24} sm={12} lg={8}>
        <StatCard
          title="คำขอลาที่รออนุมัติ"
          value={stats.pendingLeaveRequests}
          icon={<CalendarOutlined />}
          color="#faad14"
          suffix="รายการ"
        />
      </Col>
      <Col xs={24} sm={12} lg={8}>
        <StatCard
          title="เข้างานวันนี้"
          value={stats.todayAttendance}
          icon={<CheckCircleOutlined />}
          color="#13c2c2"
          suffix="คน"
        />
      </Col>
      <Col xs={24} sm={12} lg={8}>
        <Card>
          <Statistic
            title="เงินเดือนประจำเดือน"
            value={formatCurrency(stats.monthlyPayroll)}
            prefix={
              <span style={{ color: '#722ed1', fontSize: '24px', marginRight: '8px' }}>
                <DollarOutlined />
              </span>
            }
            valueStyle={{ color: '#262626', fontSize: '20px' }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={8}>
        <StatCard
          title="จำนวนแผนก"
          value={stats.departmentCount}
          icon={<ApartmentOutlined />}
          color="#eb2f96"
          suffix="แผนก"
        />
      </Col>
    </Row>
  );
};
