import { Button, Card, Flex, Spin, Statistic, Typography } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useClockIn } from '@/domains/people/features/attendance/hooks/useClockIn';
import { useClockOut } from '@/domains/people/features/attendance/hooks/useClockOut';
import { useTodayAttendance } from '@/domains/people/features/attendance/hooks/useTodayAttendance';

const { Title, Text } = Typography;

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
    clockIn();
  };

  const handleClockOut = () => {
    if (attendanceRecord) {
      clockOut({
        recordId: attendanceRecord.id,
        clockInTime: attendanceRecord.clockInTime,
      });
    }
  };

  const renderStatus = () => {
    if (isLoadingAttendance) {
      return <Spin tip="Loading status..." />;
    }

    if (isError) {
      return <Text type="danger">Could not load attendance status.</Text>;
    }

    if (attendanceRecord?.status === 'clocked-in') {
      return (
        <Flex vertical align="center" gap="middle">
          <Text type="secondary">You clocked in at</Text>
          <Title level={3} className="!m-0">
            {dayjs(attendanceRecord.clockInTime.toDate()).format('HH:mm:ss')}
          </Title>
          <Button
            type="primary"
            danger
            size="large"
            onClick={handleClockOut}
            loading={isClockingOut}
            disabled={isClockingIn}
          >
            Clock Out
          </Button>
        </Flex>
      );
    }

    if (attendanceRecord?.status === 'clocked-out') {
      return (
        <Flex vertical align="center" gap="middle">
          <Text type="success">You have clocked out for today.</Text>
          <Text type="secondary">
            Clocked in at {dayjs(attendanceRecord.clockInTime.toDate()).format('HH:mm')}, Clocked
            out at {dayjs(attendanceRecord.clockOutTime?.toDate()).format('HH:mm')}
          </Text>
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
