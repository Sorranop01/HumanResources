/**
 * Overtime Request Card
 * Responsive card view for OT requests with contextual actions
 */

import {
  CalendarOutlined,
  ClockCircleOutlined,
  FieldTimeOutlined,
  FireOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { Button, Card, Col, Flex, Row, Space, Tag, Typography } from 'antd';
import dayjs from 'dayjs';
import type { FC, ReactNode } from 'react';
import { OvertimeStatusBadge } from '@/domains/people/features/overtime/components/OvertimeStatusBadge';
import type { OvertimeRequest } from '@/domains/people/features/overtime/types';

const { Text } = Typography;

type RequestActionHandler = (request: OvertimeRequest) => void;

interface OvertimeRequestCardProps {
  request: OvertimeRequest;
  onApprove?: RequestActionHandler;
  onReject?: RequestActionHandler;
  onCancel?: RequestActionHandler;
  onClockIn?: RequestActionHandler;
  onClockOut?: RequestActionHandler;
  extraActions?: ReactNode;
  actionLoading?: boolean;
  compact?: boolean;
}

export const OvertimeRequestCard: FC<OvertimeRequestCardProps> = ({
  request,
  onApprove,
  onReject,
  onCancel,
  onClockIn,
  onClockOut,
  extraActions,
  actionLoading,
  compact = false,
}) => {
  const isPending = request.status === 'pending';
  const isApproved = request.status === 'approved';
  const isClockedIn = request.clockStatus === 'clocked-in';
  const isCompleted = request.status === 'completed';

  const renderActions = () => {
    if (extraActions) {
      return extraActions;
    }

    return (
      <Space wrap>
        {onApprove && isPending && (
          <Button type="primary" onClick={() => onApprove(request)} loading={!!actionLoading}>
            อนุมัติ
          </Button>
        )}
        {onReject && isPending && (
          <Button danger onClick={() => onReject(request)} loading={!!actionLoading}>
            ปฏิเสธ
          </Button>
        )}
        {onCancel && !isCompleted && (
          <Button onClick={() => onCancel(request)} loading={!!actionLoading}>
            ยกเลิก
          </Button>
        )}
        {onClockIn && isApproved && request.clockStatus === 'not-started' && (
          <Button type="dashed" onClick={() => onClockIn(request)} loading={!!actionLoading}>
            ลงเวลาเข้า
          </Button>
        )}
        {onClockOut && isClockedIn && (
          <Button type="dashed" onClick={() => onClockOut(request)} loading={!!actionLoading}>
            ลงเวลาออก
          </Button>
        )}
      </Space>
    );
  };

  return (
    <Card
      title={
        <Flex justify="space-between" align="center">
          <Space>
            <OvertimeStatusBadge
              status={request.status}
              clockStatus={request.clockStatus}
              showClockStatus
            />
            <Tag color="blue" icon={<CalendarOutlined />}>
              {dayjs(request.overtimeDate).format('DD MMM YYYY')}
            </Tag>
          </Space>
          <Tag color="purple" icon={<FieldTimeOutlined />}>
            {request.plannedStartTime} - {request.plannedEndTime}
          </Tag>
        </Flex>
      }
      extra={
        <Tag icon={<ClockCircleOutlined />} color="magenta">
          {request.plannedHours.toFixed(1)} ชั่วโมง
        </Tag>
      }
      styles={{ body: { padding: compact ? 16 : 24 } }}
    >
      <Row gutter={16}>
        <Col span={compact ? 24 : 12}>
          <Space direction="vertical" size="small">
            <Text strong>พนักงาน</Text>
            <Space>
              <Tag icon={<TeamOutlined />} color="cyan">
                {request.employeeName}
              </Tag>
              <Tag>{request.departmentName}</Tag>
              <Tag color="blue">{request.positionName}</Tag>
            </Space>

            <Text strong>รายละเอียดงาน</Text>
            <Text type="secondary">{request.taskDescription}</Text>

            <Text strong>เหตุผล</Text>
            <Text>{request.reason}</Text>
          </Space>
        </Col>

        <Col span={compact ? 24 : 12}>
          <Space direction="vertical" size="small">
            <Text strong>ข้อมูลเพิ่มเติม</Text>
            <Space wrap>
              <Tag color="geekblue">{request.overtimeType.toUpperCase()}</Tag>
              <Tag color="orange">อัตรา x{request.overtimeRate}</Tag>
              <Tag color={request.isEmergency ? 'red' : 'default'} icon={<FireOutlined />}>
                {request.isEmergency ? 'ฉุกเฉิน' : 'ปกติ'}
              </Tag>
              <Tag color="purple">{request.urgencyLevel.toUpperCase()}</Tag>
            </Space>
            {request.attachmentUrl && (
              <a href={request.attachmentUrl} target="_blank" rel="noreferrer">
                ดูไฟล์แนบ
              </a>
            )}
            {request.notes && (
              <>
                <Text strong>หมายเหตุ</Text>
                <Text type="secondary">{request.notes}</Text>
              </>
            )}
          </Space>
        </Col>
      </Row>

      <div style={{ marginTop: compact ? 16 : 24, display: 'flex', justifyContent: 'flex-end' }}>
        {renderActions()}
      </div>
    </Card>
  );
};
