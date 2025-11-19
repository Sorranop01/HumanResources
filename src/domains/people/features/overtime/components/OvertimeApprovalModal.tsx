/**
 * Overtime Approval Modal
 * Approver can review OT details and add approval comments
 */

import { Descriptions, Form, Input, Modal, Tag } from 'antd';
import type { FC } from 'react';
import type { OvertimeRequest } from '@/domains/people/features/overtime/types';
import { formatDate } from '@/shared/lib/date';

const { TextArea } = Input;

interface OvertimeApprovalModalProps {
  open: boolean;
  loading?: boolean;
  request?: OvertimeRequest;
  onSubmit: (comments?: string) => void;
  onCancel: () => void;
}

export const OvertimeApprovalModal: FC<OvertimeApprovalModalProps> = ({
  open,
  loading,
  request,
  onSubmit,
  onCancel,
}) => {
  const [form] = Form.useForm<{ comments?: string }>();

  const handleOk = async () => {
    const values = await form.validateFields();
    onSubmit(values.comments);
    form.resetFields();
  };

  return (
    <Modal
      title="อนุมัติคำขอ OT"
      open={open}
      confirmLoading={loading}
      onOk={handleOk}
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
      okText="อนุมัติ"
      cancelText="ปิด"
    >
      {request && (
        <Descriptions column={1} size="small" bordered style={{ marginBottom: 16 }}>
          <Descriptions.Item label="พนักงาน">{request.employeeName}</Descriptions.Item>
          <Descriptions.Item label="วันที่">
            {formatDate(request.overtimeDate, 'DD MMM YYYY')}
          </Descriptions.Item>
          <Descriptions.Item label="ช่วงเวลา">
            {request.plannedStartTime} - {request.plannedEndTime}
          </Descriptions.Item>
          <Descriptions.Item label="ประเภท">
            <Tag color="geekblue">{request.overtimeType.toUpperCase()}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="เหตุผล">{request.reason}</Descriptions.Item>
        </Descriptions>
      )}

      <Form form={form} layout="vertical">
        <Form.Item label="ความคิดเห็น (ถ้ามี)" name="comments">
          <TextArea placeholder="ให้เหตุผลหรือคำแนะนำเพิ่มเติม" rows={4} />
        </Form.Item>
      </Form>
    </Modal>
  );
};
