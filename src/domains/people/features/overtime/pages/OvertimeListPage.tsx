import { CalendarOutlined } from '@ant-design/icons';
import { Card, Modal, message, Space, Spin, Typography } from 'antd';
import type { FC } from 'react';
import { useMemo, useState } from 'react';

import { useAuth } from '@/shared/hooks/useAuth';
import { PageHeader } from '@/shared/ui/components/PageHeader';
import { formatDate } from '@/shared/lib/date';

import { OvertimeRequestTable } from '../components/OvertimeRequestTable';
import { OvertimeStats } from '../components/OvertimeStats';
import {
  useCancelOvertime,
  useMyOvertimeRequests,
  useOvertimeClockIn,
  useOvertimeClockOut,
} from '../hooks/useOvertime';
import type { OvertimeRequest } from '../types';

const { Paragraph } = Typography;

export const OvertimeListPage: FC = () => {
  const { employeeId } = useAuth();
  const { data: requests, isLoading } = useMyOvertimeRequests(employeeId ?? undefined);

  const cancelMutation = useCancelOvertime();
  const clockInMutation = useOvertimeClockIn();
  const clockOutMutation = useOvertimeClockOut();
  const [actionRequestId, setActionRequestId] = useState<string>();

  const dataSource = requests ?? [];

  const currentMonthLabel = useMemo(() => {
    const now = new Date();
    return now.toLocaleString('th-TH', { month: 'long', year: 'numeric' });
  }, []);

  const handleCancel = (request: OvertimeRequest) => {
    Modal.confirm({
      title: 'ยืนยันการยกเลิกคำขอ OT',
      content: `ต้องการยกเลิกคำขอ OT วันที่ ${formatDate(request.overtimeDate)} หรือไม่?`,
      okButtonProps: { danger: true },
      okText: 'ยกเลิกคำขอ',
      cancelText: 'กลับ',
      onOk: () => {
        setActionRequestId(request.id);
        cancelMutation.mutate(request.id, {
          onSettled: () => setActionRequestId(undefined),
        });
      },
    });
  };

  const handleClockIn = (request: OvertimeRequest) => {
    setActionRequestId(request.id);
    clockInMutation.mutate(request.id, {
      onSuccess: () => message.success('ลงเวลาเข้า OT เรียบร้อย'),
      onSettled: () => setActionRequestId(undefined),
    });
  };

  const handleClockOut = (request: OvertimeRequest) => {
    Modal.confirm({
      title: 'ลงเวลาออก OT',
      content: 'ยืนยันการลงเวลาออก OT หรือไม่?',
      okText: 'ลงเวลาออก',
      cancelText: 'กลับ',
      onOk: () => {
        setActionRequestId(request.id);
        clockOutMutation.mutate(
          { requestId: request.id },
          {
            onSuccess: () => message.success('ลงเวลาออก OT เรียบร้อย'),
            onSettled: () => setActionRequestId(undefined),
          }
        );
      },
    });
  };

  return (
    <div style={{ padding: 24 }}>
      <PageHeader
        title="คำขอ OT ของฉัน"
        breadcrumbs={[
          { label: 'การจัดการคน', path: '/people' },
          { label: 'OT', path: '/overtime' },
          { label: 'รายการของฉัน' },
        ]}
      />

      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Card>
          <Space align="start">
            <CalendarOutlined style={{ fontSize: 32, color: '#1890ff' }} />
            <div>
              <Paragraph strong style={{ marginBottom: 0 }}>
                ภาพรวมเดือน {currentMonthLabel}
              </Paragraph>
              <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                ตรวจสอบสถานะคำขอ OT, ลงเวลา และยกเลิก/แก้ไขได้จากหน้านี้
              </Paragraph>
            </div>
          </Space>
        </Card>

        <OvertimeStats requests={dataSource} periodLabel={currentMonthLabel} />

        <Card title="รายการคำขอ OT">
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <Spin />
            </div>
          ) : (
            <OvertimeRequestTable
              data={dataSource}
              onCancel={handleCancel}
              onClockIn={handleClockIn}
              onClockOut={handleClockOut}
              actionLoadingId={actionRequestId}
            />
          )}
        </Card>
      </Space>
    </div>
  );
};
