/**
 * Overtime Status Badge
 * Visual indicator for OT request + clock statuses
 */

import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  PauseCircleOutlined,
  StopOutlined,
} from '@ant-design/icons';
import { Tag, Tooltip } from 'antd';
import type { FC } from 'react';
import type {
  OvertimeClockStatus,
  OvertimeRequestStatus,
} from '@/domains/people/features/overtime/types';

type StatusConfig = {
  label: string;
  color: string;
  icon: JSX.Element;
  description?: string;
};

const requestStatusConfig: Record<OvertimeRequestStatus, StatusConfig> = {
  pending: {
    label: 'รออนุมัติ',
    color: 'gold',
    icon: <ClockCircleOutlined />,
  },
  approved: {
    label: 'อนุมัติแล้ว',
    color: 'green',
    icon: <CheckCircleOutlined />,
  },
  rejected: {
    label: 'ปฏิเสธ',
    color: 'red',
    icon: <CloseCircleOutlined />,
  },
  cancelled: {
    label: 'ยกเลิก',
    color: 'default',
    icon: <StopOutlined />,
  },
  completed: {
    label: 'เสร็จสิ้น',
    color: 'blue',
    icon: <CheckCircleOutlined />,
  },
};

const clockStatusConfig: Record<OvertimeClockStatus, StatusConfig> = {
  'not-started': {
    label: 'ยังไม่เริ่ม',
    color: 'default',
    icon: <PauseCircleOutlined />,
  },
  'clocked-in': {
    label: 'กำลังทำ OT',
    color: 'processing',
    icon: <ClockCircleOutlined />,
  },
  'clocked-out': {
    label: 'รอยืนยัน',
    color: 'purple',
    icon: <ExclamationCircleOutlined />,
  },
  completed: {
    label: 'ลงเวลาครบ',
    color: 'success',
    icon: <CheckCircleOutlined />,
  },
};

interface OvertimeStatusBadgeProps {
  status: OvertimeRequestStatus;
  clockStatus?: OvertimeClockStatus;
  showClockStatus?: boolean;
}

export const OvertimeStatusBadge: FC<OvertimeStatusBadgeProps> = ({
  status,
  clockStatus,
  showClockStatus = false,
}) => {
  const statusMeta = requestStatusConfig[status];
  const clockMeta = clockStatus ? clockStatusConfig[clockStatus] : undefined;

  const badge = (
    <Tag color={statusMeta.color} icon={statusMeta.icon}>
      {statusMeta.label}
    </Tag>
  );

  if (!showClockStatus || !clockMeta) {
    return badge;
  }

  return (
    <Tooltip
      title={
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span>
            สถานะคำขอ: <strong>{statusMeta.label}</strong>
          </span>
          <span>
            สถานะลงเวลา: <strong>{clockMeta.label}</strong>
          </span>
        </div>
      }
    >
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
        {badge}
        <Tag color={clockMeta.color} icon={clockMeta.icon}>
          {clockMeta.label}
        </Tag>
      </span>
    </Tooltip>
  );
};
