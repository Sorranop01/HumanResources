/**
 * EmployeeForm - Reusable form component for creating and editing employees
 * Uses react-hook-form + Zod for validation
 */

import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Col, DatePicker, Form, Input, InputNumber, Row, Select } from 'antd';
import dayjs from 'dayjs';
import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { EmployeeStatusSchema } from '@/domains/people/features/employees/schemas';
import type { Employee } from '@/domains/people/features/employees/types';
import { DepartmentSelect } from '@/domains/system/features/settings/departments/components/DepartmentSelect';
import { PositionSelect } from '@/domains/system/features/settings/positions/components/PositionSelect';

const { Option } = Select;

const phonePattern = /^[0-9]{9,10}$/;

const QuickEmployeeFormSchema = z.object({
  employeeCode: z.string().min(1, 'กรุณากรอกรหัสพนักงาน'),
  status: EmployeeStatusSchema,
  firstName: z.string().min(1, 'กรุณากรอกชื่อ (อังกฤษ)'),
  lastName: z.string().min(1, 'กรุณากรอกนามสกุล (อังกฤษ)'),
  thaiFirstName: z.string().min(1, 'กรุณากรอกชื่อ (ไทย)'),
  thaiLastName: z.string().min(1, 'กรุณากรอกนามสกุล (ไทย)'),
  email: z.string().email('รูปแบบอีเมลไม่ถูกต้อง'),
  phoneNumber: z.string().regex(phonePattern, 'เบอร์โทรศัพท์ต้องเป็นตัวเลข 9-10 หลัก'),
  dateOfBirth: z.string().min(1, 'กรุณาเลือกวันเกิด'),
  hireDate: z.string().min(1, 'กรุณาเลือกวันเริ่มงาน'),
  position: z.string().min(1, 'กรุณาเลือกตำแหน่ง'),
  department: z.string().min(1, 'กรุณาเลือกแผนก'),
  salary: z.number().nonnegative('เงินเดือนต้องไม่ติดลบ'),
  photoURL: z.string().url('URL รูปภาพไม่ถูกต้อง').optional().or(z.literal('')),
});

export type EmployeeQuickFormValues = z.infer<typeof QuickEmployeeFormSchema>;

interface EmployeeFormProps {
  initialData?: Employee | undefined;
  onSubmit: (data: EmployeeQuickFormValues) => void | Promise<void>;
  loading?: boolean | undefined;
  submitText?: string | undefined;
}

export const EmployeeForm: FC<EmployeeFormProps> = ({
  initialData,
  onSubmit,
  loading = false,
  submitText = 'บันทึก',
}) => {
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string | undefined>(
    initialData?.department
  );

  const defaultValues: EmployeeQuickFormValues = initialData
    ? {
        employeeCode: initialData.employeeCode,
        status: initialData.status,
        firstName: initialData.firstName,
        lastName: initialData.lastName,
        thaiFirstName: initialData.thaiFirstName,
        thaiLastName: initialData.thaiLastName,
        email: initialData.email,
        phoneNumber: initialData.phoneNumber,
        dateOfBirth: dayjs(initialData.dateOfBirth).format('YYYY-MM-DD'),
        hireDate: dayjs(initialData.hireDate).format('YYYY-MM-DD'),
        position: initialData.position,
        department: initialData.department,
        salary: initialData.salary.baseSalary,
        photoURL: initialData.photoURL ?? '',
      }
    : {
        employeeCode: '',
        status: 'active',
        firstName: '',
        lastName: '',
        thaiFirstName: '',
        thaiLastName: '',
        email: '',
        phoneNumber: '',
        dateOfBirth: dayjs().format('YYYY-MM-DD'),
        hireDate: dayjs().format('YYYY-MM-DD'),
        position: '',
        department: '',
        salary: 0,
        photoURL: '',
      };

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EmployeeQuickFormValues>({
    resolver: zodResolver(QuickEmployeeFormSchema),
    defaultValues,
  });

  // Reset form when initialData changes
  useEffect(() => {
    if (initialData) {
      reset({
        employeeCode: initialData.employeeCode,
        status: initialData.status,
        firstName: initialData.firstName,
        lastName: initialData.lastName,
        thaiFirstName: initialData.thaiFirstName,
        thaiLastName: initialData.thaiLastName,
        email: initialData.email,
        phoneNumber: initialData.phoneNumber,
        dateOfBirth: dayjs(initialData.dateOfBirth).format('YYYY-MM-DD'),
        hireDate: dayjs(initialData.hireDate).format('YYYY-MM-DD'),
        position: initialData.position,
        department: initialData.department,
        salary: initialData.salary.baseSalary,
        photoURL: initialData.photoURL ?? '',
      });
      setSelectedDepartmentId(initialData.department);
    }
  }, [initialData, reset]);

  const handleFormSubmit = handleSubmit(onSubmit);

  return (
    <Form
      layout="vertical"
      onFinish={(e) => {
        void handleFormSubmit(e);
      }}
    >
      <Row gutter={16}>
        {/* Employee Code */}
        <Col xs={24} sm={12} md={8}>
          <Form.Item
            label="รหัสพนักงาน"
            validateStatus={errors.employeeCode ? 'error' : ''}
            help={errors.employeeCode?.message}
            required
          >
            <Controller
              name="employeeCode"
              control={control}
              render={({ field }) => <Input {...field} placeholder="เช่น EMP001" />}
            />
          </Form.Item>
        </Col>

        {/* Status */}
        <Col xs={24} sm={12} md={8}>
          <Form.Item
            label="สถานะ"
            validateStatus={errors.status ? 'error' : ''}
            help={errors.status?.message}
            required
          >
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select {...field} placeholder="เลือกสถานะ">
                  <Option value="active">ทำงานอยู่</Option>
                  <Option value="on-leave">ลา</Option>
                  <Option value="resigned">ลาออก</Option>
                  <Option value="terminated">เลิกจ้าง</Option>
                </Select>
              )}
            />
          </Form.Item>
        </Col>

        {/* English First Name */}
        <Col xs={24} sm={12} md={8}>
          <Form.Item
            label="ชื่อ (อังกฤษ)"
            validateStatus={errors.firstName ? 'error' : ''}
            help={errors.firstName?.message}
            required
          >
            <Controller
              name="firstName"
              control={control}
              render={({ field }) => <Input {...field} placeholder="John" />}
            />
          </Form.Item>
        </Col>

        {/* English Last Name */}
        <Col xs={24} sm={12} md={8}>
          <Form.Item
            label="นามสกุล (อังกฤษ)"
            validateStatus={errors.lastName ? 'error' : ''}
            help={errors.lastName?.message}
            required
          >
            <Controller
              name="lastName"
              control={control}
              render={({ field }) => <Input {...field} placeholder="Doe" />}
            />
          </Form.Item>
        </Col>

        {/* Thai First Name */}
        <Col xs={24} sm={12} md={8}>
          <Form.Item
            label="ชื่อ (ไทย)"
            validateStatus={errors.thaiFirstName ? 'error' : ''}
            help={errors.thaiFirstName?.message}
            required
          >
            <Controller
              name="thaiFirstName"
              control={control}
              render={({ field }) => <Input {...field} placeholder="สมชาย" />}
            />
          </Form.Item>
        </Col>

        {/* Thai Last Name */}
        <Col xs={24} sm={12} md={8}>
          <Form.Item
            label="นามสกุล (ไทย)"
            validateStatus={errors.thaiLastName ? 'error' : ''}
            help={errors.thaiLastName?.message}
            required
          >
            <Controller
              name="thaiLastName"
              control={control}
              render={({ field }) => <Input {...field} placeholder="ใจดี" />}
            />
          </Form.Item>
        </Col>

        {/* Email */}
        <Col xs={24} sm={12} md={8}>
          <Form.Item
            label="อีเมล"
            validateStatus={errors.email ? 'error' : ''}
            help={errors.email?.message}
            required
          >
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <Input {...field} type="email" placeholder="john@example.com" />
              )}
            />
          </Form.Item>
        </Col>

        {/* Phone Number */}
        <Col xs={24} sm={12} md={8}>
          <Form.Item
            label="เบอร์โทรศัพท์"
            validateStatus={errors.phoneNumber ? 'error' : ''}
            help={errors.phoneNumber?.message}
            required
          >
            <Controller
              name="phoneNumber"
              control={control}
              render={({ field }) => <Input {...field} placeholder="0812345678" maxLength={10} />}
            />
          </Form.Item>
        </Col>

        {/* Date of Birth */}
        <Col xs={24} sm={12} md={8}>
          <Form.Item
            label="วันเกิด"
            validateStatus={errors.dateOfBirth ? 'error' : ''}
            help={errors.dateOfBirth?.message}
            required
          >
            <Controller
              name="dateOfBirth"
              control={control}
              render={({ field }) => (
                <DatePicker
                  {...field}
                  value={field.value ? dayjs(field.value) : null}
                  onChange={(date) => {
                    field.onChange(date ? date.format('YYYY-MM-DD') : '');
                  }}
                  format="DD/MM/YYYY"
                  style={{ width: '100%' }}
                  placeholder="เลือกวันเกิด"
                />
              )}
            />
          </Form.Item>
        </Col>

        {/* Hire Date */}
        <Col xs={24} sm={12} md={8}>
          <Form.Item
            label="วันเริ่มงาน"
            validateStatus={errors.hireDate ? 'error' : ''}
            help={errors.hireDate?.message}
            required
          >
            <Controller
              name="hireDate"
              control={control}
              render={({ field }) => (
                <DatePicker
                  {...field}
                  value={field.value ? dayjs(field.value) : null}
                  onChange={(date) => {
                    field.onChange(date ? date.format('YYYY-MM-DD') : '');
                  }}
                  format="DD/MM/YYYY"
                  style={{ width: '100%' }}
                  placeholder="เลือกวันเริ่มงาน"
                />
              )}
            />
          </Form.Item>
        </Col>

        {/* Department */}
        <Col xs={24} sm={12} md={8}>
          <Form.Item
            label="แผนก"
            validateStatus={errors.department ? 'error' : ''}
            help={errors.department?.message}
            required
          >
            <Controller
              name="department"
              control={control}
              render={({ field }) => (
                <DepartmentSelect
                  value={field.value}
                  onChange={(value) => {
                    field.onChange(value);
                    setSelectedDepartmentId(value);
                  }}
                  placeholder="เลือกแผนก"
                />
              )}
            />
          </Form.Item>
        </Col>

        {/* Position */}
        <Col xs={24} sm={12} md={8}>
          <Form.Item
            label="ตำแหน่ง"
            validateStatus={errors.position ? 'error' : ''}
            help={errors.position?.message}
            required
          >
            <Controller
              name="position"
              control={control}
              render={({ field }) => (
                <PositionSelect
                  value={field.value}
                  onChange={(value) => field.onChange(value)}
                  {...(selectedDepartmentId ? { departmentId: selectedDepartmentId } : {})}
                  placeholder="เลือกตำแหน่ง"
                />
              )}
            />
          </Form.Item>
        </Col>

        {/* Salary */}
        <Col xs={24} sm={12} md={8}>
          <Form.Item
            label="เงินเดือน (บาท)"
            validateStatus={errors.salary ? 'error' : ''}
            help={errors.salary?.message}
            required
          >
            <Controller
              name="salary"
              control={control}
              render={({ field }) => (
                <InputNumber
                  {...field}
                  style={{ width: '100%' }}
                  min={0}
                  step={0.01}
                  placeholder="15000"
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => Number(value?.replace(/,/g, '') ?? 0)}
                />
              )}
            />
          </Form.Item>
        </Col>

        {/* Photo URL (Optional) */}
        <Col xs={24}>
          <Form.Item
            label="URL รูปภาพ (ไม่บังคับ)"
            validateStatus={errors.photoURL ? 'error' : ''}
            help={errors.photoURL?.message}
          >
            <Controller
              name="photoURL"
              control={control}
              render={({ field }) => (
                <Input {...field} placeholder="https://example.com/photo.jpg" />
              )}
            />
          </Form.Item>
        </Col>
      </Row>

      {/* Submit Button */}
      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading} size="large">
          {submitText}
        </Button>
      </Form.Item>
    </Form>
  );
};
