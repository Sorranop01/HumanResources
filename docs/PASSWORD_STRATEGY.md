# กลยุทธ์การจัดการรหัสผ่านพนักงาน

## 🔐 ปัญหาปัจจุบัน

Form สร้างพนักงานไม่มีช่องให้กรอกรหัสผ่าน แต่ Cloud Function ต้องการ `password` เพื่อสร้าง Firebase Auth user

---

## 💡 วิธีแก้ไข 3 แบบ

### วิธีที่ 1: สร้างรหัสผ่านชั่วคราวอัตโนมัติ (✅ ใช้งานแล้ว)

**ข้อดี:**
- ✅ ไม่ต้องแก้ form
- ✅ ใช้งานได้ทันที
- ✅ ปลอดภัย (random password)

**ข้อเสีย:**
- ⚠️ ต้องส่งรหัสผ่านให้พนักงานผ่าน email/SMS
- ⚠️ พนักงานต้องเปลี่ยนรหัสผ่านครั้งแรกที่ login

**Implementation:**
```typescript
// ในไฟล์ EmployeeFormWizard.tsx
const temporaryPassword = `Temp${Math.random().toString(36).slice(-8)}!`;

await createEmployee({
  employeeData: employeeData,
  password: temporaryPassword,
});
```

**รูปแบบรหัสผ่าน:**
```
Temp + random8chars + !
ตัวอย่าง: Tempx7k2m9p4!
```

---

### วิธีที่ 2: เพิ่มช่องกรอกรหัสผ่านใน Form (⭐ แนะนำ)

**ข้อดี:**
- ✅ HR สามารถกำหนดรหัสผ่านเองได้
- ✅ สามารถบอกพนักงานตัวต่อตัว
- ✅ มีความยืดหยุ่นมากขึ้น

**ข้อเสีย:**
- ⚠️ ต้องแก้ form เพิ่มขั้นตอน
- ⚠️ HR ต้องจำรหัสผ่านที่ตั้งให้

**Implementation:**

#### Step 1: เพิ่ม password field ใน form schema

```typescript
// src/domains/people/features/employees/schemas/index.ts

export const EmployeeFormSchema = PersonalInfoFormSchema
  .merge(EmploymentInfoFormSchema)
  .merge(CompensationFormSchema)
  .merge(TaxSocialSecurityFormSchema)
  .merge(z.object({
    // เพิ่ม password field
    temporaryPassword: z.string()
      .min(6, 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร')
      .optional(),
    generatePassword: z.boolean().default(false),
  }));
```

#### Step 2: เพิ่ม step ใหม่ใน form wizard

```tsx
// Step 5: รหัสผ่านเริ่มต้น
const PasswordStep = () => {
  const [autoGenerate, setAutoGenerate] = useState(true);

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Typography.Title level={4}>
        รหัสผ่านเริ่มต้นสำหรับพนักงาน
      </Typography.Title>

      <Radio.Group
        value={autoGenerate}
        onChange={(e) => setAutoGenerate(e.target.value)}
      >
        <Space direction="vertical">
          <Radio value={true}>
            สร้างรหัสผ่านอัตโนมัติ (แนะนำ)
          </Radio>
          <Radio value={false}>
            กำหนดรหัสผ่านเอง
          </Radio>
        </Space>
      </Radio.Group>

      {!autoGenerate && (
        <Form.Item
          name="temporaryPassword"
          label="รหัสผ่าน"
          rules={[
            { required: true, message: 'กรุณากรอกรหัสผ่าน' },
            { min: 6, message: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' },
          ]}
        >
          <Input.Password placeholder="กรอกรหัสผ่านชั่วคราว" />
        </Form.Item>
      )}

      <Alert
        message="คำแนะนำ"
        description="รหัสผ่านนี้จะถูกส่งให้พนักงานผ่านอีเมล พนักงานควรเปลี่ยนรหัสผ่านหลังจาก login ครั้งแรก"
        type="info"
        showIcon
      />
    </Space>
  );
};
```

#### Step 3: แก้ handleFinalSubmit

```typescript
const handleFinalSubmit = async (finalStepData: Partial<EmployeeFormInput>) => {
  try {
    setIsSubmitting(true);
    const completeFormData = { ...formData, ...finalStepData };
    const employeeData = formDataToCreateInput(completeFormData);

    // ใช้รหัสผ่านที่กรอก หรือสร้างอัตโนมัติ
    const password = completeFormData.generatePassword
      ? `Temp${Math.random().toString(36).slice(-8)}!`
      : completeFormData.temporaryPassword || `Temp${Math.random().toString(36).slice(-8)}!`;

    await createEmployee({
      employeeData: employeeData,
      password: password,
    });

    setIsSuccess(true);
    message.success('สร้างพนักงานสำเร็จ!');
  } catch (error) {
    console.error('Failed to create employee:', error);
    message.error('เกิดข้อผิดพลาดในการสร้างพนักงาน');
  } finally {
    setIsSubmitting(false);
  }
};
```

---

### วิธีที่ 3: ใช้ Email Verification Link (🚀 Best Practice)

**ข้อดี:**
- ✅ ปลอดภัยที่สุด
- ✅ พนักงานตั้งรหัสผ่านเอง
- ✅ ไม่ต้องส่งรหัสผ่านผ่าน channel ไม่ปลอดภัย

**ข้อเสีย:**
- ⚠️ ซับซ้อนกว่า
- ⚠️ ต้อง implement email sending
- ⚠️ ต้องมีหน้า set password

**Flow:**
```
1. HR สร้างพนักงาน
2. ระบบสร้าง Firebase Auth user โดยไม่ต้องใส่รหัสผ่าน (disabled: true)
3. ส่ง verification link ไปยังอีเมลพนักงาน
4. พนักงาน click link และตั้งรหัสผ่านเอง
5. Account ถูก enable หลังจากตั้งรหัสผ่านเสร็จ
```

**Implementation:**

#### Cloud Function: createEmployee (แก้ไข)

```typescript
// สร้าง Auth user แบบ disabled
newUser = await auth.createUser({
  email,
  password: Math.random().toString(36) + Math.random().toString(36), // random temp
  displayName,
  emailVerified: false,
  disabled: true, // ⭐ ปิดการใช้งานก่อน
});

// สร้าง verification token
const actionCodeSettings = {
  url: `${YOUR_APP_URL}/auth/set-password?email=${email}`,
  handleCodeInApp: true,
};

const passwordResetLink = await auth.generatePasswordResetLink(
  email,
  actionCodeSettings
);

// ส่งอีเมล (TODO: implement)
await sendEmail({
  to: email,
  subject: 'ยินดีต้อนรับสู่บริษัท - กรุณาตั้งรหัสผ่าน',
  body: `
    สวัสดี ${displayName},

    คุณได้รับเชิญให้เข้าร่วมระบบ HR
    กรุณาคลิกลิงก์ด้านล่างเพื่อตั้งรหัสผ่าน:

    ${passwordResetLink}

    ลิงก์นี้จะหมดอายุใน 24 ชั่วโมง
  `,
});
```

#### หน้า Set Password

```tsx
// src/domains/system/features/auth/pages/SetPasswordPage.tsx

export function SetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async () => {
    try {
      // ยืนยันรหัสผ่านจาก reset link
      await confirmPasswordReset(auth, oobCode, password);

      // Enable account (ต้องเรียก Cloud Function)
      await enableUserAccount(email);

      message.success('ตั้งรหัสผ่านสำเร็จ!');
      navigate('/login');
    } catch (error) {
      message.error('เกิดข้อผิดพลาด');
    }
  };

  return (
    <Form onFinish={handleSubmit}>
      <Form.Item label="รหัสผ่าน">
        <Input.Password value={password} onChange={e => setPassword(e.target.value)} />
      </Form.Item>
      <Form.Item label="ยืนยันรหัสผ่าน">
        <Input.Password value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
      </Form.Item>
      <Button type="primary" htmlType="submit">
        ตั้งรหัสผ่าน
      </Button>
    </Form>
  );
}
```

---

## 📊 เปรียบเทียบ

| Feature | วิธีที่ 1 (Auto) | วิธีที่ 2 (Manual) | วิธีที่ 3 (Email) |
|---------|------------------|-------------------|-------------------|
| ความยาก | ⭐ (ง่าย) | ⭐⭐ (ปานกลาง) | ⭐⭐⭐ (ยาก) |
| ความปลอดภัย | ⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| UX | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| เวลาพัฒนา | 5 นาที | 1 ชั่วโมง | 4 ชั่วโมง |
| Maintenance | ต่ำ | ต่ำ | ปานกลาง |

---

## 🎯 คำแนะนำ

### สำหรับ MVP / ระยะเริ่มต้น
✅ **ใช้วิธีที่ 1** - Auto-generate temporary password
- เร็ว ใช้งานได้ทันที
- TODO: เพิ่ม email sending ภายหลัง

### สำหรับ Production (Phase 1)
✅ **ใช้วิธีที่ 2** - Manual password input
- ให้ HR มีความยืดหยุ่น
- ยังคงใช้งานง่าย

### สำหรับ Production (Phase 2)
⭐ **อัพเกรดเป็นวิธีที่ 3** - Email verification
- Best practice ระดับ enterprise
- ปลอดภัยและ UX ดีที่สุด

---

## 🔒 Security Best Practices

### 1. Password Requirements
```typescript
// กำหนดเงื่อนไขรหัสผ่าน
const passwordRules = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecialChar: true,
};

// Validation
const validatePassword = (password: string): boolean => {
  return (
    password.length >= passwordRules.minLength &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[!@#$%^&*]/.test(password)
  );
};
```

### 2. Force Password Change on First Login
```typescript
// Cloud Function: onCreate trigger
export const onUserCreate = onDocumentCreated(
  'users/{userId}',
  async (event) => {
    const userData = event.data?.data();

    // Set flag to force password change
    await db.collection('users').doc(event.params.userId).update({
      mustChangePassword: true,
      passwordSetAt: null,
    });
  }
);
```

### 3. Password Expiry
```typescript
// ตรวจสอบอายุรหัสผ่าน
const PASSWORD_MAX_AGE_DAYS = 90;

const checkPasswordExpiry = (passwordSetAt: Date): boolean => {
  const daysSinceSet = differenceInDays(new Date(), passwordSetAt);
  return daysSinceSet > PASSWORD_MAX_AGE_DAYS;
};
```

---

## 📧 Email Template (สำหรับวิธีที่ 3)

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>ยินดีต้อนรับสู่บริษัท</title>
</head>
<body>
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2>ยินดีต้อนรับสู่ [ชื่อบริษัท]</h2>

    <p>สวัสดี {{displayName}},</p>

    <p>คุณได้ถูกเพิ่มเข้าระบบ HR ของบริษัทแล้ว</p>

    <p><strong>ข้อมูลบัญชีของคุณ:</strong></p>
    <ul>
      <li>รหัสพนักงาน: {{employeeCode}}</li>
      <li>อีเมล: {{email}}</li>
      <li>ตำแหน่ง: {{position}}</li>
      <li>แผนก: {{department}}</li>
    </ul>

    <p>กรุณาคลิกปุ่มด้านล่างเพื่อตั้งรหัสผ่าน:</p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="{{passwordResetLink}}"
         style="background-color: #1890ff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; display: inline-block;">
        ตั้งรหัสผ่าน
      </a>
    </div>

    <p style="color: #888; font-size: 12px;">
      ลิงก์นี้จะหมดอายุใน 24 ชั่วโมง<br>
      ถ้าคุณไม่ได้ร้องขอบัญชีนี้ กรุณาละเว้นอีเมลนี้
    </p>

    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

    <p style="color: #888; font-size: 12px;">
      © 2025 [ชื่อบริษัท]. All rights reserved.
    </p>
  </div>
</body>
</html>
```

---

## 🎉 สรุป

**ปัจจุบันใช้: วิธีที่ 1** ✅
- Auto-generate temporary password
- ใช้งานได้ทันที
- TODO: เพิ่ม email sending

**แผนอนาคต:**
1. Phase 1: เพิ่มช่องกรอกรหัสผ่านใน form (วิธีที่ 2)
2. Phase 2: Implement email verification (วิธีที่ 3)
3. Phase 3: เพิ่ม password policy และ expiry

พร้อมใช้งานแล้วครับ! 🚀
