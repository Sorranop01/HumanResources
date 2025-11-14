import { App, Form, Input, Modal } from 'antd';
import type { FC } from 'react';
import { useCreateRoleCloudFunction } from '../hooks/useCreateRole';

interface CreateRoleModalProps {
  open: boolean;
  onClose: () => void;
}

interface FormValues {
  role: string;
  name: string;
  description: string;
}

/**
 * Create role modal component
 */
export const CreateRoleModal: FC<CreateRoleModalProps> = ({ open, onClose }) => {
  const [form] = Form.useForm<FormValues>();
  const { message } = App.useApp();
  const { mutate: createRole, isPending } = useCreateRoleCloudFunction();

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      createRole(
        {
          role: values.role,
          name: values.name,
          description: values.description,
        },
        {
          onSuccess: (data) => {
            message.success(`สร้างบทบาท "${data.name}" สำเร็จ`);
            form.resetFields();
            onClose();
          },
          onError: (error) => {
            const errorMessage = error instanceof Error ? error.message : 'ไม่สามารถสร้างบทบาทได้';
            message.error(errorMessage);
          },
        }
      );
    } catch (error) {
      console.error('Form validation failed:', error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title="สร้างบทบาทใหม่"
      open={open}
      onOk={handleSubmit}
      onCancel={handleCancel}
      confirmLoading={isPending}
      okText="สร้าง"
      cancelText="ยกเลิก"
      width={700}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 24 }}>
        <Form.Item
          label="รหัสบทบาท (Role Key)"
          name="role"
          tooltip="ใช้ตัวอักษรภาษาอังกฤษตัวเล็ก ตัวเลข และ _ เท่านั้น ต้องขึ้นต้นด้วยตัวอักษร (เช่น sales_manager, project_lead)"
          rules={[
            { required: true, message: 'กรุณากรอกรหัสบทบาท' },
            { min: 3, message: 'รหัสบทบาทต้องมีอย่างน้อย 3 ตัวอักษร' },
            { max: 50, message: 'รหัสบทบาทต้องไม่เกิน 50 ตัวอักษร' },
            {
              pattern: /^[a-z][a-z0-9_]*$/,
              message: 'รหัสบทบาทต้องขึ้นต้นด้วยตัวอักษรเล็ก และมีเฉพาะตัวอักษรเล็ก ตัวเลข และ _ เท่านั้น',
            },
          ]}
        >
          <Input placeholder="เช่น sales_manager, project_lead, finance_officer" />
        </Form.Item>

        <Form.Item
          label="ชื่อบทบาท"
          name="name"
          tooltip="ชื่อบทบาทที่แสดงในระบบ (ภาษาไทยหรืออังกฤษ)"
          rules={[
            { required: true, message: 'กรุณากรอกชื่อบทบาท' },
            { min: 2, message: 'ชื่อบทบาทต้องมีอย่างน้อย 2 ตัวอักษร' },
            { max: 100, message: 'ชื่อบทบาทต้องไม่เกิน 100 ตัวอักษร' },
          ]}
        >
          <Input placeholder="เช่น ผู้จัดการฝ่ายขาย, หัวหน้าโครงการ" />
        </Form.Item>

        <Form.Item
          label="คำอธิบาย"
          name="description"
          rules={[
            { required: true, message: 'กรุณากรอกคำอธิบาย' },
            { min: 10, message: 'คำอธิบายต้องมีอย่างน้อย 10 ตัวอักษร' },
            { max: 500, message: 'คำอธิบายต้องไม่เกิน 500 ตัวอักษร' },
          ]}
        >
          <Input.TextArea
            rows={4}
            placeholder="อธิบายบทบาทและหน้าที่ความรับผิดชอบ (อย่างน้อย 10 ตัวอักษร)"
            showCount
            maxLength={500}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};
