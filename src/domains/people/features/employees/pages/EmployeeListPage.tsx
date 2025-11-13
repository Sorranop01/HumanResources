/**
 * EmployeeListPage - Main page for listing all employees
 * Includes filters, search, and actions
 */

import { PlusOutlined } from '@ant-design/icons';
import { Button, Col, Row, Space, Typography } from 'antd';
import type { FC } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EmployeeFilters } from '../components/EmployeeFilters';
import { EmployeeStats } from '../components/EmployeeStats';
import { EmployeeTable } from '../components/EmployeeTable';
import { useEmployees } from '../hooks/useEmployees';
import type { EmployeeFilters as EmployeeFiltersType } from '../schemas';

const { Title } = Typography;

export const EmployeeListPage: FC = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<EmployeeFiltersType>({});
  const { data: employees, isLoading } = useEmployees(filters);

  // Note: Client-side search filtering is commented out since EmployeeTable
  // currently doesn't accept filtered data. Uncomment if needed in the future.
  // const filteredEmployees = employees?.filter((emp) => {
  //   if (!filters.search) return true;
  //   const searchTerm = filters.search.toLowerCase();
  //   const fullName = `${emp.firstName} ${emp.lastName}`.toLowerCase();
  //   const thaiFullName = `${emp.thaiFirstName} ${emp.thaiLastName}`.toLowerCase();
  //   return (
  //     fullName.includes(searchTerm) ||
  //     thaiFullName.includes(searchTerm) ||
  //     emp.email.toLowerCase().includes(searchTerm) ||
  //     emp.employeeCode.toLowerCase().includes(searchTerm)
  //   );
  // });

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2} style={{ margin: 0 }}>
            จัดการพนักงาน
          </Title>
        </Col>
        <Col>
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/employees/create')}
            >
              เพิ่มพนักงาน
            </Button>
          </Space>
        </Col>
      </Row>

      {/* Employee Statistics */}
      <Row style={{ marginBottom: 24 }}>
        <Col span={24}>
          <EmployeeStats employees={employees ?? []} loading={isLoading} />
        </Col>
      </Row>

      {/* Filters */}
      <Row style={{ marginBottom: 16 }}>
        <Col span={24}>
          <EmployeeFilters filters={filters} onFiltersChange={setFilters} loading={isLoading} />
        </Col>
      </Row>

      {/* Table */}
      <Row>
        <Col span={24}>
          <EmployeeTable />
        </Col>
      </Row>
    </div>
  );
};
