import { DeleteOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons';
import { Button, Space, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDeletePosition } from '@/domains/people/features/positions/hooks/useDeletePosition';
import { usePositions } from '@/domains/people/features/positions/hooks/usePositions';
import type {
  PositionFiltersType,
  PositionLevel,
  PositionStatus,
} from '@/domains/people/features/positions/schemas';
import type { Position } from '@/domains/people/features/positions/types';
import { formatMoney } from '@/shared/lib/format';

interface PositionTableProps {
  filters?: PositionFiltersType;
}

const STATUS_COLORS: Record<PositionStatus, string> = {
  active: 'green',
  inactive: 'red',
};

const STATUS_LABELS: Record<PositionStatus, string> = {
  active: 'เปิดใช้งาน',
  inactive: 'ปิดใช้งาน',
};

const LEVEL_LABELS: Record<PositionLevel, string> = {
  executive: 'ผู้บริหารระดับสูง',
  'senior-management': 'ผู้บริหารอาวุโส',
  'middle-management': 'ผู้บริหารระดับกลาง',
  supervisor: 'หัวหน้างาน',
  staff: 'พนักงาน',
  junior: 'พนักงานระดับเริ่มต้น',
};

export const PositionTable = memo(function PositionTable({ filters }: PositionTableProps) {
  const navigate = useNavigate();
  const { data: positions, isLoading } = usePositions(filters);
  const { deleteWithConfirm, isPending: isDeleting } = useDeletePosition();

  const columns: ColumnsType<Position> = [
    {
      title: 'รหัสตำแหน่ง',
      dataIndex: 'positionCode',
      key: 'positionCode',
      width: 120,
      fixed: 'left',
      sorter: (a, b) => a.positionCode.localeCompare(b.positionCode),
    },
    {
      title: 'ชื่อตำแหน่ง',
      dataIndex: 'nameTH',
      key: 'nameTH',
      width: 200,
      fixed: 'left',
      sorter: (a, b) => a.nameTH.localeCompare(b.nameTH),
      render: (text: string, record: Position) => (
        <div>
          <div style={{ fontWeight: 500 }}>{text}</div>
          {record.nameEN && <div style={{ fontSize: '12px', color: '#888' }}>{record.nameEN}</div>}
        </div>
      ),
    },
    {
      title: 'ระดับ',
      dataIndex: 'level',
      key: 'level',
      width: 160,
      sorter: (a, b) => a.level.localeCompare(b.level),
      render: (level: PositionLevel) => LEVEL_LABELS[level],
    },
    {
      title: 'แผนก/ฝ่าย',
      dataIndex: 'department',
      key: 'department',
      width: 150,
      sorter: (a, b) => a.department.localeCompare(b.department),
    },
    {
      title: 'ตำแหน่งหัวหน้า',
      dataIndex: 'parentPositionName',
      key: 'parentPositionName',
      width: 180,
      render: (name?: string) => name || '-',
    },
    {
      title: 'ช่วงเงินเดือน',
      key: 'salaryRange',
      width: 180,
      render: (_, record: Position) => (
        <div>
          {formatMoney(record.salaryRange.min)} - {formatMoney(record.salaryRange.max)}
        </div>
      ),
    },
    {
      title: 'จำนวนตำแหน่ง',
      dataIndex: 'headcount',
      key: 'headcount',
      width: 120,
      align: 'center',
      sorter: (a, b) => a.headcount - b.headcount,
    },
    {
      title: 'พนักงานปัจจุบัน',
      dataIndex: 'currentEmployees',
      key: 'currentEmployees',
      width: 130,
      align: 'center',
      sorter: (a, b) => a.currentEmployees - b.currentEmployees,
    },
    {
      title: 'ตำแหน่งว่าง',
      dataIndex: 'vacancy',
      key: 'vacancy',
      width: 100,
      align: 'center',
      sorter: (a, b) => a.vacancy - b.vacancy,
      render: (vacancy: number) => <Tag color={vacancy > 0 ? 'orange' : 'default'}>{vacancy}</Tag>,
    },
    {
      title: 'สถานะ',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      align: 'center',
      filters: [
        { text: 'เปิดใช้งาน', value: 'active' },
        { text: 'ปิดใช้งาน', value: 'inactive' },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status: PositionStatus) => (
        <Tag color={STATUS_COLORS[status]}>{STATUS_LABELS[status]}</Tag>
      ),
    },
    {
      title: 'จัดการ',
      key: 'actions',
      width: 140,
      fixed: 'right',
      render: (_, record: Position) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/positions/${record.id}`)}
          >
            ดู
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => navigate(`/positions/${record.id}/edit`)}
          >
            แก้ไข
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            loading={isDeleting}
            onClick={() => deleteWithConfirm(record.id, record.nameTH)}
          >
            ลบ
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Table<Position>
      columns={columns}
      dataSource={positions}
      rowKey="id"
      loading={isLoading}
      scroll={{ x: 1600 }}
      pagination={{
        pageSize: 20,
        showSizeChanger: true,
        showTotal: (total) => `ทั้งหมด ${total} ตำแหน่ง`,
      }}
    />
  );
});
