/**
 * Overtime Rejection Modal
 * Collects rejection reason before rejecting OT request
 */

import { Form, Input, Modal } from 'antd';
import type { FC } from 'react';
import type { OvertimeRequest } from '@/domains/people/features/overtime/types';

const { TextArea } = Input;

interface OvertimeRejectionModalProps {
  open: boolean;
  loading?: boolean;
  request?: OvertimeRequest;
  onSubmit: (reason: string) => void;
  onCancel: () => void;
}

export const OvertimeRejectionModal: FC<OvertimeRejectionModalProps> = ({
  open,
  loading,
  request,
  onSubmit,
  onCancel,
}) => {
  const [form] = Form.useForm<{ reason: string }>();

  const handleReject = async () => {
    const values = await form.validateFields();
    onSubmit(values.reason);
    form.resetFields();
  };

  return (
    <Modal
      title={`ปฏิเสธคำขอ OT${request ? ` (${request.employeeName})` : ''}`}
      open={open}
      onOk={handleReject}
      confirmLoading={loading}
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
      okText="ปฏิเสธ"
      okButtonProps={{ danger: true }}
      cancelText="กลับ"
    >
      <Form form={form} layout="vertical" initialValues={{ reason: '' }}>
        <Form.Item
          label="เหตุผลในการปฏิเสธ"
          name="reason"
          rules={[
            { required: true, message: 'กรุณาระบุเหตุผล' },
            { min: 10, message: 'กรุณาระบุอย่างน้อย 10 ตัวอักษร' },
          ]}
        >
          <TextArea rows={4} placeholder="อธิบายเหตุผลอย่างละเอียด" />
        </Form.Item>
      </Form>
    </Modal>
  );
};
