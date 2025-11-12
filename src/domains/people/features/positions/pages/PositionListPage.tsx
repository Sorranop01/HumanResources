import {
  BankOutlined,
  PlusOutlined,
  TeamOutlined,
  UserOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { Button, Card, Col, Row, Space, Statistic, Typography } from 'antd';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PositionFilters } from '@/domains/people/features/positions/components/PositionFilters';
import { PositionTable } from '@/domains/people/features/positions/components/PositionTable';
import { usePositionStats } from '@/domains/people/features/positions/hooks/usePositionStats';
import type { PositionFiltersType } from '@/domains/people/features/positions/schemas';

const { Title } = Typography;

export const PositionListPage = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<PositionFiltersType>({});
  const { data: stats, isLoading: isStatsLoading } = usePositionStats();

  return (
    <div style={{ padding: '24px' }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2} style={{ margin: 0 }}>
            จัดการตำแหน่งงาน
          </Title>
        </Col>
        <Col>
          <Space>
            <Button
              type="default"
              icon={<BankOutlined />}
              onClick={() => navigate('/positions/org-chart')}
            >
              ดูแผนผังองค์กร
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/positions/create')}
            >
              เพิ่มตำแหน่ง
            </Button>
          </Space>
        </Col>
      </Row>

      {/* Statistics */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card loading={isStatsLoading}>
            <Statistic
              title="ตำแหน่งทั้งหมด"
              value={stats?.totalPositions ?? 0}
              prefix={<BankOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card loading={isStatsLoading}>
            <Statistic
              title="Headcount ทั้งหมด"
              value={stats?.totalHeadcount ?? 0}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card loading={isStatsLoading}>
            <Statistic
              title="พนักงานปัจจุบัน"
              value={stats?.totalEmployees ?? 0}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card loading={isStatsLoading}>
            <Statistic
              title="ตำแหน่งว่าง"
              value={stats?.totalVacancies ?? 0}
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#ff7a45' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <PositionFilters filters={filters} onFiltersChange={setFilters} />

      {/* Table */}
      <Card>
        <PositionTable filters={filters} />
      </Card>
    </div>
  );
};
