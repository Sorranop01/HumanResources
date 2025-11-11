/**
 * Leave Request Form Component
 * Form for creating and editing leave requests
 */

import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Checkbox, Col, DatePicker, Form, Input, Row, Select, Spin } from 'antd';
import dayjs from 'dayjs';
import type { FC } from 'react';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  type LeaveRequestFormInput,
  LeaveRequestFormSchema,
} from '@/domains/people/features/leave/schemas';
import { useEmployees } from '../../employees/hooks/useEmployees';
import { useLeaveTypes } from '../hooks/useLeaveTypes';

const { TextArea } = Input;

interface LeaveRequestFormProps {
  initialData?: Partial<LeaveRequestFormInput>;
  onSubmit: (data: LeaveRequestFormInput) => void;
  onCancel?: () => void;
  loading?: boolean;
}

export const LeaveRequestForm: FC<LeaveRequestFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  loading,
}) => {
  const { data: leaveTypes, isLoading: loadingLeaveTypes } = useLeaveTypes();
  const { data: employees, isLoading: loadingEmployees } = useEmployees();
  const [showCertificateUpload, setShowCertificateUpload] = useState(
    initialData?.hasCertificate ?? false
  );

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(LeaveRequestFormSchema),
    defaultValues: {
      leaveTypeId: initialData?.leaveTypeId ?? '',
      startDate: initialData?.startDate ?? '',
      endDate: initialData?.endDate ?? '',
      isHalfDay: initialData?.isHalfDay ?? false,
      halfDayPeriod: initialData?.halfDayPeriod ?? undefined,
      reason: initialData?.reason ?? '',
      contactDuringLeave: initialData?.contactDuringLeave ?? '',
      workHandoverTo: initialData?.workHandoverTo ?? '',
      workHandoverNotes: initialData?.workHandoverNotes ?? '',
      hasCertificate: initialData?.hasCertificate ?? false,
      certificateUrl: initialData?.certificateUrl ?? '',
      certificateFileName: initialData?.certificateFileName ?? '',
    },
  });

  const isHalfDay = watch('isHalfDay');
  const hasCertificate = watch('hasCertificate');

  if (loadingLeaveTypes || loadingEmployees) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Form
      layout="vertical"
      onFinish={handleSubmit((data) => onSubmit(data as LeaveRequestFormInput))}
    >
      <Row gutter={16}>
        <Col span={24}>
          <Form.Item
            label="ประเภทการลา"
            required
            validateStatus={errors.leaveTypeId ? 'error' : ''}
            help={errors.leaveTypeId?.message}
          >
            <Controller
              name="leaveTypeId"
              control={control}
              render={({ field }) => (
                <Select {...field} placeholder="เลือกประเภทการลา">
                  {leaveTypes?.map((type) => (
                    <Select.Option key={type.id} value={type.id}>
                      {type.icon && <span style={{ marginRight: 8 }}>{type.icon}</span>}
                      {type.nameTh}
                    </Select.Option>
                  ))}
                </Select>
              )}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="วันที่เริ่มลา"
            required
            validateStatus={errors.startDate ? 'error' : ''}
            help={errors.startDate?.message}
          >
            <Controller
              name="startDate"
              control={control}
              render={({ field }) => (
                <DatePicker
                  {...field}
                  value={field.value ? dayjs(field.value) : null}
                  onChange={(date) => field.onChange(date ? date.format('YYYY-MM-DD') : '')}
                  style={{ width: '100%' }}
                  format="DD/MM/YYYY"
                />
              )}
            />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            label="วันที่สิ้นสุด"
            required
            validateStatus={errors.endDate ? 'error' : ''}
            help={errors.endDate?.message}
          >
            <Controller
              name="endDate"
              control={control}
              render={({ field }) => (
                <DatePicker
                  {...field}
                  value={field.value ? dayjs(field.value) : null}
                  onChange={(date) => field.onChange(date ? date.format('YYYY-MM-DD') : '')}
                  style={{ width: '100%' }}
                  format="DD/MM/YYYY"
                />
              )}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item>
            <Controller
              name="isHalfDay"
              control={control}
              render={({ field }) => (
                <Checkbox {...field} checked={field.value}>
                  ลาครึ่งวัน
                </Checkbox>
              )}
            />
          </Form.Item>
        </Col>

        {isHalfDay && (
          <Col span={12}>
            <Form.Item
              label="ช่วงเวลา"
              validateStatus={errors.halfDayPeriod ? 'error' : ''}
              help={errors.halfDayPeriod?.message}
            >
              <Controller
                name="halfDayPeriod"
                control={control}
                render={({ field }) => (
                  <Select {...field} placeholder="เลือกช่วงเวลา">
                    <Select.Option value="morning">เช้า (08:00 - 12:00)</Select.Option>
                    <Select.Option value="afternoon">บ่าย (13:00 - 17:00)</Select.Option>
                  </Select>
                )}
              />
            </Form.Item>
          </Col>
        )}
      </Row>

      <Form.Item
        label="เหตุผลการลา"
        required
        validateStatus={errors.reason ? 'error' : ''}
        help={errors.reason?.message}
      >
        <Controller
          name="reason"
          control={control}
          render={({ field }) => (
            <TextArea
              {...field}
              rows={4}
              placeholder="ระบุเหตุผลการลาอย่างละเอียด (อย่างน้อย 10 ตัวอักษร)"
              showCount
              maxLength={500}
            />
          )}
        />
      </Form.Item>

      <Form.Item
        label="ช่องทางติดต่อระหว่างลา"
        validateStatus={errors.contactDuringLeave ? 'error' : ''}
        help={errors.contactDuringLeave?.message}
      >
        <Controller
          name="contactDuringLeave"
          control={control}
          render={({ field }) => (
            <Input {...field} placeholder="เบอร์โทรศัพท์หรืออีเมล" maxLength={100} />
          )}
        />
      </Form.Item>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="มอบหมายงานให้"
            validateStatus={errors.workHandoverTo ? 'error' : ''}
            help={errors.workHandoverTo?.message}
          >
            <Controller
              name="workHandoverTo"
              control={control}
              render={({ field }) => (
                <Select {...field} placeholder="เลือกผู้รับมอบหมายงาน" allowClear>
                  {employees?.map((emp) => (
                    <Select.Option key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName} ({emp.employeeCode})
                    </Select.Option>
                  ))}
                </Select>
              )}
            />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            label="หมายเหตุการมอบหมายงาน"
            validateStatus={errors.workHandoverNotes ? 'error' : ''}
            help={errors.workHandoverNotes?.message}
          >
            <Controller
              name="workHandoverNotes"
              control={control}
              render={({ field }) => (
                <TextArea {...field} rows={3} placeholder="รายละเอียดงานที่มอบหมาย" maxLength={500} />
              )}
            />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item>
        <Controller
          name="hasCertificate"
          control={control}
          render={({ field }) => (
            <Checkbox
              {...field}
              checked={field.value}
              onChange={(e) => {
                field.onChange(e.target.checked);
                setShowCertificateUpload(e.target.checked);
              }}
            >
              แนบใบรับรองแพทย์ (สำหรับการลาป่วยเกิน 3 วัน)
            </Checkbox>
          )}
        />
      </Form.Item>

      {(hasCertificate || showCertificateUpload) && (
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="URL ใบรับรองแพทย์"
              validateStatus={errors.certificateUrl ? 'error' : ''}
              help={errors.certificateUrl?.message}
            >
              <Controller
                name="certificateUrl"
                control={control}
                render={({ field }) => (
                  <Input {...field} placeholder="https://example.com/certificate.pdf" />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="ชื่อไฟล์"
              validateStatus={errors.certificateFileName ? 'error' : ''}
              help={errors.certificateFileName?.message}
            >
              <Controller
                name="certificateFileName"
                control={control}
                render={({ field }) => <Input {...field} placeholder="certificate.pdf" />}
              />
            </Form.Item>
          </Col>
        </Row>
      )}

      <Form.Item>
        <Row gutter={8}>
          <Col>
            <Button type="primary" htmlType="submit" loading={loading ?? false}>
              {initialData ? 'อัปเดต' : 'ยื่นคำขอลา'}
            </Button>
          </Col>
          {onCancel && (
            <Col>
              <Button onClick={onCancel} disabled={loading ?? false}>
                ยกเลิก
              </Button>
            </Col>
          )}
        </Row>
      </Form.Item>
    </Form>
  );
};
