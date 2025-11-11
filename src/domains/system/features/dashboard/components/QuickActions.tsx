import {
  CalendarOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  FileTextOutlined,
  SafetyOutlined,
  SettingOutlined,
  TeamOutlined,
  UserAddOutlined,
} from '@ant-design/icons';
import { Card, Col, Row, Typography } from 'antd';
import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROLES, type Role } from '@/shared/constants/roles';
import { ROUTES } from '@/shared/constants/routes';

const { Title, Text } = Typography;

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  onClick: () => void;
}

/**
 * Quick action card component
 */
const QuickActionCard: FC<QuickActionCardProps> = ({
  title,
  description,
  icon,
  color,
  onClick,
}) => {
  return (
    <Card hoverable onClick={onClick} style={{ height: '100%', cursor: 'pointer' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <div
          style={{
            fontSize: '32px',
            color,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {icon}
        </div>
        <div style={{ flex: 1 }}>
          <Title level={5} style={{ margin: 0, marginBottom: '4px' }}>
            {title}
          </Title>
          <Text type="secondary" style={{ fontSize: '13px' }}>
            {description}
          </Text>
        </div>
      </div>
    </Card>
  );
};

interface QuickActionsProps {
  userRole: Role | undefined;
}

/**
 * Quick actions component
 */
export const QuickActions: FC<QuickActionsProps> = ({ userRole }) => {
  const navigate = useNavigate();

  // Define actions based on role
  const getActions = () => {
    const commonActions = [
      {
        id: 'attendance',
        title: 'บันทึกเวลาทำงาน',
        description: 'เช็คอิน/เช็คเอาท์',
        icon: <ClockCircleOutlined />,
        color: '#1890ff',
        onClick: () => navigate(ROUTES.ATTENDANCE),
        roles: [ROLES.EMPLOYEE, ROLES.MANAGER, ROLES.HR, ROLES.ADMIN],
      },
      {
        id: 'leave-request',
        title: 'ขอลางาน',
        description: 'สร้างคำขอลางาน',
        icon: <CalendarOutlined />,
        color: '#52c41a',
        onClick: () => navigate(ROUTES.LEAVE_REQUESTS),
        roles: [ROLES.EMPLOYEE, ROLES.MANAGER, ROLES.HR, ROLES.ADMIN],
      },
      {
        id: 'payroll',
        title: 'ดูสลิปเงินเดือน',
        description: 'ตรวจสอบเงินเดือนของคุณ',
        icon: <DollarOutlined />,
        color: '#722ed1',
        onClick: () => navigate(ROUTES.PAYROLL),
        roles: [ROLES.EMPLOYEE, ROLES.MANAGER, ROLES.HR, ROLES.ADMIN],
      },
    ];

    const hrActions = [
      {
        id: 'add-employee',
        title: 'เพิ่มพนักงานใหม่',
        description: 'สร้างข้อมูลพนักงาน',
        icon: <UserAddOutlined />,
        color: '#13c2c2',
        onClick: () => navigate(ROUTES.EMPLOYEE_CREATE),
        roles: [ROLES.HR, ROLES.ADMIN],
      },
      {
        id: 'employees',
        title: 'จัดการพนักงาน',
        description: 'ดู/แก้ไขข้อมูลพนักงาน',
        icon: <TeamOutlined />,
        color: '#eb2f96',
        onClick: () => navigate(ROUTES.EMPLOYEES),
        roles: [ROLES.HR, ROLES.ADMIN],
      },
      {
        id: 'payroll-runs',
        title: 'ประมวลผลเงินเดือน',
        description: 'คำนวณและจ่ายเงินเดือน',
        icon: <FileTextOutlined />,
        color: '#faad14',
        onClick: () => navigate(ROUTES.PAYROLL_RUNS),
        roles: [ROLES.HR, ROLES.ADMIN],
      },
    ];

    const adminActions = [
      {
        id: 'roles',
        title: 'จัดการสิทธิ์',
        description: 'กำหนดบทบาทและสิทธิ์',
        icon: <SafetyOutlined />,
        color: '#fa8c16',
        onClick: () => navigate(ROUTES.ROLES),
        roles: [ROLES.ADMIN],
      },
      {
        id: 'settings',
        title: 'ตั้งค่าระบบ',
        description: 'กำหนดค่าต่างๆ',
        icon: <SettingOutlined />,
        color: '#2f54eb',
        onClick: () => navigate(ROUTES.SETTINGS),
        roles: [ROLES.ADMIN],
      },
    ];

    // Filter actions based on user role
    const allActions = [...commonActions, ...hrActions, ...adminActions];
    return allActions.filter((action) =>
      userRole ? (action.roles as readonly Role[]).includes(userRole) : false
    );
  };

  const actions = getActions();

  if (actions.length === 0) {
    return null;
  }

  return (
    <div>
      <Title level={4} style={{ marginBottom: '16px' }}>
        การดำเนินการด่วน
      </Title>
      <Row gutter={[16, 16]}>
        {actions.map((action) => (
          <Col xs={24} sm={12} lg={8} key={action.id}>
            <QuickActionCard
              title={action.title}
              description={action.description}
              icon={action.icon}
              color={action.color}
              onClick={action.onClick}
            />
          </Col>
        ))}
      </Row>
    </div>
  );
};
