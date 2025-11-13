/**
 * Overtime Stats
 * Display high-level KPIs for overtime requests
 */

import { Card, Col, Progress, Row, Statistic } from 'antd';
import dayjs from 'dayjs';
import type { FC } from 'react';
import { useMemo } from 'react';
import type {
  EmployeeOvertimeSummary,
  OvertimeRequest,
} from '@/domains/people/features/overtime/types';

interface OvertimeStatsProps {
  requests?: OvertimeRequest[];
  summary?: EmployeeOvertimeSummary;
  loading?: boolean;
  periodLabel?: string;
}

export const OvertimeStats: FC<OvertimeStatsProps> = ({
  requests,
  summary,
  loading,
  periodLabel,
}) => {
  const computed = useMemo(() => {
    if (summary) {
      return {
        totalRequests: summary.totalOTRequests,
        totalHours: summary.totalOTHours,
        approved: summary.approvedRequests,
        rejected: summary.rejectedRequests,
        completed: summary.totalOTHours,
        byType: summary.byType,
      };
    }

    const base = {
      totalRequests: 0,
      totalHours: 0,
      approved: 0,
      rejected: 0,
      completed: 0,
      byType: {
        weekday: 0,
        weekend: 0,
        holiday: 0,
        emergency: 0,
      },
    };

    if (!requests) {
      return base;
    }

    for (const request of requests) {
      base.totalRequests += 1;
      base.totalHours += request.actualHours ?? request.plannedHours;
      if (request.status === 'approved') {
        base.approved += 1;
      }
      if (request.status === 'rejected') {
        base.rejected += 1;
      }
      if (request.status === 'completed') {
        base.completed += request.actualHours ?? request.plannedHours;
      }

      base.byType[request.overtimeType] += 1;
    }

    return base;
  }, [requests, summary]);

  const approvalRate =
    computed.totalRequests > 0 ? Math.round((computed.approved / computed.totalRequests) * 100) : 0;

  const fulfillmentRate =
    computed.totalHours > 0 ? Math.round((computed.completed / computed.totalHours) * 100) : 0;

  const metrics = [
    {
      title: 'คำขอทั้งหมด',
      value: computed.totalRequests,
      suffix: 'รายการ',
    },
    {
      title: 'ชั่วโมง OT รวม',
      value: computed.totalHours.toFixed(1),
      suffix: 'ชั่วโมง',
    },
    {
      title: 'อัตราการอนุมัติ',
      value: `${approvalRate}%`,
    },
    {
      title: 'ชั่วโมงที่ทำสำเร็จ',
      value: computed.completed.toFixed(1),
      suffix: 'ชั่วโมง',
    },
  ];

  return (
    <Card title={`สรุป OT${periodLabel ? ` (${periodLabel})` : ''}`} loading={!!loading}>
      <Row gutter={[16, 16]}>
        {metrics.map((metric) => (
          <Col span={12} md={6} key={metric.title}>
            <Card size="small">
              <Statistic title={metric.title} value={metric.value} suffix={metric.suffix} />
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col span={12}>
          <Card size="small" title="อัตราการอนุมัติ">
            <Progress type="dashboard" percent={approvalRate} format={(value) => `${value}%`} />
          </Card>
        </Col>
        <Col span={12}>
          <Card size="small" title="ชั่วโมงทำจริงเทียบแผน">
            <Progress
              percent={fulfillmentRate}
              status="active"
              format={(value) => `${value}%`}
              strokeColor={{ from: '#108ee9', to: '#87d068' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginTop: 16 }}>
        {Object.entries(computed.byType).map(([type, count]) => (
          <Col span={12} md={6} key={type}>
            <Card size="small" title={type.toUpperCase()}>
              <Statistic value={count} suffix="ครั้ง" />
            </Card>
          </Col>
        ))}
      </Row>

      <div style={{ marginTop: 12, fontSize: 12, color: '#999' }}>
        อัปเดตล่าสุด: {dayjs().format('DD MMM YYYY HH:mm น.')}
      </div>
    </Card>
  );
};
