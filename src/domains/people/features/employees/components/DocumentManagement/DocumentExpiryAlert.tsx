import { Alert, List, Tag } from 'antd';
import dayjs from 'dayjs';
import type { FC } from 'react';
import type { DocumentRecord, DocumentType } from '@/domains/people/features/employees/types';
import { DOCUMENT_TYPE_LABELS } from './documentTypes';

interface DocumentExpiryAlertProps {
  documents?: DocumentRecord[];
  warningDays?: number;
}

export const DocumentExpiryAlert: FC<DocumentExpiryAlertProps> = ({
  documents,
  warningDays = 30,
}) => {
  const resolveLabel = (type: DocumentRecord['type']) =>
    DOCUMENT_TYPE_LABELS[type as DocumentType] ?? type;

  if (!documents?.length) {
    return null;
  }

  const now = dayjs();
  const expiringSoon = documents.filter(
    (doc) =>
      doc.expiryDate &&
      dayjs(doc.expiryDate).isAfter(now, 'day') &&
      dayjs(doc.expiryDate).diff(now, 'day') <= warningDays
  );
  const expired = documents.filter(
    (doc) => doc.expiryDate && dayjs(doc.expiryDate).isBefore(now, 'day')
  );

  if (!expiringSoon.length && !expired.length) {
    return null;
  }

  return (
    <div style={{ marginBottom: 16 }}>
      {expired.length > 0 && (
        <Alert
          type="error"
          showIcon
          message="เอกสารหมดอายุ"
          description={
            <List
              size="small"
              dataSource={expired}
              renderItem={(doc) => (
                <List.Item>
                  <Tag color="red">{resolveLabel(doc.type)}</Tag>
                  <span>{doc.fileName}</span>
                  <span style={{ marginLeft: 'auto' }}>
                    หมดอายุ {dayjs(doc.expiryDate).format('DD/MM/YYYY')}
                  </span>
                </List.Item>
              )}
            />
          }
          style={{ marginBottom: 12 }}
        />
      )}

      {expiringSoon.length > 0 && (
        <Alert
          type="warning"
          showIcon
          message={`เอกสารใกล้หมดอายุ (${warningDays} วัน)`}
          description={
            <List
              size="small"
              dataSource={expiringSoon}
              renderItem={(doc) => (
                <List.Item>
                  <Tag color="orange">{resolveLabel(doc.type)}</Tag>
                  <span>{doc.fileName}</span>
                  <span style={{ marginLeft: 'auto' }}>
                    หมดอายุ {dayjs(doc.expiryDate).format('DD/MM/YYYY')}
                  </span>
                </List.Item>
              )}
            />
          }
        />
      )}
    </div>
  );
};
