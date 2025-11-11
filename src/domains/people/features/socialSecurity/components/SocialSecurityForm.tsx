/**
 * Social Security Form Component
 * Form for creating and editing social security records
 */

import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Col, DatePicker, Form, Input, InputNumber, Row, Select, Space } from 'antd';
import dayjs from 'dayjs';
import type { FC } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { type SocialSecurityFormInput, SocialSecurityFormSchema } from '../schemas';
import type { SocialSecurity } from '../types';

const { TextArea } = Input;

interface SocialSecurityFormProps {
  initialData?: SocialSecurity | undefined;
  onSubmit: (data: SocialSecurityFormInput) => void;
  onCancel?: () => void;
  loading?: boolean;
}

export const SocialSecurityForm: FC<SocialSecurityFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SocialSecurityFormInput>({
    resolver: zodResolver(SocialSecurityFormSchema),
    defaultValues: initialData
      ? {
          socialSecurityNumber: initialData.socialSecurityNumber,
          registrationDate: initialData.registrationDate.toISOString().split('T')[0],
          hospitalName: initialData.hospitalName,
          hospitalCode: initialData.hospitalCode,
          employeeContributionRate: initialData.employeeContributionRate * 100,
          employerContributionRate: initialData.employerContributionRate * 100,
          status: initialData.status,
          notes: initialData.notes,
        }
      : {
          employeeContributionRate: 5,
          employerContributionRate: 5,
          status: 'active',
        },
  });

  const handleFormSubmit = (data: SocialSecurityFormInput) => {
    const submitData = {
      ...data,
      employeeContributionRate: data.employeeContributionRate / 100,
      employerContributionRate: data.employerContributionRate / 100,
    };
    onSubmit(submitData);
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
                  max={100}
                  step={0.1}
                  style={{ width: '100%' }}
                  addonAfter="%"
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
                  max={100}
                  step={0.1}
                  style={{ width: '100%' }}
                  addonAfter="%"
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
