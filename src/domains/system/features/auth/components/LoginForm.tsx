import { Form, Input, Button, Checkbox } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useLogin } from '../hooks/useLogin';
import type { LoginCredentials } from '../services/authService';
import { ROUTES } from '@/shared/constants/routes';

export function LoginForm() {
  const { mutate: login, isPending } = useLogin();

  const handleSubmit = (values: LoginCredentials & { remember?: boolean }) => {
    login({
      email: values.email,
      password: values.password,
    });
  };

  return (
    <Form
      name="login"
      initialValues={{ remember: true }}
      onFinish={handleSubmit}
      size="large"
      autoComplete="off"
    >
      <Form.Item
        name="email"
        rules={[
          { required: true, message: 'กรุณากรอกอีเมล' },
          { type: 'email', message: 'รูปแบบอีเมลไม่ถูกต้อง' },
        ]}
      >
        <Input
          prefix={<UserOutlined />}
          placeholder="อีเมล"
          autoComplete="email"
        />
      </Form.Item>

      <Form.Item
        name="password"
        rules={[{ required: true, message: 'กรุณากรอกรหัสผ่าน' }]}
      >
        <Input.Password
          prefix={<LockOutlined />}
          placeholder="รหัสผ่าน"
          autoComplete="current-password"
        />
      </Form.Item>

      <Form.Item>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Form.Item name="remember" valuePropName="checked" noStyle>
            <Checkbox>จดจำฉันไว้</Checkbox>
          </Form.Item>
          <Link to={ROUTES.FORGOT_PASSWORD}>ลืมรหัสผ่าน?</Link>
        </div>
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={isPending} block>
          เข้าสู่ระบบ
        </Button>
      </Form.Item>

      <div style={{ textAlign: 'center' }}>
        ยังไม่มีบัญชี? <Link to={ROUTES.REGISTER}>สมัครสมาชิก</Link>
      </div>
    </Form>
  );
}
