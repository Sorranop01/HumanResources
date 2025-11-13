/**
 * Payroll Overview Page
 * Dashboard for payroll overview and statistics with real data
 */

import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloudUploadOutlined,
  DollarOutlined,
  DownloadOutlined,
  FileTextOutlined,
  MailOutlined,
  TeamOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  DatePicker,
  message,
  Row,
  Space,
  Spin,
  Statistic,
  Table,
  Tag,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import type { FC } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/shared/ui/components/PageHeader';
import { usePayrollList, usePayrollSummary } from '../hooks/usePayroll';
import { payslipService } from '../services/payslipService';
import type { PayrollRecord, PayrollStatus } from '../types';

/**
 * Get status color
 */
function getStatusColor(status: PayrollStatus): string {
  const colors: Record<PayrollStatus, string> = {
    draft: 'default',
    pending: 'processing',
    approved: 'success',
    paid: 'success',
    cancelled: 'error',
  };
  return colors[status];
}

/**
 * Get status text
 */
function getStatusText(status: PayrollStatus): string {
  const texts: Record<PayrollStatus, string> = {
    draft: 'แบบร่าง',
    pending: 'รออนุมัติ',
    approved: 'อนุมัติแล้ว',
    paid: 'จ่ายเงินแล้ว',
    cancelled: 'ยกเลิก',
  };
  return texts[status];
}

/**
 * Format Thai month
 */
function formatThaiMonth(month: number, year: number): string {
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
  return `${months[month - 1]} ${year + 543}`;
}

export const PayrollPage: FC = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [downloadingPayslipId, setDownloadingPayslipId] = useState<string | null>(null);
  const [emailingPayslipId, setEmailingPayslipId] = useState<string | null>(null);
  const [uploadingPayslipId, setUploadingPayslipId] = useState<string | null>(null);
  const month = selectedDate.month() + 1;
  const year = selectedDate.year();

  // Fetch data
  const { data: payrollList, isLoading: isLoadingList } = usePayrollList({ month, year });
  const { data: summary, isLoading: isLoadingSummary } = usePayrollSummary(month, year);

  const handleDownloadPayslip = async (payrollId: string) => {
    try {
      setDownloadingPayslipId(payrollId);
      await payslipService.downloadPayslip(payrollId);
      message.success('ดาวน์โหลดสลิปเรียบร้อย');
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : 'ไม่สามารถดาวน์โหลดสลิปได้';
      message.error(errMsg);
    } finally {
      setDownloadingPayslipId(null);
    }
  };

  const handleEmailPayslip = async (payrollId: string) => {
    try {
      setEmailingPayslipId(payrollId);
      await payslipService.emailPayslip(payrollId);
      message.success('เปิดหน้าต่างอีเมลแล้ว');
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : 'ไม่สามารถเปิดอีเมลสลิปได้';
      message.error(errMsg);
    } finally {
      setEmailingPayslipId(null);
    }
  };

  const handleUploadPayslip = async (payrollId: string) => {
    try {
      setUploadingPayslipId(payrollId);
      const { url } = await payslipService.uploadPayslipToStorage(payrollId);
      message.success({
        content: (
          <span>
            บันทึกสลิปแล้ว{' '}
            <a href={url} target="_blank" rel="noreferrer">
              เปิดดู
            </a>
          </span>
        ),
        duration: 6,
      });
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : 'ไม่สามารถบันทึกสลิปได้';
      message.error(errMsg);
    } finally {
      setUploadingPayslipId(null);
    }
  };

  const columns: ColumnsType<PayrollRecord> = [
    {
      title: 'รหัสพนักงาน',
      dataIndex: 'employeeCode',
      key: 'employeeCode',
      width: 120,
    },
    {
      title: 'ชื่อพนักงาน',
      dataIndex: 'employeeName',
      key: 'employeeName',
      width: 200,
    },
    {
      title: 'แผนก',
      dataIndex: 'department',
      key: 'department',
      width: 150,
    },
    {
      title: 'ตำแหน่ง',
      dataIndex: 'position',
      key: 'position',
      width: 150,
    },
    {
      title: 'รายได้รวม',
      dataIndex: 'grossIncome',
      key: 'grossIncome',
      align: 'right',
      width: 120,
      render: (value: number) => `฿${value.toLocaleString()}`,
    },
    {
      title: 'หักรวม',
      dataIndex: 'totalDeductions',
      key: 'totalDeductions',
      align: 'right',
      width: 120,
      render: (value: number) => `฿${value.toLocaleString()}`,
    },
    {
      title: 'รับสุทธิ',
      dataIndex: 'netPay',
      key: 'netPay',
      align: 'right',
      width: 120,
      render: (value: number) => (
        <Typography.Text strong style={{ color: '#52c41a' }}>
          ฿{value.toLocaleString()}
        </Typography.Text>
      ),
    },
    {
      title: 'สถานะ',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: PayrollStatus) => (
        <Tag
          color={getStatusColor(status)}
          icon={status === 'paid' ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
        >
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: 'วันที่จ่าย',
      dataIndex: 'payDate',
      key: 'payDate',
      width: 120,
      render: (date: Date) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'สลิปเงินเดือน',
      key: 'payslip',
      width: 320,
      render: (_: unknown, record) => (
        <Space>
          <Button
            size="small"
            icon={<DownloadOutlined />}
            loading={downloadingPayslipId === record.id}
            onClick={(event) => {
              event.stopPropagation();
              void handleDownloadPayslip(record.id);
            }}
          >
            ดาวน์โหลด
          </Button>
          <Button
            size="small"
            icon={<MailOutlined />}
            loading={emailingPayslipId === record.id}
            onClick={(event) => {
              event.stopPropagation();
              void handleEmailPayslip(record.id);
            }}
          >
            ส่งอีเมล
          </Button>
          <Button
            size="small"
            icon={<CloudUploadOutlined />}
            loading={uploadingPayslipId === record.id}
            onClick={(event) => {
              event.stopPropagation();
              void handleUploadPayslip(record.id);
            }}
          >
            บันทึกในระบบ
          </Button>
        </Space>
      ),
    },
  ];

  // Calculate pending count
  const pendingCount =
    payrollList?.filter((p) => p.status === 'draft' || p.status === 'pending').length ?? 0;

  return (
    <div style={{ padding: '24px' }}>
      {/* Page Header */}
      <PageHeader
        title="ภาพรวมเงินเดือน"
        extra={
          <DatePicker
            picker="month"
            value={selectedDate}
            onChange={(date) => date && setSelectedDate(date)}
            format="MMMM YYYY"
            allowClear={false}
          />
        }
      />

      {/* Statistics Cards */}
      <Spin spinning={isLoadingSummary}>
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="จำนวนพนักงาน"
                value={summary?.totalEmployees ?? 0}
                prefix={<TeamOutlined />}
                suffix="คน"
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="รายได้รวม"
                value={summary?.totalGrossIncome ?? 0}
                prefix={<DollarOutlined />}
                precision={2}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="รับสุทธิเฉลี่ย"
                value={summary?.averageNetPay ?? 0}
                prefix={<TrophyOutlined />}
                precision={2}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="รอดำเนินการ"
                value={pendingCount}
                prefix={<FileTextOutlined />}
                valueStyle={{ color: pendingCount > 0 ? '#cf1322' : '#52c41a' }}
              />
            </Card>
          </Col>
        </Row>
      </Spin>

      {/* Payroll Table */}
      <Card
        title={
          <span>
            <FileTextOutlined style={{ marginRight: '8px' }} />
            รายการเงินเดือน {formatThaiMonth(month, year)}
          </span>
        }
      >
        <Table
          columns={columns}
          dataSource={payrollList}
          rowKey="id"
          loading={isLoadingList}
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showTotal: (total) => `ทั้งหมด ${total} รายการ`,
          }}
          scroll={{ x: 1200 }}
          onRow={(record) => ({
            onClick: () => navigate(`/payroll/${record.id}`),
            style: { cursor: 'pointer' },
          })}
        />
      </Card>
    </div>
  );
};
