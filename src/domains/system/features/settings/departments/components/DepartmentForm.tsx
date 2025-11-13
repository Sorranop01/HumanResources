import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Form, Input, InputNumber, Modal, message, Select, Switch } from 'antd';
import type { FC } from 'react';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useCreateDepartment } from '../hooks/useCreateDepartment';
import { useDepartments } from '../hooks/useDepartments';
import { useUpdateDepartment } from '../hooks/useUpdateDepartment';
import {
  type CreateDepartmentFormInput,
  CreateDepartmentSchema,
} from '../schemas/departmentSchemas';
import type { Department } from '../types/departmentTypes';

const TENANT_ID = 'default';
const USER_ID = 'system'; // TODO: Get from auth

interface DepartmentFormProps {
  visible: boolean;
  department?: Department | null;
  onClose: () => void;
}

export const DepartmentForm: FC<DepartmentFormProps> = ({ visible, department, onClose }) => {
  const { data: departments } = useDepartments(TENANT_ID, { isActive: true });
  const { mutate: createDepartment, isPending: isCreating } = useCreateDepartment();
  const { mutate: updateDepartment, isPending: isUpdating } = useUpdateDepartment();

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<CreateDepartmentFormInput>({
    resolver: zodResolver(CreateDepartmentSchema),
    defaultValues: {
      code: '',
      name: '',
      nameEn: '',
      level: 1,
      path: '/',
      isActive: true,
      tenantId: TENANT_ID,
    },
  });

  const _parentDepartmentId = watch('parentDepartmentId');

  useEffect(() => {
    if (department) {
      reset({
        code: department.code,
        name: department.name,
        nameEn: department.nameEn,
        parentDepartmentId: department.parentDepartmentId,
        level: department.level,
        path: department.path,
        managerId: department.managerId,
        managerName: department.managerName,
        costCenter: department.costCenter,
        budgetAmount: department.budgetAmount,
        isActive: department.isActive,
        description: department.description,
        tenantId: department.tenantId,
      });
    } else {
      reset({
        code: '',
        name: '',
        nameEn: '',
        level: 1,
        path: '/',
        isActive: true,
        tenantId: TENANT_ID,
      });
    }
  }, [department, reset]);

  const onSubmit = (data: CreateDepartmentFormInput) => {
    if (department) {
      updateDepartment(
        {
          id: department.id,
          input: data,
          userId: USER_ID,
        },
        {
          onSuccess: () => {
            message.success('อัปเดตแผนกสำเร็จ');
            onClose();
          },
          onError: (error) => {
            message.error(error.message || 'เกิดข้อผิดพลาด');
          },
        }
      );
    } else {
      createDepartment(
        {
          input: data,
          userId: USER_ID,
        },
        {
          onSuccess: () => {
            message.success('สร้างแผนกสำเร็จ');
            onClose();
          },
          onError: (error) => {
            message.error(error.message || 'เกิดข้อผิดพลาด');
          },
        }
      );
    }
  };

  return (
    <Modal
      title={department ? 'แก้ไขแผนก' : 'เพิ่มแผนกใหม่'}
      open={visible}
      onCancel={onClose}
      footer={null}
      width={600}
    >
      <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
        <Form.Item
          label="รหัสแผนก"
          validateStatus={errors.code ? 'error' : ''}
          help={errors.code?.message}
          required
        >
          <Controller
            name="code"
            control={control}
            render={({ field }) => <Input {...field} placeholder="เช่น HR, IT, FIN" />}
          />
        </Form.Item>

        <Form.Item
          label="ชื่อแผนก (ไทย)"
          validateStatus={errors.name ? 'error' : ''}
          help={errors.name?.message}
          required
        >
          <Controller
            name="name"
            control={control}
            render={({ field }) => <Input {...field} placeholder="เช่น ฝ่ายทรัพยากรบุคคล" />}
          />
        </Form.Item>

        <Form.Item
          label="ชื่อแผนก (อังกฤษ)"
          validateStatus={errors.nameEn ? 'error' : ''}
          help={errors.nameEn?.message}
          required
        >
          <Controller
            name="nameEn"
            control={control}
            render={({ field }) => <Input {...field} placeholder="e.g. Human Resources" />}
          />
        </Form.Item>

        <Form.Item label="แผนกหลัก">
          <Controller
            name="parentDepartmentId"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                placeholder="เลือกแผนกหลัก (ถ้ามี)"
                allowClear
                options={departments
                  ?.filter((d) => d.id !== department?.id)
                  .map((d) => ({
                    label: `${d.code} - ${d.name}`,
                    value: d.id,
                  }))}
              />
            )}
          />
        </Form.Item>

        <Form.Item
          label="ระดับ"
          validateStatus={errors.level ? 'error' : ''}
          help={errors.level?.message}
          required
        >
          <Controller
            name="level"
            control={control}
            render={({ field }) => (
              <InputNumber {...field} min={1} max={10} style={{ width: '100%' }} />
            )}
          />
        </Form.Item>

        <Form.Item
          label="Path"
          validateStatus={errors.path ? 'error' : ''}
          help={errors.path?.message}
          required
        >
          <Controller
            name="path"
            control={control}
            render={({ field }) => <Input {...field} placeholder="/HR/Recruitment" />}
          />
        </Form.Item>

        <Form.Item label="รหัสศูนย์ต้นทุน">
          <Controller
            name="costCenter"
            control={control}
            render={({ field }) => <Input {...field} placeholder="เช่น CC-001" />}
          />
        </Form.Item>

        <Form.Item label="งบประมาณ (บาท)">
          <Controller
            name="budgetAmount"
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

        <Form.Item label="สถานะ">
          <Controller
            name="isActive"
            control={control}
            render={({ field }) => <Switch checked={field.value} onChange={field.onChange} />}
          />
        </Form.Item>

        <Form.Item>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={onClose}>ยกเลิก</Button>
            <Button type="primary" htmlType="submit" loading={isCreating || isUpdating}>
              {department ? 'บันทึก' : 'สร้าง'}
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};
