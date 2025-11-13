import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Button, Card, Col, Form, InputNumber, Row, Select, Space, Typography } from 'antd';
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
export const CompensationStep: FC<CompensationStepProps> = ({
  initialData,
  onNext,
  onBack,
  onCancel,
}) => {
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
      healthInsurance: initialData?.healthInsurance ?? false,
      lifeInsurance: initialData?.lifeInsurance ?? false,
      providentFundEnrolled: initialData?.providentFundEnrolled ?? false,
      providentFundEmployeeRate: initialData?.providentFundEmployeeRate || undefined,
      providentFundEmployerRate: initialData?.providentFundEmployerRate || undefined,
      annualLeave: initialData?.annualLeave || 0,
      sickLeave: initialData?.sickLeave || 0,
      otherBenefits: initialData?.otherBenefits || [],
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

      {/* Benefits Section */}
      <Card title="สวัสดิการ" style={{ marginTop: '24px' }}>
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              label="ประกันสุขภาพ"
              validateStatus={errors.healthInsurance ? 'error' : ''}
              help={errors.healthInsurance?.message}
            >
              <Controller
                name="healthInsurance"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    value={field.value ? 'true' : 'false'}
                    onChange={(v) => field.onChange(v === 'true')}
                  >
                    <Select.Option value="true">มี</Select.Option>
                    <Select.Option value="false">ไม่มี</Select.Option>
                  </Select>
                )}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              label="ประกันชีวิต"
              validateStatus={errors.lifeInsurance ? 'error' : ''}
              help={errors.lifeInsurance?.message}
            >
              <Controller
                name="lifeInsurance"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    value={field.value ? 'true' : 'false'}
                    onChange={(v) => field.onChange(v === 'true')}
                  >
                    <Select.Option value="true">มี</Select.Option>
                    <Select.Option value="false">ไม่มี</Select.Option>
                  </Select>
                )}
              />
            </Form.Item>
          </Col>
        </Row>

        <Title level={5} style={{ marginTop: '16px' }}>
          กองทุนสำรองเลี้ยงชีพ
        </Title>
        <Row gutter={16}>
          <Col xs={24}>
            <Form.Item
              label="เข้าร่วมกองทุน"
              validateStatus={errors.providentFundEnrolled ? 'error' : ''}
              help={errors.providentFundEnrolled?.message}
            >
              <Controller
                name="providentFundEnrolled"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    value={field.value ? 'true' : 'false'}
                    onChange={(v) => field.onChange(v === 'true')}
                  >
                    <Select.Option value="true">เข้าร่วม</Select.Option>
                    <Select.Option value="false">ไม่เข้าร่วม</Select.Option>
                  </Select>
                )}
              />
            </Form.Item>
          </Col>
          {watch('providentFundEnrolled') && (
            <>
              <Col xs={24} md={12}>
                <Form.Item
                  label="อัตราส่วนพนักงาน (%)"
                  validateStatus={errors.providentFundEmployeeRate ? 'error' : ''}
                  help={errors.providentFundEmployeeRate?.message}
                >
                  <Controller
                    name="providentFundEmployeeRate"
                    control={control}
                    render={({ field }) => (
                      <InputNumber
                        {...field}
                        style={{ width: '100%' }}
                        min={0}
                        max={100}
                        step={0.5}
                        addonAfter="%"
                      />
                    )}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  label="อัตราส่วนบริษัท (%)"
                  validateStatus={errors.providentFundEmployerRate ? 'error' : ''}
                  help={errors.providentFundEmployerRate?.message}
                >
                  <Controller
                    name="providentFundEmployerRate"
                    control={control}
                    render={({ field }) => (
                      <InputNumber
                        {...field}
                        style={{ width: '100%' }}
                        min={0}
                        max={100}
                        step={0.5}
                        addonAfter="%"
                      />
                    )}
                  />
                </Form.Item>
              </Col>
            </>
          )}
        </Row>

        <Title level={5} style={{ marginTop: '16px' }}>
          วันลา
        </Title>
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              label="วันลาพักร้อน (วัน/ปี)"
              validateStatus={errors.annualLeave ? 'error' : ''}
              help={errors.annualLeave?.message}
              required
            >
              <Controller
                name="annualLeave"
                control={control}
                render={({ field }) => (
                  <InputNumber
                    {...field}
                    style={{ width: '100%' }}
                    min={0}
                    step={1}
                    addonAfter="วัน"
                  />
                )}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              label="วันลาป่วย (วัน/ปี)"
              validateStatus={errors.sickLeave ? 'error' : ''}
              help={errors.sickLeave?.message}
              required
            >
              <Controller
                name="sickLeave"
                control={control}
                render={({ field }) => (
                  <InputNumber
                    {...field}
                    style={{ width: '100%' }}
                    min={0}
                    step={1}
                    addonAfter="วัน"
                  />
                )}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24}>
            <Form.Item
              label="สวัสดิการอื่นๆ"
              validateStatus={errors.otherBenefits ? 'error' : ''}
              help={errors.otherBenefits?.message}
              tooltip="พิมพ์และกด Enter เพื่อเพิ่มสวัสดิการ"
            >
              <Controller
                name="otherBenefits"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    mode="tags"
                    style={{ width: '100%' }}
                    placeholder="กดพิมพ์และ Enter เพื่อเพิ่มสวัสดิการ"
                    tokenSeparators={[',']}
                  />
                )}
              />
            </Form.Item>
          </Col>
        </Row>
      </Card>

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
