import {
  ApartmentOutlined,
  AuditOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  DashboardOutlined,
  DollarOutlined,
  SafetyOutlined,
  SettingOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Layout, Menu } from 'antd';
import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/domains/system/features/auth/hooks/useAuth';
import { ROLES, type Role } from '@/shared/constants/roles';
import { ROUTES } from '@/shared/constants/routes';

const { Sider } = Layout;

interface AppSidebarProps {
  collapsed: boolean;
}

type MenuItem = Required<MenuProps>['items'][number];

/**
 * Create menu item helper
 */
function getItem(
  label: React.ReactNode,
  key: string,
  icon?: React.ReactNode,
  children?: MenuItem[],
  type?: 'group'
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
    type,
  } as MenuItem;
}

/**
 * Check if user has required role
 */
function hasRequiredRole(userRole: Role | undefined, allowedRoles: Role[]): boolean {
  return userRole ? allowedRoles.includes(userRole) : false;
}

/**
 * Application sidebar component
 */
export const AppSidebar: FC<AppSidebarProps> = ({ collapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

  // Update selected menu item based on current route
  useEffect(() => {
    const path = location.pathname;
    setSelectedKeys([path]);
  }, [location.pathname]);

  const handleMenuClick: MenuProps['onClick'] = (e) => {
    navigate(e.key);
  };

  // Define all menu items
  const menuItems: MenuItem[] = [
    // Dashboard
    getItem('แดชบอร์ด', ROUTES.DASHBOARD, <DashboardOutlined />),

    // People Management (for HR and Admin)
    ...(hasRequiredRole(user?.role, [ROLES.HR, ROLES.ADMIN])
      ? [
          getItem('บุคลากร', 'people', <TeamOutlined />, [
            getItem('พนักงาน', ROUTES.EMPLOYEES, <UserOutlined />),
            getItem('ผู้สมัครงาน', ROUTES.CANDIDATES, <ApartmentOutlined />),
          ]),
        ]
      : []),

    // Attendance & Leave
    getItem('เวลาทำงาน', 'time', <ClockCircleOutlined />, [
      getItem('บันทึกเวลา', ROUTES.ATTENDANCE, <ClockCircleOutlined />),
      getItem('คำขอลา', ROUTES.LEAVE_REQUESTS, <CalendarOutlined />),
    ]),

    // Payroll (for HR and Admin)
    ...(hasRequiredRole(user?.role, [ROLES.HR, ROLES.ADMIN])
      ? [
          getItem('เงินเดือน', 'payroll', <DollarOutlined />, [
            getItem('ภาพรวม', ROUTES.PAYROLL, <DollarOutlined />),
            getItem('ประมวลผล', ROUTES.PAYROLL_RUNS, <AuditOutlined />),
          ]),
        ]
      : []),

    // System Management (for Admin only)
    ...(hasRequiredRole(user?.role, [ROLES.ADMIN])
      ? [
          getItem('ระบบ', 'system', <SettingOutlined />, [
            getItem('ผู้ใช้งาน', ROUTES.USERS, <UserOutlined />),
            getItem('บทบาทและสิทธิ์', ROUTES.ROLES, <SafetyOutlined />),
            getItem('ประวัติการใช้งาน', ROUTES.AUDIT_LOGS, <AuditOutlined />),
            getItem('ตั้งค่า', ROUTES.SETTINGS, <SettingOutlined />),
          ]),
        ]
      : []),
  ];

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      style={{
        overflow: 'auto',
        height: '100vh',
        position: 'sticky',
        top: 0,
        left: 0,
      }}
      breakpoint="lg"
    >
      <div
        style={{
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          transition: 'all 0.2s',
        }}
      >
        {collapsed ? (
          <span style={{ fontSize: '24px' }}>👥</span>
        ) : (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#fff',
            }}
          >
            <span style={{ fontSize: '24px' }}>👥</span>
            <span style={{ fontSize: '16px', fontWeight: 'bold' }}>HR System</span>
          </div>
        )}
      </div>

      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={selectedKeys}
        onClick={handleMenuClick}
        items={menuItems}
        style={{ borderRight: 0 }}
      />
    </Sider>
  );
};
