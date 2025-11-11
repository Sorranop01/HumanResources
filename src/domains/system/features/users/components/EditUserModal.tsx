import { Form, Input, Modal, Select, Switch } from 'antd';
import type { FC } from 'react';
import { useEffect } from 'react';
import { ROLE_LABELS, ROLES } from '@/shared/constants/roles';
import type { User } from '@/shared/types';
import { useUpdateUser } from '../hooks/useUsers';

interface EditUserModalProps {
  user: User;
  open: boolean;
  onClose: () => void;
}

interface FormValues {
  displayName: string;
  role: User['role'];
  phoneNumber?: string | undefined;
  isActive: boolean;
}

/**
 * Edit user modal component
 */
export const EditUserModal: FC<EditUserModalProps> = ({ user, open, onClose }) => {
  const [form] = Form.useForm<FormValues>();
  const { mutate: updateUser, isPending } = useUpdateUser();

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        displayName: user.displayName,
        role: user.role,
        phoneNumber: user.phoneNumber,
        isActive: user.isActive,
      });
    }
  }, [open, user, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      updateUser(
        {
          userId: user.id,
          payload: {
            displayName: values.displayName,
            role: values.role,
            phoneNumber: values.phoneNumber,
            isActive: values.isActive,
          },
        },
        {
          onSuccess: () => {
            onClose();
          },
        }
      );
    } catch (error) {
      console.error('Form validation failed:', error);
    }
  };

  return (
    <Modal
      title="แก้ไขข้อมูลผู้ใช้"
      open={open}
      onOk={handleSubmit}
      onCancel={onClose}
      confirmLoading={isPending}
      okText="บันทึก"
      cancelText="ยกเลิก"
      width={600}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 24 }}>
        <Form.Item label="อีเมล">
          <Input value={user.email} disabled />
        </Form.Item>

        <Form.Item
          label="ชื่อ-นามสกุล"
          name="displayName"
          rules={[{ required: true, message: 'กรุณากรอกชื่อ-นามสกุล' }]}
        >
          <Input placeholder="กรอกชื่อ-นามสกุล" />
        </Form.Item>

        <Form.Item label="บทบาท" name="role" rules={[{ required: true, message: 'กรุณาเลือกบทบาท' }]}>
          <Select placeholder="เลือกบทบาท">
            <Select.Option value={ROLES.ADMIN}>{ROLE_LABELS[ROLES.ADMIN]}</Select.Option>
            <Select.Option value={ROLES.HR}>{ROLE_LABELS[ROLES.HR]}</Select.Option>
            <Select.Option value={ROLES.MANAGER}>{ROLE_LABELS[ROLES.MANAGER]}</Select.Option>
            <Select.Option value={ROLES.EMPLOYEE}>{ROLE_LABELS[ROLES.EMPLOYEE]}</Select.Option>
            <Select.Option value={ROLES.AUDITOR}>{ROLE_LABELS[ROLES.AUDITOR]}</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item label="เบอร์โทรศัพท์" name="phoneNumber">
          <Input placeholder="กรอกเบอร์โทรศัพท์" />
        </Form.Item>

        <Form.Item label="สถานะการใช้งาน" name="isActive" valuePropName="checked">
          <Switch checkedChildren="ใช้งานอยู่" unCheckedChildren="ปิดการใช้งาน" />
        </Form.Item>
      </Form>
    </Modal>
  );
};
