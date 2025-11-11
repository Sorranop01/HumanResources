/**
 * EmployeeEditPage - Page for editing an existing employee
 */

import { ArrowLeftOutlined } from '@ant-design/icons';
import { Button, Card, Col, Result, Row, Spin, Typography } from 'antd';
import type { FC } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { EmployeeForm } from '../components/EmployeeForm';
import { useEmployee } from '../hooks/useEmployee';
import { useUpdateEmployee } from '../hooks/useUpdateEmployee';
import type { EmployeeFormInput } from '../schemas';
import { formDataToCreateInput } from '../schemas';

const { Title } = Typography;

export const EmployeeEditPage: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: employee, isLoading, error } = useEmployee(id);
  const updateMutation = useUpdateEmployee();

  const handleSubmit = async (formData: EmployeeFormInput): Promise<void> => {
    if (!id) return;

    try {
      // Convert form data to update input
      const updateInput = formDataToCreateInput(formData);

      await updateMutation.mutateAsync({
        id,
        data: updateInput,
      });

      // Navigate to detail page
      navigate(`/employees/${id}`);
    } catch (error) {
      console.error('Failed to update employee:', error);
    }
  };

  const handleBack = (): void => {
    if (id) {
      navigate(`/employees/${id}`);
    } else {
      navigate('/employees');
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  // Error state
  if (error !== null || !employee) {
    return (
      <Result
        status="404"
        title="ไม่พบข้อมูลพนักงาน"
        subTitle="ไม่พบพนักงานที่คุณกำลังค้นหา"
        extra={
          <Button type="primary" onClick={handleBack}>
            กลับไปหน้ารายการ
          </Button>
        }
      />
    );
  }

  // Now TypeScript knows employee is not null/undefined
  return (
    <div style={{ padding: '24px' }}>
      {/* Back Button */}
      <Button icon={<ArrowLeftOutlined />} onClick={handleBack} style={{ marginBottom: 16 }}>
        กลับ
      </Button>

      <Row>
        <Col xs={24} lg={16}>
          <Card>
            <Title level={3}>แก้ไขข้อมูลพนักงาน</Title>
            <EmployeeForm
              initialData={employee}
              onSubmit={(data) => void handleSubmit(data)}
              loading={updateMutation.isPending}
              submitText="บันทึกการเปลี่ยนแปลง"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};
