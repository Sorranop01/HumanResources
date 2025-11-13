import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Col, DatePicker, Form, Input, Row, Select, Space, Typography } from 'antd';
import dayjs from 'dayjs';
import type { FC } from 'react';
import { Controller, useForm } from 'react-hook-form';
import type { EmployeeFormInput } from '../../schemas';
import { EmploymentInfoFormSchema } from '../../schemas';

const { Title, Text } = Typography;

type EmploymentInfoFormValues = (typeof EmploymentInfoFormSchema)['_input'];

interface EmploymentInfoStepProps {
  initialData?: Partial<EmployeeFormInput>;
  onNext: (data: Partial<EmployeeFormInput>) => void;
  onBack: () => void;
  onCancel: () => void;
}

/**
 * Step 2: Employment Information Form
 * Collects hire date, employment type, position, department, work location
 */
export const EmploymentInfoStep: FC<EmploymentInfoStepProps> = ({
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
  } = useForm<EmploymentInfoFormValues>({
    resolver: zodResolver(EmploymentInfoFormSchema),
    defaultValues: {
      hireDate: initialData?.hireDate || '',
      probationEndDate: initialData?.probationEndDate || '',
      status: initialData?.status || 'active',
      employmentType: initialData?.employmentType || 'permanent',
      workType: initialData?.workType || 'full-time',
      position: initialData?.position || '',
      level: initialData?.level || '',
      department: initialData?.department || '',
      division: initialData?.division || '',
      team: initialData?.team || '',
      workLocationOffice: initialData?.workLocationOffice || '',
      workLocationBuilding: initialData?.workLocationBuilding || '',
      workLocationFloor: initialData?.workLocationFloor || '',
      workLocationSeat: initialData?.workLocationSeat || '',
    },
  });

  const employmentType = watch('employmentType');

  const onSubmit = (data: EmploymentInfoFormValues) => {
    const parsed = EmploymentInfoFormSchema.parse(data);
    onNext(parsed);
  };

  return (
    <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
      <Title level={4}>ข้อมูลการจ้างงาน</Title>
      <Text type="secondary">รายละเอียดการจ้างงานและตำแหน่งงาน</Text>

      {/* Dates */}
      <Title level={5} style={{ marginTop: '24px' }}>
        วันที่สำคัญ
      </Title>
      <Row gutter={16}>
        <Col xs={24} md={8}>
          <Form.Item
            label="วันเริ่มงาน"
            required
            validateStatus={errors.hireDate ? 'error' : ''}
            help={errors.hireDate?.message}
          >
            <Controller
              name="hireDate"
              control={control}
              render={({ field }) => (
                <DatePicker
                  {...field}
                  value={field.value ? dayjs(field.value) : null}
                  onChange={(date) => field.onChange(date ? date.format('YYYY-MM-DD') : '')}
                  style={{ width: '100%' }}
                  placeholder="เลือกวันเริ่มงาน"
                  format="DD/MM/YYYY"
                />
              )}
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item
            label="วันสิ้นสุดทดลองงาน"
            validateStatus={errors.probationEndDate ? 'error' : ''}
            help={errors.probationEndDate?.message}
          >
            <Controller
              name="probationEndDate"
              control={control}
              render={({ field }) => (
                <DatePicker
                  {...field}
                  value={field.value ? dayjs(field.value) : null}
                  onChange={(date) => field.onChange(date ? date.format('YYYY-MM-DD') : '')}
                  style={{ width: '100%' }}
                  placeholder="เลือกวันสิ้นสุดทดลองงาน"
                  format="DD/MM/YYYY"
                  disabled={employmentType !== 'probation'}
                />
              )}
            />
          </Form.Item>
        </Col>
      </Row>

      {/* Employment Status & Type */}
      <Title level={5} style={{ marginTop: '16px' }}>
        ประเภทการจ้างงาน
      </Title>
      <Row gutter={16}>
        <Col xs={24} md={8}>
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
                  <Select.Option value="active">ทำงานอยู่</Select.Option>
                  <Select.Option value="on-leave">ลาพัก</Select.Option>
                  <Select.Option value="resigned">ลาออก</Select.Option>
                  <Select.Option value="terminated">เลิกจ้าง</Select.Option>
                </Select>
              )}
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item
            label="ประเภทการจ้างงาน"
            required
            validateStatus={errors.employmentType ? 'error' : ''}
            help={errors.employmentType?.message}
            tooltip="Permanent = พนักงานประจำ, Contract = สัญญาจ้าง, Probation = ทดลองงาน"
          >
            <Controller
              name="employmentType"
              control={control}
              render={({ field }) => (
                <Select {...field} placeholder="เลือกประเภทการจ้างงาน">
                  <Select.Option value="permanent">พนักงานประจำ (Permanent)</Select.Option>
                  <Select.Option value="contract">พนักงานสัญญาจ้าง (Contract)</Select.Option>
                  <Select.Option value="probation">พนักงานทดลองงาน (Probation)</Select.Option>
                  <Select.Option value="freelance">ฟรีแลนซ์ (Freelance)</Select.Option>
                  <Select.Option value="intern">พนักงานฝึกงาน (Intern)</Select.Option>
                </Select>
              )}
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item
            label="รูปแบบการทำงาน"
            required
            validateStatus={errors.workType ? 'error' : ''}
            help={errors.workType?.message}
            tooltip="Full-time = เต็มเวลา (40 ชม./สัปดาห์), Part-time = นอกเวลา"
          >
            <Controller
              name="workType"
              control={control}
              render={({ field }) => (
                <Select {...field} placeholder="เลือกรูปแบบการทำงาน">
                  <Select.Option value="full-time">เต็มเวลา (Full-time)</Select.Option>
                  <Select.Option value="part-time">นอกเวลา (Part-time)</Select.Option>
                </Select>
              )}
            />
          </Form.Item>
        </Col>
      </Row>

      {/* Position & Department */}
      <Title level={5} style={{ marginTop: '16px' }}>
        ตำแหน่งและหน่วยงาน
      </Title>
      <Row gutter={16}>
        <Col xs={24} md={8}>
          <Form.Item
            label="ตำแหน่งงาน"
            required
            validateStatus={errors.position ? 'error' : ''}
            help={errors.position?.message}
          >
            <Controller
              name="position"
              control={control}
              render={({ field }) => <Input {...field} placeholder="Software Engineer" />}
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item
            label="ระดับ"
            validateStatus={errors.level ? 'error' : ''}
            help={errors.level?.message}
          >
            <Controller
              name="level"
              control={control}
              render={({ field }) => (
                <Select {...field} placeholder="เลือกระดับ" allowClear>
                  <Select.Option value="Junior">Junior</Select.Option>
                  <Select.Option value="Mid-level">Mid-level</Select.Option>
                  <Select.Option value="Senior">Senior</Select.Option>
                  <Select.Option value="Lead">Lead</Select.Option>
                  <Select.Option value="Manager">Manager</Select.Option>
                  <Select.Option value="Director">Director</Select.Option>
                </Select>
              )}
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item
            label="แผนก"
            required
            validateStatus={errors.department ? 'error' : ''}
            help={errors.department?.message}
          >
            <Controller
              name="department"
              control={control}
              render={({ field }) => (
                <Select {...field} placeholder="เลือกแผนก" showSearch>
                  <Select.Option value="Engineering">Engineering</Select.Option>
                  <Select.Option value="Product">Product</Select.Option>
                  <Select.Option value="Design">Design</Select.Option>
                  <Select.Option value="Marketing">Marketing</Select.Option>
                  <Select.Option value="Sales">Sales</Select.Option>
                  <Select.Option value="HR">Human Resources</Select.Option>
                  <Select.Option value="Finance">Finance</Select.Option>
                  <Select.Option value="Operations">Operations</Select.Option>
                </Select>
              )}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Form.Item
            label="ฝ่าย"
            validateStatus={errors.division ? 'error' : ''}
            help={errors.division?.message}
          >
            <Controller
              name="division"
              control={control}
              render={({ field }) => <Input {...field} placeholder="Technology Division" />}
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item
            label="ทีม"
            validateStatus={errors.team ? 'error' : ''}
            help={errors.team?.message}
          >
            <Controller
              name="team"
              control={control}
              render={({ field }) => <Input {...field} placeholder="Backend Team" />}
            />
          </Form.Item>
        </Col>
      </Row>

      {/* Work Location */}
      <Title level={5} style={{ marginTop: '16px' }}>
        สถานที่ทำงาน
      </Title>
      <Row gutter={16}>
        <Col xs={24} md={6}>
          <Form.Item
            label="สำนักงาน"
            required
            validateStatus={errors.workLocationOffice ? 'error' : ''}
            help={errors.workLocationOffice?.message}
          >
            <Controller
              name="workLocationOffice"
              control={control}
              render={({ field }) => (
                <Select {...field} placeholder="เลือกสำนักงาน">
                  <Select.Option value="กรุงเทพ">กรุงเทพ</Select.Option>
                  <Select.Option value="เชียงใหม่">เชียงใหม่</Select.Option>
                  <Select.Option value="ภูเก็ต">ภูเก็ต</Select.Option>
                  <Select.Option value="Remote">Remote</Select.Option>
                </Select>
              )}
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={6}>
          <Form.Item
            label="อาคาร"
            validateStatus={errors.workLocationBuilding ? 'error' : ''}
            help={errors.workLocationBuilding?.message}
          >
            <Controller
              name="workLocationBuilding"
              control={control}
              render={({ field }) => <Input {...field} placeholder="อาคาร A" />}
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={6}>
          <Form.Item
            label="ชั้น"
            validateStatus={errors.workLocationFloor ? 'error' : ''}
            help={errors.workLocationFloor?.message}
          >
            <Controller
              name="workLocationFloor"
              control={control}
              render={({ field }) => <Input {...field} placeholder="5" />}
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={6}>
          <Form.Item
            label="ที่นั่ง"
            validateStatus={errors.workLocationSeat ? 'error' : ''}
            help={errors.workLocationSeat?.message}
          >
            <Controller
              name="workLocationSeat"
              control={control}
              render={({ field }) => <Input {...field} placeholder="A-501" />}
            />
          </Form.Item>
        </Col>
      </Row>

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
