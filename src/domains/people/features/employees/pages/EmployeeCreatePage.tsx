/**
 * EmployeeCreatePage - Page for creating a new employee
 */

import { ArrowLeftOutlined } from '@ant-design/icons';
import { App, Button, Card, Col, Form, Input, Row, Space, Typography } from 'antd';
import type { FC } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EmployeeForm } from '@/domains/people/features/employees/components/EmployeeForm';
import { useCreateEmployee } from '@/domains/people/features/employees/hooks/useCreateEmployee';
import type { EmployeeFormInput } from '@/domains/people/features/employees/schemas';
import { ROUTES } from '@/shared/constants/routes';

const { Title } = Typography;

export const EmployeeCreatePage: FC = () => {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const { mutate: createEmployee, isPending } = useCreateEmployee();

  const handleSubmit = (formData: EmployeeFormInput) => {
    if (!password || password !== confirmPassword) {
      message.error('รหัสผ่านไม่ตรงกันหรือไม่ถูกป้อน');
      return;
    }
    if (password.length < 6) {
      message.error('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
      return;
    }

    createEmployee(
      { employeeData: formData, password },
      {
        onSuccess: () => {
          navigate(ROUTES.EMPLOYEES);
        },
        // onError is handled globally in the hook
      }
    );
  };

  return (
    <Space direction="vertical" size="large" style={{ display: 'flex' }}>
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

      <Row gutter={[24, 24]}>
        {/* Auth Details */}
        <Col xs={24} lg={16}>
          <Card title="ข้อมูลสำหรับเข้าสู่ระบบ">
            <Form layout="vertical">
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item label="รหัสผ่านเริ่มต้น" required>
                    <Input.Password
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="อย่างน้อย 6 ตัวอักษร"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item label="ยืนยันรหัสผ่าน" required>
                    <Input.Password
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="ป้อนรหัสผ่านอีกครั้ง"
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Card>
        </Col>

        {/* Employee Details */}
        <Col xs={24} lg={16}>
          <Card title="ข้อมูลส่วนตัวพนักงาน">
            <EmployeeForm onSubmit={handleSubmit} loading={isPending} submitText="สร้างพนักงาน" />
          </Card>
        </Col>
      </Row>
    </Space>
  );
};
