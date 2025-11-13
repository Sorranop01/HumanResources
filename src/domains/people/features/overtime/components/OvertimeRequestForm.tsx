/**
 * Overtime Request Form
 * Handles OT request creation/editing with RHF + Zod validation
 */

import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Col, DatePicker, Form, Input, Row, Select, Switch, TimePicker } from 'antd';
import dayjs from 'dayjs';
import type { FC } from 'react';
import { Controller, useForm } from 'react-hook-form';
import type { OvertimeRequestFormInput } from '@/domains/people/features/overtime/schemas';
import { OvertimeRequestFormSchema } from '@/domains/people/features/overtime/schemas';
import type { OvertimeType } from '@/domains/people/features/overtime/types';

const { TextArea } = Input;
const TIME_FORMAT = 'HH:mm';

const overtimeTypeOptions: { label: string; value: OvertimeType }[] = [
  { label: 'วันทำงาน (1.5x)', value: 'weekday' },
  { label: 'วันหยุด (2x)', value: 'weekend' },
  { label: 'วันนักขัตฤกษ์ (3x)', value: 'holiday' },
  { label: 'กรณีฉุกเฉิน', value: 'emergency' },
];

const urgencyOptions = [
  { label: 'ปกติ', value: 'normal' },
  { label: 'ด่วน', value: 'urgent' },
  { label: 'วิกฤติ', value: 'critical' },
];

interface OvertimeRequestFormProps {
  initialValues?: Partial<OvertimeRequestFormInput>;
  onSubmit: (values: OvertimeRequestFormInput) => void;
  onCancel?: () => void;
  submitting?: boolean;
}

export const OvertimeRequestForm: FC<OvertimeRequestFormProps> = ({
  initialValues,
  onSubmit,
  onCancel,
  submitting,
}) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<OvertimeRequestFormInput>({
    resolver: zodResolver(OvertimeRequestFormSchema),
    defaultValues: {
      overtimeDate: initialValues?.overtimeDate ?? dayjs().format('YYYY-MM-DD'),
      overtimeType: initialValues?.overtimeType ?? 'weekday',
      plannedStartTime: initialValues?.plannedStartTime ?? '18:00',
      plannedEndTime: initialValues?.plannedEndTime ?? '20:00',
      reason: initialValues?.reason ?? '',
      taskDescription: initialValues?.taskDescription ?? '',
      urgencyLevel: initialValues?.urgencyLevel ?? 'normal',
      isEmergency: initialValues?.isEmergency ?? false,
      attachmentUrl: initialValues?.attachmentUrl ?? '',
      notes: initialValues?.notes ?? '',
    },
  });

  return (
    <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="วันที่ทำ OT"
            required
            validateStatus={errors.overtimeDate ? 'error' : ''}
            help={errors.overtimeDate?.message}
          >
            <Controller
              name="overtimeDate"
              control={control}
              render={({ field }) => (
                <DatePicker
                  {...field}
                  value={field.value ? dayjs(field.value) : dayjs()}
                  onChange={(value) => field.onChange(value ? value.format('YYYY-MM-DD') : '')}
                  style={{ width: '100%' }}
                  format="DD/MM/YYYY"
                />
              )}
            />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            label="ประเภท OT"
            required
            validateStatus={errors.overtimeType ? 'error' : ''}
            help={errors.overtimeType?.message}
          >
            <Controller
              name="overtimeType"
              control={control}
              render={({ field }) => (
                <Select {...field} options={overtimeTypeOptions} placeholder="เลือกประเภท OT" />
              )}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="เวลาเริ่ม"
            required
            validateStatus={errors.plannedStartTime ? 'error' : ''}
            help={errors.plannedStartTime?.message}
          >
            <Controller
              name="plannedStartTime"
              control={control}
              render={({ field }) => (
                <TimePicker
                  style={{ width: '100%' }}
                  format={TIME_FORMAT}
                  value={field.value ? dayjs(field.value, TIME_FORMAT) : null}
                  onChange={(value) => field.onChange(value ? value.format(TIME_FORMAT) : '')}
                />
              )}
            />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            label="เวลาสิ้นสุด"
            required
            validateStatus={errors.plannedEndTime ? 'error' : ''}
            help={errors.plannedEndTime?.message}
          >
            <Controller
              name="plannedEndTime"
              control={control}
              render={({ field }) => (
                <TimePicker
                  style={{ width: '100%' }}
                  format={TIME_FORMAT}
                  value={field.value ? dayjs(field.value, TIME_FORMAT) : null}
                  onChange={(value) => field.onChange(value ? value.format(TIME_FORMAT) : '')}
                />
              )}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="ระดับความเร่งด่วน"
            validateStatus={errors.urgencyLevel ? 'error' : ''}
            help={errors.urgencyLevel?.message}
          >
            <Controller
              name="urgencyLevel"
              control={control}
              render={({ field }) => (
                <Select {...field} options={urgencyOptions} placeholder="เลือกระดับความเร่งด่วน" />
              )}
            />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item label="กรณีฉุกเฉิน">
            <Controller
              name="isEmergency"
              control={control}
              render={({ field }) => (
                <Switch
                  checked={field.value}
                  onChange={(value) => field.onChange(value)}
                  checkedChildren="ฉุกเฉิน"
                  unCheckedChildren="ปกติ"
                />
              )}
            />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        label="เหตุผลในการทำ OT"
        required
        validateStatus={errors.reason ? 'error' : ''}
        help={errors.reason?.message}
      >
        <Controller
          name="reason"
          control={control}
          render={({ field }) => (
            <TextArea
              rows={3}
              {...field}
              value={field.value ?? ''}
              placeholder="อธิบายเหตุผลโดยละเอียด"
            />
          )}
        />
      </Form.Item>

      <Form.Item
        label="รายละเอียดงาน"
        required
        validateStatus={errors.taskDescription ? 'error' : ''}
        help={errors.taskDescription?.message}
      >
        <Controller
          name="taskDescription"
          control={control}
          render={({ field }) => (
            <TextArea
              rows={4}
              {...field}
              value={field.value ?? ''}
              placeholder="อธิบายงานที่ต้องทำระหว่าง OT"
            />
          )}
        />
      </Form.Item>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="ไฟล์แนบ (URL)"
            validateStatus={errors.attachmentUrl ? 'error' : ''}
            help={errors.attachmentUrl?.message}
          >
            <Controller
              name="attachmentUrl"
              control={control}
              render={({ field }) => (
                <Input {...field} value={field.value ?? ''} placeholder="ลิงก์ไฟล์แนบ (ถ้ามี)" />
              )}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="หมายเหตุเพิ่มเติม"
            validateStatus={errors.notes ? 'error' : ''}
            help={errors.notes?.message}
          >
            <Controller
              name="notes"
              control={control}
              render={({ field }) => (
                <Input {...field} value={field.value ?? ''} placeholder="ระบุหมายเหตุ" />
              )}
            />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item style={{ textAlign: 'right' }}>
        {onCancel && (
          <Button style={{ marginRight: 12 }} onClick={onCancel}>
            ยกเลิก
          </Button>
        )}
        <Button type="primary" htmlType="submit" loading={submitting}>
          บันทึกคำขอ OT
        </Button>
      </Form.Item>
    </Form>
  );
};
