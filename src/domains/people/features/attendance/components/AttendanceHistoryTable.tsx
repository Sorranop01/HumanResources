import { Card, Table, Tag, Typography } from 'antd';
import dayjs from 'dayjs';
import { useAttendanceHistory } from '@/domains/people/features/attendance/hooks/useAttendanceHistory';
import type { AttendanceRecord } from '@/domains/people/features/attendance/types';

const { Text } = Typography;

const columns = [
  {
    title: 'Date',
    dataIndex: 'date',
    key: 'date',
    render: (date: string) => dayjs(date).format('DD MMM YYYY'),
  },
  {
    title: 'Clock In',
    dataIndex: 'clockInTime',
    key: 'clockInTime',
    render: (time: AttendanceRecord['clockInTime']) =>
      time ? dayjs(time.toDate()).format('HH:mm:ss') : '-',
  },
  {
    title: 'Clock Out',
    dataIndex: 'clockOutTime',
    key: 'clockOutTime',
    render: (time: AttendanceRecord['clockOutTime']) =>
      time ? (
        dayjs(time.toDate()).format('HH:mm:ss')
      ) : (
        <Text type="secondary">Not clocked out</Text>
      ),
  },
  {
    title: 'Duration (Hours)',
    dataIndex: 'durationHours',
    key: 'durationHours',
    render: (duration: number | null) => (duration !== null ? duration.toFixed(2) : '-'),
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    render: (status: AttendanceRecord['status']) => (
      <Tag color={status === 'clocked-in' ? 'processing' : 'success'}>
        {status === 'clocked-in' ? 'Clocked In' : 'Clocked Out'}
      </Tag>
    ),
  },
];

export const AttendanceHistoryTable = () => {
  const { data: history, isLoading, isError } = useAttendanceHistory();

  if (isError) {
    return (
      <Card>
        <Text type="danger">Could not load attendance history.</Text>
      </Card>
    );
  }

  return (
    <Card title="Attendance History">
      <Table
        dataSource={history}
        columns={columns}
        loading={isLoading}
        rowKey="id"
        pagination={{ pageSize: 7 }}
      />
    </Card>
  );
};
