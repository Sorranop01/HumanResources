/**
 * Payroll Runs Page
 * Page for managing payroll processing runs with real Firebase integration
 */

import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  PlayCircleOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Modal,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import type { FC } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEmployees } from '@/domains/people/features/employees';
import { PageHeader } from '@/shared/ui/components/PageHeader';
import { useCreatePayroll, usePayrollList } from '../hooks/usePayroll';
import type { PayrollRecord, PayrollStatus } from '../types';

/**
 * Group payroll records by period
 */
interface PayrollRunGroup {
  key: string;
  period: string;
  month: number;
  year: number;
  employeeCount: number;
  totalAmount: number;
  records: PayrollRecord[];
  statuses: { [key in PayrollStatus]?: number };
}

function groupPayrollByPeriod(records: PayrollRecord[]): PayrollRunGroup[] {
  const groups = new Map<string, PayrollRunGroup>();

  for (const record of records) {
    const key = `${record.year}-${record.month.toString().padStart(2, '0')}`;
    const months = [
      'มกราคม',
      'กุมภาพันธ์',
      'มีนาคม',
      'เมษายน',
      'พฤษภาคม',
      'มิถุนายน',
      'กรกฎาคม',
      'สิงหาคม',
      'กันยายน',
      'ตุลาคม',
      'พฤศจิกายน',
      'ธันวาคม',
    ];
    const period = `${months[record.month - 1]} ${record.year + 543}`;

    if (!groups.has(key)) {
      groups.set(key, {
        key,
        period,
        month: record.month,
        year: record.year,
        employeeCount: 0,
        totalAmount: 0,
        records: [],
        statuses: {},
      });
    }

    const group = groups.get(key); // Get the group

    // Add a check to satisfy Biome, though logically it should always exist
    if (group) {
      group.employeeCount++;
      group.totalAmount += record.netPay;
      group.records.push(record);

      // Count status
      group.statuses[record.status] = (group.statuses[record.status] ?? 0) + 1;
    }
  }

  return Array.from(groups.values()).sort((a, b) => b.key.localeCompare(a.key));
}

export const PayrollRunsPage: FC = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  // Fetch data
  const { data: payrollRecords, isLoading } = usePayrollList();
  const { data: employees } = useEmployees({});
  const createPayrollMutation = useCreatePayroll();

  // Group records by period
  const payrollRuns = payrollRecords ? groupPayrollByPeriod(payrollRecords) : [];

  // Calculate statistics
  const completedRuns = payrollRuns.filter((run) =>
    run.records.every((r) => r.status === 'paid')
  ).length;
  const pendingRuns = payrollRuns.filter((run) =>
    run.records.some((r) => r.status === 'draft' || r.status === 'pending')
  ).length;

  /**
   * Handle create payroll
   */
  const handleCreatePayroll = async (values: {
    employeeId: string;
    month: Dayjs;
    payDate: Dayjs;
  }) => {
    try {
      const month = values.month.month() + 1;
      const year = values.month.year();
      const periodStart = values.month.startOf('month').toDate();
      const periodEnd = values.month.endOf('month').toDate();
      const payDate = values.payDate.toDate();

      await createPayrollMutation.mutateAsync({
        employeeId: values.employeeId,
        month,
        year,
        periodStart,
        periodEnd,
        payDate,
      });

      setIsModalOpen(false);
      form.resetFields();
    } catch (_error) {
      // Error already handled by mutation
    }
  };

  // Table columns
  const columns: ColumnsType<PayrollRunGroup> = [
    {
      title: 'งวดเงินเดือน',
      dataIndex: 'period',
      key: 'period',
      fixed: 'left',
      width: 200,
    },
    {
      title: 'จำนวนพนักงาน',
      dataIndex: 'employeeCount',
      key: 'employeeCount',
      width: 150,
      render: (count: number) => `${count} คน`,
    },
    {
      title: 'ยอดรวมสุทธิ',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 180,
      align: 'right',
      render: (amount: number) => (
        <Typography.Text strong style={{ color: '#52c41a' }}>
          ฿{amount.toLocaleString()}
        </Typography.Text>
      ),
    },
    {
      title: 'สถานะ',
      key: 'status',
      width: 300,
      render: (_, record) => (
        <Space size="small" wrap>
          {record.statuses.paid && <Tag color="success">{record.statuses.paid} จ่ายแล้ว</Tag>}
          {record.statuses.approved && <Tag color="green">{record.statuses.approved} อนุมัติ</Tag>}
          {record.statuses.pending && (
            <Tag color="processing">{record.statuses.pending} รออนุมัติ</Tag>
          )}
          {record.statuses.draft && <Tag color="default">{record.statuses.draft} แบบร่าง</Tag>}
        </Space>
      ),
    },
    {
      title: 'การดำเนินการ',
      key: 'actions',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => navigate(`/payroll?month=${record.month}&year=${record.year}`)}
        >
          ดูรายละเอียด
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      {/* Page Header */}
      <PageHeader
        title="รอบการจ่ายเงินเดือน"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            onClick={() => setIsModalOpen(true)}
          >
            สร้างรายการเงินเดือน
          </Button>
        }
      />

      {/* Statistics Summary */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="รอบที่เสร็จสิ้น"
              value={completedRuns}
              valueStyle={{ color: '#3f8600' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="รอบที่รอดำเนินการ"
              value={pendingRuns}
              valueStyle={{ color: '#faad14' }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="รอบทั้งหมด"
              value={payrollRuns.length}
              prefix={<PlayCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Payroll Runs Table */}
      <Card title="รายการรอบเงินเดือน">
        <Table
          columns={columns}
          dataSource={payrollRuns}
          rowKey="key"
          loading={isLoading}
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showTotal: (total) => `ทั้งหมด ${total} รอบ`,
          }}
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* Create Payroll Modal */}
      <Modal
        title="สร้างรายการเงินเดือน"
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreatePayroll}
          initialValues={{
            month: dayjs(),
            payDate: dayjs().endOf('month'),
          }}
        >
          <Form.Item
            label="พนักงาน"
            name="employeeId"
            rules={[{ required: true, message: 'กรุณาเลือกพนักงาน' }]}
          >
            <Select
              showSearch
              placeholder="เลือกพนักงาน"
              optionFilterProp="label"
              filterOption={(input, option) =>
                String(option?.label ?? '')
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              options={(employees ?? []).map(
                (emp: {
                  id: string;
                  employeeCode: string;
                  firstName: string;
                  lastName: string;
                }) => ({
                  value: emp.id,
                  label: `${emp.employeeCode} - ${emp.firstName} ${emp.lastName}`,
                })
              )}
            />
          </Form.Item>

          <Form.Item
            label="งวดเงินเดือน"
            name="month"
            rules={[{ required: true, message: 'กรุณาเลือกงวด' }]}
          >
            <DatePicker picker="month" style={{ width: '100%' }} format="MMMM YYYY" />
          </Form.Item>

          <Form.Item
            label="วันที่จ่ายเงิน"
            name="payDate"
            rules={[{ required: true, message: 'กรุณาเลือกวันที่จ่ายเงิน' }]}
          >
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button
                onClick={() => {
                  setIsModalOpen(false);
                  form.resetFields();
                }}
              >
                ยกเลิก
              </Button>
              <Button type="primary" htmlType="submit" loading={createPayrollMutation.isPending}>
                สร้างรายการ
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
