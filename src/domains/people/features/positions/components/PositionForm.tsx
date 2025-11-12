import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
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
  Tag,
} from 'antd';
import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { usePositions } from '@/domains/people/features/positions/hooks/usePositions';
import {
  type PositionFormInput,
  PositionFormSchema,
  type PositionLevel,
  type PositionStatus,
} from '@/domains/people/features/positions/schemas';
import type { Position } from '@/domains/people/features/positions/types';

const { Option } = Select;
const { TextArea } = Input;

interface PositionFormProps {
  initialData?: Position | undefined;
  onSubmit: (data: PositionFormInput) => void | Promise<void>;
  loading?: boolean | undefined;
  submitText?: string | undefined;
}

const DEPARTMENTS = [
  'ฝ่ายบริหาร',
  'ฝ่ายบุคคล',
  'ฝ่ายการเงินและบัญชี',
  'ฝ่ายขาย',
  'ฝ่ายการตลาด',
  'ฝ่ายไอที',
  'ฝ่ายปฏิบัติการ',
  'ฝ่ายผลิต',
  'ฝ่ายวิจัยและพัฒนา',
  'ฝ่ายบริการลูกค้า',
  'ฝ่ายจัดซื้อ',
  'ฝ่ายโลจิสติกส์',
];

const POSITION_LEVELS: { value: PositionLevel; label: string }[] = [
  { value: 'executive', label: 'ผู้บริหารระดับสูง' },
  { value: 'senior-management', label: 'ผู้บริหารอาวุโส' },
  { value: 'middle-management', label: 'ผู้บริหารระดับกลาง' },
  { value: 'supervisor', label: 'หัวหน้างาน' },
  { value: 'staff', label: 'พนักงาน' },
  { value: 'junior', label: 'พนักงานระดับเริ่มต้น' },
];

const STATUS_OPTIONS: { value: PositionStatus; label: string; color: string }[] = [
  { value: 'active', label: 'เปิดใช้งาน', color: 'green' },
  { value: 'inactive', label: 'ปิดใช้งาน', color: 'red' },
];

export const PositionForm: FC<PositionFormProps> = ({
  initialData,
  onSubmit,
  loading = false,
  submitText = 'บันทึก',
}) => {
  const [responsibilities, setResponsibilities] = useState<string[]>(['']);
  const [requirements, setRequirements] = useState<string[]>(['']);
  const [qualifications, setQualifications] = useState<string[]>(['']);
  const [skills, setSkills] = useState<string[]>(['']);
  const [competencies, setCompetencies] = useState<string[]>(['']);

  const { data: positions } = usePositions({ status: 'active' });

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PositionFormInput>({
    resolver: zodResolver(PositionFormSchema),
    defaultValues: initialData
      ? {
          positionCode: initialData.positionCode,
          nameTH: initialData.nameTH,
          nameEN: initialData.nameEN,
          level: initialData.level,
          department: initialData.department,
          parentPositionId: initialData.parentPositionId,
          jobDescription: initialData.jobDescription,
          salaryRange: initialData.salaryRange,
          headcount: initialData.headcount,
          status: initialData.status,
        }
      : {
          status: 'active',
          salaryRange: {
            min: 0,
            max: 0,
            currency: 'THB',
          },
          headcount: 1,
        },
  });

  // Reset form when initialData changes
  useEffect(() => {
    if (initialData) {
      reset({
        positionCode: initialData.positionCode,
        nameTH: initialData.nameTH,
        nameEN: initialData.nameEN,
        level: initialData.level,
        department: initialData.department,
        parentPositionId: initialData.parentPositionId,
        jobDescription: initialData.jobDescription,
        salaryRange: initialData.salaryRange,
        headcount: initialData.headcount,
        status: initialData.status,
      });

      // Set array fields
      setResponsibilities(initialData.jobDescription.responsibilities || ['']);
      setRequirements(initialData.jobDescription.requirements || ['']);
      setQualifications(initialData.jobDescription.qualifications || ['']);
      setSkills(initialData.jobDescription.skills || ['']);
      setCompetencies(initialData.jobDescription.competencies || ['']);
    }
  }, [initialData, reset]);

  const handleFormSubmit = handleSubmit((data) => {
    // Build job description from array fields
    const jobDescription = {
      overview: data.jobDescription.overview,
      responsibilities: responsibilities.filter((r) => r.trim() !== ''),
      requirements: requirements.filter((r) => r.trim() !== ''),
      qualifications: qualifications.filter((q) => q.trim() !== ''),
      skills: skills.filter((s) => s.trim() !== ''),
      competencies: competencies.filter((c) => c.trim() !== ''),
    };

    onSubmit({
      ...data,
      jobDescription,
    });
  });

  // Helper to add/remove array items
  const addArrayItem = (arr: string[], setArr: (arr: string[]) => void) => {
    setArr([...arr, '']);
  };

  const removeArrayItem = (arr: string[], setArr: (arr: string[]) => void, index: number) => {
    setArr(arr.filter((_, i) => i !== index));
  };

  const updateArrayItem = (
    arr: string[],
    setArr: (arr: string[]) => void,
    index: number,
    value: string
  ) => {
    const newArr = [...arr];
    newArr[index] = value;
    setArr(newArr);
  };

  return (
    <Form layout="vertical" onFinish={handleFormSubmit}>
      <Card title="ข้อมูลพื้นฐาน" style={{ marginBottom: 24 }}>
        <Row gutter={16}>
          <Col xs={24} sm={12} md={8}>
            <Form.Item
              label="รหัสตำแหน่ง"
              required
              validateStatus={errors.positionCode ? 'error' : ''}
              help={errors.positionCode?.message}
            >
              <Controller
                name="positionCode"
                control={control}
                render={({ field }) => <Input {...field} placeholder="เช่น POS-001" />}
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={8}>
            <Form.Item
              label="ชื่อตำแหน่ง (ไทย)"
              required
              validateStatus={errors.nameTH ? 'error' : ''}
              help={errors.nameTH?.message}
            >
              <Controller
                name="nameTH"
                control={control}
                render={({ field }) => <Input {...field} placeholder="เช่น ผู้จัดการฝ่ายขาย" />}
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={8}>
            <Form.Item
              label="ชื่อตำแหน่ง (อังกฤษ)"
              validateStatus={errors.nameEN ? 'error' : ''}
              help={errors.nameEN?.message}
            >
              <Controller
                name="nameEN"
                control={control}
                render={({ field }) => <Input {...field} placeholder="e.g. Sales Manager" />}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} sm={12} md={8}>
            <Form.Item
              label="ระดับตำแหน่ง"
              required
              validateStatus={errors.level ? 'error' : ''}
              help={errors.level?.message}
            >
              <Controller
                name="level"
                control={control}
                render={({ field }) => (
                  <Select {...field} placeholder="เลือกระดับตำแหน่ง">
                    {POSITION_LEVELS.map((level) => (
                      <Option key={level.value} value={level.value}>
                        {level.label}
                      </Option>
                    ))}
                  </Select>
                )}
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={8}>
            <Form.Item
              label="แผนก/ฝ่าย"
              required
              validateStatus={errors.department ? 'error' : ''}
              help={errors.department?.message}
            >
              <Controller
                name="department"
                control={control}
                render={({ field }) => (
                  <Select {...field} placeholder="เลือกแผนก/ฝ่าย" showSearch>
                    {DEPARTMENTS.map((dept) => (
                      <Option key={dept} value={dept}>
                        {dept}
                      </Option>
                    ))}
                  </Select>
                )}
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={8}>
            <Form.Item
              label="ตำแหน่งหัวหน้า"
              validateStatus={errors.parentPositionId ? 'error' : ''}
              help={errors.parentPositionId?.message}
            >
              <Controller
                name="parentPositionId"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    placeholder="เลือกตำแหน่งหัวหน้า (ถ้ามี)"
                    allowClear
                    showSearch
                    optionFilterProp="children"
                  >
                    {positions
                      ?.filter((p) => p.id !== initialData?.id) // Exclude current position
                      .map((pos) => (
                        <Option key={pos.id} value={pos.id}>
                          {pos.nameTH} ({pos.positionCode})
                        </Option>
                      ))}
                  </Select>
                )}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} sm={12} md={8}>
            <Form.Item
              label="จำนวนตำแหน่ง (Headcount)"
              required
              validateStatus={errors.headcount ? 'error' : ''}
              help={errors.headcount?.message}
            >
              <Controller
                name="headcount"
                control={control}
                render={({ field }) => <InputNumber {...field} min={1} style={{ width: '100%' }} />}
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={8}>
            <Form.Item
              label="สถานะ"
              required
              validateStatus={errors.status ? 'error' : ''}
              help={errors.status?.message}
            >
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select {...field} placeholder="เลือกสถานะ">
                    {STATUS_OPTIONS.map((status) => (
                      <Option key={status.value} value={status.value}>
                        <Tag color={status.color}>{status.label}</Tag>
                      </Option>
                    ))}
                  </Select>
                )}
              />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      <Card title="ช่วงเงินเดือน" style={{ marginBottom: 24 }}>
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              label="เงินเดือนขั้นต่ำ (บาท)"
              required
              validateStatus={errors.salaryRange?.min ? 'error' : ''}
              help={errors.salaryRange?.min?.message}
            >
              <Controller
                name="salaryRange.min"
                control={control}
                render={({ field }) => (
                  <InputNumber
                    {...field}
                    min={0}
                    style={{ width: '100%' }}
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => value?.replace(/\$\s?|(,*)/g, '') as unknown as number}
                  />
                )}
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item
              label="เงินเดือนขั้นสูง (บาท)"
              required
              validateStatus={errors.salaryRange?.max ? 'error' : ''}
              help={errors.salaryRange?.max?.message}
            >
              <Controller
                name="salaryRange.max"
                control={control}
                render={({ field }) => (
                  <InputNumber
                    {...field}
                    min={0}
                    style={{ width: '100%' }}
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => value?.replace(/\$\s?|(,*)/g, '') as unknown as number}
                  />
                )}
              />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      <Card title="รายละเอียดงาน (Job Description)" style={{ marginBottom: 24 }}>
        <Form.Item
          label="ภาพรวมของงาน"
          required
          validateStatus={errors.jobDescription?.overview ? 'error' : ''}
          help={errors.jobDescription?.overview?.message}
        >
          <Controller
            name="jobDescription.overview"
            control={control}
            render={({ field }) => (
              <TextArea {...field} rows={4} placeholder="อธิบายภาพรวมของตำแหน่งงานนี้" />
            )}
          />
        </Form.Item>

        <Divider />

        <Form.Item label="ความรับผิดชอบ" required>
          <Space direction="vertical" style={{ width: '100%' }}>
            {responsibilities.map((resp, index) => (
              <Space key={`resp-${index}`} style={{ width: '100%' }}>
                <Input
                  value={resp}
                  onChange={(e) =>
                    updateArrayItem(responsibilities, setResponsibilities, index, e.target.value)
                  }
                  placeholder="ระบุความรับผิดชอบ"
                  style={{ width: 400 }}
                />
                {responsibilities.length > 1 && (
                  <Button
                    type="text"
                    danger
                    icon={<MinusCircleOutlined />}
                    onClick={() => removeArrayItem(responsibilities, setResponsibilities, index)}
                  />
                )}
              </Space>
            ))}
            <Button
              type="dashed"
              onClick={() => addArrayItem(responsibilities, setResponsibilities)}
              icon={<PlusOutlined />}
            >
              เพิ่มความรับผิดชอบ
            </Button>
          </Space>
        </Form.Item>

        <Form.Item label="คุณสมบัติที่ต้องการ" required>
          <Space direction="vertical" style={{ width: '100%' }}>
            {requirements.map((req, index) => (
              <Space key={`req-${index}`} style={{ width: '100%' }}>
                <Input
                  value={req}
                  onChange={(e) =>
                    updateArrayItem(requirements, setRequirements, index, e.target.value)
                  }
                  placeholder="ระบุคุณสมบัติที่ต้องการ"
                  style={{ width: 400 }}
                />
                {requirements.length > 1 && (
                  <Button
                    type="text"
                    danger
                    icon={<MinusCircleOutlined />}
                    onClick={() => removeArrayItem(requirements, setRequirements, index)}
                  />
                )}
              </Space>
            ))}
            <Button
              type="dashed"
              onClick={() => addArrayItem(requirements, setRequirements)}
              icon={<PlusOutlined />}
            >
              เพิ่มคุณสมบัติ
            </Button>
          </Space>
        </Form.Item>

        <Form.Item label="วุฒิการศึกษา/ประสบการณ์" required>
          <Space direction="vertical" style={{ width: '100%' }}>
            {qualifications.map((qual, index) => (
              <Space key={`qual-${index}`} style={{ width: '100%' }}>
                <Input
                  value={qual}
                  onChange={(e) =>
                    updateArrayItem(qualifications, setQualifications, index, e.target.value)
                  }
                  placeholder="ระบุวุฒิการศึกษาหรือประสบการณ์"
                  style={{ width: 400 }}
                />
                {qualifications.length > 1 && (
                  <Button
                    type="text"
                    danger
                    icon={<MinusCircleOutlined />}
                    onClick={() => removeArrayItem(qualifications, setQualifications, index)}
                  />
                )}
              </Space>
            ))}
            <Button
              type="dashed"
              onClick={() => addArrayItem(qualifications, setQualifications)}
              icon={<PlusOutlined />}
            >
              เพิ่มวุฒิการศึกษา/ประสบการณ์
            </Button>
          </Space>
        </Form.Item>

        <Form.Item label="ทักษะที่จำเป็น" required>
          <Space direction="vertical" style={{ width: '100%' }}>
            {skills.map((skill, index) => (
              <Space key={`skill-${index}`} style={{ width: '100%' }}>
                <Input
                  value={skill}
                  onChange={(e) => updateArrayItem(skills, setSkills, index, e.target.value)}
                  placeholder="ระบุทักษะที่จำเป็น"
                  style={{ width: 400 }}
                />
                {skills.length > 1 && (
                  <Button
                    type="text"
                    danger
                    icon={<MinusCircleOutlined />}
                    onClick={() => removeArrayItem(skills, setSkills, index)}
                  />
                )}
              </Space>
            ))}
            <Button
              type="dashed"
              onClick={() => addArrayItem(skills, setSkills)}
              icon={<PlusOutlined />}
            >
              เพิ่มทักษะ
            </Button>
          </Space>
        </Form.Item>

        <Form.Item label="สมรรถนะหลัก (Optional)">
          <Space direction="vertical" style={{ width: '100%' }}>
            {competencies.map((comp, index) => (
              <Space key={`comp-${index}`} style={{ width: '100%' }}>
                <Input
                  value={comp}
                  onChange={(e) =>
                    updateArrayItem(competencies, setCompetencies, index, e.target.value)
                  }
                  placeholder="ระบุสมรรถนะหลัก"
                  style={{ width: 400 }}
                />
                <Button
                  type="text"
                  danger
                  icon={<MinusCircleOutlined />}
                  onClick={() => removeArrayItem(competencies, setCompetencies, index)}
                />
              </Space>
            ))}
            <Button
              type="dashed"
              onClick={() => addArrayItem(competencies, setCompetencies)}
              icon={<PlusOutlined />}
            >
              เพิ่มสมรรถนะหลัก
            </Button>
          </Space>
        </Form.Item>
      </Card>

      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit" loading={loading} size="large">
            {submitText}
          </Button>
          <Button htmlType="reset" size="large">
            ล้างข้อมูล
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};
