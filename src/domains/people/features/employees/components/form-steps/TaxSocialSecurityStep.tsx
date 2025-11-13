import { zodResolver } from '@hookform/resolvers/zod';
import {
  Alert,
  Button,
  Checkbox,
  Col,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
  Typography,
} from 'antd';
import type { FC } from 'react';
import { Controller, useForm } from 'react-hook-form';
import type { EmployeeFormInput } from '../../schemas';
import { TaxSocialSecurityFormSchema } from '../../schemas';

const { Title, Text } = Typography;

type TaxSocialSecurityFormValues = (typeof TaxSocialSecurityFormSchema)['_input'];

interface TaxSocialSecurityStepProps {
  initialData?: Partial<EmployeeFormInput>;
  onNext: (data: Partial<EmployeeFormInput>) => void;
  onBack: () => void;
  onCancel: () => void;
}

/**
 * Step 4: Tax & Social Security Form
 * Collects social security, tax withholding, and bank account information
 */
export const TaxSocialSecurityStep: FC<TaxSocialSecurityStepProps> = ({
  initialData,
  onNext,
  onBack,
  onCancel,
}) => {
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<TaxSocialSecurityFormValues>({
    resolver: zodResolver(TaxSocialSecurityFormSchema),
    defaultValues: {
      socialSecurityEnrolled: initialData?.socialSecurityEnrolled ?? true,
      socialSecurityNumber: initialData?.socialSecurityNumber || '',
      hospitalCode: initialData?.hospitalCode || '',
      hospitalName: initialData?.hospitalName || '',
      taxId: initialData?.taxId || '',
      withholdingTax: initialData?.withholdingTax ?? true,
      withholdingRate: initialData?.withholdingRate || 0,
      bankName: initialData?.bankName || '',
      accountNumber: initialData?.accountNumber || '',
      accountName: initialData?.accountName || '',
      branchName: initialData?.branchName || '',
    },
  });

  const socialSecurityEnrolled = watch('socialSecurityEnrolled');
  const withholdingTax = watch('withholdingTax');

  const handleFormSubmit = (data: TaxSocialSecurityFormValues) => {
    const parsed = TaxSocialSecurityFormSchema.parse(data);
    onNext(parsed);
  };

  return (
    <Form layout="vertical" onFinish={handleSubmit(handleFormSubmit)}>
      <Title level={4}>ภาษีและประกันสังคม</Title>
      <Text type="secondary">ข้อมูลสำหรับการคำนวณเงินเดือนและภาษี</Text>

      {/* Security Alert */}
      <Alert
        message="ข้อมูลสำคัญ"
        description="ข้อมูลในหน้านี้จะใช้สำหรับการคำนวณเงินเดือนสุทธิและการหักภาษี กรุณาตรวจสอบความถูกต้อง"
        type="warning"
        showIcon
        style={{ marginTop: '16px', marginBottom: '24px' }}
      />

      {/* Social Security */}
      <Title level={5}>ประกันสังคม</Title>
      <Row gutter={16}>
        <Col xs={24} md={24}>
          <Form.Item>
            <Controller
              name="socialSecurityEnrolled"
              control={control}
              render={({ field }) => (
                <Checkbox {...field} checked={field.value}>
                  <strong>เข้าระบบประกันสังคม</strong>
                  <Text type="secondary" style={{ marginLeft: '8px' }}>
                    (หักเงินสมทบประกันสังคมทุกเดือน)
                  </Text>
                </Checkbox>
              )}
            />
          </Form.Item>
        </Col>
      </Row>

      {socialSecurityEnrolled && (
        <Row gutter={16}>
          <Col xs={24} md={8}>
            <Form.Item
              label="เลขประกันสังคม"
              validateStatus={errors.socialSecurityNumber ? 'error' : ''}
              help={errors.socialSecurityNumber?.message}
            >
              <Controller
                name="socialSecurityNumber"
                control={control}
                render={({ field }) => (
                  <Input {...field} placeholder="1234567890123" maxLength={13} />
                )}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item
              label="รหัสโรงพยาบาล"
              validateStatus={errors.hospitalCode ? 'error' : ''}
              help={errors.hospitalCode?.message}
              tooltip="รหัสโรงพยาบาลที่ใช้สิทธิ์ประกันสังคม"
            >
              <Controller
                name="hospitalCode"
                control={control}
                render={({ field }) => <Input {...field} placeholder="10234" />}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item
              label="ชื่อโรงพยาบาล"
              validateStatus={errors.hospitalName ? 'error' : ''}
              help={errors.hospitalName?.message}
            >
              <Controller
                name="hospitalName"
                control={control}
                render={({ field }) => <Input {...field} placeholder="โรงพยาบาลราชวิถี" />}
              />
            </Form.Item>
          </Col>
        </Row>
      )}

      {/* Tax Information */}
      <Title level={5} style={{ marginTop: '16px' }}>
        ข้อมูลภาษี
      </Title>
      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Form.Item
            label="เลขประจำตัวผู้เสียภาษี"
            validateStatus={errors.taxId ? 'error' : ''}
            help={errors.taxId?.message}
            tooltip="เลขบัตรประชาชน 13 หลัก"
          >
            <Controller
              name="taxId"
              control={control}
              render={({ field }) => (
                <Input {...field} placeholder="1234567890123" maxLength={13} />
              )}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} md={24}>
          <Form.Item>
            <Controller
              name="withholdingTax"
              control={control}
              render={({ field }) => (
                <Checkbox {...field} checked={field.value}>
                  <strong>หัก ณ ที่จ่าย (Withholding Tax)</strong>
                  <Text type="secondary" style={{ marginLeft: '8px' }}>
                    (หักภาษีเงินได้บุคคลธรรมดาจากเงินเดือน)
                  </Text>
                </Checkbox>
              )}
            />
          </Form.Item>
        </Col>
      </Row>

      {withholdingTax && (
        <Row gutter={16}>
          <Col xs={24} md={8}>
            <Form.Item
              label="อัตราการหัก (%)"
              validateStatus={errors.withholdingRate ? 'error' : ''}
              help={errors.withholdingRate?.message}
              tooltip="อัตราการหักภาษี ณ ที่จ่าย (0-35%)"
            >
              <Controller
                name="withholdingRate"
                control={control}
                render={({ field }) => (
                  <InputNumber
                    {...field}
                    style={{ width: '100%' }}
                    placeholder="0"
                    min={0}
                    max={35}
                    step={1}
                    formatter={(value) => `${value}%`}
                    parser={(value) => Number.parseFloat(value?.replace('%', '') || '0')}
                  />
                )}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={16}>
            <Alert
              message="อัตราภาษีมาตรฐาน"
              description="0-5% (รายได้ต่ำ), 5-10% (รายได้ปานกลาง), 10-35% (รายได้สูง)"
              type="info"
              showIcon
            />
          </Col>
        </Row>
      )}

      {/* Bank Account */}
      <Title level={5} style={{ marginTop: '24px' }}>
        บัญชีธนาคาร (สำหรับโอนเงินเดือน)
      </Title>
      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Form.Item
            label="ชื่อธนาคาร"
            required
            validateStatus={errors.bankName ? 'error' : ''}
            help={errors.bankName?.message}
          >
            <Controller
              name="bankName"
              control={control}
              render={({ field }) => (
                <Select {...field} placeholder="เลือกธนาคาร" showSearch>
                  <Select.Option value="ธนาคารกรุงเทพ">ธนาคารกรุงเทพ</Select.Option>
                  <Select.Option value="ธนาคารกสิกรไทย">ธนาคารกสิกรไทย</Select.Option>
                  <Select.Option value="ธนาคารไทยพาณิชย์">ธนาคารไทยพาณิชย์</Select.Option>
                  <Select.Option value="ธนาคารกรุงไทย">ธนาคารกรุงไทย</Select.Option>
                  <Select.Option value="ธนาคารกรุงศรีอยุธยา">ธนาคารกรุงศรีอยุธยา</Select.Option>
                  <Select.Option value="ธนาคารทหารไทยธนชาต">ธนาคารทหารไทยธนชาต</Select.Option>
                  <Select.Option value="ธนาคารออมสิน">ธนาคารออมสิน</Select.Option>
                  <Select.Option value="ธนาคาร ธ.ก.ส.">ธนาคาร ธ.ก.ส.</Select.Option>
                </Select>
              )}
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item
            label="เลขที่บัญชี"
            required
            validateStatus={errors.accountNumber ? 'error' : ''}
            help={errors.accountNumber?.message}
          >
            <Controller
              name="accountNumber"
              control={control}
              render={({ field }) => <Input {...field} placeholder="1234567890" maxLength={15} />}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Form.Item
            label="ชื่อบัญชี"
            required
            validateStatus={errors.accountName ? 'error' : ''}
            help={errors.accountName?.message}
            tooltip="ชื่อบัญชีต้องตรงกับชื่อพนักงาน"
          >
            <Controller
              name="accountName"
              control={control}
              render={({ field }) => <Input {...field} placeholder="นาย/นาง/นางสาว..." />}
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item
            label="สาขา"
            validateStatus={errors.branchName ? 'error' : ''}
            help={errors.branchName?.message}
          >
            <Controller
              name="branchName"
              control={control}
              render={({ field }) => <Input {...field} placeholder="สาขาสยาม" />}
            />
          </Form.Item>
        </Col>
      </Row>

      {/* Summary Alert */}
      <Alert
        message="ตรวจสอบข้อมูล"
        description="กรุณาตรวจสอบความถูกต้องของข้อมูลทั้งหมดก่อนกดยืนยัน การแก้ไขข้อมูลในภายหลังต้องได้รับการอนุมัติจาก HR"
        type="info"
        showIcon
        style={{ marginTop: '24px' }}
      />

      {/* Form Actions */}
      <Form.Item style={{ marginTop: '32px' }}>
        <Space>
          <Button onClick={onCancel}>ยกเลิก</Button>
          <Button onClick={onBack}>ย้อนกลับ</Button>
          <Button type="primary" htmlType="submit">
            ถัดไป
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};
