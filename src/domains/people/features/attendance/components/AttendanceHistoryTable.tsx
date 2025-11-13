import { CheckCircleOutlined, ClockCircleOutlined, WarningOutlined } from '@ant-design/icons';
import { Card, Flex, Space, Table, Tag, Tooltip, Typography } from 'antd';
import dayjs from 'dayjs';
import { useAttendanceHistory } from '@/domains/people/features/attendance/hooks/useAttendanceHistory';
import type { AttendanceRecord } from '@/domains/people/features/attendance/types';
import { formatMinutesToDuration } from '@/domains/people/features/attendance/utils/timeCalculations';

const { Text } = Typography;

const columns = [
  {
    title: 'วันที่',
    dataIndex: 'date',
    key: 'date',
    render: (date: string) => dayjs(date).format('DD MMM YYYY'),
  },
  {
    title: 'เข้างาน',
    dataIndex: 'clockInTime',
    key: 'clockInTime',
    render: (time: AttendanceRecord['clockInTime'], record: AttendanceRecord) => {
      if (!time) return '-';

      return (
        <Flex vertical gap={4}>
          <Text strong>{dayjs(time.toDate()).format('HH:mm:ss')}</Text>
          {record.scheduledStartTime && (
            <Text type="secondary" style={{ fontSize: '11px' }}>
              กำหนด: {record.scheduledStartTime}
            </Text>
          )}
        </Flex>
      );
    },
  },
  {
    title: 'ออกงาน',
    dataIndex: 'clockOutTime',
    key: 'clockOutTime',
    render: (time: AttendanceRecord['clockOutTime'], record: AttendanceRecord) => {
      if (!time) {
        return <Text type="secondary">ยังไม่ได้ออกงาน</Text>;
      }

      return (
        <Flex vertical gap={4}>
          <Text strong>{dayjs(time.toDate()).format('HH:mm:ss')}</Text>
          {record.scheduledEndTime && (
            <Text type="secondary" style={{ fontSize: '11px' }}>
              กำหนด: {record.scheduledEndTime}
            </Text>
          )}
        </Flex>
      );
    },
  },
  {
    title: 'ชั่วโมง',
    dataIndex: 'durationHours',
    key: 'durationHours',
    align: 'center' as const,
    render: (duration: number | null) =>
      duration !== null ? <Text strong>{duration.toFixed(2)}</Text> : '-',
  },
  {
    title: 'สถานะ',
    key: 'status',
    render: (_: unknown, record: AttendanceRecord) => (
      <Space direction="vertical" size="small">
        {/* Main Status */}
        <Tag
          color={record.status === 'clocked-in' ? 'processing' : 'success'}
          icon={<ClockCircleOutlined />}
        >
          {record.status === 'clocked-in' ? 'กำลังทำงาน' : 'เสร็จสิ้น'}
        </Tag>

        {/* Late Status */}
        {record.isLate && !record.isExcusedLate && (
          <Tooltip title={`สาย ${formatMinutesToDuration(record.minutesLate)}`}>
            <Tag color="error" icon={<WarningOutlined />}>
              สาย {record.minutesLate} นาที
            </Tag>
          </Tooltip>
        )}

        {/* On Time */}
        {!record.isLate && record.minutesLate === 0 && record.status === 'clocked-out' && (
          <Tag color="success" icon={<CheckCircleOutlined />}>
            ตรงเวลา
          </Tag>
        )}

        {/* Early Leave */}
        {record.isEarlyLeave && !record.isApprovedEarlyLeave && (
          <Tooltip title={`ออกก่อนเวลา ${formatMinutesToDuration(record.minutesEarly)}`}>
            <Tag color="warning" icon={<WarningOutlined />}>
              ออกเร็ว {record.minutesEarly} นาที
            </Tag>
          </Tooltip>
        )}

        {/* Approved Early Leave */}
        {record.isApprovedEarlyLeave && <Tag color="blue">อนุมัติออกก่อนเวลา</Tag>}

        {/* Excused Late */}
        {record.isExcusedLate && <Tag color="blue">อนุมัติสาย</Tag>}
      </Space>
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
