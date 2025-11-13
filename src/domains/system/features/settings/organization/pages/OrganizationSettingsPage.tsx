import { BankOutlined, EditOutlined, PlusOutlined, SaveOutlined } from '@ant-design/icons';
import { Button, Card, Col, Descriptions, Form, Input, message, Row, Select, Spin } from 'antd';
import type { FC } from 'react';
import { useState } from 'react';
import { useCreateOrganization } from '../hooks/useCreateOrganization';
import { useOrganization } from '../hooks/useOrganization';
import { useUpdateOrganization } from '../hooks/useUpdateOrganization';

const TENANT_ID = 'default'; // TODO: Get from auth context
const USER_ID = 'system'; // TODO: Get from auth context

export const OrganizationSettingsPage: FC = () => {
  const { data: organization, isLoading } = useOrganization(TENANT_ID);
  const { mutate: createOrganization, isPending: isCreating } = useCreateOrganization();
  const { mutate: updateOrganization, isPending: isUpdating } = useUpdateOrganization();
  const [isEditing, setIsEditing] = useState(false);
  const [form] = Form.useForm();

  const isPending = isCreating || isUpdating;

  const handleEdit = () => {
    if (organization) {
      form.setFieldsValue({
        companyName: organization.companyName,
        companyNameEn: organization.companyNameEn,
        registrationNumber: organization.registrationNumber,
        taxNumber: organization.taxNumber,
        phone: organization.phone,
        email: organization.email,
        website: organization.website,
        addressLine1: organization.address.addressLine1,
        addressLine2: organization.address.addressLine2,
        subDistrict: organization.address.subDistrict,
        district: organization.address.district,
        province: organization.address.province,
        postalCode: organization.address.postalCode,
        country: organization.address.country,
        currency: organization.currency,
        timezone: organization.timezone,
        defaultLanguage: organization.defaultLanguage,
        fiscalYearStart: organization.fiscalYearStart,
      });
      setIsEditing(true);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setIsEditing(false);
  };

  const handleCreate = () => {
    form.setFieldsValue({
      country: 'ประเทศไทย',
      currency: 'THB',
      timezone: 'Asia/Bangkok',
      defaultLanguage: 'th',
      fiscalYearStart: '01-01',
    });
    setIsEditing(true);
  };

  const handleSave = () => {
    form.validateFields().then((values) => {
      const inputData = {
        companyName: values.companyName,
        companyNameEn: values.companyNameEn,
        registrationNumber: values.registrationNumber,
        taxNumber: values.taxNumber,
        phone: values.phone,
        email: values.email,
        website: values.website || undefined,
        address: {
          addressLine1: values.addressLine1,
          addressLine2: values.addressLine2 || undefined,
          subDistrict: values.subDistrict,
          district: values.district,
          province: values.province,
          postalCode: values.postalCode,
          country: values.country,
        },
        currency: values.currency || 'THB',
        timezone: values.timezone || 'Asia/Bangkok',
        defaultLanguage: values.defaultLanguage || 'th',
        fiscalYearStart: values.fiscalYearStart || '01-01',
      };

      if (organization) {
        // Update existing
        updateOrganization(
          {
            tenantId: TENANT_ID,
            input: inputData,
            userId: USER_ID,
          },
          {
            onSuccess: () => {
              message.success('บันทึกข้อมูลองค์กรสำเร็จ');
              setIsEditing(false);
            },
            onError: (error) => {
              message.error(error.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
            },
          }
        );
      } else {
        // Create new
        createOrganization(
          {
            tenantId: TENANT_ID,
            input: inputData,
            userId: USER_ID,
          },
          {
            onSuccess: () => {
              message.success('สร้างข้อมูลองค์กรสำเร็จ');
              setIsEditing(false);
            },
            onError: (error) => {
              message.error(error.message || 'เกิดข้อผิดพลาดในการสร้างข้อมูล');
            },
          }
        );
      }
    });
  };

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!organization && !isEditing) {
    return (
      <Card
        title={
          <span>
            <BankOutlined /> ข้อมูลองค์กร
          </span>
        }
      >
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ marginBottom: 16 }}>ยังไม่มีข้อมูลองค์กร</p>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            สร้างข้อมูลองค์กร
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card
            title={
              <span>
                <BankOutlined /> ข้อมูลองค์กร
              </span>
            }
            extra={
              !isEditing ? (
                <Button icon={<EditOutlined />} onClick={handleEdit}>
                  แก้ไข
                </Button>
              ) : (
                <div>
                  <Button onClick={handleCancel} style={{ marginRight: 8 }}>
                    ยกเลิก
                  </Button>
                  <Button
                    type="primary"
                    icon={<SaveOutlined />}
                    onClick={handleSave}
                    loading={isPending}
                  >
                    บันทึก
                  </Button>
                </div>
              )
            }
          >
            {!isEditing ? (
              <Descriptions bordered column={2}>
                <Descriptions.Item label="ชื่อบริษัท (TH)" span={2}>
                  {organization.companyName}
                </Descriptions.Item>
                <Descriptions.Item label="Company Name (EN)" span={2}>
                  {organization.companyNameEn}
                </Descriptions.Item>
                <Descriptions.Item label="เลขทะเบียนนิติบุคคล">
                  {organization.registrationNumber}
                </Descriptions.Item>
                <Descriptions.Item label="เลขประจำตัวผู้เสียภาษี">
                  {organization.taxNumber}
                </Descriptions.Item>
                <Descriptions.Item label="เบอร์โทรศัพท์">{organization.phone}</Descriptions.Item>
                <Descriptions.Item label="อีเมล">{organization.email}</Descriptions.Item>
                <Descriptions.Item label="เว็บไซต์" span={2}>
                  {organization.website || '-'}
                </Descriptions.Item>
                <Descriptions.Item label="ที่อยู่" span={2}>
                  {organization.address.addressLine1}
                  {organization.address.addressLine2 && `, ${organization.address.addressLine2}`}
                  <br />
                  ตำบล/แขวง {organization.address.subDistrict} อำเภอ/เขต{' '}
                  {organization.address.district}
                  <br />
                  จังหวัด {organization.address.province} {organization.address.postalCode}
                  <br />
                  {organization.address.country}
                </Descriptions.Item>
                <Descriptions.Item label="สกุลเงิน">{organization.currency}</Descriptions.Item>
                <Descriptions.Item label="วันเริ่มปีงบประมาณ">
                  {organization.fiscalYearStart}
                </Descriptions.Item>
                <Descriptions.Item label="เขตเวลา">{organization.timezone}</Descriptions.Item>
                <Descriptions.Item label="ภาษาเริ่มต้น">
                  {organization.defaultLanguage === 'th' ? 'ไทย' : 'English'}
                </Descriptions.Item>
              </Descriptions>
            ) : (
              <Form form={form} layout="vertical">
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label="ชื่อบริษัท (TH)"
                      name="companyName"
                      rules={[{ required: true, message: 'กรุณากรอกชื่อบริษัท' }]}
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="Company Name (EN)"
                      name="companyNameEn"
                      rules={[{ required: true, message: 'Please enter company name' }]}
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="เลขทะเบียนนิติบุคคล"
                      name="registrationNumber"
                      rules={[{ required: true, message: 'กรุณากรอกเลขทะเบียน' }]}
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="เลขประจำตัวผู้เสียภาษี"
                      name="taxNumber"
                      rules={[
                        { required: true, message: 'กรุณากรอกเลขภาษี' },
                        { len: 13, message: 'เลขภาษีต้องเป็น 13 หลัก' },
                      ]}
                    >
                      <Input maxLength={13} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="เบอร์โทรศัพท์"
                      name="phone"
                      rules={[{ required: true, message: 'กรุณากรอกเบอร์โทรศัพท์' }]}
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="อีเมล"
                      name="email"
                      rules={[
                        { required: true, message: 'กรุณากรอกอีเมล' },
                        { type: 'email', message: 'รูปแบบอีเมลไม่ถูกต้อง' },
                      ]}
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item label="เว็บไซต์" name="website">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item
                      label="ที่อยู่บรรทัดที่ 1"
                      name="addressLine1"
                      rules={[{ required: true, message: 'กรุณากรอกที่อยู่' }]}
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item label="ที่อยู่บรรทัดที่ 2" name="addressLine2">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="ตำบล/แขวง"
                      name="subDistrict"
                      rules={[{ required: true, message: 'กรุณากรอกตำบล/แขวง' }]}
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="อำเภอ/เขต"
                      name="district"
                      rules={[{ required: true, message: 'กรุณากรอกอำเภอ/เขต' }]}
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="จังหวัด"
                      name="province"
                      rules={[{ required: true, message: 'กรุณากรอกจังหวัด' }]}
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="รหัสไปรษณีย์"
                      name="postalCode"
                      rules={[
                        { required: true, message: 'กรุณากรอกรหัสไปรษณีย์' },
                        { len: 5, message: 'รหัสไปรษณีย์ต้องเป็น 5 หลัก' },
                      ]}
                    >
                      <Input maxLength={5} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="ประเทศ"
                      name="country"
                      rules={[{ required: true, message: 'กรุณากรอกประเทศ' }]}
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="สกุลเงิน"
                      name="currency"
                      initialValue="THB"
                      rules={[{ required: true, message: 'กรุณาเลือกสกุลเงิน' }]}
                    >
                      <Select>
                        <Select.Option value="THB">THB - บาท</Select.Option>
                        <Select.Option value="USD">USD - ดอลลาร์</Select.Option>
                        <Select.Option value="EUR">EUR - ยูโร</Select.Option>
                        <Select.Option value="GBP">GBP - ปอนด์</Select.Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="เขตเวลา"
                      name="timezone"
                      initialValue="Asia/Bangkok"
                      rules={[{ required: true, message: 'กรุณาเลือกเขตเวลา' }]}
                    >
                      <Select>
                        <Select.Option value="Asia/Bangkok">Asia/Bangkok (GMT+7)</Select.Option>
                        <Select.Option value="Asia/Singapore">Asia/Singapore (GMT+8)</Select.Option>
                        <Select.Option value="Asia/Tokyo">Asia/Tokyo (GMT+9)</Select.Option>
                        <Select.Option value="Europe/London">Europe/London (GMT+0)</Select.Option>
                        <Select.Option value="America/New_York">
                          America/New_York (GMT-5)
                        </Select.Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="ภาษาเริ่มต้น"
                      name="defaultLanguage"
                      initialValue="th"
                      rules={[{ required: true, message: 'กรุณาเลือกภาษา' }]}
                    >
                      <Select>
                        <Select.Option value="th">ไทย</Select.Option>
                        <Select.Option value="en">English</Select.Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="วันเริ่มปีงบประมาณ (MM-DD)"
                      name="fiscalYearStart"
                      initialValue="01-01"
                      rules={[
                        { required: true, message: 'กรุณากรอกวันเริ่มปีงบประมาณ' },
                        { pattern: /^\d{2}-\d{2}$/, message: 'รูปแบบต้องเป็น MM-DD เช่น 01-01' },
                      ]}
                    >
                      <Input placeholder="01-01" />
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};
