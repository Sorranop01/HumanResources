import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SearchOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { Button, Card, Input, Modal, message, Space, Spin, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { FC } from 'react';
import { useMemo, useState } from 'react';
import { PositionForm } from '../components/PositionForm';
import { useCreatePosition } from '../hooks/useCreatePosition';
import { useDeletePosition } from '../hooks/useDeletePosition';
import { usePositions } from '../hooks/usePositions';
import { useUpdatePosition } from '../hooks/useUpdatePosition';
import type { CreatePositionFormInput, UpdatePositionFormInput } from '../schemas/positionSchemas';
import type { Position } from '../types/positionTypes';

const TENANT_ID = 'default'; // TODO: Get from auth context
const USER_ID = 'system'; // TODO: Get from auth context

const LEVEL_LABELS: Record<string, string> = {
  entry: 'Entry Level',
  junior: 'Junior',
  senior: 'Senior',
  lead: 'Lead',
  manager: 'Manager',
  director: 'Director',
  executive: 'Executive',
};

const CATEGORY_LABELS: Record<string, string> = {
  technical: 'Technical',
  management: 'Management',
  support: 'Support',
  sales: 'Sales',
  operations: 'Operations',
};

export const PositionsPage: FC = () => {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [searchText, setSearchText] = useState('');

  const { data: positions, isLoading } = usePositions(TENANT_ID);
  const createMutation = useCreatePosition();
  const updateMutation = useUpdatePosition();
  const deleteMutation = useDeletePosition();

  const handleCreate = () => {
    setSelectedPosition(null);
    setIsFormVisible(true);
  };

  const handleEdit = (position: Position) => {
    setSelectedPosition(position);
    setIsFormVisible(true);
  };

  const handleFormSubmit = (data: CreatePositionFormInput | UpdatePositionFormInput) => {
    if (selectedPosition) {
      // Update existing position
      updateMutation.mutate(
        {
          id: selectedPosition.id,
          input: data as UpdatePositionFormInput,
          userId: USER_ID,
        },
        {
          onSuccess: () => {
            message.success('อัปเดตตำแหน่งสำเร็จ');
            setIsFormVisible(false);
            setSelectedPosition(null);
          },
          onError: (error) => {
            message.error(`เกิดข้อผิดพลาด: ${error.message}`);
          },
        }
      );
    } else {
      // Create new position
      createMutation.mutate(
        {
          input: data as CreatePositionFormInput,
          userId: USER_ID,
        },
        {
          onSuccess: () => {
            message.success('เพิ่มตำแหน่งสำเร็จ');
            setIsFormVisible(false);
          },
          onError: (error) => {
            message.error(`เกิดข้อผิดพลาด: ${error.message}`);
          },
        }
      );
    }
  };

  const handleDelete = (position: Position) => {
    Modal.confirm({
      title: 'ยืนยันการลบ',
      content: `คุณต้องการลบตำแหน่ง "${position.title}" ใช่หรือไม่?`,
      okText: 'ลบ',
      okType: 'danger',
      cancelText: 'ยกเลิก',
      onOk: () => {
        deleteMutation.mutate(
          { id: position.id },
          {
            onSuccess: () => {
              message.success('ลบตำแหน่งสำเร็จ');
            },
            onError: (error) => {
              message.error(`เกิดข้อผิดพลาด: ${error.message}`);
            },
          }
        );
      },
    });
  };

  const handleCloseForm = () => {
    setIsFormVisible(false);
    setSelectedPosition(null);
  };

  // Filter positions based on search
  const filteredPositions = useMemo(() => {
    if (!positions) return [];
    if (!searchText.trim()) return positions;

    const lowerSearch = searchText.toLowerCase();
    return positions.filter(
      (pos) =>
        pos.code.toLowerCase().includes(lowerSearch) ||
        pos.title.toLowerCase().includes(lowerSearch) ||
        pos.titleEn?.toLowerCase().includes(lowerSearch) ||
        pos.departmentName?.toLowerCase().includes(lowerSearch)
    );
  }, [positions, searchText]);

  const columns: ColumnsType<Position> = [
    {
      title: 'รหัส',
      dataIndex: 'code',
      key: 'code',
      width: 120,
      render: (code) => <Tag color="blue">{code}</Tag>,
    },
    {
      title: 'ชื่อตำแหน่ง (TH)',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Position Title (EN)',
      dataIndex: 'titleEn',
      key: 'titleEn',
    },
    {
      title: 'ระดับ',
      dataIndex: 'level',
      key: 'level',
      width: 120,
      render: (level) => <Tag color="purple">{LEVEL_LABELS[level]}</Tag>,
    },
    {
      title: 'หมวดหมู่',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      render: (category) => <Tag>{CATEGORY_LABELS[category]}</Tag>,
    },
    {
      title: 'แผนก',
      dataIndex: 'departmentName',
      key: 'departmentName',
    },
    {
      title: 'เงินเดือน (บาท)',
      key: 'salary',
      width: 180,
      render: (_text, record) => {
        if (record.minSalary && record.maxSalary) {
          return `${record.minSalary.toLocaleString('th-TH')} - ${record.maxSalary.toLocaleString('th-TH')}`;
        }
        return '-';
      },
    },
    {
      title: 'สถานะ',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      render: (isActive) => (
        <Tag color={isActive ? 'green' : 'red'}>{isActive ? 'ใช้งาน' : 'ปิดใช้งาน'}</Tag>
      ),
    },
    {
      title: 'จัดการ',
      key: 'action',
      width: 120,
      render: (_text, record) => (
        <Space size="small">
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            แก้ไข
          </Button>
          <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record)}>
            ลบ
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card
        title={
          <span>
            <TeamOutlined /> จัดการตำแหน่งงาน
          </span>
        }
        extra={
          <Space>
            <Input
              placeholder="ค้นหาตำแหน่ง..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 250 }}
              allowClear
            />
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
              เพิ่มตำแหน่ง
            </Button>
          </Space>
        }
      >
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <Spin size="large" />
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={filteredPositions}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `ทั้งหมด ${total} ตำแหน่ง`,
            }}
          />
        )}
      </Card>

      <PositionForm
        visible={isFormVisible}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
        initialPosition={selectedPosition || undefined}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
};
