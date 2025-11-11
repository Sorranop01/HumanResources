import { UserOutlined } from '@ant-design/icons';
import { Avatar, Card, Space, Typography } from 'antd';
import type { FC } from 'react';
import { ROLE_LABELS } from '@/shared/constants/roles';
import type { User } from '@/shared/types';

const { Title, Text } = Typography;

interface WelcomeSectionProps {
  user: User | null;
}

/**
 * Welcome section component for dashboard
 */
export const WelcomeSection: FC<WelcomeSectionProps> = ({ user }) => {
  const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return 'สวัสดีตอนเช้า';
    if (hour < 18) return 'สวัสดีตอนบ่าย';
    return 'สวัสดีตอนเย็น';
  };

  const getCurrentDate = (): string => {
    return new Date().toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
  };

  return (
    <Card>
      <Space size="large" align="start">
        <Avatar
          size={64}
          src={user?.photoURL}
          icon={<UserOutlined />}
          style={{ backgroundColor: '#1890ff' }}
        />
        <Space direction="vertical" size={0}>
          <Title level={3} style={{ margin: 0 }}>
            {getGreeting()}, {user?.displayName || 'ผู้ใช้งาน'}
          </Title>
          <Text type="secondary">
            {user ? ROLE_LABELS[user.role] : 'บทบาท'} • {getCurrentDate()}
          </Text>
        </Space>
      </Space>
    </Card>
  );
};
