import {
  ClockCircleOutlined,
  DashboardOutlined,
  DollarOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SettingOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Avatar, Dropdown, Layout, Menu, type MenuProps } from 'antd';
import { type ReactNode, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ROUTES } from '@/shared/constants/routes';

const { Header, Sider, Content } = Layout;

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems: MenuProps['items'] = [
    {
      key: ROUTES.DASHBOARD,
      icon: <DashboardOutlined />,
      label: 'แดชบอร์ด',
      onClick: () => navigate(ROUTES.DASHBOARD),
    },
    {
      key: 'people',
      icon: <TeamOutlined />,
      label: 'บุคลากร',
      children: [
        {
          key: ROUTES.EMPLOYEES,
          label: 'พนักงาน',
          onClick: () => navigate(ROUTES.EMPLOYEES),
        },
        {
          key: ROUTES.CANDIDATES,
          label: 'ผู้สมัครงาน',
          onClick: () => navigate(ROUTES.CANDIDATES),
        },
      ],
    },
    {
      key: 'attendance',
      icon: <ClockCircleOutlined />,
      label: 'เวลาทำงาน',
      children: [
        {
          key: ROUTES.ATTENDANCE,
          label: 'บันทึกเวลา',
          onClick: () => navigate(ROUTES.ATTENDANCE),
        },
        {
          key: ROUTES.LEAVE_REQUESTS,
          label: 'คำขอลา',
          onClick: () => navigate(ROUTES.LEAVE_REQUESTS),
        },
      ],
    },
    {
      key: 'payroll',
      icon: <DollarOutlined />,
      label: 'เงินเดือน',
      children: [
        {
          key: ROUTES.PAYROLL,
          label: 'จัดการเงินเดือน',
          onClick: () => navigate(ROUTES.PAYROLL),
        },
        {
          key: ROUTES.PAYROLL_RUNS,
          label: 'รอบการจ่าย',
          onClick: () => navigate(ROUTES.PAYROLL_RUNS),
        },
      ],
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'ตั้งค่า',
      onClick: () => navigate(ROUTES.SETTINGS),
    },
  ];

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'โปรไฟล์',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'ออกจากระบบ',
      danger: true,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed} theme="light">
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 20,
            fontWeight: 'bold',
            color: '#1890ff',
          }}
        >
          {collapsed ? 'HR' : 'HumanResources'}
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          defaultOpenKeys={['people', 'attendance', 'payroll']}
          items={menuItems}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            padding: '0 24px',
            background: '#fff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                setCollapsed(!collapsed);
              }
            }}
            style={{
              cursor: 'pointer',
              fontSize: 18,
              background: 'none',
              border: 'none',
              padding: 0,
            }}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </button>
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <div style={{ cursor: 'pointer' }}>
              <Avatar icon={<UserOutlined />} />
            </div>
          </Dropdown>
        </Header>
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: '#fff',
            borderRadius: 8,
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
