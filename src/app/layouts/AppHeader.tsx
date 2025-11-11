import {
  BellOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Avatar, Badge, Button, Dropdown, Layout, Space, Typography } from 'antd';
import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/domains/system/features/auth/hooks/useAuth';
import { useLogout } from '@/domains/system/features/auth/hooks/useLogout';
import { ROLE_LABELS } from '@/shared/constants/roles';
import { ROUTES } from '@/shared/constants/routes';

const { Header } = Layout;
const { Text } = Typography;

interface AppHeaderProps {
  collapsed: boolean;
  onToggle: () => void;
}

/**
 * Application header component
 */
export const AppHeader: FC<AppHeaderProps> = ({ collapsed, onToggle }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { mutate: logout } = useLogout();

  const handleLogout = () => {
    logout();
  };

  const handleProfileClick = () => {
    navigate(ROUTES.SETTINGS);
  };

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'โปรไฟล์',
      onClick: handleProfileClick,
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'ออกจากระบบ',
      danger: true,
      onClick: handleLogout,
    },
  ];

  return (
    <Header
      style={{
        padding: '0 24px',
        background: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #f0f0f0',
        position: 'sticky',
        top: 0,
        zIndex: 1,
      }}
    >
      {/* Left side - Toggle button and Logo */}
      <Space size="middle">
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={onToggle}
          style={{ fontSize: '16px', width: 40, height: 40 }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '20px' }}>👥</span>
          <Text strong style={{ fontSize: '18px' }}>
            HR System
          </Text>
        </div>
      </Space>

      {/* Right side - Notifications and User menu */}
      <Space size="middle">
        {/* Notifications */}
        <Badge count={3} offset={[-5, 5]}>
          <Button
            type="text"
            icon={<BellOutlined style={{ fontSize: '18px' }} />}
            style={{ width: 40, height: 40 }}
          />
        </Badge>

        {/* User menu */}
        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']}>
          {/* biome-ignore lint/a11y/useSemanticElements: Dropdown requires div wrapper for styling */}
          <div
            role="button"
            tabIndex={0}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: '8px',
              transition: 'background-color 0.3s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f5f5f5';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
              }
            }}
          >
            <Avatar
              src={user?.photoURL}
              icon={<UserOutlined />}
              style={{ backgroundColor: '#1890ff' }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <Text strong style={{ fontSize: '14px' }}>
                {user?.displayName || 'ผู้ใช้งาน'}
              </Text>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {user ? ROLE_LABELS[user.role] : ''}
              </Text>
            </div>
          </div>
        </Dropdown>
      </Space>
    </Header>
  );
};
