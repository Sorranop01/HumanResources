/**
 * EmployeeCreatePage - Page for creating a new employee using Multi-Step Wizard
 */

import { ArrowLeftOutlined } from '@ant-design/icons';
import { Button, Space, Typography } from 'antd';
import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { EmployeeFormWizard } from '../components/EmployeeFormWizard';
import { ROUTES } from '@/shared/constants/routes';

const { Title } = Typography;

export const EmployeeCreatePage: FC = () => {
  const navigate = useNavigate();

  return (
    <Space direction="vertical" size="large" style={{ display: 'flex', padding: '24px' }}>
      {/* Header */}
      <div>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(ROUTES.EMPLOYEES)}
          style={{ marginBottom: 16 }}
        >
          กลับไปหน้ารายชื่อ
        </Button>
        <Title level={2}>เพิ่มพนักงานใหม่</Title>
      </div>

      {/* Multi-Step Form Wizard */}
      <EmployeeFormWizard />
    </Space>
  );
};
