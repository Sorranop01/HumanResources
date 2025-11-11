import {
  ApiOutlined,
  DatabaseOutlined,
  InfoCircleOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { Card, Col, Descriptions, Row, Space, Statistic, Tabs, Typography } from 'antd';
import type { FC } from 'react';
import { useAuth } from '@/domains/system/features/auth/hooks/useAuth';
import { ROLE_LABELS } from '@/shared/constants/roles';

const { Title, Text } = Typography;

/**
 * Settings page
 */
export const SettingsPage: FC = () => {
  const { user } = useAuth();

  const tabItems = [
    {
      key: 'general',
      label: (
        <span>
          <InfoCircleOutlined />
          ข้อมูลทั่วไป
        </span>
      ),
      children: (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* System Information */}
          <Card title="ข้อมูลระบบ" bordered={false}>
            <Descriptions column={1}>
              <Descriptions.Item label="ชื่อระบบ">
                <Text strong>HR Management System</Text>
              </Descriptions.Item>
              <Descriptions.Item label="เวอร์ชัน">
                <Text>1.0.0</Text>
              </Descriptions.Item>
              <Descriptions.Item label="สภาพแวดล้อม">
                <Text>Production</Text>
              </Descriptions.Item>
              <Descriptions.Item label="สถานะ">
                <Text type="success">ทำงานปกติ</Text>
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* User Profile */}
          <Card title="ข้อมูลผู้ใช้งาน" bordered={false}>
            <Descriptions column={1}>
              <Descriptions.Item label="ชื่อ-นามสกุล">
                <Text strong>{user?.displayName || 'ไม่ระบุ'}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="อีเมล">
                <Text>{user?.email || 'ไม่ระบุ'}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="บทบาท">
                <Text>{user ? ROLE_LABELS[user.role] : 'ไม่ระบุ'}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="เบอร์โทรศัพท์">
                <Text>{user?.phoneNumber || 'ไม่ระบุ'}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="สถานะ">
                <Text type={user?.isActive ? 'success' : 'danger'}>
                  {user?.isActive ? 'ใช้งานอยู่' : 'ปิดการใช้งาน'}
                </Text>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Space>
      ),
    },
    {
      key: 'system',
      label: (
        <span>
          <DatabaseOutlined />
          ระบบ
        </span>
      ),
      children: (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Card title="สถิติระบบ" bordered={false}>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} lg={6}>
                <Statistic
                  title="Firebase Project"
                  value={import.meta.env.VITE_FIREBASE_PROJECT_ID || 'N/A'}
                  valueStyle={{ fontSize: '16px' }}
                />
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Statistic
                  title="Region"
                  value="asia-southeast1"
                  valueStyle={{ fontSize: '16px' }}
                />
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Statistic title="Auth Domain" value="Enabled" valueStyle={{ fontSize: '16px' }} />
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Statistic title="Firestore" value="Active" valueStyle={{ fontSize: '16px' }} />
              </Col>
            </Row>
          </Card>

          <Card title="การตั้งค่าฐานข้อมูล" bordered={false}>
            <Descriptions column={1}>
              <Descriptions.Item label="Database Type">
                <Text>Cloud Firestore</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Authentication">
                <Text>Firebase Authentication</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Storage">
                <Text>Firebase Storage</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Functions">
                <Text>Cloud Functions (Node.js)</Text>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Space>
      ),
    },
    {
      key: 'api',
      label: (
        <span>
          <ApiOutlined />
          API
        </span>
      ),
      children: (
        <Card title="API Configuration" bordered={false}>
          <Descriptions column={1}>
            <Descriptions.Item label="API Key">
              <Text code>
                {import.meta.env.VITE_FIREBASE_API_KEY
                  ? `${import.meta.env.VITE_FIREBASE_API_KEY.substring(0, 20)}...`
                  : 'Not configured'}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Auth Domain">
              <Text code>{import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'Not configured'}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Storage Bucket">
              <Text code>{import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'Not configured'}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Messaging Sender ID">
              <Text code>
                {import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || 'Not configured'}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="App ID">
              <Text code>
                {import.meta.env.VITE_FIREBASE_APP_ID
                  ? `${import.meta.env.VITE_FIREBASE_APP_ID.substring(0, 30)}...`
                  : 'Not configured'}
              </Text>
            </Descriptions.Item>
          </Descriptions>
        </Card>
      ),
    },
  ];

  return (
    <div style={{ padding: 0 }}>
      <Card>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <Title level={3} style={{ margin: 0, marginBottom: 8 }}>
            <SettingOutlined /> ตั้งค่าระบบ
          </Title>
          <Text type="secondary">การตั้งค่าและข้อมูลระบบ HR Management</Text>
        </div>

        {/* Tabs */}
        <Tabs items={tabItems} />
      </Card>
    </div>
  );
};
