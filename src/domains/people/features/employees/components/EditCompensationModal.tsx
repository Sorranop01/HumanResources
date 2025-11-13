import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Form, InputNumber, Modal, Select, Space } from 'antd';
import type { FC } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { PaymentFrequencySchema } from '../schemas';

const EditSalarySchema = z.object({
  baseSalary: z.number().positive('เงินเดือนพื้นฐานต้องมากกว่า 0'),
  currency: z.string().default('THB'),
  paymentFrequency: PaymentFrequencySchema,
  hourlyRate: z.number().positive('อัตราค่าจ้างต่อชั่วโมงต้องมากกว่า 0').optional(),
});

export type EditSalaryInput = z.infer<typeof EditSalarySchema>;
type EditSalaryFormValues = (typeof EditSalarySchema)['_input'];
type PaymentFrequency = z.infer<typeof PaymentFrequencySchema>;

interface EditCompensationModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: EditSalaryInput) => Promise<void>;
  initialData: {
    baseSalary: number;
    currency: string;
    paymentFrequency: PaymentFrequency;
    hourlyRate?: number;
  };
  loading?: boolean;
}

export const EditCompensationModal: FC<EditCompensationModalProps> = ({
  open,
  onClose,
  onSubmit,
  initialData,
  loading = false,
}) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EditSalaryFormValues>({
    resolver: zodResolver(EditSalarySchema),
    defaultValues: initialData,
  });

  const handleFormSubmit = async (data: EditSalaryFormValues) => {
    const payload = EditSalarySchema.parse(data);
    await onSubmit(payload);
    reset();
    onClose();
  };

  const handleCancel = () => {
    reset();
    onClose();
  };

  return (
    <Modal title="แก้ไขข้อมูลเงินเดือน" open={open} onCancel={handleCancel} footer={null} width={600}>
      <Form layout="vertical" onFinish={handleSubmit(handleFormSubmit)}>
        <Form.Item
          label="เงินเดือนพื้นฐาน"
          validateStatus={errors.baseSalary ? 'error' : ''}
          help={errors.baseSalary?.message}
          required
        >
          <Controller
            name="baseSalary"
            control={control}
            render={({ field }) => (
              <InputNumber
                {...field}
                style={{ width: '100%' }}
                min={0}
                step={1000}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => value?.replace(/,/g, '') as unknown as number}
                addonAfter="บาท"
              />
            )}
          />
        </Form.Item>

        <Form.Item
          label="สกุลเงิน"
          validateStatus={errors.currency ? 'error' : ''}
          help={errors.currency?.message}
        >
          <Controller
            name="currency"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                options={[
                  { label: 'บาท (THB)', value: 'THB' },
                  { label: 'ดอลลาร์สหรัฐ (USD)', value: 'USD' },
                  { label: 'ยูโร (EUR)', value: 'EUR' },
                ]}
              />
            )}
          />
        </Form.Item>

        <Form.Item
          label="รอบการจ่าย"
          validateStatus={errors.paymentFrequency ? 'error' : ''}
          help={errors.paymentFrequency?.message}
          required
        >
          <Controller
            name="paymentFrequency"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                options={[
                  { label: 'รายเดือน', value: 'monthly' },
                  { label: 'ทุก 2 สัปดาห์', value: 'bi-weekly' },
                  { label: 'รายสัปดาห์', value: 'weekly' },
                  { label: 'รายชั่วโมง', value: 'hourly' },
                ]}
              />
            )}
          />
        </Form.Item>

        <Form.Item
          label="อัตราต่อชั่วโมง (ถ้ามี)"
          validateStatus={errors.hourlyRate ? 'error' : ''}
          help={errors.hourlyRate?.message}
        >
          <Controller
            name="hourlyRate"
            control={control}
            render={({ field }) => (
              <InputNumber
                {...field}
                style={{ width: '100%' }}
                min={0}
                step={10}
                addonAfter="บาท/ชม."
              />
            )}
          />
        </Form.Item>

        <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
          <Space>
            <Button onClick={handleCancel}>ยกเลิก</Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              บันทึก
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};
