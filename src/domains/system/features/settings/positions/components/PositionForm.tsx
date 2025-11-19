import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Form, Input, InputNumber, Modal, Select, Switch } from 'antd';
import type { FC } from 'react';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useDepartments } from '../../departments/hooks/useDepartments';
import { type CreatePositionFormInput, CreatePositionSchema } from '../schemas/positionSchemas';
import type { Position } from '../types/positionTypes';

const TENANT_ID = 'default';

interface PositionFormProps {
  visible: boolean;
  position?: Position | null;
  onClose: () => void;
  onSubmit: (data: CreatePositionFormInput) => void;
  isLoading?: boolean;
}

export const PositionForm: FC<PositionFormProps> = ({
  visible,
  position,
  onClose,
  onSubmit,
  isLoading,
}) => {
  const { data: departments } = useDepartments(TENANT_ID, { isActive: true });

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreatePositionFormInput>({
    resolver: zodResolver(CreatePositionSchema),
    defaultValues: {
      currency: 'THB',
      isActive: true,
      isPublic: false,
      employmentTypes: ['permanent'],
      tenantId: TENANT_ID,
    },
  });

  useEffect(() => {
    if (position) {
      // Map Position to CreatePositionFormInput
      const formValues: CreatePositionFormInput = {
        code: position.code,
        title: position.title,
        titleEn: position.titleEn,
        level: position.level,
        category: position.category,
        departmentId: position.departmentId,
        departmentName: position.departmentName,
        departmentCode: position.departmentCode,
        minSalary: position.minSalary,
        maxSalary: position.maxSalary,
        currency: position.currency,
        description: position.description,
        responsibilities: position.responsibilities,
        requirements: position.requirements,
        employmentTypes: position.employmentTypes,
        isActive: position.isActive,
        isPublic: position.isPublic,
        tenantId: position.tenantId,
      };
      reset(formValues);
    } else {
      reset({
        code: '',
        title: '',
        titleEn: '',
        level: 'entry',
        category: 'technical',
        departmentId: '',
        departmentName: '',
        currency: 'THB',
        isActive: true,
        isPublic: false,
        employmentTypes: ['permanent'],
        tenantId: TENANT_ID,
      });
    }
  }, [position, reset]);

  return (
    <Modal
      title={position ? 'แก้ไขตำแหน่ง' : 'เพิ่มตำแหน่งใหม่'}
      open={visible}
      onCancel={onClose}
      footer={null}
      width={700}
    >
      <Form layout="vertical" onFinish={handleSubmit((data: CreatePositionFormInput) => onSubmit(data))}>
        <Form.Item
          label="รหัสตำแหน่ง"
          validateStatus={errors.code ? 'error' : ''}
          help={errors.code?.message}
          required
        >
          <Controller
            name="code"
            control={control}
            render={({ field }) => <Input {...field} placeholder="เช่น ENG-001" />}
          />
        </Form.Item>

        <Form.Item
          label="ชื่อตำแหน่ง (ไทย)"
          validateStatus={errors.title ? 'error' : ''}
          help={errors.title?.message}
          required
        >
          <Controller
            name="title"
            control={control}
            render={({ field }) => <Input {...field} placeholder="เช่น วิศวกรซอฟต์แวร์" />}
          />
        </Form.Item>

        <Form.Item
          label="ชื่อตำแหน่ง (อังกฤษ)"
          validateStatus={errors.titleEn ? 'error' : ''}
          help={errors.titleEn?.message}
          required
        >
          <Controller
            name="titleEn"
            control={control}
            render={({ field }) => <Input {...field} placeholder="e.g. Software Engineer" />}
          />
        </Form.Item>

        <Form.Item label="ระดับ" required>
          <Controller
            name="level"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                options={[
                  { label: 'Entry Level', value: 'entry' },
                  { label: 'Junior', value: 'junior' },
                  { label: 'Senior', value: 'senior' },
                  { label: 'Lead', value: 'lead' },
                  { label: 'Manager', value: 'manager' },
                  { label: 'Director', value: 'director' },
                  { label: 'Executive', value: 'executive' },
                ]}
              />
            )}
          />
        </Form.Item>

        <Form.Item label="หมวดหมู่" required>
          <Controller
            name="category"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                options={[
                  { label: 'Technical', value: 'technical' },
                  { label: 'Management', value: 'management' },
                  { label: 'Support', value: 'support' },
                  { label: 'Sales', value: 'sales' },
                  { label: 'Operations', value: 'operations' },
                ]}
              />
            )}
          />
        </Form.Item>

        <Form.Item label="แผนก" required>
          <Controller
            name="departmentId"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                placeholder="เลือกแผนก"
                options={departments?.map((d) => ({
                  label: `${d.code} - ${d.name}`,
                  value: d.id,
                }))}
                onChange={(value) => {
                  field.onChange(value);
                  const dept = departments?.find((d) => d.id === value);
                  if (dept) {
                    reset((prev) => ({ ...prev, departmentName: dept.name }));
                  }
                }}
              />
            )}
          />
        </Form.Item>

        <Form.Item label="เงินเดือนขั้นต่ำ (บาท)">
          <Controller
            name="minSalary"
            control={control}
            render={({ field }) => (
              <InputNumber
                {...field}
                min={0}
                style={{ width: '100%' }}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              />
            )}
          />
        </Form.Item>

        <Form.Item label="เงินเดือนสูงสุด (บาท)">
          <Controller
            name="maxSalary"
            control={control}
            render={({ field }) => (
              <InputNumber
                {...field}
                min={0}
                style={{ width: '100%' }}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              />
            )}
          />
        </Form.Item>

        <Form.Item label="คำอธิบาย">
          <Controller
            name="description"
            control={control}
            render={({ field }) => <Input.TextArea {...field} rows={3} />}
          />
        </Form.Item>

        <Form.Item label="ประเภทการจ้างงาน">
          <Controller
            name="employmentTypes"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                mode="multiple"
                options={[
                  { label: 'Permanent', value: 'permanent' },
                  { label: 'Contract', value: 'contract' },
                  { label: 'Probation', value: 'probation' },
                  { label: 'Intern', value: 'intern' },
                ]}
              />
            )}
          />
        </Form.Item>

        <Form.Item label="สถานะ">
          <Controller
            name="isActive"
            control={control}
            render={({ field }) => <Switch checked={field.value} onChange={field.onChange} />}
          />
        </Form.Item>

        <Form.Item label="แสดงในประกาศงาน">
          <Controller
            name="isPublic"
            control={control}
            render={({ field }) => <Switch checked={field.value} onChange={field.onChange} />}
          />
        </Form.Item>

        <Form.Item>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={onClose}>ยกเลิก</Button>
            <Button type="primary" htmlType="submit" loading={isLoading}>
              {position ? 'บันทึก' : 'สร้าง'}
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};
