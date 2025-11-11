import { UserAddOutlined } from '@ant-design/icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, Input, Modal, Select } from 'antd';
import type { FC } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ROLE_LABELS, ROLES } from '@/shared/constants/roles';
import { useCreateUser } from '../hooks/useUsers';
import { type CreateUserFormInput, CreateUserSchema } from '../schemas/userSchemas';

interface CreateUserModalProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Modal for creating a new user
 */
export const CreateUserModal: FC<CreateUserModalProps> = ({ open, onClose }) => {
  const { mutate: createUser, isPending } = useCreateUser();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateUserFormInput>({
    resolver: zodResolver(CreateUserSchema),
    defaultValues: {
      email: '',
      password: '',
      displayName: '',
      role: ROLES.EMPLOYEE,
      phoneNumber: '',
    },
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = (data: CreateUserFormInput) => {
    createUser(data, {
      onSuccess: () => {
        handleClose();
      },
    });
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <UserAddOutlined />
          <span>เพิ่มผู้ใช้ใหม่</span>
        </div>
      }
      open={open}
      onCancel={handleClose}
      onOk={handleSubmit(onSubmit)}
      confirmLoading={isPending}
      okText="สร้างผู้ใช้"
      cancelText="ยกเลิก"
      width={600}
    >
      <Form layout="vertical" style={{ marginTop: 24 }}>
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <Form.Item
              label="อีเมล"
              validateStatus={errors.email ? 'error' : ''}
              help={errors.email?.message}
              required
            >
              <Input {...field} placeholder="user@example.com" type="email" />
            </Form.Item>
          )}
        />

        <Controller
          name="password"
          control={control}
          render={({ field }) => (
            <Form.Item
              label="รหัสผ่าน"
              validateStatus={errors.password ? 'error' : ''}
              help={errors.password?.message}
              required
            >
              <Input.Password {...field} placeholder="อย่างน้อย 6 ตัวอักษร" />
            </Form.Item>
          )}
        />

        <Controller
          name="displayName"
          control={control}
          render={({ field }) => (
            <Form.Item
              label="ชื่อ-นามสกุล"
              validateStatus={errors.displayName ? 'error' : ''}
              help={errors.displayName?.message}
              required
            >
              <Input {...field} placeholder="ชื่อ นามสกุล" />
            </Form.Item>
          )}
        />

        <Controller
          name="role"
          control={control}
          render={({ field }) => (
            <Form.Item
              label="บทบาท"
              validateStatus={errors.role ? 'error' : ''}
              help={errors.role?.message}
              required
            >
              <Select {...field} placeholder="เลือกบทบาท">
                {Object.values(ROLES).map((role) => (
                  <Select.Option key={role} value={role}>
                    {ROLE_LABELS[role]}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          )}
        />

        <Controller
          name="phoneNumber"
          control={control}
          render={({ field }) => (
            <Form.Item
              label="เบอร์โทรศัพท์ (ไม่บังคับ)"
              validateStatus={errors.phoneNumber ? 'error' : ''}
              help={errors.phoneNumber?.message}
            >
              <Input {...field} placeholder="0812345678" />
            </Form.Item>
          )}
        />
      </Form>
    </Modal>
  );
};
