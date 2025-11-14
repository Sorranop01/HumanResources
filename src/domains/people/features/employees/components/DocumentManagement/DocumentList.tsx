import { DeleteOutlined, DownloadOutlined, EyeOutlined, FileOutlined } from '@ant-design/icons';
import { Button, Popconfirm, Space, Table, Tag, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import type { FC } from 'react';
import { useMemo, useState } from 'react';
import { useDeleteEmployeeDocument } from '@/domains/people/features/employees/hooks/useEmployeeDocuments';
import type { DocumentRecord, DocumentType } from '@/domains/people/features/employees/types';
import { DocumentViewerModal } from './DocumentViewerModal';
import { DOCUMENT_TYPE_LABELS } from './documentTypes';

interface DocumentListProps {
  employeeId: string;
  documents?: DocumentRecord[];
}

export const DocumentList: FC<DocumentListProps> = ({ employeeId, documents }) => {
  const resolveLabel = (type: DocumentRecord['type']) =>
    DOCUMENT_TYPE_LABELS[type as DocumentType] ?? type;

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const deleteMutation = useDeleteEmployeeDocument(employeeId);

  const dataSource = useMemo(() => {
    return (documents ?? []).map((doc, index) => ({
      key: `${doc.fileURL}-${index}`,
      ...doc,
    }));
  }, [documents]);

  const columns: ColumnsType<DocumentRecord & { key: string }> = [
    {
      title: 'ประเภท',
      dataIndex: 'type',
      key: 'type',
      render: (type: DocumentRecord['type']) => (
        <Tag icon={<FileOutlined />} color="blue">
          {resolveLabel(type)}
        </Tag>
      ),
    },
    {
      title: 'ชื่อไฟล์',
      dataIndex: 'fileName',
      key: 'fileName',
      render: (fileName: string) => (
        <Tooltip title={fileName}>
          <span>{fileName}</span>
        </Tooltip>
      ),
    },
    {
      title: 'อัปโหลดโดย',
      dataIndex: 'uploadedBy',
      key: 'uploadedBy',
      width: 160,
    },
    {
      title: 'วันที่อัปโหลด',
      dataIndex: 'uploadDate',
      key: 'uploadDate',
      width: 160,
      render: (date: Date) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'วันหมดอายุ',
      dataIndex: 'expiryDate',
      key: 'expiryDate',
      width: 160,
      render: (date?: Date) => {
        if (!date) {
          return '-';
        }
        const formatted = dayjs(date).format('DD/MM/YYYY');
        const isExpired = dayjs(date).isBefore(dayjs(), 'day');
        return (
          <Tag color={isExpired ? 'red' : 'default'}>
            {formatted}
            {isExpired ? ' (หมดอายุ)' : ''}
          </Tag>
        );
      },
    },
    {
      title: 'การจัดการ',
      key: 'actions',
      width: 220,
      render: (_: unknown, record) => (
        <Space>
          <Button icon={<EyeOutlined />} size="small" onClick={() => setPreviewUrl(record.fileURL)}>
            ดู
          </Button>
          <Button
            icon={<DownloadOutlined />}
            size="small"
            onClick={() => window.open(record.fileURL, '_blank')}
          >
            ดาวน์โหลด
          </Button>
          <Popconfirm
            title="ลบเอกสาร"
            description="คุณแน่ใจหรือไม่ว่าต้องการลบเอกสารนี้?"
            okText="ลบ"
            cancelText="ยกเลิก"
            onConfirm={() =>
              deleteMutation.mutate({
                employeeId,
                fileURL: record.fileURL,
              })
            }
          >
            <Button
              icon={<DeleteOutlined />}
              danger
              size="small"
              loading={deleteMutation.isPending}
            >
              ลบ
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Table
        columns={columns}
        dataSource={dataSource}
        pagination={{ pageSize: 5 }}
        locale={{
          emptyText: 'ยังไม่มีเอกสาร',
        }}
      />
      <DocumentViewerModal
        open={Boolean(previewUrl)}
        url={previewUrl ?? ''}
        onClose={() => setPreviewUrl(null)}
      />
    </>
  );
};
