import { ClockCircleOutlined, CoffeeOutlined } from '@ant-design/icons';
import { Button, Card, Flex, Select, Space, Tag, Typography } from 'antd';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { useEffect, useState } from 'react';
import { useCurrentBreak, useEndBreak, useStartBreak } from '../hooks/useBreakManagement';
import { useTodayAttendance } from '../hooks/useTodayAttendance';

dayjs.extend(duration);

const { Text } = Typography;

const breakTypeOptions = [
  { label: 'พักกลางวัน (Lunch)', value: 'lunch' },
  { label: 'พักเบรก (Rest)', value: 'rest' },
  { label: 'สวดมนต์ (Prayer)', value: 'prayer' },
  { label: 'อื่นๆ (Other)', value: 'other' },
];

export const BreakManagementCard = () => {
  const { data: attendanceRecord } = useTodayAttendance();
  const { data: currentBreak, isLoading: isLoadingBreak } = useCurrentBreak(
    attendanceRecord?.id || null
  );
  const { mutate: startBreak, isPending: isStartingBreak } = useStartBreak();
  const { mutate: endBreak, isPending: isEndingBreak } = useEndBreak();

  const [selectedBreakType, setSelectedBreakType] = useState<string>('lunch');
  const [breakDuration, setBreakDuration] = useState<string>('00:00:00');

  // Update break duration every second
  useEffect(() => {
    if (!currentBreak?.startTime) {
      setBreakDuration('00:00:00');
      return;
    }

    const interval = setInterval(() => {
      const start = dayjs(currentBreak.startTime.toDate());
      const now = dayjs();
      const diff = now.diff(start);
      const dur = dayjs.duration(diff);
      setBreakDuration(
        `${String(Math.floor(dur.asHours())).padStart(2, '0')}:${String(dur.minutes()).padStart(2, '0')}:${String(dur.seconds()).padStart(2, '0')}`
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [currentBreak]);

  const handleStartBreak = () => {
    if (!attendanceRecord?.id) return;

    startBreak({
      recordId: attendanceRecord.id,
      breakType: selectedBreakType as 'lunch' | 'rest' | 'prayer' | 'other',
    });
  };

  const handleEndBreak = () => {
    if (!attendanceRecord?.id || !currentBreak?.id) return;

    endBreak({
      recordId: attendanceRecord.id,
      breakId: currentBreak.id,
    });
  };

  // Don't show if not clocked in
  if (!attendanceRecord || attendanceRecord.status !== 'clocked-in') {
    return null;
  }

  // Show active break status
  if (currentBreak) {
    const breakTypeLabel =
      breakTypeOptions.find((opt) => opt.value === currentBreak.breakType)?.label || 'Unknown';

    return (
      <Card>
        <Flex vertical align="center" gap="middle">
          <Tag color="processing" icon={<CoffeeOutlined />}>
            กำลังพัก - {breakTypeLabel}
          </Tag>
          <Text type="secondary">ระยะเวลาพัก</Text>
          <Text strong style={{ fontSize: '24px' }}>
            {breakDuration}
          </Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            เริ่มพักเมื่อ: {dayjs(currentBreak.startTime.toDate()).format('HH:mm:ss')}
          </Text>
          <Button
            type="primary"
            size="large"
            onClick={handleEndBreak}
            loading={isEndingBreak}
            icon={<ClockCircleOutlined />}
          >
            สิ้นสุดการพัก
          </Button>
        </Flex>
      </Card>
    );
  }

  // Show break start UI
  return (
    <Card>
      <Flex vertical align="center" gap="middle">
        <Space direction="vertical" align="center">
          <Text type="secondary">จัดการเวลาพัก</Text>
          <Select
            style={{ width: 200 }}
            value={selectedBreakType}
            onChange={setSelectedBreakType}
            options={breakTypeOptions}
            disabled={isStartingBreak || isLoadingBreak}
          />
        </Space>
        <Button
          type="default"
          size="large"
          onClick={handleStartBreak}
          loading={isStartingBreak}
          disabled={isLoadingBreak}
          icon={<CoffeeOutlined />}
        >
          เริ่มพัก
        </Button>
        {attendanceRecord.breaks && attendanceRecord.breaks.length > 0 && (
          <Flex vertical gap="small" style={{ width: '100%', marginTop: '16px' }}>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              พักไปแล้ววันนี้:
            </Text>
            {attendanceRecord.breaks.map((b) => (
              <Flex
                key={`${attendanceRecord.id}-${b.startTime.toMillis()}`}
                justify="space-between"
                style={{ fontSize: '12px' }}
              >
                <Text type="secondary">
                  {breakTypeOptions.find((opt) => opt.value === b.breakType)?.label || 'Unknown'}
                </Text>
                <Text type="secondary">{b.duration ? `${b.duration} นาที` : 'กำลังพัก...'}</Text>
              </Flex>
            ))}
            <Flex justify="space-between" style={{ fontWeight: 'bold', marginTop: '8px' }}>
              <Text>รวมเวลาพัก:</Text>
              <Text>{attendanceRecord.totalBreakMinutes || 0} นาที</Text>
            </Flex>
          </Flex>
        )}
      </Flex>
    </Card>
  );
};
