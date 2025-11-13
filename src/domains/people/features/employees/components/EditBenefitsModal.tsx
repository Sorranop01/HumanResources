import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Card, Form, InputNumber, Modal, Select, Space } from 'antd';
import type { FC } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

const EditBenefitsSchema = z.object({
  healthInsurance: z.boolean(),
  lifeInsurance: z.boolean(),
  providentFund: z.object({
    isEnrolled: z.boolean(),
    employeeContributionRate: z.number().min(0).max(100).optional(),
    employerContributionRate: z.number().min(0).max(100).optional(),
  }),
  annualLeave: z.number().min(0),
  sickLeave: z.number().min(0),
  otherBenefits: z.array(z.string()).optional(),
});

export type EditBenefitsInput = z.infer<typeof EditBenefitsSchema>;

interface EditBenefitsModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: EditBenefitsInput) => Promise<void>;
  initialData: {
    healthInsurance: boolean;
    lifeInsurance: boolean;
    providentFund: {
      isEnrolled: boolean;
      employeeContributionRate?: number;
      employerContributionRate?: number;
    };
    annualLeave: number;
    sickLeave: number;
    otherBenefits?: string[];
  };
  loading?: boolean;
}

export const EditBenefitsModal: FC<EditBenefitsModalProps> = ({
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
    watch,
  } = useForm<EditBenefitsInput>({
    resolver: zodResolver(EditBenefitsSchema),
    defaultValues: initialData,
  });

  const providentFundEnrolled = watch('providentFund.isEnrolled');

  const handleFormSubmit = async (data: EditBenefitsInput) => {
    await onSubmit(data);
    reset();
    onClose();
  };

  const handleCancel = () => {
    reset();
    onClose();
  };

  return (
    <Modal title="แก้ไขข้อมูลสวัสดิการ" open={open} onCancel={handleCancel} footer={null} width={700}>
      <Form layout="vertical" onFinish={handleSubmit(handleFormSubmit)}>
        <Form.Item
          label="ประกันสุขภาพ"
          validateStatus={errors.healthInsurance ? 'error' : ''}
          help={errors.healthInsurance?.message}
          required
        >
          <Controller
            name="healthInsurance"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                options={[
                  { label: 'มี', value: true },
                  { label: 'ไม่มี', value: false },
                ]}
              />
            )}
          />
        </Form.Item>

        <Form.Item
          label="ประกันชีวิต"
          validateStatus={errors.lifeInsurance ? 'error' : ''}
          help={errors.lifeInsurance?.message}
          required
        >
          <Controller
            name="lifeInsurance"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                options={[
                  { label: 'มี', value: true },
                  { label: 'ไม่มี', value: false },
                ]}
              />
            )}
          />
        </Form.Item>

        <Card title="กองทุนสำรองเลี้ยงชีพ" size="small" style={{ marginBottom: 16 }}>
          <Form.Item
            label="เข้าร่วม"
            validateStatus={errors.providentFund?.isEnrolled ? 'error' : ''}
            help={errors.providentFund?.isEnrolled?.message}
            required
          >
            <Controller
              name="providentFund.isEnrolled"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  options={[
                    { label: 'เข้าร่วม', value: true },
                    { label: 'ไม่เข้าร่วม', value: false },
                  ]}
                />
              )}
            />
          </Form.Item>

          {providentFundEnrolled && (
            <>
              <Form.Item
                label="อัตราส่วนพนักงาน (%)"
                validateStatus={errors.providentFund?.employeeContributionRate ? 'error' : ''}
                help={errors.providentFund?.employeeContributionRate?.message}
              >
                <Controller
                  name="providentFund.employeeContributionRate"
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

              <Form.Item
                label="อัตราส่วนบริษัท (%)"
                validateStatus={errors.providentFund?.employerContributionRate ? 'error' : ''}
                help={errors.providentFund?.employerContributionRate?.message}
              >
                <Controller
                  name="providentFund.employerContributionRate"
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
            </>
          )}
        </Card>

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
              <InputNumber {...field} style={{ width: '100%' }} min={0} step={1} addonAfter="วัน" />
            )}
          />
        </Form.Item>

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
              <InputNumber {...field} style={{ width: '100%' }} min={0} step={1} addonAfter="วัน" />
            )}
          />
        </Form.Item>

        <Form.Item
          label="สวัสดิการอื่นๆ"
          validateStatus={errors.otherBenefits ? 'error' : ''}
          help={errors.otherBenefits?.message}
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
