import {
  ApartmentOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { Button, Card, Col, Input, Modal, message, Row, Space, Spin, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { FC } from 'react';
import { useMemo, useState } from 'react';
import { DepartmentForm } from '../components/DepartmentForm';
import { DepartmentTree } from '../components/DepartmentTree';
import { useDeleteDepartment } from '../hooks/useDeleteDepartment';
import { useDepartments } from '../hooks/useDepartments';
import type { Department } from '../types/departmentTypes';

const TENANT_ID = 'default'; // TODO: Get from auth context

export const DepartmentsPage: FC = () => {
  const { data: departments, isLoading } = useDepartments(TENANT_ID);
  const { mutate: deleteDepartment } = useDeleteDepartment();
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [searchText, setSearchText] = useState('');

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: 'ยืนยันการลบ',
      content: 'คุณต้องการลบแผนกนี้ใช่หรือไม่?',
      okText: 'ลบ',
      okType: 'danger',
      cancelText: 'ยกเลิก',
      onOk: () => {
        deleteDepartment(
          { id },
          {
            onSuccess: () => {
              message.success('ลบแผนกสำเร็จ');
            },
            onError: (error) => {
              message.error(error.message || 'เกิดข้อผิดพลาดในการลบแผนก');
            },
          }
        );
      },
    });
  };

  const handleEdit = (dept: Department) => {
    setSelectedDepartment(dept);
    setIsFormVisible(true);
  };

  const handleCreate = () => {
    setSelectedDepartment(null);
    setIsFormVisible(true);
  };

  const handleCloseForm = () => {
    setIsFormVisible(false);
    setSelectedDepartment(null);
  };

  // Filter departments based on search
  const filteredDepartments = useMemo(() => {
    if (!departments) return [];
    if (!searchText.trim()) return departments;

    const lowerSearch = searchText.toLowerCase();
    return departments.filter(
      (dept) =>
        dept.code.toLowerCase().includes(lowerSearch) ||
        dept.name.toLowerCase().includes(lowerSearch) ||
        dept.nameEn?.toLowerCase().includes(lowerSearch) ||
        dept.managerName?.toLowerCase().includes(lowerSearch)
    );
  }, [departments, searchText]);

  const columns: ColumnsType<Department> = [
    {
      title: 'รหัสแผนก',
      dataIndex: 'code',
      key: 'code',
      width: 120,
      render: (code) => <Tag color="blue">{code}</Tag>,
    },
    {
      title: 'ชื่อแผนก (TH)',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Department Name (EN)',
      dataIndex: 'nameEn',
      key: 'nameEn',
    },
    {
      title: 'ระดับ',
      dataIndex: 'level',
      key: 'level',
      width: 80,
      render: (level) => <Tag>{level}</Tag>,
    },
    {
      title: 'ผู้จัดการ',
      dataIndex: 'managerName',
      key: 'managerName',
      render: (name) => name || '-',
    },
    {
      title: 'ศูนย์ต้นทุน',
      dataIndex: 'costCenter',
      key: 'costCenter',
      render: (code) => code || '-',
    },
    {
      title: 'งบประมาณ',
      dataIndex: 'budgetAmount',
      key: 'budgetAmount',
      align: 'right',
      render: (amount) => (amount ? `${amount.toLocaleString('th-TH')} บาท` : '-'),
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
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            ลบ
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col span={8}>
          <DepartmentTree />
        </Col>
        <Col span={16}>
          <Card
            title={
              <span>
                <ApartmentOutlined /> จัดการแผนก
              </span>
            }
            extra={
              <Space>
                <Input
                  placeholder="ค้นหาแผนก..."
                  prefix={<SearchOutlined />}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  style={{ width: 250 }}
                  allowClear
                />
                <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                  เพิ่มแผนก
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
                dataSource={filteredDepartments}
                rowKey="id"
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showTotal: (total) => `ทั้งหมด ${total} แผนก`,
                }}
              />
            )}
          </Card>
        </Col>
      </Row>

      <DepartmentForm
        visible={isFormVisible}
        department={selectedDepartment}
        onClose={handleCloseForm}
      />
    </div>
  );
};
