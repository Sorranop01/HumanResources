import {
  CalendarOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  SettingOutlined,
  UserAddOutlined,
} from '@ant-design/icons';
import { Badge, Card, Empty, List, Tag, Typography } from 'antd';
import type { FC } from 'react';
import type { RecentActivity } from '../types/dashboard.types';

const { Title, Text } = Typography;

interface RecentActivitiesProps {
  activities?: RecentActivity[] | undefined;
  isLoading?: boolean | undefined;
}

/**
 * Get icon for activity type
 */
const getActivityIcon = (type: RecentActivity['type']) => {
  const iconStyle = { fontSize: '20px' };
  switch (type) {
    case 'leave':
      return <CalendarOutlined style={{ ...iconStyle, color: '#52c41a' }} />;
    case 'attendance':
      return <ClockCircleOutlined style={{ ...iconStyle, color: '#1890ff' }} />;
    case 'employee':
      return <UserAddOutlined style={{ ...iconStyle, color: '#13c2c2' }} />;
    case 'payroll':
      return <DollarOutlined style={{ ...iconStyle, color: '#722ed1' }} />;
    case 'system':
      return <SettingOutlined style={{ ...iconStyle, color: '#fa8c16' }} />;
    default:
      return <SettingOutlined style={{ ...iconStyle, color: '#8c8c8c' }} />;
  }
};

/**
 * Get status tag color
 */
const getStatusColor = (
  status?: RecentActivity['status']
): 'warning' | 'success' | 'error' | 'blue' | 'default' => {
  switch (status) {
    case 'pending':
      return 'warning';
    case 'approved':
      return 'success';
    case 'rejected':
      return 'error';
    case 'completed':
      return 'blue';
    default:
      return 'default';
  }
};

/**
 * Get status label
 */
const getStatusLabel = (status?: RecentActivity['status']): string | undefined => {
  switch (status) {
    case 'pending':
      return 'รอดำเนินการ';
    case 'approved':
      return 'อนุมัติ';
    case 'rejected':
      return 'ปฏิเสธ';
    case 'completed':
      return 'เสร็จสิ้น';
    default:
      return undefined;
  }
};

/**
 * Format timestamp to relative time
 */
const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} วันที่แล้ว`;
  if (hours > 0) return `${hours} ชั่วโมงที่แล้ว`;
  if (minutes > 0) return `${minutes} นาทีที่แล้ว`;
  return 'เมื่อสักครู่';
};

/**
 * Recent activities component
 */
export const RecentActivities: FC<RecentActivitiesProps> = ({
  activities = [],
  isLoading = false,
}) => {
  // Mock data if no activities provided
  const mockActivities: RecentActivity[] = [
    {
      id: '1',
      type: 'employee',
      title: 'พนักงานใหม่เข้าร่วมงาน',
      description: 'สมชาย ใจดี เข้าร่วมตำแหน่ง Software Engineer',
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      user: 'Admin',
      status: 'completed',
    },
    {
      id: '2',
      type: 'leave',
      title: 'คำขอลาใหม่',
      description: 'สมหญิง รักงาน ขอลาพักร้อน 3 วัน',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      user: 'สมหญิง รักงาน',
      status: 'pending',
    },
    {
      id: '3',
      type: 'attendance',
      title: 'เช็คอินเข้างาน',
      description: '25 คน เช็คอินเข้างานในเช้าวันนี้',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
      status: 'completed',
    },
    {
      id: '4',
      type: 'payroll',
      title: 'ประมวลผลเงินเดือน',
      description: 'เงินเดือนประจำเดือน พฤษภาคม ได้รับการประมวลผลแล้ว',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      user: 'HR System',
      status: 'completed',
    },
    {
      id: '5',
      type: 'leave',
      title: 'คำขอลาได้รับการอนุมัติ',
      description: 'สมศักดิ์ ขยัน - ลาป่วย 1 วัน',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
      user: 'Manager',
      status: 'approved',
    },
  ];

  const displayActivities = activities.length > 0 ? activities : mockActivities;

  return (
    <div>
      <Title level={4} style={{ marginBottom: '16px' }}>
        กิจกรรมล่าสุด
      </Title>
      <Card>
        {displayActivities.length === 0 && !isLoading ? (
          <Empty description="ไม่มีกิจกรรมล่าสุด" />
        ) : (
          <List
            loading={isLoading}
            itemLayout="horizontal"
            dataSource={displayActivities}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta
                  avatar={
                    <Badge dot={item.status === 'pending'}>{getActivityIcon(item.type)}</Badge>
                  }
                  title={
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <span>{item.title}</span>
                      {item.status && (
                        <Tag color={getStatusColor(item.status)}>{getStatusLabel(item.status)}</Tag>
                      )}
                    </div>
                  }
                  description={
                    <div>
                      <div>{item.description}</div>
                      <Text type="secondary" style={{ fontSize: '12px', marginTop: '4px' }}>
                        {formatRelativeTime(item.timestamp)}
                        {item.user && ` • โดย ${item.user}`}
                      </Text>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Card>
    </div>
  );
};
