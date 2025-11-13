/**
 * EmployeeStats - Summary statistics cards for employee overview
 * Displays total, active, on-leave, and terminated employee counts
 */

import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  StopOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { Card, Col, Row, Statistic } from 'antd';
import type { FC } from 'react';
import { useMemo } from 'react';
import type { Employee } from '@/domains/people/features/employees/types';

interface EmployeeStatsProps {
  employees?: Employee[];
  loading?: boolean;
}

export const EmployeeStats: FC<EmployeeStatsProps> = ({ employees = [], loading = false }) => {
  const stats = useMemo(() => {
    const total = employees.length;
    const active = employees.filter((emp) => emp.status === 'active').length;
    const onLeave = employees.filter((emp) => emp.status === 'on-leave').length;
    const inactive = employees.filter(
      (emp) => emp.status === 'resigned' || emp.status === 'terminated'
    ).length;

    return { total, active, onLeave, inactive };
  }, [employees]);

  return (
    <Row gutter={[16, 16]}>
      {/* Total Employees */}
      <Col xs={24} sm={12} lg={6}>
        <Card>
          <Statistic
            title="พนักงานทั้งหมด"
            value={stats.total}
            prefix={<TeamOutlined />}
            valueStyle={{ color: '#1890ff' }}
            loading={loading}
          />
        </Card>
      </Col>

      {/* Active Employees */}
      <Col xs={24} sm={12} lg={6}>
        <Card>
          <Statistic
            title="ทำงานอยู่"
            value={stats.active}
            prefix={<CheckCircleOutlined />}
            valueStyle={{ color: '#52c41a' }}
            loading={loading}
          />
        </Card>
      </Col>

      {/* On Leave */}
      <Col xs={24} sm={12} lg={6}>
        <Card>
          <Statistic
            title="ลางาน"
            value={stats.onLeave}
            prefix={<ClockCircleOutlined />}
            valueStyle={{ color: '#faad14' }}
            loading={loading}
          />
        </Card>
      </Col>

      {/* Inactive (Resigned/Terminated) */}
      <Col xs={24} sm={12} lg={6}>
        <Card>
          <Statistic
            title="พ้นสภาพ"
            value={stats.inactive}
            prefix={<StopOutlined />}
            valueStyle={{ color: '#ff4d4f' }}
            loading={loading}
          />
        </Card>
      </Col>
    </Row>
  );
};
