import { Col, Row, Space } from 'antd';
import { AttendanceHistoryTable } from '@/domains/people/features/attendance/components/AttendanceHistoryTable';
import { ClockInOutCard } from '@/domains/people/features/attendance/components/ClockInOutCard';
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
          <ClockInOutCard />
        </Col>
        <Col xs={24} md={16}>
          <AttendanceHistoryTable />
        </Col>
      </Row>
    </Space>
  );
};
