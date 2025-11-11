/**
 * AssignRoleModal Component
 * Modal for assigning roles to users
 */

import { DatePicker, Form, Input, Modal, Select } from 'antd';
import dayjs from 'dayjs';
import type { FC } from 'react';
import { useAuth } from '@/domains/system/features/auth/hooks/useAuth';
import { ROLE_LABELS, ROLES, type Role } from '@/shared/constants/roles';
import type { User } from '@/shared/types';
import { useAssignRole } from '../hooks/useUserRoleManagement';

interface AssignRoleModalProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
}

interface FormValues {
  role: Role;
  expiresAt?: Date;
  reason?: string;
}

/**
 * Modal for assigning role to user
 */
export const AssignRoleModal: FC<AssignRoleModalProps> = ({ open, onClose, user }) => {
  const [form] = Form.useForm<FormValues>();
  const { user: currentUser } = useAuth();
  const { mutate: assignRole, isPending } = useAssignRole();

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (!user || !currentUser?.id) {
        return;
      }

      assignRole(
        {
          userId: user.id,
          userEmail: user.email,
          userDisplayName: user.displayName,
          role: values.role,
          assignedByUserId: currentUser.id,
          expiresAt: values.expiresAt,
          reason: values.reason,
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
      title={`มอบหมายบทบาทให้ ${user?.displayName || ''}`}
      open={open}
      onOk={handleSubmit}
      onCancel={handleCancel}
      confirmLoading={isPending}
      okText="มอบหมาย"
      cancelText="ยกเลิก"
      width={600}
    >
      {user && (
        <div style={{ marginBottom: 16, padding: 12, background: '#f5f5f5', borderRadius: 6 }}>
          <div>
            <strong>ผู้ใช้:</strong> {user.displayName}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>{user.email}</div>
          <div style={{ marginTop: 4 }}>
            <strong>บทบาทปัจจุบัน:</strong> {ROLE_LABELS[user.role]}
          </div>
        </div>
      )}

      <Form form={form} layout="vertical" style={{ marginTop: 24 }}>
        <Form.Item
          label="บทบาทที่ต้องการมอบหมาย"
          name="role"
          rules={[{ required: true, message: 'กรุณาเลือกบทบาท' }]}
        >
          <Select placeholder="เลือกบทบาท" size="large">
            <Select.Option value={ROLES.ADMIN}>{ROLE_LABELS[ROLES.ADMIN]}</Select.Option>
            <Select.Option value={ROLES.HR}>{ROLE_LABELS[ROLES.HR]}</Select.Option>
            <Select.Option value={ROLES.MANAGER}>{ROLE_LABELS[ROLES.MANAGER]}</Select.Option>
            <Select.Option value={ROLES.EMPLOYEE}>{ROLE_LABELS[ROLES.EMPLOYEE]}</Select.Option>
            <Select.Option value={ROLES.AUDITOR}>{ROLE_LABELS[ROLES.AUDITOR]}</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item label="วันหมดอายุ (ไม่บังคับ)" name="expiresAt">
          <DatePicker
            style={{ width: '100%' }}
            placeholder="เลือกวันหมดอายุ"
            format="DD/MM/YYYY"
            disabledDate={(current) => current && current < dayjs().startOf('day')}
            size="large"
          />
        </Form.Item>

        <Form.Item
          label="เหตุผล"
          name="reason"
          rules={[{ required: true, message: 'กรุณากรอกเหตุผล' }]}
        >
          <Input.TextArea
            rows={3}
            placeholder="ระบุเหตุผลในการมอบหมายบทบาท เช่น รักษาการแทน, โครงการพิเศษ"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};
