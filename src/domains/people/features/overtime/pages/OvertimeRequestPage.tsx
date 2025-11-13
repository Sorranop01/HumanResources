import { InfoCircleOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { Alert, Card, Col, message, Row, Space, Spin, Statistic, Typography } from 'antd';
import type { FC } from 'react';
import { useMemo } from 'react';
import { useAuth } from '@/shared/hooks/useAuth';
import { PageHeader } from '@/shared/ui/components/PageHeader';
import { useEmployee } from '../../employees/hooks/useEmployee';
import { OvertimeRequestForm } from '../components/OvertimeRequestForm';
import { useCreateOvertimeRequest } from '../hooks/useOvertime';
import type { OvertimeRequestFormInput } from '../schemas';
import { formDataToOvertimeRequestInput } from '../schemas';
import type { OvertimeType } from '../types';

const { Paragraph } = Typography;

const OVERTIME_RATE_BY_TYPE: Record<OvertimeType, number> = {
  weekday: 1.5,
  weekend: 2,
  holiday: 3,
  emergency: 2.5,
};

export const OvertimeRequestPage: FC = () => {
  const { employeeId } = useAuth();
  const { data: employee, isLoading: isEmployeeLoading } = useEmployee(employeeId ?? undefined);
  const createRequestMutation = useCreateOvertimeRequest();

  const canSubmit = Boolean(employee?.overtime?.isEligible);

  const employeeStats = useMemo(() => {
    if (!employee) {
      return null;
    }

    return {
      name: `${employee.firstName} ${employee.lastName}`,
      code: employee.employeeCode,
      department: employee.department || 'N/A',
      position: employee.position || 'N/A',
      overtimeRate: employee.overtime?.rate ?? 1.5,
    };
  }, [employee]);

  const handleSubmit = (values: OvertimeRequestFormInput) => {
    if (!employee || !employeeId) {
      message.error('ไม่พบข้อมูลพนักงาน ไม่สามารถส่งคำขอ OT ได้');
      return;
    }

    if (!canSubmit) {
      message.warning('คุณไม่ได้รับสิทธิ์ทำ OT กรุณาติดต่อ HR');
      return;
    }

    const overtimeRate =
      OVERTIME_RATE_BY_TYPE[values.overtimeType] ?? employee.overtime?.rate ?? 1.5;

    const payload = formDataToOvertimeRequestInput(
      values,
      employee.id,
      employeeStats?.name ?? employee.employeeCode,
      employee.employeeCode,
      employee.department,
      employee.position,
      overtimeRate
    );

    createRequestMutation.mutate(payload);
  };

  if (isEmployeeLoading) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <PageHeader
        title="ขอทำงานล่วงเวลา (OT)"
        breadcrumbs={[
          { label: 'การจัดการคน', path: '/people' },
          { label: 'OT', path: '/overtime' },
          { label: 'ขอทำ OT' },
        ]}
        extra={
          employeeStats ? (
            <Space size="large">
              <Statistic title="รหัสพนักงาน" value={employeeStats.code} />
              <Statistic title="แผนก" value={employeeStats.department} />
              <Statistic title="ค่าล่วงเวลา (x)" value={employeeStats.overtimeRate} precision={1} />
            </Space>
          ) : null
        }
      />

      {!canSubmit && (
        <Alert
          type="warning"
          showIcon
          icon={<InfoCircleOutlined />}
          message="คุณยังไม่ได้รับสิทธิ์ทำงานล่วงเวลา"
          description="กรุณาติดต่อ HR หรือผู้จัดการเพื่อเปิดสิทธิ์ก่อนส่งคำขอ OT"
          style={{ marginBottom: 24 }}
        />
      )}

      <Row gutter={24}>
        <Col span={24} lg={14}>
          <Card
            title={
              <Space>
                <ThunderboltOutlined />
                รายละเอียดคำขอ OT
              </Space>
            }
            styles={{ body: { padding: 24 } }}
          >
            <OvertimeRequestForm
              onSubmit={handleSubmit}
              submitting={createRequestMutation.isPending}
              initialValues={{
                overtimeType: 'weekday',
              }}
            />
          </Card>
        </Col>
        <Col span={24} lg={10}>
          <Card title="คำแนะนำก่อนทำ OT" style={{ marginBottom: 24 }}>
            <Space direction="vertical" size="middle">
              <Paragraph>1. ระบุเหตุผลและงานที่ต้องดำเนินการให้ชัดเจน เพื่อให้ผู้อนุมัติพิจารณาได้ถูกต้อง</Paragraph>
              <Paragraph>2. เลือกประเภท OT ให้ตรงกับวันที่ทำงาน (วันธรรมดา/วันหยุด/ฉุกเฉิน)</Paragraph>
              <Paragraph>3. หากมีไฟล์อ้างอิง เช่น แผนงาน หรือเอกสารอนุมัติอื่น ๆ กรุณาแนบลิงก์ไว้ด้วย</Paragraph>
              <Paragraph>
                4. หลังคำขอได้รับอนุมัติ ให้ลงเวลาเข้า-ออกให้ครบถ้วน เพื่อให้ฝ่ายบัญชีคำนวณค่าแรงได้ถูกต้อง
              </Paragraph>
            </Space>
          </Card>

          <Card title="ข้อมูลพนักงาน">
            {employeeStats ? (
              <Space direction="vertical">
                <Paragraph>ชื่อ: {employeeStats.name}</Paragraph>
                <Paragraph>ตำแหน่ง: {employeeStats.position}</Paragraph>
                <Paragraph>แผนก: {employeeStats.department}</Paragraph>
              </Space>
            ) : (
              <Paragraph type="secondary">ไม่พบข้อมูลพนักงาน</Paragraph>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};
