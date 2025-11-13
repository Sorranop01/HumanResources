import { BarChartOutlined } from '@ant-design/icons';
import { Card, Col, DatePicker, Row, Select, Space, Spin } from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import type { FC } from 'react';
import { useMemo, useState } from 'react';
import { PageHeader } from '@/shared/ui/components/PageHeader';
import { OvertimeCalendar } from '../components/OvertimeCalendar';
import { OvertimeRequestTable } from '../components/OvertimeRequestTable';
import { OvertimeStats } from '../components/OvertimeStats';
import { useOvertimeList } from '../hooks/useOvertime';
import type { OvertimeFilters } from '../schemas';
import type { OvertimeRequestStatus, OvertimeType } from '../types';

const { RangePicker } = DatePicker;

export const OvertimeDashboardPage: FC = () => {
  const [filters, setFilters] = useState<OvertimeFilters>({});
  const filtersForQuery = Object.keys(filters).length > 0 ? filters : undefined;
  const { data: requests, isLoading } = useOvertimeList(filtersForQuery);

  const updateFilter = <K extends keyof OvertimeFilters>(
    key: K,
    value: OvertimeFilters[K] | undefined | null
  ) => {
    setFilters((prev) => {
      const next = { ...prev };
      if (value === undefined || value === null || value === '') {
        delete next[key];
      } else {
        next[key] = value;
      }
      return next;
    });
  };

  const handleStatusChange = (value: OvertimeRequestStatus | null) => {
    updateFilter('status', value ?? undefined);
  };

  const handleTypeChange = (value: OvertimeType | null) => {
    updateFilter('overtimeType', value ?? undefined);
  };

  const handleDateChange = (dates: null | [Dayjs | null, Dayjs | null]) => {
    if (!dates || !dates[0] || !dates[1]) {
      updateFilter('startDate', undefined);
      updateFilter('endDate', undefined);
      return;
    }

    updateFilter('startDate', dates[0]?.format('YYYY-MM-DD'));
    updateFilter('endDate', dates[1]?.format('YYYY-MM-DD'));
  };

  const periodLabel = useMemo(() => {
    if (!filters?.startDate || !filters?.endDate) {
      return dayjs().format('MMMM YYYY');
    }

    return `${dayjs(filters.startDate).format('DD MMM YYYY')} - ${dayjs(filters.endDate).format('DD MMM YYYY')}`;
  }, [filters]);

  return (
    <div style={{ padding: 24 }}>
      <PageHeader
        title="แดชบอร์ด OT"
        breadcrumbs={[
          { label: 'การจัดการคน', path: '/people' },
          { label: 'OT', path: '/overtime' },
          { label: 'แดชบอร์ด' },
        ]}
      />

      <Card style={{ marginBottom: 24 }}>
        <Space align="center" size="large" wrap>
          <BarChartOutlined style={{ fontSize: 36, color: '#722ed1' }} />
          <Space>
            <Select
              allowClear
              placeholder="สถานะ"
              style={{ width: 160 }}
              onChange={(value) => handleStatusChange((value as OvertimeRequestStatus) ?? null)}
              options={[
                { label: 'รออนุมัติ', value: 'pending' },
                { label: 'อนุมัติแล้ว', value: 'approved' },
                { label: 'ปฏิเสธ', value: 'rejected' },
                { label: 'ยกเลิก', value: 'cancelled' },
                { label: 'เสร็จสิ้น', value: 'completed' },
              ]}
            />
            <Select
              allowClear
              placeholder="ประเภท OT"
              style={{ width: 180 }}
              onChange={(value) => handleTypeChange((value as OvertimeType) ?? null)}
              options={[
                { label: 'วันทำงาน', value: 'weekday' },
                { label: 'วันหยุด', value: 'weekend' },
                { label: 'วันนักขัตฤกษ์', value: 'holiday' },
                { label: 'ฉุกเฉิน', value: 'emergency' },
              ]}
            />
            <RangePicker onChange={handleDateChange} />
          </Space>
        </Space>
      </Card>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <Spin size="large" />
        </div>
      ) : (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <OvertimeStats requests={requests ?? []} periodLabel={periodLabel} />
          <Row gutter={24}>
            <Col span={24} lg={12}>
              <OvertimeCalendar requests={requests ?? []} />
            </Col>
            <Col span={24} lg={12}>
              <Card title="คำขอล่าสุด">
                <OvertimeRequestTable data={requests?.slice(0, 10) ?? []} pagination={false} />
              </Card>
            </Col>
          </Row>
        </Space>
      )}
    </div>
  );
};
