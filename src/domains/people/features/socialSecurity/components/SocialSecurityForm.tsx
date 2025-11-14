/**
 * Social Security Form Component
 * Form for creating and editing social security records
 */

import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Col, DatePicker, Form, Input, InputNumber, Row, Select, Space } from 'antd';
import dayjs from 'dayjs';
import type { FC } from 'react';
import { Controller, useForm } from 'react-hook-form';
import type { z } from 'zod';
import { SocialSecurityFormSchema } from '../schemas';
import type { SocialSecurity } from '../types';

const { TextArea } = Input;

interface SocialSecurityFormProps {
  initialData?: SocialSecurity | undefined;
  onSubmit: (data: {
    socialSecurityNumber: string;
    registrationDate: string;
    hospitalName: string;
    hospitalCode?: string;
    employeeContributionRate: number;
    employerContributionRate: number;
    status: 'active' | 'inactive' | 'suspended';
    notes?: string;
  }) => void;
  onCancel?: () => void;
  loading?: boolean;
}

export const SocialSecurityForm: FC<SocialSecurityFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  type SocialSecurityFormValues = z.input<typeof SocialSecurityFormSchema>;

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SocialSecurityFormValues>({
    resolver: zodResolver(SocialSecurityFormSchema),
    defaultValues: initialData
      ? {
          socialSecurityNumber: initialData.socialSecurityNumber,
          registrationDate: initialData.registrationDate.toISOString().split('T')[0],
          hospitalName: initialData.hospitalName,
          hospitalCode: initialData.hospitalCode ?? undefined,
          employeeContributionRate: initialData.employeeContributionRate,
          employerContributionRate: initialData.employerContributionRate,
          status: initialData.status,
          notes: initialData.notes ?? undefined,
        }
      : {
          employeeContributionRate: 0.05,
          employerContributionRate: 0.05,
          status: 'active',
        },
  });

  const percentFormatter = (value?: string | number) => {
    if (value === undefined || value === null || value === '') {
      return '';
    }
    const numeric = typeof value === 'number' ? value : Number(value);
    if (Number.isNaN(numeric)) {
      return '';
    }
    return `${(numeric * 100).toFixed(2)}%`;
  };

  const percentParser = (value?: string) => {
    if (!value) return 0;
    const cleaned = value.replace('%', '');
    const numeric = Number(cleaned);
    if (Number.isNaN(numeric)) {
      return 0;
    }
    return numeric / 100;
  };

  const handleFormSubmit = (data: SocialSecurityFormValues) => {
    const parsed = SocialSecurityFormSchema.parse(data);
    onSubmit(parsed);
  };

  return (
    <Form layout="vertical" onFinish={handleSubmit(handleFormSubmit)}>
      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item
            label="เลขประกันสังคม"
            required
            validateStatus={errors.socialSecurityNumber ? 'error' : ''}
            help={errors.socialSecurityNumber?.message}
          >
            <Controller
              name="socialSecurityNumber"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="1234567890123"
                  maxLength={13}
                  disabled={!!initialData}
                />
              )}
            />
          </Form.Item>
        </Col>

        <Col xs={24} sm={12}>
          <Form.Item
            label="วันที่เริ่มจ่ายประกันสังคม"
            required
            validateStatus={errors.registrationDate ? 'error' : ''}
            help={errors.registrationDate?.message}
          >
            <Controller
              name="registrationDate"
              control={control}
              render={({ field }) => (
                <DatePicker
                  {...field}
                  value={field.value ? dayjs(field.value) : null}
                  onChange={(date) => {
                    field.onChange(date ? date.format('YYYY-MM-DD') : '');
                  }}
                  format="DD/MM/YYYY"
                  placeholder="เลือกวันที่"
                  style={{ width: '100%' }}
                />
              )}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} sm={16}>
          <Form.Item
            label="โรงพยาบาลประจำ"
            required
            validateStatus={errors.hospitalName ? 'error' : ''}
            help={errors.hospitalName?.message}
          >
            <Controller
              name="hospitalName"
              control={control}
              render={({ field }) => <Input {...field} placeholder="โรงพยาบาลกรุงเทพ" />}
            />
          </Form.Item>
        </Col>

        <Col xs={24} sm={8}>
          <Form.Item
            label="รหัสโรงพยาบาล (ถ้ามี)"
            validateStatus={errors.hospitalCode ? 'error' : ''}
            help={errors.hospitalCode?.message}
          >
            <Controller
              name="hospitalCode"
              control={control}
              render={({ field }) => <Input {...field} placeholder="10111" />}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} sm={8}>
          <Form.Item
            label="อัตราเงินสมทบพนักงาน (%)"
            required
            validateStatus={errors.employeeContributionRate ? 'error' : ''}
            help={errors.employeeContributionRate?.message}
          >
            <Controller
              name="employeeContributionRate"
              control={control}
              render={({ field }) => (
                <InputNumber
                  {...field}
                  min={0}
                  max={1}
                  step={0.01}
                  style={{ width: '100%' }}
                  formatter={percentFormatter}
                  parser={percentParser}
                />
              )}
            />
          </Form.Item>
        </Col>

        <Col xs={24} sm={8}>
          <Form.Item
            label="อัตราเงินสมทบนายจ้าง (%)"
            required
            validateStatus={errors.employerContributionRate ? 'error' : ''}
            help={errors.employerContributionRate?.message}
          >
            <Controller
              name="employerContributionRate"
              control={control}
              render={({ field }) => (
                <InputNumber
                  {...field}
                  min={0}
                  max={1}
                  step={0.01}
                  style={{ width: '100%' }}
                  formatter={percentFormatter}
                  parser={percentParser}
                />
              )}
            />
          </Form.Item>
        </Col>

        <Col xs={24} sm={8}>
          <Form.Item
            label="สถานะ"
            required
            validateStatus={errors.status ? 'error' : ''}
            help={errors.status?.message}
          >
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select {...field} style={{ width: '100%' }}>
                  <Select.Option value="active">ใช้งาน</Select.Option>
                  <Select.Option value="inactive">ไม่ใช้งาน</Select.Option>
                  <Select.Option value="suspended">ระงับ</Select.Option>
                </Select>
              )}
            />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        label="หมายเหตุ"
        validateStatus={errors.notes ? 'error' : ''}
        help={errors.notes?.message}
      >
        <Controller
          name="notes"
          control={control}
          render={({ field }) => <TextArea {...field} rows={3} placeholder="หมายเหตุเพิ่มเติม (ถ้ามี)" />}
        />
      </Form.Item>

      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit" loading={loading}>
            {initialData ? 'บันทึกการแก้ไข' : 'สร้างข้อมูล'}
          </Button>
          {onCancel && (
            <Button onClick={onCancel} disabled={loading}>
              ยกเลิก
            </Button>
          )}
        </Space>
      </Form.Item>
    </Form>
  );
};
