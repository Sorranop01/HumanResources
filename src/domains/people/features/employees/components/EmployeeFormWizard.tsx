import {
  CheckCircleOutlined,
  DollarOutlined,
  LockOutlined,
  SafetyCertificateOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Button, Card, message, Result, Steps } from 'antd';
import type { FC } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateEmployee } from '../hooks/useCreateEmployee';
import type { EmployeeFormInput } from '../schemas';
import { formDataToCreateInput } from '../schemas';
import { CompensationStep } from './form-steps/CompensationStep';
import { EmploymentInfoStep } from './form-steps/EmploymentInfoStep';
import { PasswordStep } from './form-steps/PasswordStep';
import { PersonalInfoStep } from './form-steps/PersonalInfoStep';
import { TaxSocialSecurityStep } from './form-steps/TaxSocialSecurityStep';

export interface FinalStepData extends Partial<EmployeeFormInput> {
  passwordOption?: 'auto' | 'manual';
  temporaryPassword?: string;
}

/**
 * Multi-Step Employee Form Wizard
 * 5-step process for creating a complete employee record
 */
export const EmployeeFormWizard: FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Partial<EmployeeFormInput>>({});
  const [_isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const { mutateAsync: createEmployee } = useCreateEmployee();

  // Step configuration
  const steps = [
    {
      title: 'ข้อมูลส่วนบุคคล',
      icon: <UserOutlined />,
      description: 'ข้อมูลพื้นฐานและที่อยู่',
    },
    {
      title: 'การจ้างงาน',
      icon: <SafetyCertificateOutlined />,
      description: 'ตำแหน่งและแผนก',
    },
    {
      title: 'ค่าตอบแทน',
      icon: <DollarOutlined />,
      description: 'เงินเดือนและสวัสดิการ',
    },
    {
      title: 'ภาษีและประกัน',
      icon: <CheckCircleOutlined />,
      description: 'ประกันสังคมและภาษี',
    },
    {
      title: 'รหัสผ่าน',
      icon: <LockOutlined />,
      description: 'รหัสผ่านเริ่มต้น',
    },
  ];

  // Handle step completion
  const handleStepComplete = (stepData: Partial<EmployeeFormInput>) => {
    const updatedFormData = { ...formData, ...stepData };
    setFormData(updatedFormData);

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Handle final submission (from Password Step)
  const handleFinalSubmit = async (finalStepData: FinalStepData) => {
    try {
      setIsSubmitting(true);

      const completeFormData = { ...formData, ...finalStepData };

      // Transform form data to API format
      const employeeData = formDataToCreateInput(completeFormData as EmployeeFormInput);

      // Get password from finalStepData
      const passwordOption = finalStepData.passwordOption || 'auto';
      const generatedPassword = `Temp${Math.random().toString(36).slice(-8)}!`;
      const temporaryPassword =
        passwordOption === 'manual'
          ? (finalStepData.temporaryPassword ?? generatedPassword)
          : generatedPassword;

      // Submit to API with password
      await createEmployee({
        employeeData: employeeData,
        password: temporaryPassword,
      });

      setIsSuccess(true);
      message.success(
        passwordOption === 'auto'
          ? 'สร้างพนักงานสำเร็จ! รหัสผ่านชั่วคราวได้ถูกสร้างอัตโนมัติ'
          : 'สร้างพนักงานสำเร็จ!'
      );
    } catch (error) {
      console.error('Failed to create employee:', error);
      message.error('เกิดข้อผิดพลาดในการสร้างพนักงาน');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle back button
  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    navigate('/employees');
  };

  // Success screen
  if (isSuccess) {
    return (
      <Card>
        <Result
          status="success"
          title="สร้างพนักงานสำเร็จ!"
          subTitle="ข้อมูลพนักงานถูกบันทึกเรียบร้อยแล้ว"
          extra={[
            <Button type="primary" key="list" onClick={() => navigate('/employees')}>
              กลับไปรายการพนักงาน
            </Button>,
            <Button key="new" onClick={() => window.location.reload()}>
              เพิ่มพนักงานใหม่
            </Button>,
          ]}
        />
      </Card>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Progress Steps */}
      <Card style={{ marginBottom: '24px' }}>
        <Steps current={currentStep} items={steps} />
      </Card>

      {/* Step Content */}
      <Card>
        {currentStep === 0 && (
          <PersonalInfoStep
            initialData={formData}
            onNext={handleStepComplete}
            onCancel={handleCancel}
          />
        )}

        {currentStep === 1 && (
          <EmploymentInfoStep
            initialData={formData}
            onNext={handleStepComplete}
            onBack={handleBack}
            onCancel={handleCancel}
          />
        )}

        {currentStep === 2 && (
          <CompensationStep
            initialData={formData}
            onNext={handleStepComplete}
            onBack={handleBack}
            onCancel={handleCancel}
          />
        )}

        {currentStep === 3 && (
          <TaxSocialSecurityStep
            initialData={formData}
            onNext={handleStepComplete}
            onBack={handleBack}
            onCancel={handleCancel}
          />
        )}

        {currentStep === 4 && (
          <PasswordStep initialData={formData} onNext={handleFinalSubmit} onBack={handleBack} />
        )}
      </Card>
    </div>
  );
};
