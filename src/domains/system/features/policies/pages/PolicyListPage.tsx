/**
 * Policy List Page
 * Main page for managing all policies (Work Schedule, Overtime, Shifts, Penalties, Holidays)
 */

import {
  CalendarOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  ScheduleOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { Card, Tabs } from 'antd';
import type { FC } from 'react';
import { HolidayCalendarTable } from '../components/HolidayCalendarTable';
import { OvertimePolicyTable } from '../components/OvertimePolicyTable';
import { PenaltyPolicyTable } from '../components/PenaltyPolicyTable';
import { ShiftManagementTable } from '../components/ShiftManagementTable';
import { WorkSchedulePolicyTable } from '../components/WorkSchedulePolicyTable';

export const PolicyListPage: FC = () => {
  const tabItems = [
    {
      key: 'workSchedule',
      label: (
        <span>
          <ClockCircleOutlined />
          ตารางเวลาทำงาน
        </span>
      ),
      children: <WorkSchedulePolicyTable />,
    },
    {
      key: 'overtime',
      label: (
        <span>
          <DollarOutlined />
          OT Policy
        </span>
      ),
      children: <OvertimePolicyTable />,
    },
    {
      key: 'shifts',
      label: (
        <span>
          <ScheduleOutlined />
          กะทำงาน
        </span>
      ),
      children: <ShiftManagementTable />,
    },
    {
      key: 'penalties',
      label: (
        <span>
          <WarningOutlined />
          กฎการปรับ
        </span>
      ),
      children: <PenaltyPolicyTable />,
    },
    {
      key: 'holidays',
      label: (
        <span>
          <CalendarOutlined />
          วันหยุด
        </span>
      ),
      children: <HolidayCalendarTable />,
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card
        title={
          <div style={{ fontSize: '20px', fontWeight: 600 }}>
            <ScheduleOutlined style={{ marginRight: '8px' }} />
            จัดการนโยบาย (Policy Management)
          </div>
        }
      >
        <Tabs items={tabItems} />
      </Card>
    </div>
  );
};
