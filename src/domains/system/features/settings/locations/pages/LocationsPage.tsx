import {
  DeleteOutlined,
  EditOutlined,
  EnvironmentOutlined,
  PlusOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { Button, Card, Input, Modal, message, Space, Spin, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { FC } from 'react';
import { useMemo, useState } from 'react';
import { LocationForm } from '../components/LocationForm';
import { useCreateLocation } from '../hooks/useCreateLocation';
import { useDeleteLocation } from '../hooks/useDeleteLocation';
import { useLocations } from '../hooks/useLocations';
import { useUpdateLocation } from '../hooks/useUpdateLocation';
import type { CreateLocationInput, UpdateLocationInput, Location } from '../types/locationTypes';

const TENANT_ID = 'default'; // TODO: Get from auth context
const USER_ID = 'system'; // TODO: Get from auth context

const TYPE_LABELS: Record<string, string> = {
  headquarters: 'สำนักงานใหญ่',
  branch: 'สาขา',
  warehouse: 'คลังสินค้า',
  remote: 'ทำงานระยะไกล',
  coworking: 'Co-working',
  'client-site': 'สถานที่ลูกค้า',
};

export const LocationsPage: FC = () => {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [searchText, setSearchText] = useState('');

  // React Query hooks
  const { data: locations, isLoading } = useLocations(TENANT_ID);
  const createMutation = useCreateLocation();
  const updateMutation = useUpdateLocation();
  const deleteMutation = useDeleteLocation();

  const handleCreate = () => {
    setSelectedLocation(null);
    setIsFormVisible(true);
  };

  const handleEdit = (location: Location) => {
    setSelectedLocation(location);
    setIsFormVisible(true);
  };

  const handleFormSubmit = (data: CreateLocationInput | UpdateLocationInput) => {
    if (selectedLocation) {
      // Update existing location
      updateMutation.mutate(
        {
          id: selectedLocation.id,
          input: data as UpdateLocationInput,
          userId: USER_ID,
        },
        {
          onSuccess: () => {
            message.success('อัปเดตสถานที่สำเร็จ');
            setIsFormVisible(false);
            setSelectedLocation(null);
          },
          onError: (error) => {
            message.error(`เกิดข้อผิดพลาด: ${error.message}`);
          },
        }
      );
    } else {
      // Create new location
      createMutation.mutate(
        {
          input: data as CreateLocationInput,
          userId: USER_ID,
        },
        {
          onSuccess: () => {
            message.success('เพิ่มสถานที่สำเร็จ');
            setIsFormVisible(false);
          },
          onError: (error) => {
            message.error(`เกิดข้อผิดพลาด: ${error.message}`);
          },
        }
      );
    }
  };

  const handleDelete = (location: Location) => {
    Modal.confirm({
      title: 'ยืนยันการลบ',
      content: `คุณต้องการลบสถานที่ "${location.name}" ใช่หรือไม่?`,
      okText: 'ลบ',
      okType: 'danger',
      cancelText: 'ยกเลิก',
      onOk: () => {
        deleteMutation.mutate(
          { id: location.id },
          {
            onSuccess: () => {
              message.success('ลบสถานที่สำเร็จ');
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
    setSelectedLocation(null);
  };

  // Filter locations based on search
  const filteredLocations = useMemo(() => {
    if (!locations) return [];
    if (!searchText.trim()) return locations;

    const lowerSearch = searchText.toLowerCase();
    return locations.filter(
      (loc) =>
        loc.code.toLowerCase().includes(lowerSearch) ||
        loc.name.toLowerCase().includes(lowerSearch) ||
        loc.nameEn?.toLowerCase().includes(lowerSearch) ||
        loc.address.province.toLowerCase().includes(lowerSearch)
    );
  }, [locations, searchText]);

  const columns: ColumnsType<Location> = [
    {
      title: 'รหัส',
      dataIndex: 'code',
      key: 'code',
      width: 100,
      render: (code) => <Tag color="blue">{code}</Tag>,
    },
    {
      title: 'ชื่อสถานที่ (TH)',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Location Name (EN)',
      dataIndex: 'nameEn',
      key: 'nameEn',
    },
    {
      title: 'ประเภท',
      dataIndex: 'type',
      key: 'type',
      width: 150,
      render: (type) => <Tag color="cyan">{TYPE_LABELS[type]}</Tag>,
    },
    {
      title: 'จังหวัด',
      key: 'province',
      width: 120,
      render: (_text, record) => record.address.province,
    },
    {
      title: 'GPS',
      key: 'coordinates',
      width: 80,
      align: 'center',
      render: (_text, record) =>
        record.coordinates?.latitude && record.coordinates?.longitude ? (
          <Tag color="green">✓</Tag>
        ) : (
          <Tag>-</Tag>
        ),
    },
    {
      title: 'ความจุ',
      dataIndex: 'capacity',
      key: 'capacity',
      width: 100,
      align: 'right',
      render: (capacity, record) =>
        capacity ? `${record.currentEmployeeCount || 0}/${capacity}` : '-',
    },
    {
      title: 'Remote',
      dataIndex: 'supportsRemoteWork',
      key: 'supportsRemoteWork',
      width: 80,
      align: 'center',
      render: (supports) => (supports ? <Tag color="green">✓</Tag> : <Tag>-</Tag>),
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
            <EnvironmentOutlined /> จัดการสาขา/สถานที่ทำงาน
          </span>
        }
        extra={
          <Space>
            <Input
              placeholder="ค้นหาสถานที่..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 250 }}
              allowClear
            />
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
              เพิ่มสถานที่
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
            dataSource={filteredLocations}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `ทั้งหมด ${total} สถานที่`,
            }}
          />
        )}
      </Card>

      <LocationForm
        visible={isFormVisible}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
        initialData={selectedLocation || undefined}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
};
