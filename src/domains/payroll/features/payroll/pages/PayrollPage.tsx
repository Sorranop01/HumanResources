import { DollarOutlined, FileTextOutlined, TeamOutlined, TrophyOutlined } from '@ant-design/icons';
import { Card, Col, Row, Statistic, Table, Typography } from 'antd';
import type { FC } from 'react';

const { Title } = Typography;

/**
 * Payroll Overview Page
 * Dashboard for payroll overview and statistics
 */
export const PayrollPage: FC = () => {
  // Mock data for demonstration
  const mockStats = {
    totalEmployees: 150,
    totalPayroll: 3500000,
    averageSalary: 23333,
    pendingPayslips: 5,
  };

  const mockRecentPayrolls = [
    {
      key: '1',
      period: 'มกราคม 2025',
      amount: 3500000,
      employees: 150,
      status: 'จ่ายแล้ว',
      date: '2025-01-31',
    },
    {
      key: '2',
      period: 'ธันวาคม 2024',
      amount: 3450000,
      employees: 148,
      status: 'จ่ายแล้ว',
      date: '2024-12-31',
    },
    {
      key: '3',
      period: 'พฤศจิกายน 2024',
      amount: 3400000,
      employees: 145,
      status: 'จ่ายแล้ว',
      date: '2024-11-30',
    },
  ];

  const columns = [
    {
      title: 'งวดเงินเดือน',
      dataIndex: 'period',
      key: 'period',
    },
    {
      title: 'จำนวนเงิน',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => `฿${amount.toLocaleString()}`,
    },
    {
      title: 'จำนวนพนักงาน',
      dataIndex: 'employees',
      key: 'employees',
      render: (count: number) => `${count} คน`,
    },
    {
      title: 'สถานะ',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: 'วันที่จ่าย',
      dataIndex: 'date',
      key: 'date',
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      {/* Page Header */}
      <Row align="middle" style={{ marginBottom: '24px' }}>
        <Col>
          <Title level={2}>
            <DollarOutlined style={{ marginRight: '12px', color: '#1890ff' }} />
            ภาพรวมเงินเดือน
          </Title>
        </Col>
      </Row>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="จำนวนพนักงานทั้งหมด"
              value={mockStats.totalEmployees}
              prefix={<TeamOutlined />}
              suffix="คน"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="เงินเดือนรวมต่อเดือน"
              value={mockStats.totalPayroll}
              prefix={<DollarOutlined />}
              precision={0}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="เงินเดือนเฉลี่ย"
              value={mockStats.averageSalary}
              prefix={<TrophyOutlined />}
              precision={0}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="สลิปเงินเดือนรอดำเนินการ"
              value={mockStats.pendingPayslips}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Recent Payrolls Table */}
      <Card title="ประวัติการจ่ายเงินเดือนล่าสุด">
        <Table
          columns={columns}
          dataSource={mockRecentPayrolls}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 'max-content' }}
        />
      </Card>

      {/* Placeholder Notice */}
      <Card style={{ marginTop: '24px', background: '#fff7e6', borderColor: '#ffc53d' }}>
        <Typography.Text type="warning">
          หมายเหตุ: หน้านี้เป็นตัวอย่างเบื้องต้น ข้อมูลจริงจะถูกเชื่อมต่อกับระบบ Payroll ในภายหลัง
        </Typography.Text>
      </Card>
    </div>
  );
};
