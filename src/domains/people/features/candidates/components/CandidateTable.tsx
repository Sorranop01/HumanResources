import { DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { Badge, Button, Space, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Timestamp } from 'firebase/firestore';
import type { FC } from 'react';
import { useState } from 'react';
import { useDeleteCandidate } from '../hooks/useDeleteCandidate';
import type { Candidate, CandidateStatus } from '../schemas';
import { CandidateDetailModal } from './CandidateDetailModal';

interface CandidateTableProps {
  candidates: Candidate[];
  loading?: boolean;
}

export const CandidateTable: FC<CandidateTableProps> = ({ candidates, loading }) => {
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const deleteCandidate = useDeleteCandidate();

  const handleDelete = (id: string) => {
    if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบผู้สมัครคนนี้?')) {
      void deleteCandidate.mutateAsync(id);
    }
  };

  const columns: ColumnsType<Candidate> = [
    {
      title: 'ชื่อ-นามสกุล',
      key: 'name',
      render: (_, record) => `${record.firstName} ${record.lastName}`,
      sorter: (a, b) => a.firstName.localeCompare(b.firstName),
    },
    {
      title: 'อีเมล',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'โทรศัพท์',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'ตำแหน่งที่สมัคร',
      dataIndex: 'positionApplied',
      key: 'positionApplied',
      sorter: (a, b) => a.positionApplied.localeCompare(b.positionApplied),
    },
    {
      title: 'เงินเดือนที่คาดหวัง',
      dataIndex: 'expectedSalary',
      key: 'expectedSalary',
      render: (salary?: number) => (salary ? `${salary.toLocaleString()} บาท` : '-'),
      sorter: (a, b) => (a.expectedSalary ?? 0) - (b.expectedSalary ?? 0),
    },
    {
      title: 'ประสบการณ์',
      dataIndex: 'yearsOfExperience',
      key: 'yearsOfExperience',
      render: (years?: number) => (years !== undefined ? `${years} ปี` : '-'),
      sorter: (a, b) => (a.yearsOfExperience ?? 0) - (b.yearsOfExperience ?? 0),
    },
    {
      title: 'สถานะ',
      dataIndex: 'status',
      key: 'status',
      render: (status: CandidateStatus) => {
        const { color, text } = getStatusConfig(status);
        return <Badge color={color} text={text} />;
      },
      filters: [
        { text: 'ใหม่', value: 'new' },
        { text: 'คัดกรอง', value: 'screening' },
        { text: 'สัมภาษณ์', value: 'interview' },
        { text: 'เสนอตำแหน่ง', value: 'offer' },
        { text: 'รับเข้าทำงาน', value: 'hired' },
        { text: 'ปฏิเสธ', value: 'rejected' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'วันที่สมัคร',
      dataIndex: 'appliedAt',
      key: 'appliedAt',
      render: (date: Timestamp | Date | string | number) => formatAppliedAt(date),
      sorter: (a, b) => {
        const dateA = normalizeDateValue(a.appliedAt);
        const dateB = normalizeDateValue(b.appliedAt);
        return dateA.getTime() - dateB.getTime();
      },
      defaultSortOrder: 'descend',
    },
    {
      title: 'การจัดการ',
      key: 'actions',
      fixed: 'right',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EyeOutlined />} onClick={() => setSelectedCandidate(record)}>
            ดู
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
            loading={deleteCandidate.isPending}
          >
            ลบ
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Table
        columns={columns}
        dataSource={candidates}
        rowKey="id"
        loading={loading ?? false}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `ทั้งหมด ${total} รายการ`,
        }}
        scroll={{ x: 1200 }}
      />

      {selectedCandidate && (
        <CandidateDetailModal
          candidate={selectedCandidate}
          open={!!selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
        />
      )}
    </>
  );
};

function getStatusConfig(status: CandidateStatus): { color: string; text: string } {
  const configs: Record<CandidateStatus, { color: string; text: string }> = {
    new: { color: 'blue', text: 'ใหม่' },
    screening: { color: 'cyan', text: 'คัดกรอง' },
    interview: { color: 'orange', text: 'สัมภาษณ์' },
    offer: { color: 'purple', text: 'เสนอตำแหน่ง' },
    hired: { color: 'green', text: 'รับเข้าทำงาน' },
    rejected: { color: 'red', text: 'ปฏิเสธ' },
  };
  return configs[status] ?? { color: 'default', text: status };
}

function formatAppliedAt(value: Timestamp | Date | string | number): string {
  if (value instanceof Timestamp) {
    return value.toDate().toLocaleDateString('th-TH');
  }
  if (value instanceof Date) {
    return value.toLocaleDateString('th-TH');
  }
  return new Date(value).toLocaleDateString('th-TH');
}

function normalizeDateValue(value: Timestamp | Date | string | number): Date {
  if (value instanceof Timestamp) {
    return value.toDate();
  }
  if (value instanceof Date) {
    return value;
  }
  return new Date(value);
}
