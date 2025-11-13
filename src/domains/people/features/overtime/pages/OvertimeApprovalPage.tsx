import { AuditOutlined } from '@ant-design/icons';
import { Alert, Card, Modal, message, Space, Spin, Typography } from 'antd';
import type { FC } from 'react';
import { useState } from 'react';

import { useAuth } from '@/shared/hooks/useAuth';
import { PageHeader } from '@/shared/ui/components/PageHeader';

import { OvertimeApprovalModal } from '../components/OvertimeApprovalModal';
import { OvertimeRejectionModal } from '../components/OvertimeRejectionModal';
import { OvertimeRequestTable } from '../components/OvertimeRequestTable';
import { useApproveOvertime, usePendingApprovals, useRejectOvertime } from '../hooks/useOvertime';
import type { OvertimeRequest } from '../types';

const { Paragraph } = Typography;

export const OvertimeApprovalPage: FC = () => {
  const { user } = useAuth();
  const { data: pendingRequests, isLoading } = usePendingApprovals();

  const approveMutation = useApproveOvertime();
  const rejectMutation = useRejectOvertime();

  const [currentRequest, setCurrentRequest] = useState<OvertimeRequest | null>(null);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

  const handleApproveSubmit = (comments?: string) => {
    if (!currentRequest || !user) {
      message.error('ไม่พบข้อมูลผู้อนุมัติ');
      return;
    }

    approveMutation.mutate(
      {
        requestId: currentRequest.id,
        approverId: user.id,
        approverName: user.displayName ?? '',
        comments: comments || undefined,
      },
      {
        onSuccess: () => setIsApproveModalOpen(false),
      }
    );
  };

  const handleRejectSubmit = (reason: string) => {
    if (!currentRequest || !user) {
      message.error('ไม่พบข้อมูลผู้อนุมัติ');
      return;
    }

    rejectMutation.mutate(
      {
        requestId: currentRequest.id,
        approverId: user.id,
        approverName: user.displayName ?? '',
        reason,
      },
      {
        onSuccess: () => setIsRejectModalOpen(false),
      }
    );
  };

  const openApproveModal = (request: OvertimeRequest) => {
    setCurrentRequest(request);
    setIsApproveModalOpen(true);
  };

  const openRejectModal = (request: OvertimeRequest) => {
    setCurrentRequest(request);
    setIsRejectModalOpen(true);
  };

  const handleQuickApprove = (request: OvertimeRequest) => {
    Modal.confirm({
      title: 'อนุมัติคำขอ OT',
      content: `ต้องการอนุมัติ OT ของ ${request.employeeName} หรือไม่?`,
      onOk: () => openApproveModal(request),
      okText: 'ระบุความคิดเห็น',
      cancelText: 'กลับ',
    });
  };

  return (
    <div style={{ padding: 24 }}>
      <PageHeader
        title="อนุมัติคำขอ OT"
        breadcrumbs={[
          { label: 'การจัดการคน', path: '/people' },
          { label: 'OT', path: '/overtime' },
          { label: 'อนุมัติคำขอ' },
        ]}
      />

      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Card>
          <Space align="start">
            <AuditOutlined style={{ fontSize: 32, color: '#fa8c16' }} />
            <div>
              <Paragraph strong style={{ marginBottom: 0 }}>
                คำขอที่รอการอนุมัติ
              </Paragraph>
              <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                ตรวจสอบเหตุผลและรายละเอียดการทำงานก่อนดำเนินการอนุมัติหรือปฏิเสธ
              </Paragraph>
            </div>
          </Space>
        </Card>

        {!user && (
          <Alert
            type="warning"
            showIcon
            message="จำเป็นต้องเข้าสู่ระบบเพื่ออนุมัติคำขอ OT"
            style={{ marginBottom: 24 }}
          />
        )}

        <Card title="คำขอที่รอดำเนินการ">
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <Spin />
            </div>
          ) : (
            <OvertimeRequestTable
              data={pendingRequests ?? []}
              onApprove={handleQuickApprove}
              onReject={openRejectModal}
            />
          )}
        </Card>
      </Space>

      {isApproveModalOpen && currentRequest && (
        <OvertimeApprovalModal
          open={isApproveModalOpen}
          request={currentRequest}
          loading={approveMutation.isPending}
          onSubmit={handleApproveSubmit}
          onCancel={() => setIsApproveModalOpen(false)}
        />
      )}

      {isRejectModalOpen && currentRequest && (
        <OvertimeRejectionModal
          open={isRejectModalOpen}
          request={currentRequest}
          loading={rejectMutation.isPending}
          onSubmit={handleRejectSubmit}
          onCancel={() => setIsRejectModalOpen(false)}
        />
      )}
    </div>
  );
};
