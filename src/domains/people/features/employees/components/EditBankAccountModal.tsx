import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Form, Input, Modal, Select, Space } from 'antd';
import type { FC } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

const EditBankAccountSchema = z.object({
  bankName: z.string().min(1, 'ชื่อธนาคารต้องไม่ว่าง'),
  accountNumber: z.string().min(10, 'เลขที่บัญชีต้องมีอย่างน้อย 10 หลัก'),
  accountName: z.string().min(1, 'ชื่อบัญชีต้องไม่ว่าง'),
  branchName: z.string().optional(),
});

export type EditBankAccountInput = z.infer<typeof EditBankAccountSchema>;

interface EditBankAccountModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: EditBankAccountInput) => Promise<void>;
  initialData: {
    bankName: string;
    accountNumber: string;
    accountName: string;
    branchName?: string;
  };
  loading?: boolean;
}

const THAI_BANKS = [
  'ธนาคารกรุงเทพ',
  'ธนาคารกสิกรไทย',
  'ธนาคารกรุงไทย',
  'ธนาคารทหารไทยธนชาต',
  'ธนาคารไทยพาณิชย์',
  'ธนาคารกรุงศรีอยุธยา',
  'ธนาคารเกียรตินาคินภัทร',
  'ธนาคารซีไอเอ็มบีไทย',
  'ธนาคารทิสโก้',
  'ธนาคารยูโอบี',
  'ธนาคารแลนด์ แอนด์ เฮาส์',
  'ธนาคารไอซีบีซี (ไทย)',
  'ธนาคารพัฒนาวิสาหกิจขนาดกลางและขนาดย่อมแห่งประเทศไทย',
  'ธนาคารเพื่อการเกษตรและสหกรณ์การเกษตร',
  'ธนาคารออมสิน',
  'ธนาคารอาคารสงเคราะห์',
  'ธนาคารอิสลามแห่งประเทศไทย',
];

export const EditBankAccountModal: FC<EditBankAccountModalProps> = ({
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
  } = useForm<EditBankAccountInput>({
    resolver: zodResolver(EditBankAccountSchema),
    defaultValues: initialData,
  });

  const handleFormSubmit = async (data: EditBankAccountInput) => {
    await onSubmit(data);
    reset();
    onClose();
  };

  const handleCancel = () => {
    reset();
    onClose();
  };

  return (
    <Modal title="แก้ไขข้อมูลบัญชีธนาคาร" open={open} onCancel={handleCancel} footer={null} width={600}>
      <Form layout="vertical" onFinish={handleSubmit(handleFormSubmit)}>
        <Form.Item
          label="ธนาคาร"
          validateStatus={errors.bankName ? 'error' : ''}
          help={errors.bankName?.message}
          required
        >
          <Controller
            name="bankName"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                showSearch
                placeholder="เลือกธนาคาร"
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                options={THAI_BANKS.map((bank) => ({ label: bank, value: bank }))}
              />
            )}
          />
        </Form.Item>

        <Form.Item
          label="สาขา"
          validateStatus={errors.branchName ? 'error' : ''}
          help={errors.branchName?.message}
        >
          <Controller
            name="branchName"
            control={control}
            render={({ field }) => <Input {...field} placeholder="เช่น สาขาสยาม" />}
          />
        </Form.Item>

        <Form.Item
          label="เลขที่บัญชี"
          validateStatus={errors.accountNumber ? 'error' : ''}
          help={errors.accountNumber?.message}
          required
        >
          <Controller
            name="accountNumber"
            control={control}
            render={({ field }) => <Input {...field} placeholder="เช่น 1234567890" maxLength={15} />}
          />
        </Form.Item>

        <Form.Item
          label="ชื่อบัญชี"
          validateStatus={errors.accountName ? 'error' : ''}
          help={errors.accountName?.message}
          required
        >
          <Controller
            name="accountName"
            control={control}
            render={({ field }) => <Input {...field} placeholder="ชื่อที่ปรากฏในบัญชี" />}
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
