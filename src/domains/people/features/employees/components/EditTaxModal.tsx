import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Card, Form, Input, InputNumber, Modal, Select, Space } from 'antd';
import type { FC } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';

const TaxReliefSchema = z.object({
  type: z.string().min(1, 'ประเภทต้องไม่ว่าง'),
  amount: z.number().min(0, 'จำนวนเงินต้องมากกว่าหรือเท่ากับ 0'),
});

const EditTaxSchema = z.object({
  taxId: z.string().optional(),
  withholdingTax: z.boolean(),
  withholdingRate: z.number().min(0).max(100).optional(),
  taxReliefs: z.array(TaxReliefSchema).optional(),
});

export type EditTaxInput = z.infer<typeof EditTaxSchema>;

interface EditTaxModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: EditTaxInput) => Promise<void>;
  initialData: {
    taxId?: string;
    withholdingTax: boolean;
    withholdingRate?: number;
    taxReliefs?: Array<{ type: string; amount: number }>;
  };
  loading?: boolean;
}

export const EditTaxModal: FC<EditTaxModalProps> = ({
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
  } = useForm<EditTaxInput>({
    resolver: zodResolver(EditTaxSchema),
    defaultValues: initialData,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'taxReliefs',
  });

  const withholdingTax = watch('withholdingTax');

  const handleFormSubmit = async (data: EditTaxInput) => {
    await onSubmit(data);
    reset();
    onClose();
  };

  const handleCancel = () => {
    reset();
    onClose();
  };

  return (
    <Modal title="แก้ไขข้อมูลภาษี" open={open} onCancel={handleCancel} footer={null} width={700}>
      <Form layout="vertical" onFinish={handleSubmit(handleFormSubmit)}>
        <Form.Item
          label="เลขประจำตัวผู้เสียภาษี"
          validateStatus={errors.taxId ? 'error' : ''}
          help={errors.taxId?.message}
        >
          <Controller
            name="taxId"
            control={control}
            render={({ field }) => (
              <Input {...field} placeholder="เช่น 1234567890123" maxLength={13} />
            )}
          />
        </Form.Item>

        <Form.Item
          label="หัก ณ ที่จ่าย"
          validateStatus={errors.withholdingTax ? 'error' : ''}
          help={errors.withholdingTax?.message}
          required
        >
          <Controller
            name="withholdingTax"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                options={[
                  { label: 'หัก', value: true },
                  { label: 'ไม่หัก', value: false },
                ]}
              />
            )}
          />
        </Form.Item>

        {withholdingTax && (
          <Form.Item
            label="อัตราการหัก (%)"
            validateStatus={errors.withholdingRate ? 'error' : ''}
            help={errors.withholdingRate?.message}
          >
            <Controller
              name="withholdingRate"
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
        )}

        <Form.Item label="ลดหย่อนภาษี">
          {fields.map((field, index) => (
            <Card key={field.id} size="small" style={{ marginBottom: 8 }}>
              <Space.Compact style={{ width: '100%' }}>
                <Form.Item
                  style={{ marginBottom: 0, flex: 1 }}
                  validateStatus={errors.taxReliefs?.[index]?.type ? 'error' : ''}
                >
                  <Controller
                    name={`taxReliefs.${index}.type`}
                    control={control}
                    render={({ field }) => (
                      <Input {...field} placeholder="ประเภท เช่น ค่าลดหย่อนส่วนตัว" />
                    )}
                  />
                </Form.Item>

                <Form.Item
                  style={{ marginBottom: 0, width: 200 }}
                  validateStatus={errors.taxReliefs?.[index]?.amount ? 'error' : ''}
                >
                  <Controller
                    name={`taxReliefs.${index}.amount`}
                    control={control}
                    render={({ field }) => (
                      <InputNumber
                        {...field}
                        style={{ width: '100%' }}
                        min={0}
                        step={1000}
                        addonAfter="บาท"
                      />
                    )}
                  />
                </Form.Item>

                <Button danger icon={<DeleteOutlined />} onClick={() => remove(index)} />
              </Space.Compact>
            </Card>
          ))}

          <Button
            type="dashed"
            onClick={() => append({ type: '', amount: 0 })}
            block
            icon={<PlusOutlined />}
          >
            เพิ่มลดหย่อนภาษี
          </Button>
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
