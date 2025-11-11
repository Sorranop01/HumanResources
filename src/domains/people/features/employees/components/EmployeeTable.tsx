import { EditOutlined, EyeOutlined } from '@ant-design/icons';
import { Button, Space, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEmployees } from '@/domains/people/features/employees/hooks/useEmployees';
import type { Employee, EmployeeStatus } from '@/domains/people/features/employees/types';
import { ROUTES } from '@/shared/constants/routes';
import { formatThaiDate } from '@/shared/lib/date';
import { formatMoney } from '@/shared/lib/format';

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
      fixed: 'left',
    },
    {
      title: 'ชื่อ-นามสกุล',
      key: 'fullName',
      width: 200,
      fixed: 'left',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{`${record.firstName} ${record.lastName}`}</div>
          <div style={{ fontSize: '12px', color: '#888' }}>
            {`${record.thaiFirstName} ${record.thaiLastName}`}
          </div>
        </div>
      ),
    },
    {
      title: 'ตำแหน่ง',
      dataIndex: 'position',
      key: 'position',
      width: 180,
    },
    {
      title: 'แผนก',
      dataIndex: 'department',
      key: 'department',
      width: 120,
    },
    {
      title: 'ระดับ',
      dataIndex: 'level',
      key: 'level',
      width: 100,
      render: (level?: string) => level || '-',
    },
    {
      title: 'ประเภท',
      key: 'employmentType',
      width: 120,
      render: (_, record) => (
        <div>
          <Tag color="blue">{getEmploymentTypeLabel(record.employmentType)}</Tag>
          <Tag color={record.workType === 'full-time' ? 'green' : 'orange'}>
            {record.workType === 'full-time' ? 'Full-time' : 'Part-time'}
          </Tag>
        </div>
      ),
    },
    {
      title: 'เงินเดือน',
      key: 'salary',
      width: 120,
      render: (_, record) => formatMoney(record.salary.baseSalary),
      align: 'right',
    },
    {
      title: 'วันเริ่มงาน',
      dataIndex: 'hireDate',
      key: 'hireDate',
      width: 120,
      render: (date: Date) => formatThaiDate(date),
    },
    {
      title: 'สถานะ',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: EmployeeStatus) => (
        <Tag color={STATUS_COLORS[status]}>{STATUS_LABELS[status]}</Tag>
      ),
    },
    {
      title: 'จัดการ',
      key: 'actions',
      width: 150,
      fixed: 'right',
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

  // Helper function for employment type labels
  function getEmploymentTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      permanent: 'ประจำ',
      contract: 'สัญญา',
      probation: 'ทดลองงาน',
      freelance: 'ฟรีแลนซ์',
      intern: 'ฝึกงาน',
    };
    return labels[type] || type;
  }

  return (
    <Table
      columns={columns}
      dataSource={employees}
      rowKey="id"
      loading={isLoading}
      scroll={{ x: 1500 }}
      pagination={{
        pageSize: 10,
        showSizeChanger: true,
        pageSizeOptions: ['10', '20', '50', '100'],
        showTotal: (total) => `ทั้งหมด ${total} คน`,
      }}
    />
  );
});
