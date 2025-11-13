/**
 * EmployeeEditPage - Page for editing an existing employee
 */

import { ArrowLeftOutlined } from '@ant-design/icons';
import { Button, Card, Col, Result, Row, Spin, Typography } from 'antd';
import dayjs from 'dayjs';
import type { FC } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { EmployeeForm, type EmployeeQuickFormValues } from '../components/EmployeeForm';
import { useEmployee } from '../hooks/useEmployee';
import { useUpdateEmployee } from '../hooks/useUpdateEmployee';
import type { Employee } from '../types';

const { Title } = Typography;

export const EmployeeEditPage: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: employee, isLoading, error } = useEmployee(id);
  const updateMutation = useUpdateEmployee();

  const handleSubmit = async (formData: EmployeeQuickFormValues): Promise<void> => {
    if (!id || !employee) return;

    try {
      const updateData: Partial<Employee> = {
        employeeCode: formData.employeeCode,
        status: formData.status,
        firstName: formData.firstName,
        lastName: formData.lastName,
        thaiFirstName: formData.thaiFirstName,
        thaiLastName: formData.thaiLastName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        dateOfBirth: dayjs(formData.dateOfBirth).toDate(),
        hireDate: dayjs(formData.hireDate).toDate(),
        position: formData.position,
        department: formData.department,
        salary: {
          ...employee.salary,
          baseSalary: formData.salary,
        },
      };

      if (formData.photoURL) {
        updateData.photoURL = formData.photoURL;
      }

      await updateMutation.mutateAsync({
        id,
        data: updateData,
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
