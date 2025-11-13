/**
 * PayrollConfigForm Component
 * Form for editing payroll configuration settings
 */

import { Card, Col, Form, type FormInstance, Input, InputNumber, Row, Select, Switch } from 'antd';
import { memo, useEffect } from 'react';
import type {
  PayrollConfig,
  UpdatePayrollConfigInput,
} from '@/shared/schemas/payrollConfig.schema';

interface PayrollConfigFormProps {
  form: FormInstance<UpdatePayrollConfigInput>;
  initialValues?: PayrollConfig | null;
  loading?: boolean;
}

/**
 * Payroll Configuration Form Component
 */
export const PayrollConfigForm = memo<PayrollConfigFormProps>(
  ({ form, initialValues, loading }) => {
    // Set initial values when data loads
    useEffect(() => {
      if (initialValues) {
        form.setFieldsValue(initialValues);
      }
    }, [initialValues, form]);

    return (
      <Form form={form} layout="vertical" disabled={loading}>
        {/* Basic Settings */}
        <Card title="การตั้งค่าพื้นฐาน" style={{ marginBottom: 16 }}>
          <Row gutter={[16, 0]}>
            <Col xs={24} md={12}>
              <Form.Item
                label="ชื่อองค์กร"
                name="organizationName"
                rules={[{ required: true, message: 'กรุณากรอกชื่อองค์กร' }]}
              >
                <Input placeholder="เช่น บริษัท ABC จำกัด" />
              </Form.Item>
            </Col>

            <Col xs={24} md={6}>
              <Form.Item
                label="รอบการจ่าย"
                name="payFrequency"
                rules={[{ required: true, message: 'กรุณาเลือกรอบการจ่าย' }]}
              >
                <Select placeholder="เลือกรอบการจ่าย">
                  <Select.Option value="monthly">รายเดือน</Select.Option>
                  <Select.Option value="bi-weekly">ทุก 2 สัปดาห์</Select.Option>
                  <Select.Option value="weekly">รายสัปดาห์</Select.Option>
                  <Select.Option value="daily">รายวัน</Select.Option>
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} md={6}>
              <Form.Item
                label="วันที่จ่ายเงินเดือน"
                name="payDay"
                rules={[{ required: true, message: 'กรุณากรอกวันที่จ่าย' }]}
                tooltip="วันที่ในแต่ละเดือนที่จ่ายเงินเดือน (1-31)"
              >
                <InputNumber min={1} max={31} style={{ width: '100%' }} placeholder="25" />
              </Form.Item>
            </Col>

            <Col xs={24} md={6}>
              <Form.Item
                label="สกุลเงิน"
                name="currency"
                rules={[{ required: true, message: 'กรุณาเลือกสกุลเงิน' }]}
              >
                <Select placeholder="เลือกสกุลเงิน">
                  <Select.Option value="THB">บาท (THB)</Select.Option>
                  <Select.Option value="USD">ดอลลาร์ (USD)</Select.Option>
                  <Select.Option value="EUR">ยูโร (EUR)</Select.Option>
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} md={6}>
              <Form.Item
                label="เดือนเริ่มต้นปีงบประมาณ"
                name="fiscalYearStartMonth"
                rules={[{ required: true, message: 'กรุณาเลือกเดือน' }]}
              >
                <Select placeholder="เลือกเดือน">
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                    <Select.Option key={month} value={month}>
                      {new Date(2024, month - 1).toLocaleDateString('th-TH', { month: 'long' })}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Overtime Rates */}
        <Card title="อัตราค่าล่วงเวลา (OT)" style={{ marginBottom: 16 }}>
          <Row gutter={[16, 0]}>
            <Col xs={24} md={8}>
              <Form.Item
                label="วันทำงานปกติ"
                name={['overtimeRates', 'regularDayRate']}
                rules={[{ required: true, message: 'กรุณากรอกอัตรา' }]}
                tooltip="เช่น 1.5 หมายถึง 1.5 เท่า"
              >
                <InputNumber
                  min={1}
                  max={5}
                  step={0.5}
                  style={{ width: '100%' }}
                  addonAfter="เท่า"
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item
                label="วันหยุดสุดสัปดาห์"
                name={['overtimeRates', 'weekendRate']}
                rules={[{ required: true, message: 'กรุณากรอกอัตรา' }]}
              >
                <InputNumber
                  min={1}
                  max={5}
                  step={0.5}
                  style={{ width: '100%' }}
                  addonAfter="เท่า"
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item
                label="วันหยุดนักขัตฤกษ์"
                name={['overtimeRates', 'holidayRate']}
                rules={[{ required: true, message: 'กรุณากรอกอัตรา' }]}
              >
                <InputNumber
                  min={1}
                  max={5}
                  step={0.5}
                  style={{ width: '100%' }}
                  addonAfter="เท่า"
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Social Security */}
        <Card title="ประกันสังคม" style={{ marginBottom: 16 }}>
          <Row gutter={[16, 0]}>
            <Col xs={24}>
              <Form.Item
                label="เปิดใช้งานประกันสังคม"
                name={['socialSecurity', 'enabled']}
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item
                label="อัตราหักพนักงาน (%)"
                name={['socialSecurity', 'employeeRate']}
                rules={[{ required: true, message: 'กรุณากรอกอัตรา' }]}
              >
                <InputNumber min={0} max={100} style={{ width: '100%' }} addonAfter="%" />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item
                label="อัตราจ่ายนายจ้าง (%)"
                name={['socialSecurity', 'employerRate']}
                rules={[{ required: true, message: 'กรุณากรอกอัตรา' }]}
              >
                <InputNumber min={0} max={100} style={{ width: '100%' }} addonAfter="%" />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item
                label="ฐานเงินเดือนสูงสุด (บาท)"
                name={['socialSecurity', 'maxSalaryBase']}
                rules={[{ required: true, message: 'กรุณากรอกจำนวน' }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item label="จำนวนหักขั้นต่ำ (บาท)" name={['socialSecurity', 'minContribution']}>
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item
                label="จำนวนหักสูงสุด (บาท)"
                name={['socialSecurity', 'maxContribution']}
                rules={[{ required: true, message: 'กรุณากรอกจำนวน' }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Provident Fund */}
        <Card title="กองทุนสำรองเลี้ยงชีพ" style={{ marginBottom: 16 }}>
          <Row gutter={[16, 0]}>
            <Col xs={24}>
              <Form.Item
                label="เปิดใช้งานกองทุนสำรองเลี้ยงชีพ"
                name={['providentFund', 'enabled']}
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label="อัตราหักพนักงานเริ่มต้น (%)"
                name={['providentFund', 'defaultEmployeeRate']}
              >
                <InputNumber min={0} max={100} style={{ width: '100%' }} addonAfter="%" />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label="อัตราจ่ายนายจ้างเริ่มต้น (%)"
                name={['providentFund', 'defaultEmployerRate']}
              >
                <InputNumber min={0} max={100} style={{ width: '100%' }} addonAfter="%" />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item label="อัตราหักขั้นต่ำ (%)" name={['providentFund', 'minContributionRate']}>
                <InputNumber min={0} max={100} style={{ width: '100%' }} addonAfter="%" />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item label="อัตราหักสูงสุด (%)" name={['providentFund', 'maxContributionRate']}>
                <InputNumber min={0} max={100} style={{ width: '100%' }} addonAfter="%" />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Tax Configuration */}
        <Card title="ภาษี" style={{ marginBottom: 16 }}>
          <Row gutter={[16, 0]}>
            <Col xs={24}>
              <Form.Item
                label="เปิดใช้งานหักภาษี ณ ที่จ่าย"
                name={['tax', 'enabled']}
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label="อัตราภาษีเริ่มต้น (%)"
                name={['tax', 'defaultTaxRate']}
                tooltip="ใช้เฉพาะกรณีไม่ใช้ภาษีแบบขั้นบันได"
              >
                <InputNumber min={0} max={100} style={{ width: '100%' }} addonAfter="%" />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label="ใช้ภาษีแบบขั้นบันได"
                name={['tax', 'useProgressiveTax']}
                valuePropName="checked"
                tooltip="คำนวณภาษีตามอัตราขั้นบันไดของกฎหมาย"
              >
                <Switch />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Working Days Configuration */}
        <Card title="วันทำงานและชั่วโมงทำงาน" style={{ marginBottom: 16 }}>
          <Row gutter={[16, 0]}>
            <Col xs={24} md={8}>
              <Form.Item
                label="วันทำงานมาตรฐานต่อเดือน"
                name={['workingDays', 'standardWorkDaysPerMonth']}
                rules={[{ required: true, message: 'กรุณากรอกจำนวนวัน' }]}
              >
                <InputNumber min={1} max={31} style={{ width: '100%' }} addonAfter="วัน" />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item
                label="ชั่วโมงทำงานมาตรฐานต่อวัน"
                name={['workingDays', 'standardWorkHoursPerDay']}
                rules={[{ required: true, message: 'กรุณากรอกจำนวนชั่วโมง' }]}
              >
                <InputNumber min={1} max={24} style={{ width: '100%' }} addonAfter="ชม." />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item
                label="ชั่วโมงทำงานมาตรฐานต่อสัปดาห์"
                name={['workingDays', 'standardWorkHoursPerWeek']}
                rules={[{ required: true, message: 'กรุณากรอกจำนวนชั่วโมง' }]}
              >
                <InputNumber min={1} max={168} style={{ width: '100%' }} addonAfter="ชม." />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Default Allowances */}
        <Card title="ค่าเบี้ยเลี้ยงเริ่มต้น" style={{ marginBottom: 16 }}>
          <Row gutter={[16, 0]}>
            <Col xs={24} md={6}>
              <Form.Item label="ค่าเดินทาง (บาท)" name={['defaultAllowances', 'transportation']}>
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>

            <Col xs={24} md={6}>
              <Form.Item label="ค่าที่พัก (บาท)" name={['defaultAllowances', 'housing']}>
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>

            <Col xs={24} md={6}>
              <Form.Item label="ค่าอาหาร (บาท)" name={['defaultAllowances', 'meal']}>
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>

            <Col xs={24} md={6}>
              <Form.Item label="เบี้ยตำแหน่ง (บาท)" name={['defaultAllowances', 'position']}>
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Additional Settings */}
        <Card title="การตั้งค่าเพิ่มเติม">
          <Row gutter={[16, 0]}>
            <Col xs={24} md={8}>
              <Form.Item
                label="สร้าง Payroll อัตโนมัติ"
                name="enableAutomaticPayrollGeneration"
                valuePropName="checked"
                tooltip="สร้างรายการเงินเดือนอัตโนมัติทุกเดือน"
              >
                <Switch />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item
                label="ล็อค Payroll กี่วันก่อนจ่าย"
                name="payrollLockDaysBefore"
                tooltip="จำนวนวันก่อนวันจ่ายที่จะล็อคไม่ให้แก้ไข"
              >
                <InputNumber min={0} max={30} style={{ width: '100%' }} addonAfter="วัน" />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item
                label="ส่งสลิปเงินเดือนทางอีเมล"
                name="enablePayslipEmail"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
          </Row>
        </Card>
      </Form>
    );
  }
);

PayrollConfigForm.displayName = 'PayrollConfigForm';
