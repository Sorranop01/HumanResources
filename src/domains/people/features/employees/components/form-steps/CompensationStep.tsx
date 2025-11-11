import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Button, Col, Form, Input, InputNumber, Row, Select, Space, Typography } from 'antd';
import type { FC } from 'react';
import { Controller, useForm } from 'react-hook-form';
import type { CompensationFormInput, EmployeeFormInput } from '../../schemas';
import { CompensationFormSchema } from '../../schemas';

const { Title, Text } = Typography;

interface CompensationStepProps {
  initialData?: Partial<EmployeeFormInput>;
  onNext: (data: Partial<EmployeeFormInput>) => void;
  onBack: () => void;
  onCancel: () => void;
}

/**
 * Step 3: Compensation Form
 * Collects salary, hourly rate (for part-time), and payment frequency
 */
export const CompensationStep: FC<CompensationStepProps> = ({ initialData, onNext, onBack, onCancel }) => {
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CompensationFormInput>({
    resolver: zodResolver(CompensationFormSchema),
    defaultValues: {
      baseSalary: initialData?.baseSalary || 0,
      currency: initialData?.currency || 'THB',
      paymentFrequency: initialData?.paymentFrequency || 'monthly',
      hourlyRate: initialData?.hourlyRate || undefined,
    },
  });

  const workType = initialData?.workType;
  const paymentFrequency = watch('paymentFrequency');

  const onSubmit = (data: CompensationFormInput) => {
    onNext(data);
  };

  return (
    <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
      <Title level={4}>ค่าตอบแทนและสวัสดิการ</Title>
      <Text type="secondary">กำหนดเงินเดือนและค่าตอบแทน</Text>

      {/* Security Alert */}
      <Alert
        message="ข้อมูลสำคัญ"
        description="ข้อมูลค่าตอบแทนเป็นข้อมูลที่มีความเป็นส่วนตัว เฉพาะผู้มีสิทธิ์เท่านั้นที่สามารถเข้าถึงได้"
        type="warning"
        showIcon
        style={{ marginTop: '16px', marginBottom: '24px' }}
      />

      {/* Salary Information */}
      <Title level={5}>เงินเดือนและค่าจ้าง</Title>
      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Form.Item
            label={workType === 'part-time' ? 'เงินเดือนฐาน (ถ้ามี)' : 'เงินเดือนฐาน'}
            required={workType !== 'part-time'}
            validateStatus={errors.baseSalary ? 'error' : ''}
            help={errors.baseSalary?.message}
            tooltip="เงินเดือนพื้นฐานต่อเดือน (ไม่รวมเบี้ยเลี้ยง)"
          >
            <Controller
              name="baseSalary"
              control={control}
              render={({ field }) => (
                <InputNumber
                  {...field}
                  style={{ width: '100%' }}
                  placeholder="15000"
                  min={0}
                  step={1000}
                  formatter={(value) => `฿ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value?.replace(/฿\s?|(,*)/g, '') as any}
                />
              )}
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={6}>
          <Form.Item
            label="สกุลเงิน"
            required
            validateStatus={errors.currency ? 'error' : ''}
            help={errors.currency?.message}
          >
            <Controller
              name="currency"
              control={control}
              render={({ field }) => (
                <Select {...field} placeholder="เลือกสกุลเงิน">
                  <Select.Option value="THB">THB (บาท)</Select.Option>
                  <Select.Option value="USD">USD (ดอลลาร์)</Select.Option>
                  <Select.Option value="EUR">EUR (ยูโร)</Select.Option>
                </Select>
              )}
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={6}>
          <Form.Item
            label="รอบการจ่าย"
            required
            validateStatus={errors.paymentFrequency ? 'error' : ''}
            help={errors.paymentFrequency?.message}
          >
            <Controller
              name="paymentFrequency"
              control={control}
              render={({ field }) => (
                <Select {...field} placeholder="เลือกรอบการจ่าย">
                  <Select.Option value="monthly">รายเดือน</Select.Option>
                  <Select.Option value="bi-weekly">ทุก 2 สัปดาห์</Select.Option>
                  <Select.Option value="weekly">รายสัปดาห์</Select.Option>
                  <Select.Option value="hourly">รายชั่วโมง</Select.Option>
                </Select>
              )}
            />
          </Form.Item>
        </Col>
      </Row>

      {/* Hourly Rate (for Part-time) */}
      {(workType === 'part-time' || paymentFrequency === 'hourly') && (
        <>
          <Title level={5} style={{ marginTop: '16px' }}>
            อัตราค่าจ้างต่อชั่วโมง
          </Title>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="อัตราค่าจ้างต่อชั่วโมง"
                required
                validateStatus={errors.hourlyRate ? 'error' : ''}
                help={errors.hourlyRate?.message}
                tooltip="สำหรับพนักงาน Part-time หรือจ่ายตามชั่วโมง"
              >
                <Controller
                  name="hourlyRate"
                  control={control}
                  render={({ field }) => (
                    <InputNumber
                      {...field}
                      style={{ width: '100%' }}
                      placeholder="150"
                      min={0}
                      step={10}
                      formatter={(value) => `฿ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={(value) => value?.replace(/฿\s?|(,*)/g, '') as any}
                    />
                  )}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Alert
                message="คำแนะนำ"
                description={
                  workType === 'part-time'
                    ? 'พนักงาน Part-time ควรระบุค่าจ้างต่อชั่วโมง เงินเดือนฐานเป็นตัวเลือก'
                    : 'สำหรับการจ่ายเงินรายชั่วโมง'
                }
                type="info"
                showIcon
              />
            </Col>
          </Row>
        </>
      )}

      {/* Salary Calculation Info */}
      {workType === 'full-time' && (
        <Alert
          message="ข้อมูลเพิ่มเติม"
          description={
            <div>
              <p>
                <strong>พนักงาน Full-time:</strong>
              </p>
              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                <li>ทำงาน 40 ชั่วโมง/สัปดาห์ (8 ชม./วัน)</li>
                <li>มีสิทธิ์ได้ค่าล่วงเวลา (OT)</li>
                <li>ได้รับสวัสดิการครบ</li>
              </ul>
            </div>
          }
          type="info"
          showIcon
          style={{ marginTop: '24px' }}
        />
      )}

      {workType === 'part-time' && (
        <Alert
          message="ข้อมูลเพิ่มเติม"
          description={
            <div>
              <p>
                <strong>พนักงาน Part-time:</strong>
              </p>
              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                <li>ทำงานน้อยกว่า 40 ชั่วโมง/สัปดาห์</li>
                <li>คำนวณค่าจ้างตามชั่วโมงจริง</li>
                <li>สวัสดิการอาจแตกต่างจาก Full-time</li>
              </ul>
            </div>
          }
          type="info"
          showIcon
          style={{ marginTop: '24px' }}
        />
      )}

      {/* Future: Benefits Section (Optional - can be added later) */}
      <div style={{ marginTop: '24px', padding: '16px', background: '#f5f5f5', borderRadius: '4px' }}>
        <Text type="secondary">
          <strong>หมายเหตุ:</strong> สวัสดิการอื่นๆ เช่น ประกันสุขภาพ, กองทุนสำรองเลี้ยงชีพ สามารถเพิ่มได้ในภายหลัง
        </Text>
      </div>

      {/* Form Actions */}
      <Form.Item style={{ marginTop: '32px' }}>
        <Space>
          <Button onClick={onCancel}>ยกเลิก</Button>
          <Button onClick={onBack}>ย้อนกลับ</Button>
          <Button type="primary" htmlType="submit">
            ถัดไป
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};
