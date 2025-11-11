import { memo } from 'react';
import { Table, Tag, Space, Button } from 'antd';
import { EditOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import { useEmployees } from '../hooks/useEmployees';
import type { Employee, EmployeeStatus } from '@/shared/types';
import { formatThaiDate } from '@/shared/lib/date';
import { formatMoney } from '@/shared/lib/format';
import { ROUTES } from '@/shared/constants/routes';

const STATUS_COLORS: Record<EmployeeStatus, string> = {
  active: 'green',
  'on-leave': 'orange',
  resigned: 'red',
  terminated: 'volcano',
};

const STATUS_LABELS: Record<EmployeeStatus, string> = {
  active: 'ทำงานอยู่',
  'on-leave': 'ลา',
  resigned: 'ลาออก',
  terminated: 'เลิกจ้าง',
};

export const EmployeeTable = memo(function EmployeeTable() {
  const navigate = useNavigate();
  const { data: employees, isLoading } = useEmployees();

  const columns: ColumnsType<Employee> = [
    {
      title: 'รหัสพนักงาน',
      dataIndex: 'employeeCode',
      key: 'employeeCode',
      width: 120,
    },
    {
      title: 'ชื่อ-นามสกุล',
      key: 'fullName',
      render: (_, record) => `${record.firstName} ${record.lastName}`,
    },
    {
      title: 'แผนก',
      dataIndex: 'department',
      key: 'department',
    },
    {
      title: 'ตำแหน่ง',
      dataIndex: 'position',
      key: 'position',
    },
    {
      title: 'เงินเดือน',
      dataIndex: 'salary',
      key: 'salary',
      render: (salary: number) => formatMoney(salary),
      align: 'right',
    },
    {
      title: 'วันเริ่มงาน',
      dataIndex: 'hireDate',
      key: 'hireDate',
      render: (date: Date) => formatThaiDate(date),
    },
    {
      title: 'สถานะ',
      dataIndex: 'status',
      key: 'status',
      render: (status: EmployeeStatus) => (
        <Tag color={STATUS_COLORS[status]}>{STATUS_LABELS[status]}</Tag>
      ),
    },
    {
      title: 'จัดการ',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => navigate(ROUTES.EMPLOYEE_DETAIL.replace(':id', record.id))}
          >
            ดู
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => navigate(`${ROUTES.EMPLOYEES}/${record.id}/edit`)}
          >
            แก้ไข
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={employees}
      rowKey="id"
      loading={isLoading}
      pagination={{
        pageSize: 10,
        showSizeChanger: true,
        showTotal: (total) => `ทั้งหมด ${total} คน`,
      }}
    />
  );
});
