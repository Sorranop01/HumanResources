/**
 * Leave Request Card Component
 * Display component for showing leave request details
 */

import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { Button, Card, Col, Descriptions, Empty, Row, Spin, Tag, Timeline } from 'antd';
import dayjs from 'dayjs';
import type { FC } from 'react';
import { useLeaveRequest } from '../hooks/useLeaveRequest';

interface LeaveRequestCardProps {
  requestId: string;
  showActions?: boolean;
  onApprove?: () => void;
  onReject?: () => void;
  onCancel?: () => void;
  loading?: boolean;
}

const statusConfig = {
  draft: { color: 'default', text: 'แบบร่าง' },
  pending: { color: 'warning', text: 'รออนุมัติ' },
  approved: { color: 'success', text: 'อนุมัติแล้ว' },
  rejected: { color: 'error', text: 'ปฏิเสธ' },
  cancelled: { color: 'default', text: 'ยกเลิกแล้ว' },
};

export const LeaveRequestCard: FC<LeaveRequestCardProps> = ({
  requestId,
  showActions = false,
  onApprove,
  onReject,
  onCancel,
  loading,
}) => {
  const { data: request, isLoading } = useLeaveRequest(requestId);

  if (isLoading) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin size="large" />
        </div>
      </Card>
    );
  }

  if (!request) {
    return (
      <Card>
        <Empty description="ไม่พบข้อมูลคำขอลา" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      </Card>
    );
  }

  const getApprovalIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'rejected':
        return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
      default:
        return <ClockCircleOutlined style={{ color: '#faad14' }} />;
    }
  };

  return (
    <Card
      title={
        <span>
          <FileTextOutlined style={{ marginRight: 8 }} />
          คำขอลา {request.requestNumber}
        </span>
      }
      extra={
        <Tag color={statusConfig[request.status].color}>{statusConfig[request.status].text}</Tag>
      }
    >
      <Descriptions column={2} bordered>
        <Descriptions.Item label="พนักงาน" span={2}>
          {request.employeeName} ({request.employeeCode})
        </Descriptions.Item>
        <Descriptions.Item label="แผนก">
          {request.departmentName || request.departmentId}
        </Descriptions.Item>
        <Descriptions.Item label="ตำแหน่ง">
          {request.positionName || request.positionId}
        </Descriptions.Item>
        <Descriptions.Item label="ประเภทการลา" span={2}>
          {request.leaveTypeName}
        </Descriptions.Item>
        <Descriptions.Item label="วันที่เริ่มลา">
          {dayjs(request.startDate).format('DD/MM/YYYY')}
        </Descriptions.Item>
        <Descriptions.Item label="วันที่สิ้นสุด">
          {dayjs(request.endDate).format('DD/MM/YYYY')}
        </Descriptions.Item>
        <Descriptions.Item label="จำนวนวัน">{request.totalDays} วัน</Descriptions.Item>
        <Descriptions.Item label="ลาครึ่งวัน">
          {request.isHalfDay ? `ใช่ (${request.halfDayPeriod === 'morning' ? 'เช้า' : 'บ่าย'})` : 'ไม่'}
        </Descriptions.Item>
        <Descriptions.Item label="เหตุผล" span={2}>
          {request.reason}
        </Descriptions.Item>
        {request.contactDuringLeave && (
          <Descriptions.Item label="ติดต่อระหว่างลา" span={2}>
            {request.contactDuringLeave}
          </Descriptions.Item>
        )}
        {request.workHandoverTo && (
          <Descriptions.Item label="มอบหมายงานให้" span={2}>
            {request.workHandoverTo}
            {request.workHandoverNotes && ` - ${request.workHandoverNotes}`}
          </Descriptions.Item>
        )}
        {request.hasCertificate && (
          <Descriptions.Item label="ใบรับรองแพทย์" span={2}>
            {request.certificateUrl ? (
              <a href={request.certificateUrl} target="_blank" rel="noopener noreferrer">
                {request.certificateFileName || 'ดูไฟล์'}
              </a>
            ) : (
              'มี'
            )}
          </Descriptions.Item>
        )}
        <Descriptions.Item label="วันที่ยื่นคำขอ" span={2}>
          {request.submittedAt ? dayjs(request.submittedAt).format('DD/MM/YYYY HH:mm') : '-'}
        </Descriptions.Item>
      </Descriptions>

      {/* Approval Workflow */}
      {request.approvalChain.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <h4>ขั้นตอนการอนุมัติ</h4>
          <Timeline>
            {request.approvalChain.map((step) => (
              <Timeline.Item key={step.level} dot={getApprovalIcon(step.status)}>
                <div>
                  <strong>
                    {step.approverName} ({step.approverRole})
                  </strong>
                  <div>
                    <Tag
                      color={
                        step.status === 'approved'
                          ? 'success'
                          : step.status === 'rejected'
                            ? 'error'
                            : 'warning'
                      }
                    >
                      {step.status === 'approved'
                        ? 'อนุมัติ'
                        : step.status === 'rejected'
                          ? 'ปฏิเสธ'
                          : 'รออนุมัติ'}
                    </Tag>
                    {step.actionAt && (
                      <span style={{ marginLeft: 8, color: '#8c8c8c' }}>
                        {dayjs(step.actionAt).format('DD/MM/YYYY HH:mm')}
                      </span>
                    )}
                  </div>
                  {step.comments && (
                    <div style={{ marginTop: 8, color: '#595959' }}>ความคิดเห็น: {step.comments}</div>
                  )}
                </div>
              </Timeline.Item>
            ))}
          </Timeline>
        </div>
      )}

      {/* Rejection/Cancellation Info */}
      {request.status === 'rejected' && request.rejectionReason && (
        <div style={{ marginTop: 24, padding: 16, background: '#fff1f0', borderRadius: 4 }}>
          <strong style={{ color: '#cf1322' }}>เหตุผลที่ปฏิเสธ:</strong>
          <div style={{ marginTop: 8 }}>{request.rejectionReason}</div>
          {request.rejectedAt && (
            <div style={{ marginTop: 8, color: '#8c8c8c', fontSize: 12 }}>
              ปฏิเสธเมื่อ: {dayjs(request.rejectedAt).format('DD/MM/YYYY HH:mm')}
            </div>
          )}
        </div>
      )}

      {request.status === 'cancelled' && request.cancellationReason && (
        <div style={{ marginTop: 24, padding: 16, background: '#fafafa', borderRadius: 4 }}>
          <strong>เหตุผลที่ยกเลิก:</strong>
          <div style={{ marginTop: 8 }}>{request.cancellationReason}</div>
          {request.cancelledAt && (
            <div style={{ marginTop: 8, color: '#8c8c8c', fontSize: 12 }}>
              ยกเลิกเมื่อ: {dayjs(request.cancelledAt).format('DD/MM/YYYY HH:mm')}
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      {showActions && (
        <Row gutter={8} style={{ marginTop: 24 }}>
          {request.status === 'pending' && onApprove && (
            <Col>
              <Button type="primary" onClick={onApprove} loading={loading ?? false}>
                อนุมัติ
              </Button>
            </Col>
          )}
          {request.status === 'pending' && onReject && (
            <Col>
              <Button danger onClick={onReject} loading={loading ?? false}>
                ปฏิเสธ
              </Button>
            </Col>
          )}
          {(request.status === 'pending' || request.status === 'approved') && onCancel && (
            <Col>
              <Button onClick={onCancel} loading={loading ?? false}>
                ยกเลิก
              </Button>
            </Col>
          )}
        </Row>
      )}
    </Card>
  );
};
