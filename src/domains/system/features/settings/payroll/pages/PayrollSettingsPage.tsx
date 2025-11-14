/**
 * PayrollSettingsPage
 * Page for managing payroll system configuration
 */

import { SaveOutlined, SettingOutlined } from '@ant-design/icons';
import { Alert, Button, Card, Form, Space, Spin, Typography } from 'antd';
import { memo, useCallback } from 'react';
import { useAuth } from '@/domains/system/features/auth/hooks/useAuth';
import type { UpdatePayrollConfigInput } from '@/shared/schemas/payrollConfig.schema';
import { PageHeader } from '@/shared/ui/components/PageHeader';
import { PayrollConfigForm } from '../components/PayrollConfigForm';
import { usePayrollConfig, useUpdatePayrollConfig } from '../hooks';

const { Title, Text, Paragraph } = Typography;

/**
 * Payroll Settings Page Component
 */
export const PayrollSettingsPage = memo(() => {
  const { user } = useAuth();
  const [form] = Form.useForm<UpdatePayrollConfigInput>();

  // Fetch payroll config
  const {
    data: config,
    isLoading,
    error,
  } = usePayrollConfig(user?.tenantId || '', 'Default Organization');

  // Update mutation
  const updateMutation = useUpdatePayrollConfig();

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback(async () => {
    try {
      const values = await form.validateFields();

      if (!user?.tenantId) {
        throw new Error('Tenant ID not found');
      }

      await updateMutation.mutateAsync({
        tenantId: user.tenantId,
        data: values,
        updatedBy: user.uid,
      });
    } catch (error) {
      console.error('Form validation error:', error);
    }
  }, [form, user, updateMutation]);

  /**
   * Handle reset form to initial values
   */
  const handleReset = useCallback(() => {
    if (config) {
      form.setFieldsValue(config);
    }
  }, [config, form]);

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" tip="กำลังโหลดการตั้งค่า...">
          <div style={{ height: '200px' }} />
        </Spin>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '24px' }}>
        <Alert
          message="เกิดข้อผิดพลาด"
          description={`ไม่สามารถโหลดการตั้งค่าได้: ${error.message}`}
          type="error"
          showIcon
        />
      </div>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <PageHeader
        icon={<SettingOutlined />}
        title="ตั้งค่าระบบเงินเดือน"
        subtitle="กำหนดค่าพื้นฐานสำหรับการคำนวณและจ่ายเงินเดือน"
      />

      {/* Introduction */}
      <Card style={{ marginBottom: 16 }}>
        <Title level={5}>
          <SettingOutlined /> คำแนะนำ
        </Title>
        <Paragraph>
          หน้านี้ใช้สำหรับกำหนดการตั้งค่าพื้นฐานของระบบเงินเดือน ซึ่งจะมีผลต่อการคำนวณเงินเดือนของพนักงานทุกคน
        </Paragraph>
        <Paragraph type="warning" strong>
          ⚠️ การเปลี่ยนแปลงค่าเหล่านี้อาจส่งผลต่อการคำนวณเงินเดือนในอนาคต กรุณาตรวจสอบให้แน่ใจก่อนบันทึก
        </Paragraph>

        <Space direction="vertical" size="small">
          <Text>
            <strong>รอบการจ่าย:</strong> กำหนดความถี่ในการจ่ายเงินเดือน
          </Text>
          <Text>
            <strong>วันที่จ่าย:</strong> วันที่ในเดือนที่จะจ่ายเงินเดือน
          </Text>
          <Text>
            <strong>อัตรา OT:</strong> อัตราการคำนวณค่าล่วงเวลา
          </Text>
          <Text>
            <strong>ประกันสังคม/กองทุน:</strong> การตั้งค่าการหักเงินสมทบต่างๆ
          </Text>
          <Text>
            <strong>ภาษี:</strong> การคำนวณภาษีเงินได้หัก ณ ที่จ่าย
          </Text>
        </Space>
      </Card>

      {/* Form */}
      <PayrollConfigForm form={form} initialValues={config} loading={updateMutation.isPending} />

      {/* Action Buttons */}
      <Card style={{ marginTop: 16 }}>
        <Space>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            size="large"
            onClick={handleSubmit}
            loading={updateMutation.isPending}
          >
            บันทึกการตั้งค่า
          </Button>

          <Button size="large" onClick={handleReset} disabled={updateMutation.isPending}>
            รีเซ็ตเป็นค่าเริ่มต้น
          </Button>
        </Space>

        {config?.updatedAt && (
          <div style={{ marginTop: 16 }}>
            <Text type="secondary">
              แก้ไขล่าสุด:{' '}
              {new Date(config.updatedAt).toLocaleString('th-TH', {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
              {config.updatedBy && ` โดย ${config.updatedBy}`}
            </Text>
          </div>
        )}
      </Card>
    </div>
  );
});

PayrollSettingsPage.displayName = 'PayrollSettingsPage';
