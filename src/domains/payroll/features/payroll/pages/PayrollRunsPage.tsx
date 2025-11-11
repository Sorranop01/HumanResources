import {
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  PlayCircleOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { Button, Card, Col, Row, Space, Table, Tag, Typography } from 'antd';
import type { FC } from 'react';
import { useState } from 'react';

const { Title, Text } = Typography;

/**
 * Payroll Runs Page
 * Page for managing payroll processing runs
 */
export const PayrollRunsPage: FC = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  // Mock data for demonstration
  const mockPayrollRuns = [
    {
      key: '1',
      id: 'PR-2025-01',
      period: 'มกราคม 2025',
      startDate: '2025-01-01',
      endDate: '2025-01-31',
      payDate: '2025-01-31',
      status: 'completed',
      employeeCount: 150,
      totalAmount: 3500000,
      createdBy: 'Admin',
      createdAt: '2025-01-28',
    },
    {
      key: '2',
      id: 'PR-2024-12',
      period: 'ธันวาคม 2024',
      startDate: '2024-12-01',
      endDate: '2024-12-31',
      payDate: '2024-12-31',
      status: 'completed',
      employeeCount: 148,
      totalAmount: 3450000,
      createdBy: 'Admin',
      createdAt: '2024-12-28',
    },
    {
      key: '3',
      id: 'PR-2024-11',
      period: 'พฤศจิกายน 2024',
      startDate: '2024-11-01',
      endDate: '2024-11-30',
      payDate: '2024-11-30',
      status: 'completed',
      employeeCount: 145,
      totalAmount: 3400000,
      createdBy: 'Admin',
      createdAt: '2024-11-28',
    },
    {
      key: '4',
      id: 'PR-2025-02',
      period: 'กุมภาพันธ์ 2025',
      startDate: '2025-02-01',
      endDate: '2025-02-28',
      payDate: '2025-02-28',
      status: 'draft',
      employeeCount: 150,
      totalAmount: 3500000,
      createdBy: 'Admin',
      createdAt: '2025-02-01',
    },
  ];

  const getStatusTag = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <Tag icon={<CheckCircleOutlined />} color="success">
            เสร็จสิ้น
          </Tag>
        );
      case 'processing':
        return (
          <Tag icon={<PlayCircleOutlined />} color="processing">
            กำลังประมวลผล
          </Tag>
        );
      case 'draft':
        return (
          <Tag icon={<ClockCircleOutlined />} color="default">
            ร่าง
          </Tag>
        );
      default:
        return <Tag>{status}</Tag>;
    }
  };

  const columns = [
    {
      title: 'รหัสรอบ',
      dataIndex: 'id',
      key: 'id',
      fixed: 'left' as const,
    },
    {
      title: 'งวด',
      dataIndex: 'period',
      key: 'period',
    },
    {
      title: 'วันที่เริ่มต้น',
      dataIndex: 'startDate',
      key: 'startDate',
    },
    {
      title: 'วันที่สิ้นสุด',
      dataIndex: 'endDate',
      key: 'endDate',
    },
    {
      title: 'วันที่จ่าย',
      dataIndex: 'payDate',
      key: 'payDate',
      render: (date: string) => (
        <Space>
          <CalendarOutlined />
          <Text>{date}</Text>
        </Space>
      ),
    },
    {
      title: 'สถานะ',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusTag(status),
    },
    {
      title: 'จำนวนพนักงาน',
      dataIndex: 'employeeCount',
      key: 'employeeCount',
      render: (count: number) => `${count} คน`,
    },
    {
      title: 'ยอดรวม',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount: number) => `฿${amount.toLocaleString()}`,
    },
    {
      title: 'สร้างโดย',
      dataIndex: 'createdBy',
      key: 'createdBy',
    },
    {
      title: 'วันที่สร้าง',
      dataIndex: 'createdAt',
      key: 'createdAt',
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(newSelectedRowKeys);
    },
  };

  return (
    <div style={{ padding: '24px' }}>
      {/* Page Header */}
      <Row justify="space-between" align="middle" style={{ marginBottom: '24px' }}>
        <Col>
          <Title level={2}>
            <PlayCircleOutlined style={{ marginRight: '12px', color: '#1890ff' }} />
            การประมวลผลเงินเดือน
          </Title>
          <Text type="secondary">จัดการรอบการจ่ายเงินเดือนและประมวลผล</Text>
        </Col>
        <Col>
          <Space>
            <Button type="primary" icon={<PlusOutlined />} size="large">
              สร้างรอบใหม่
            </Button>
          </Space>
        </Col>
      </Row>

      {/* Statistics Summary */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="รอบที่เสร็จสิ้น"
              value={mockPayrollRuns.filter((run) => run.status === 'completed').length}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="รอบที่รอดำเนินการ"
              value={mockPayrollRuns.filter((run) => run.status === 'draft').length}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic title="รอบทั้งหมด" value={mockPayrollRuns.length} />
          </Card>
        </Col>
      </Row>

      {/* Payroll Runs Table */}
      <Card>
        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={mockPayrollRuns}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 'max-content' }}
        />
      </Card>

      {/* Placeholder Notice */}
      <Card style={{ marginTop: '24px', background: '#fff7e6', borderColor: '#ffc53d' }}>
        <Typography.Text type="warning">
          หมายเหตุ: หน้านี้เป็นตัวอย่างเบื้องต้น ฟังก์ชันการประมวลผลเงินเดือนจริงจะถูกพัฒนาในภายหลัง
        </Typography.Text>
      </Card>
    </div>
  );
};

// Helper component for statistics
function Statistic({
  title,
  value,
  valueStyle,
}: {
  title: string;
  value: number;
  valueStyle?: React.CSSProperties;
}) {
  return (
    <div>
      <div style={{ fontSize: '14px', color: '#8c8c8c', marginBottom: '8px' }}>{title}</div>
      <div style={{ fontSize: '24px', fontWeight: 'bold', ...valueStyle }}>{value}</div>
    </div>
  );
}
