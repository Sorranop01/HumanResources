import { Col, Row, Space } from 'antd';
import { AttendanceHistoryTable } from '@/domains/people/features/attendance/components/AttendanceHistoryTable';
import { BreakManagementCard } from '@/domains/people/features/attendance/components/BreakManagementCard';
import { ClockInOutCard } from '@/domains/people/features/attendance/components/ClockInOutCard';
import { GeofenceCheck } from '@/domains/people/features/attendance/components/GeofenceCheck';
import { PageHeader } from '@/shared/ui/components/PageHeader';

export const AttendancePage = () => {
  return (
    <Space direction="vertical" size="large" style={{ display: 'flex' }}>
      <PageHeader
        title="Attendance"
        breadcrumbs={[{ label: 'Dashboard', path: '/' }, { label: 'Attendance' }]}
      />

      <Row gutter={[24, 24]}>
        <Col xs={24} md={8}>
          <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
            <GeofenceCheck showDetails autoCheck />
            <ClockInOutCard />
            <BreakManagementCard />
          </Space>
        </Col>
        <Col xs={24} md={16}>
          <AttendanceHistoryTable />
        </Col>
      </Row>
    </Space>
  );
};
