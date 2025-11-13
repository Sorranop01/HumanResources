import {
  CheckCircleOutlined,
  EyeOutlined,
  TeamOutlined,
  TrophyOutlined,
  UserAddOutlined,
} from '@ant-design/icons';
import { Card, Col, Row, Statistic } from 'antd';
import type { FC } from 'react';
import { useCandidateStats } from '../hooks/useCandidateStats';

export const CandidateStats: FC = () => {
  const { data: stats, isLoading } = useCandidateStats();

  if (!stats) {
    return null;
  }

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} sm={12} md={8} lg={4}>
        <Card bordered={false}>
          <Statistic
            title="ทั้งหมด"
            value={stats.total}
            prefix={<TeamOutlined />}
            loading={isLoading}
          />
        </Card>
      </Col>

      <Col xs={24} sm={12} md={8} lg={4}>
        <Card bordered={false}>
          <Statistic
            title="ใหม่"
            value={stats.new}
            prefix={<UserAddOutlined />}
            valueStyle={{ color: '#1890ff' }}
            loading={isLoading}
          />
        </Card>
      </Col>

      <Col xs={24} sm={12} md={8} lg={4}>
        <Card bordered={false}>
          <Statistic
            title="คัดกรอง"
            value={stats.screening}
            prefix={<EyeOutlined />}
            valueStyle={{ color: '#13c2c2' }}
            loading={isLoading}
          />
        </Card>
      </Col>

      <Col xs={24} sm={12} md={8} lg={4}>
        <Card bordered={false}>
          <Statistic
            title="สัมภาษณ์"
            value={stats.interview}
            prefix={<TeamOutlined />}
            valueStyle={{ color: '#fa8c16' }}
            loading={isLoading}
          />
        </Card>
      </Col>

      <Col xs={24} sm={12} md={8} lg={4}>
        <Card bordered={false}>
          <Statistic
            title="เสนอตำแหน่ง"
            value={stats.offer}
            prefix={<TrophyOutlined />}
            valueStyle={{ color: '#722ed1' }}
            loading={isLoading}
          />
        </Card>
      </Col>

      <Col xs={24} sm={12} md={8} lg={4}>
        <Card bordered={false}>
          <Statistic
            title="รับเข้าทำงาน"
            value={stats.hired}
            prefix={<CheckCircleOutlined />}
            valueStyle={{ color: '#52c41a' }}
            loading={isLoading}
          />
        </Card>
      </Col>
    </Row>
  );
};
