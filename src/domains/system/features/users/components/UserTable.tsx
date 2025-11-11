import { CheckCircleOutlined, CloseCircleOutlined, EditOutlined } from '@ant-design/icons';
import { Avatar, Button, Space, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { FC } from 'react';
import { useState } from 'react';
import { ROLE_LABELS } from '@/shared/constants/roles';
import type { User } from '@/shared/types';
import type { UserTableRecord } from '../types/user.types';
import { EditUserModal } from './EditUserModal';

const { Text } = Typography;

interface UserTableProps {
  users: User[];
  loading: boolean;
}

/**
 * User table component
 */
export const UserTable: FC<UserTableProps> = ({ users, loading }) => {
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setEditingUser(null);
    setIsModalOpen(false);
  };

  const columns: ColumnsType<UserTableRecord> = [
    {
      title: 'ผู้ใช้งาน',
      dataIndex: 'displayName',
      key: 'displayName',
      render: (text: string, record: UserTableRecord) => (
        <Space>
          <Avatar src={record.photoURL}>{text[0]}</Avatar>
          <div>
            <div>
              <Text strong>{text}</Text>
            </div>
            <div>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {record.email}
              </Text>
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: 'บทบาท',
      dataIndex: 'role',
      key: 'role',
      render: (role: User['role']) => {
        const colors: Record<string, 'red' | 'blue' | 'purple' | 'green' | 'orange'> = {
          admin: 'red',
          hr: 'blue',
          manager: 'purple',
          employee: 'green',
          auditor: 'orange',
        };
        return <Tag color={colors[role] || 'default'}>{ROLE_LABELS[role]}</Tag>;
      },
    },
    {
      title: 'เบอร์โทรศัพท์',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
      render: (phoneNumber?: string) => phoneNumber || '-',
    },
    {
      title: 'สถานะ',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) =>
        isActive ? (
          <Tag icon={<CheckCircleOutlined />} color="success">
            ใช้งานอยู่
          </Tag>
        ) : (
          <Tag icon={<CloseCircleOutlined />} color="error">
            ปิดการใช้งาน
          </Tag>
        ),
    },
    {
      title: 'วันที่สร้าง',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: Date) =>
        new Date(date).toLocaleDateString('th-TH', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }),
    },
    {
      title: 'การดำเนินการ',
      key: 'actions',
      render: (_: unknown, record: UserTableRecord) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            แก้ไข
          </Button>
        </Space>
      ),
    },
  ];

  const dataSource: UserTableRecord[] = users.map((user) => ({
    ...user,
    key: user.id,
  }));

  return (
    <>
      <Table
        columns={columns}
        dataSource={dataSource}
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `ทั้งหมด ${total} รายการ`,
        }}
      />
      {editingUser && (
        <EditUserModal user={editingUser} open={isModalOpen} onClose={handleModalClose} />
      )}
    </>
  );
};
