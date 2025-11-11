import { useState } from 'react';
import { Form, Input, Button, Result } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useForgotPassword } from '../hooks/useForgotPassword';
import { ROUTES } from '@/shared/constants/routes';

export function ForgotPasswordForm() {
  const { mutate: resetPassword, isPending, isSuccess } = useForgotPassword();
  const [submittedEmail, setSubmittedEmail] = useState<string>('');

  const handleSubmit = (values: { email: string }) => {
    setSubmittedEmail(values.email);
    resetPassword(values);
  };

  if (isSuccess) {
    return (
      <Result
        status="success"
        title="ส่งอีเมลเรียบร้อยแล้ว"
        subTitle={`เราได้ส่งลิงก์รีเซ็ตรหัสผ่านไปยัง ${submittedEmail} กรุณาตรวจสอบอีเมลของคุณ`}
        extra={[
          <Link to={ROUTES.LOGIN} key="login">
            <Button type="primary">กลับไปหน้าเข้าสู่ระบบ</Button>
          </Link>,
        ]}
      />
    );
  }

  return (
    <Form name="forgot-password" onFinish={handleSubmit} size="large" autoComplete="off">
      <Form.Item
        name="email"
        rules={[
          { required: true, message: 'กรุณากรอกอีเมล' },
          { type: 'email', message: 'รูปแบบอีเมลไม่ถูกต้อง' },
        ]}
      >
        <Input
          prefix={<UserOutlined />}
          placeholder="อีเมลของคุณ"
          autoComplete="email"
          disabled={isPending}
        />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={isPending} block>
          ส่งลิงก์รีเซ็ตรหัสผ่าน
        </Button>
      </Form.Item>

      <div style={{ textAlign: 'center' }}>
        จำรหัสผ่านได้แล้ว? <Link to={ROUTES.LOGIN}>เข้าสู่ระบบ</Link>
      </div>
    </Form>
  );
}
