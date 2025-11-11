import { Form, Input, Modal, Select } from 'antd';
import type { FC } from 'react';
import { useAuth } from '@/domains/system/features/auth/hooks/useAuth';
import { ROLE_LABELS, ROLES, type Role } from '@/shared/constants/roles';
import { useCreateRole } from '../hooks/useRoles';

interface CreateRoleModalProps {
  open: boolean;
  onClose: () => void;
}

interface FormValues {
  role: Role;
  name: string;
  description: string;
}

/**
 * Create role modal component
 */
export const CreateRoleModal: FC<CreateRoleModalProps> = ({ open, onClose }) => {
  const [form] = Form.useForm<FormValues>();
  const { user } = useAuth();
  const { mutate: createRole, isPending } = useCreateRole();

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (!user?.id) {
        return;
      }

      createRole(
        {
          data: {
            role: values.role,
            name: values.name,
            description: values.description,
          },
          userId: user.id,
        },
        {
          onSuccess: () => {
            form.resetFields();
            onClose();
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
          label="ประเภทบทบาท"
          name="role"
          rules={[{ required: true, message: 'กรุณาเลือกประเภทบทบาท' }]}
        >
          <Select placeholder="เลือกประเภทบทบาท">
            <Select.Option value={ROLES.ADMIN}>{ROLE_LABELS[ROLES.ADMIN]}</Select.Option>
            <Select.Option value={ROLES.HR}>{ROLE_LABELS[ROLES.HR]}</Select.Option>
            <Select.Option value={ROLES.MANAGER}>{ROLE_LABELS[ROLES.MANAGER]}</Select.Option>
            <Select.Option value={ROLES.EMPLOYEE}>{ROLE_LABELS[ROLES.EMPLOYEE]}</Select.Option>
            <Select.Option value={ROLES.AUDITOR}>{ROLE_LABELS[ROLES.AUDITOR]}</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="ชื่อบทบาท"
          name="name"
          rules={[{ required: true, message: 'กรุณากรอกชื่อบทบาท' }]}
        >
          <Input placeholder="เช่น ผู้ดูแลระบบ" />
        </Form.Item>

        <Form.Item
          label="คำอธิบาย"
          name="description"
          rules={[{ required: true, message: 'กรุณากรอกคำอธิบาย' }]}
        >
          <Input.TextArea rows={4} placeholder="อธิบายบทบาทและหน้าที่ความรับผิดชอบ" />
        </Form.Item>
      </Form>
    </Modal>
  );
};
