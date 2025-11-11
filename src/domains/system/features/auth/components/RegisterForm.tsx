import { Form, Input, Button } from 'antd';
import { UserOutlined, LockOutlined, PhoneOutlined, IdcardOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useRegister } from '../hooks/useRegister';
import type { RegisterData } from '../services/authService';
import { ROUTES } from '@/shared/constants/routes';

interface RegisterFormValues extends Omit<RegisterData, 'role'> {
  confirmPassword: string;
}

export function RegisterForm() {
  const { mutate: register, isPending } = useRegister();

  const handleSubmit = (values: RegisterFormValues) => {
    const { confirmPassword, ...registerData } = values;

    register(registerData);
  };

  return (
    <Form<RegisterFormValues>
      name="register"
      onFinish={handleSubmit}
      size="large"
      autoComplete="off"
      layout="vertical"
    >
      <Form.Item
        name="displayName"
        label="ชื่อ-นามสกุล"
        rules={[{ required: true, message: 'กรุณากรอกชื่อ-นามสกุล' }]}
      >
        <Input prefix={<IdcardOutlined />} placeholder="ชื่อ-นามสกุล" />
      </Form.Item>

      <Form.Item
        name="email"
        label="อีเมล"
        rules={[
          { required: true, message: 'กรุณากรอกอีเมล' },
          { type: 'email', message: 'รูปแบบอีเมลไม่ถูกต้อง' },
        ]}
      >
        <Input prefix={<UserOutlined />} placeholder="email@example.com" autoComplete="email" />
      </Form.Item>

      <Form.Item
        name="phoneNumber"
        label="เบอร์โทรศัพท์ (ถ้ามี)"
        rules={[
          {
            pattern: /^[0-9]{10}$/,
            message: 'กรุณากรอกเบอร์โทรศัพท์ 10 หลัก',
          },
        ]}
      >
        <Input prefix={<PhoneOutlined />} placeholder="0812345678" maxLength={10} />
      </Form.Item>

      <Form.Item
        name="password"
        label="รหัสผ่าน"
        rules={[
          { required: true, message: 'กรุณากรอกรหัสผ่าน' },
          { min: 6, message: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' },
        ]}
      >
        <Input.Password
          prefix={<LockOutlined />}
          placeholder="อย่างน้อย 6 ตัวอักษร"
          autoComplete="new-password"
        />
      </Form.Item>

      <Form.Item
        name="confirmPassword"
        label="ยืนยันรหัสผ่าน"
        dependencies={['password']}
        rules={[
          { required: true, message: 'กรุณายืนยันรหัสผ่าน' },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue('password') === value) {
                return Promise.resolve();
              }
              return Promise.reject(new Error('รหัสผ่านไม่ตรงกัน'));
            },
          }),
        ]}
      >
        <Input.Password
          prefix={<LockOutlined />}
          placeholder="ยืนยันรหัสผ่าน"
          autoComplete="new-password"
        />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={isPending} block>
          สมัครสมาชิก
        </Button>
      </Form.Item>

      <div style={{ textAlign: 'center' }}>
        มีบัญชีอยู่แล้ว? <Link to={ROUTES.LOGIN}>เข้าสู่ระบบ</Link>
      </div>
    </Form>
  );
}
