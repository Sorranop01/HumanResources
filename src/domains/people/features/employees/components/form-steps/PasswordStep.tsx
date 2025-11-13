import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Button, Col, Form, Input, Radio, Row, Space, Typography } from 'antd';
import type { FC } from 'react';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import type { EmployeeFormInput } from '../../schemas';
import type { FinalStepData } from '../EmployeeFormWizard';

const { Title, Text } = Typography;

/**
 * Password Step Schema
 */
const PasswordStepSchema = z
  .object({
    passwordOption: z.enum(['auto', 'manual']),
    temporaryPassword: z.string().optional(),
    confirmPassword: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.passwordOption === 'manual') {
        return !!data.temporaryPassword && data.temporaryPassword.length >= 6;
      }
      return true;
    },
    {
      message: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร',
      path: ['temporaryPassword'],
    }
  )
  .refine(
    (data) => {
      if (data.passwordOption === 'manual') {
        return data.temporaryPassword === data.confirmPassword;
      }
      return true;
    },
    {
      message: 'รหัสผ่านไม่ตรงกัน',
      path: ['confirmPassword'],
    }
  );

type PasswordStepInput = z.infer<typeof PasswordStepSchema>;

interface PasswordStepProps {
  initialData?: Partial<EmployeeFormInput>;
  onNext: (data: Partial<EmployeeFormInput>) => void;
  onBack: () => void;
}

/**
 * Step 5: Password Setup
 * Allows HR to either auto-generate or manually set temporary password
 */
export const PasswordStep: FC<PasswordStepProps> = ({ initialData, onNext, onBack }) => {
  void initialData;
  const [_passwordOption, setPasswordOption] = useState<'auto' | 'manual'>('auto');

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<PasswordStepInput>({
    resolver: zodResolver(PasswordStepSchema),
    defaultValues: {
      passwordOption: 'auto',
      temporaryPassword: '',
      confirmPassword: '',
    },
  });

  const watchPasswordOption = watch('passwordOption');

  const onSubmit = (data: PasswordStepInput) => {
    // Pass password data to parent
    onNext({
      passwordOption: data.passwordOption,
      temporaryPassword: data.passwordOption === 'manual' ? data.temporaryPassword : undefined,
    } as FinalStepData);
  };

  return (
    <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
      <Title level={4}>รหัสผ่านเริ่มต้น</Title>
      <Text type="secondary">กำหนดรหัสผ่านชั่วคราวสำหรับพนักงานใหม่</Text>

      {/* Password Option */}
      <Row gutter={16} style={{ marginTop: '24px' }}>
        <Col span={24}>
          <Form.Item label="วิธีการตั้งรหัสผ่าน">
            <Controller
              name="passwordOption"
              control={control}
              render={({ field }) => (
                <Radio.Group
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    setPasswordOption(e.target.value);
                  }}
                >
                  <Space direction="vertical">
                    <Radio value="auto">
                      <strong>สร้างรหัสผ่านอัตโนมัติ</strong> (แนะนำ)
                      <br />
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        ระบบจะสร้างรหัสผ่านแบบสุ่มที่ปลอดภัย
                      </Text>
                    </Radio>
                    <Radio value="manual">
                      <strong>กำหนดรหัสผ่านเอง</strong>
                      <br />
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        ตั้งรหัสผ่านชั่วคราวด้วยตนเอง
                      </Text>
                    </Radio>
                  </Space>
                </Radio.Group>
              )}
            />
          </Form.Item>
        </Col>
      </Row>

      {/* Manual Password Input */}
      {watchPasswordOption === 'manual' && (
        <>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="รหัสผ่านชั่วคราว"
                required
                validateStatus={errors.temporaryPassword ? 'error' : ''}
                help={errors.temporaryPassword?.message}
              >
                <Controller
                  name="temporaryPassword"
                  control={control}
                  render={({ field }) => (
                    <Input.Password {...field} placeholder="อย่างน้อย 6 ตัวอักษร" minLength={6} />
                  )}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="ยืนยันรหัสผ่าน"
                required
                validateStatus={errors.confirmPassword ? 'error' : ''}
                help={errors.confirmPassword?.message}
              >
                <Controller
                  name="confirmPassword"
                  control={control}
                  render={({ field }) => (
                    <Input.Password {...field} placeholder="กรอกรหัสผ่านอีกครั้ง" />
                  )}
                />
              </Form.Item>
            </Col>
          </Row>

          <Alert
            message="คำแนะนำความปลอดภัย"
            description={
              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                <li>รหัสผ่านควรมีอย่างน้อย 8 ตัวอักษร</li>
                <li>ควรมีตัวพิมพ์ใหญ่และเล็กปนกัน</li>
                <li>ควรมีตัวเลขและอักขระพิเศษ (!@#$%)</li>
                <li>หลีกเลี่ยงการใช้วันเกิดหรือข้อมูลส่วนตัว</li>
              </ul>
            }
            type="info"
            showIcon
            style={{ marginTop: '16px' }}
          />
        </>
      )}

      {watchPasswordOption === 'auto' && (
        <Alert
          message="รหัสผ่านอัตโนมัติ"
          description={
            <>
              ระบบจะสร้างรหัสผ่านแบบสุ่มที่ปลอดภัย (ตัวอย่าง: Tempx7k2m9p4!)
              <br />
              <strong>สำคัญ:</strong> รหัสผ่านจะถูกส่งให้พนักงานผ่านอีเมล และพนักงานควร เปลี่ยนรหัสผ่านหลังจาก
              login ครั้งแรก
            </>
          }
          type="success"
          showIcon
          style={{ marginTop: '16px' }}
        />
      )}

      {/* Important Note */}
      <Alert
        message="ข้อควรระวัง"
        description="รหัสผ่านนี้เป็นรหัสผ่านชั่วคราว พนักงานควรเปลี่ยนรหัสผ่านทันทีหลังจาก login ครั้งแรก"
        type="warning"
        showIcon
        style={{ marginTop: '16px' }}
      />

      {/* Form Actions */}
      <Form.Item style={{ marginTop: '32px' }}>
        <Space>
          <Button onClick={onBack}>ย้อนกลับ</Button>
          <Button type="primary" htmlType="submit">
            สร้างพนักงาน
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};
