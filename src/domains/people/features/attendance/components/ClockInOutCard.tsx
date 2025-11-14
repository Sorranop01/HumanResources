import { CheckCircleOutlined, ClockCircleOutlined, WarningOutlined } from '@ant-design/icons';
import { Button, Card, Flex, Spin, Statistic, Tag, Typography } from 'antd';
import dayjs from 'dayjs';
import type { Timestamp } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useClockIn } from '@/domains/people/features/attendance/hooks/useClockIn';
import { useClockOut } from '@/domains/people/features/attendance/hooks/useClockOut';
import { useTodayAttendance } from '@/domains/people/features/attendance/hooks/useTodayAttendance';
import { formatMinutesToDuration } from '@/domains/people/features/attendance/utils/timeCalculations';

const { Title, Text } = Typography;

/**
 * Convert Firestore Timestamp or Date to Date
 */
function toDate(value: Date | Timestamp): Date {
  if (value instanceof Date) {
    return value;
  }
  return value.toDate();
}

export const ClockInOutCard = () => {
  const [currentTime, setCurrentTime] = useState(dayjs());

  const { data: attendanceRecord, isLoading: isLoadingAttendance, isError } = useTodayAttendance();
  const { mutate: clockIn, isPending: isClockingIn } = useClockIn();
  const { mutate: clockOut, isPending: isClockingOut } = useClockOut();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(dayjs());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleClockIn = () => {
    clockIn({});
  };

  const handleClockOut = () => {
    if (attendanceRecord) {
      clockOut({
        recordId: attendanceRecord.id,
        clockInTime: attendanceRecord.clockInTime,
        scheduledEndTime: attendanceRecord.scheduledEndTime || '18:00',
      });
    }
  };

  const renderStatus = () => {
    if (isLoadingAttendance) {
      return (
        <Spin tip="Loading status...">
          <div style={{ minHeight: 50 }} />
        </Spin>
      );
    }

    if (isError) {
      return <Text type="danger">Could not load attendance status.</Text>;
    }

    if (attendanceRecord?.status === 'clocked-in') {
      const clockInTime = dayjs(toDate(attendanceRecord.clockInTime));
      const scheduledStart = attendanceRecord.scheduledStartTime || '09:00';

      return (
        <Flex vertical align="center" gap="middle">
          <Flex gap="small" align="center">
            <Text type="secondary">You clocked in at</Text>
            {attendanceRecord.isLate && (
              <Tag color="error" icon={<WarningOutlined />}>
                สาย {formatMinutesToDuration(attendanceRecord.minutesLate)}
              </Tag>
            )}
            {!attendanceRecord.isLate && attendanceRecord.minutesLate === 0 && (
              <Tag color="success" icon={<CheckCircleOutlined />}>
                ตรงเวลา
              </Tag>
            )}
          </Flex>
          <Title level={3} className="!m-0">
            {clockInTime.format('HH:mm:ss')}
          </Title>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            กำหนดเข้างาน: {scheduledStart}
          </Text>
          <Button
            type="primary"
            danger
            size="large"
            onClick={handleClockOut}
            loading={isClockingOut}
            disabled={isClockingIn}
            icon={<ClockCircleOutlined />}
          >
            Clock Out
          </Button>
        </Flex>
      );
    }

    if (attendanceRecord?.status === 'clocked-out') {
      const clockInTime = dayjs(toDate(attendanceRecord.clockInTime));
      const clockOutTime = attendanceRecord.clockOutTime
        ? dayjs(toDate(attendanceRecord.clockOutTime))
        : null;

      return (
        <Flex vertical align="center" gap="middle">
          <Text type="success">You have clocked out for today.</Text>
          <Flex gap="small" wrap="wrap" justify="center">
            {attendanceRecord.isLate && (
              <Tag color="error" icon={<WarningOutlined />}>
                เข้างานสาย {formatMinutesToDuration(attendanceRecord.minutesLate)}
              </Tag>
            )}
            {!attendanceRecord.isLate && attendanceRecord.minutesLate === 0 && (
              <Tag color="success" icon={<CheckCircleOutlined />}>
                เข้างานตรงเวลา
              </Tag>
            )}
            {attendanceRecord.isEarlyLeave && (
              <Tag color="warning" icon={<WarningOutlined />}>
                ออกก่อนเวลา {formatMinutesToDuration(attendanceRecord.minutesEarly)}
              </Tag>
            )}
            {!attendanceRecord.isEarlyLeave && attendanceRecord.minutesEarly === 0 && (
              <Tag color="success" icon={<CheckCircleOutlined />}>
                ออกตรงเวลา
              </Tag>
            )}
          </Flex>
          <Flex vertical align="center" gap="small">
            <Text type="secondary">
              เข้างาน: {clockInTime.format('HH:mm')} | ออกงาน: {clockOutTime?.format('HH:mm') ?? '-'}
            </Text>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              รวมทำงาน: {attendanceRecord.durationHours?.toFixed(2)} ชั่วโมง
            </Text>
          </Flex>
        </Flex>
      );
    }

    return (
      <Flex vertical align="center" gap="middle">
        <Text type="secondary">You haven't clocked in yet today.</Text>
        <Button
          type="primary"
          size="large"
          onClick={handleClockIn}
          loading={isClockingIn}
          disabled={isClockingOut}
        >
          Clock In
        </Button>
      </Flex>
    );
  };

  return (
    <Card>
      <Flex vertical align="center" gap="large">
        <Statistic title="Current Time" value={currentTime.format('HH:mm:ss')} />
        <div className="w-full h-[1px] bg-gray-200" />
        {renderStatus()}
      </Flex>
    </Card>
  );
};
