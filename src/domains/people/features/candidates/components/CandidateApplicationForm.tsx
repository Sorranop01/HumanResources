import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Card,
  Col,
  Divider,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
  Typography,
} from 'antd';
import type { FC } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { usePositions } from '@/domains/system/features/settings/positions/hooks/usePositions';
import { useCreateCandidate } from '../hooks/useCreateCandidate';
import { CandidateApplicationSchema, ExperienceLevelSchema } from '../schemas';

const TENANT_ID = 'default';

type CandidateApplicationFormValues = (typeof CandidateApplicationSchema)['_input'];

const { Title, Text } = Typography;
const { TextArea } = Input;

export const CandidateApplicationForm: FC = () => {
  const createCandidate = useCreateCandidate();
  const { data: positions, isLoading: positionsLoading } = usePositions(TENANT_ID, {
    isActive: true,
  });

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm<CandidateApplicationFormValues>({
    resolver: zodResolver(CandidateApplicationSchema),
    defaultValues: {
      education: [
        { degree: '', field: '', institution: '', graduationYear: new Date().getFullYear() },
      ],
      workExperience: [],
      skills: [],
      languages: [],
    },
  });

  const {
    fields: educationFields,
    append: appendEducation,
    remove: removeEducation,
  } = useFieldArray({
    control,
    name: 'education',
  });

  const {
    fields: workExperienceFields,
    append: appendWorkExperience,
    remove: removeWorkExperience,
  } = useFieldArray({
    control,
    name: 'workExperience',
  });

  const onSubmit = async (data: CandidateApplicationFormValues) => {
    try {
      const payload = CandidateApplicationSchema.parse(data);
      await createCandidate.mutateAsync(payload);
      reset();
    } catch (error) {
      console.error('Failed to submit application:', error);
    }
  };

  const experienceLevelOptions = ExperienceLevelSchema.options.map((level) => ({
    label: getLevelLabel(level),
    value: level,
  }));

  return (
    <Card>
      <Title level={2}>ใบสมัครงาน</Title>
      <Text type="secondary">กรุณากรอกข้อมูลให้ครบถ้วนเพื่อสมัครงานกับเรา</Text>

      <Form layout="vertical" onFinish={handleSubmit(onSubmit)} style={{ marginTop: 24 }}>
        <Divider orientation="left">ข้อมูลส่วนตัว</Divider>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="ชื่อ"
              validateStatus={errors.firstName ? 'error' : ''}
              help={errors.firstName?.message}
              required
            >
              <Controller
                name="firstName"
                control={control}
                render={({ field }) => <Input {...field} placeholder="กรอกชื่อ" />}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="นามสกุล"
              validateStatus={errors.lastName ? 'error' : ''}
              help={errors.lastName?.message}
              required
            >
              <Controller
                name="lastName"
                control={control}
                render={({ field }) => <Input {...field} placeholder="กรอกนามสกุล" />}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="อีเมล"
              validateStatus={errors.email ? 'error' : ''}
              help={errors.email?.message}
              required
            >
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <Input {...field} type="email" placeholder="example@email.com" />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="เบอร์โทรศัพท์"
              validateStatus={errors.phone ? 'error' : ''}
              help={errors.phone?.message}
              required
            >
              <Controller
                name="phone"
                control={control}
                render={({ field }) => <Input {...field} placeholder="0812345678" maxLength={10} />}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item label="วันเกิด" validateStatus={errors.dateOfBirth ? 'error' : ''}>
              <Controller
                name="dateOfBirth"
                control={control}
                render={({ field }) => <Input {...field} type="date" />}
              />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item label="สัญชาติ" validateStatus={errors.nationality ? 'error' : ''}>
              <Controller
                name="nationality"
                control={control}
                render={({ field }) => <Input {...field} placeholder="ไทย" />}
              />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item label="ที่อยู่" validateStatus={errors.address ? 'error' : ''}>
              <Controller
                name="address"
                control={control}
                render={({ field }) => <TextArea {...field} rows={1} placeholder="ที่อยู่ปัจจุบัน" />}
              />
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation="left">ข้อมูลการสมัครงาน</Divider>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="ตำแหน่งที่สมัคร"
              validateStatus={errors.positionId ? 'error' : ''}
              help={errors.positionId?.message}
              required
            >
              <Controller
                name="positionId"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    placeholder="เลือกตำแหน่งที่สมัคร"
                    loading={positionsLoading}
                    showSearch
                    filterOption={(input, option) =>
                      (option?.label?.toString() ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                    onChange={(value) => {
                      // Find selected position and denormalize
                      const selectedPosition = positions?.find((p) => p.id === value);
                      if (selectedPosition) {
                        field.onChange(value); // positionId
                        setValue('positionName', selectedPosition.title);
                        setValue('departmentId', selectedPosition.departmentId);
                        setValue('departmentName', selectedPosition.departmentName);
                      }
                    }}
                    options={positions?.map((pos) => ({
                      label: `${pos.code} - ${pos.title} (${pos.level})`,
                      value: pos.id,
                    }))}
                    style={{ width: '100%' }}
                  />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="เงินเดือนที่คาดหวัง (บาท)"
              validateStatus={errors.expectedSalary ? 'error' : ''}
            >
              <Controller
                name="expectedSalary"
                control={control}
                render={({ field }) => (
                  <InputNumber {...field} style={{ width: '100%' }} min={0} placeholder="30000" />
                )}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              label="วันที่สามารถเริ่มงานได้"
              validateStatus={errors.availableDate ? 'error' : ''}
            >
              <Controller
                name="availableDate"
                control={control}
                render={({ field }) => <Input {...field} type="date" />}
              />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item label="ระดับประสบการณ์" validateStatus={errors.experienceLevel ? 'error' : ''}>
              <Controller
                name="experienceLevel"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    placeholder="เลือกระดับประสบการณ์"
                    options={experienceLevelOptions}
                  />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              label="จำนวนปีประสบการณ์"
              validateStatus={errors.yearsOfExperience ? 'error' : ''}
            >
              <Controller
                name="yearsOfExperience"
                control={control}
                render={({ field }) => (
                  <InputNumber {...field} style={{ width: '100%' }} min={0} placeholder="0" />
                )}
              />
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation="left">ประวัติการศึกษา</Divider>

        {educationFields.map((field, index) => (
          <Card key={field.id} style={{ marginBottom: 16 }} size="small">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="ระดับการศึกษา"
                  validateStatus={errors.education?.[index]?.degree ? 'error' : ''}
                  help={errors.education?.[index]?.degree?.message}
                  required
                >
                  <Controller
                    name={`education.${index}.degree`}
                    control={control}
                    render={({ field }) => <Input {...field} placeholder="เช่น ปริญญาตรี" />}
                  />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  label="สาขาวิชา"
                  validateStatus={errors.education?.[index]?.field ? 'error' : ''}
                  help={errors.education?.[index]?.field?.message}
                  required
                >
                  <Controller
                    name={`education.${index}.field`}
                    control={control}
                    render={({ field }) => <Input {...field} placeholder="เช่น วิทยาการคอมพิวเตอร์" />}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="สถาบันการศึกษา"
                  validateStatus={errors.education?.[index]?.institution ? 'error' : ''}
                  help={errors.education?.[index]?.institution?.message}
                  required
                >
                  <Controller
                    name={`education.${index}.institution`}
                    control={control}
                    render={({ field }) => <Input {...field} placeholder="ชื่อมหาวิทยาลัย" />}
                  />
                </Form.Item>
              </Col>

              <Col span={6}>
                <Form.Item
                  label="ปีที่สำเร็จการศึกษา"
                  validateStatus={errors.education?.[index]?.graduationYear ? 'error' : ''}
                  required
                >
                  <Controller
                    name={`education.${index}.graduationYear`}
                    control={control}
                    render={({ field }) => (
                      <InputNumber {...field} style={{ width: '100%' }} min={1950} max={2030} />
                    )}
                  />
                </Form.Item>
              </Col>

              <Col span={6}>
                <Form.Item
                  label="GPA"
                  validateStatus={errors.education?.[index]?.gpa ? 'error' : ''}
                >
                  <Controller
                    name={`education.${index}.gpa`}
                    control={control}
                    render={({ field }) => (
                      <InputNumber
                        {...field}
                        style={{ width: '100%' }}
                        min={0}
                        max={4}
                        step={0.01}
                      />
                    )}
                  />
                </Form.Item>
              </Col>
            </Row>

            {educationFields.length > 1 && (
              <Button
                type="link"
                danger
                icon={<DeleteOutlined />}
                onClick={() => removeEducation(index)}
              >
                ลบ
              </Button>
            )}
          </Card>
        ))}

        <Button
          type="dashed"
          onClick={() =>
            appendEducation({
              degree: '',
              field: '',
              institution: '',
              graduationYear: new Date().getFullYear(),
            })
          }
          block
          icon={<PlusOutlined />}
        >
          เพิ่มประวัติการศึกษา
        </Button>

        <Divider orientation="left">ประสบการณ์ทำงาน</Divider>

        {workExperienceFields.map((field, index) => (
          <Card key={field.id} style={{ marginBottom: 16 }} size="small">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="ตำแหน่งงาน"
                  validateStatus={errors.workExperience?.[index]?.title ? 'error' : ''}
                  help={errors.workExperience?.[index]?.title?.message}
                  required
                >
                  <Controller
                    name={`workExperience.${index}.title`}
                    control={control}
                    render={({ field }) => <Input {...field} placeholder="เช่น Senior Developer" />}
                  />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  label="บริษัท"
                  validateStatus={errors.workExperience?.[index]?.company ? 'error' : ''}
                  help={errors.workExperience?.[index]?.company?.message}
                  required
                >
                  <Controller
                    name={`workExperience.${index}.company`}
                    control={control}
                    render={({ field }) => <Input {...field} placeholder="ชื่อบริษัท" />}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  label="วันที่เริ่ม"
                  validateStatus={errors.workExperience?.[index]?.startDate ? 'error' : ''}
                  required
                >
                  <Controller
                    name={`workExperience.${index}.startDate`}
                    control={control}
                    render={({ field }) => <Input {...field} type="date" />}
                  />
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item label="วันที่สิ้นสุด">
                  <Controller
                    name={`workExperience.${index}.endDate`}
                    control={control}
                    render={({ field }) => <Input {...field} type="date" />}
                  />
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item label="ปัจจุบัน">
                  <Controller
                    name={`workExperience.${index}.current`}
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        options={[
                          { label: 'ไม่ใช่', value: false },
                          { label: 'ใช่', value: true },
                        ]}
                      />
                    )}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item label="รายละเอียดงาน">
              <Controller
                name={`workExperience.${index}.description`}
                control={control}
                render={({ field }) => (
                  <TextArea {...field} rows={3} placeholder="อธิบายหน้าที่และผลงาน" />
                )}
              />
            </Form.Item>

            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
              onClick={() => removeWorkExperience(index)}
            >
              ลบ
            </Button>
          </Card>
        ))}

        <Button
          type="dashed"
          onClick={() =>
            appendWorkExperience({
              title: '',
              company: '',
              startDate: '',
              current: false,
            })
          }
          block
          icon={<PlusOutlined />}
        >
          เพิ่มประสบการณ์ทำงาน
        </Button>

        <Divider orientation="left">เอกสารและลิงก์</Divider>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              label="Resume/CV URL"
              validateStatus={errors.resumeUrl ? 'error' : ''}
              help={errors.resumeUrl?.message}
            >
              <Controller
                name="resumeUrl"
                control={control}
                render={({ field }) => (
                  <Input {...field} value={field.value ?? ''} placeholder="https://..." />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item label="Portfolio URL" validateStatus={errors.portfolioUrl ? 'error' : ''}>
              <Controller
                name="portfolioUrl"
                control={control}
                render={({ field }) => (
                  <Input {...field} value={field.value ?? ''} placeholder="https://..." />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item label="LinkedIn URL" validateStatus={errors.linkedInUrl ? 'error' : ''}>
              <Controller
                name="linkedInUrl"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    value={field.value ?? ''}
                    placeholder="https://linkedin.com/in/..."
                  />
                )}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item style={{ marginTop: 24 }}>
          <Space>
            <Button type="primary" htmlType="submit" loading={isSubmitting} size="large">
              ส่งใบสมัคร
            </Button>
            <Button onClick={() => reset()} size="large">
              ล้างข้อมูล
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
};

function getLevelLabel(level: string): string {
  const labels: Record<string, string> = {
    entry: 'เริ่มต้น (Entry Level)',
    junior: 'จูเนียร์ (Junior)',
    mid: 'ระดับกลาง (Mid Level)',
    senior: 'ซีเนียร์ (Senior)',
    lead: 'หัวหน้าทีม (Lead)',
    executive: 'ผู้บริหาร (Executive)',
  };
  return labels[level] ?? level;
}
