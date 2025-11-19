import { Alert, Checkbox, Form, Modal, message, Space, Typography } from 'antd';
import type { FC } from 'react';
import { useEffect } from 'react';
import { useAuth } from '@/domains/system/features/auth/hooks/useAuth';
import type { Role } from '@/shared/constants/roles';
import { ROLE_LABELS } from '@/shared/constants/roles';
import {
  useAssignRolePermission,
  useRolePermissionByRoleAndResource,
} from '../hooks/usePermissions';
import type { BasePermission, Permission, Resource } from '../utils/checkPermission';

const { Text } = Typography;

const RESOURCE_LABELS: Record<Resource, string> = {
  employees: 'พนักงาน',
  attendance: 'เวลาทำงาน',
  'leave-requests': 'การลา',
  payroll: 'เงินเดือน',
  settings: 'การตั้งค่า',
  users: 'ผู้ใช้งาน',
  roles: 'บทบาท',
  'audit-logs': 'ประวัติการใช้งาน',
};

const BASE_PERMISSIONS: BasePermission[] = ['read', 'create', 'update', 'delete'];

const PERMISSION_LABELS: Record<BasePermission, string> = {
  read: 'อ่าน (Read)',
  create: 'สร้าง (Create)',
  update: 'แก้ไข (Update)',
  delete: 'ลบ (Delete)',
};

interface EditPermissionModalProps {
  open: boolean;
  role: Role;
  resource: Resource;
  onClose: () => void;
}

interface FormValues {
  permissions: Permission[];
}

/**
 * Edit Permission Modal
 * Allows admin to modify permissions for a specific role and resource
 */
export const EditPermissionModal: FC<EditPermissionModalProps> = ({
  open,
  role,
  resource,
  onClose,
}) => {
  const [form] = Form.useForm<FormValues>();
  const { user } = useAuth();

  // Fetch existing permissions
  const { data: existingPermission, isLoading } = useRolePermissionByRoleAndResource(
    role,
    resource
  );

  // Mutation to assign/update permissions
  const { mutate: assignPermission, isPending } = useAssignRolePermission();

  // Initialize form with existing permissions
  useEffect(() => {
    if (existingPermission) {
      form.setFieldsValue({
        permissions: existingPermission.permissions,
      });
    } else {
      form.setFieldsValue({
        permissions: [],
      });
    }
  }, [existingPermission, form]);

  const handleSubmit = () => {
    form
      .validateFields()
      .then((values) => {
        const { permissions } = values;
        if (!user) {
          message.error('ไม่พบข้อมูลผู้ใช้งาน');
          return;
        }

        assignPermission(
          {
            data: {
              role,
              resource,
              permissions: permissions as Permission[],
            },
            userId: user.uid,
            roleId: existingPermission?.roleId || role,
          },
          {
            onSuccess: () => {
              message.success('บันทึกสิทธิ์สำเร็จ');
              onClose();
            },
            onError: (error) => {
              message.error(`เกิดข้อผิดพลาด: ${error.message}`);
            },
          }
        );
      })
      .catch((error) => {
        console.error('Validation failed:', error);
      });
  };

  return (
    <Modal
      title={`แก้ไขสิทธิ์: ${ROLE_LABELS[role]} → ${RESOURCE_LABELS[resource]}`}
      open={open}
      onOk={handleSubmit}
      onCancel={onClose}
      confirmLoading={isPending}
      width={600}
      okText="บันทึก"
      cancelText="ยกเลิก"
    >
      {isLoading ? (
        <div>กำลังโหลดข้อมูล...</div>
      ) : (
        <Form form={form} layout="vertical">
          <Alert
            message="คำแนะนำ"
            description={
              <div>
                <p>เลือกสิทธิ์ที่ต้องการให้กับบทบาทนี้:</p>
                <ul style={{ marginBottom: 0 }}>
                  <li>
                    <strong>:all</strong> - สามารถเข้าถึงข้อมูลทั้งหมด
                  </li>
                  <li>
                    <strong>:own</strong> - สามารถเข้าถึงเฉพาะข้อมูลของตัวเอง
                  </li>
                </ul>
              </div>
            }
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />

          <Form.Item
            name="permissions"
            label="สิทธิ์"
            rules={[{ required: true, message: 'กรุณาเลือกสิทธิ์อย่างน้อย 1 รายการ' }]}
          >
            <Checkbox.Group style={{ width: '100%' }}>
              <Space direction="vertical" size={12} style={{ width: '100%' }}>
                {BASE_PERMISSIONS.map((basePermission) => (
                  <div key={basePermission}>
                    <Text strong style={{ display: 'block', marginBottom: 8 }}>
                      {PERMISSION_LABELS[basePermission]}
                    </Text>
                    <Space direction="vertical" size={4} style={{ marginLeft: 24 }}>
                      <Checkbox value={`${basePermission}:all`}>
                        {basePermission}:all (ทั้งหมด)
                      </Checkbox>
                      <Checkbox value={`${basePermission}:own`}>
                        {basePermission}:own (เฉพาะของตัวเอง)
                      </Checkbox>
                    </Space>
                  </div>
                ))}
              </Space>
            </Checkbox.Group>
          </Form.Item>
        </Form>
      )}
    </Modal>
  );
};
