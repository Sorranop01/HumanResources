import { InboxOutlined } from '@ant-design/icons';
import { Button, DatePicker, Form, message, Select, Upload } from 'antd';
import type { UploadFile } from 'antd/es/upload';
import dayjs from 'dayjs';
import type { FC } from 'react';
import { useState } from 'react';
import { useUploadEmployeeDocument } from '@/domains/people/features/employees/hooks/useEmployeeDocuments';
import type { DocumentType } from '@/domains/people/features/employees/types';
import { DOCUMENT_TYPE_OPTIONS } from './documentTypes';

interface DocumentUploadProps {
  employeeId: string;
  uploadedBy?: string;
}

interface FormValues {
  documentType: DocumentType;
  expiryDate?: dayjs.Dayjs;
}

export const DocumentUpload: FC<DocumentUploadProps> = ({ employeeId, uploadedBy }) => {
  const [form] = Form.useForm<FormValues>();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const uploadMutation = useUploadEmployeeDocument(employeeId);

  const handleSubmit = async (values: FormValues) => {
    if (!fileList[0]?.originFileObj) {
      message.error('กรุณาเลือกไฟล์ก่อนบันทึก');
      return;
    }

    if (!uploadedBy) {
      message.error('ไม่พบข้อมูลผู้ใช้งาน');
      return;
    }

    try {
      await uploadMutation.mutateAsync({
        employeeId,
        file: fileList[0].originFileObj,
        documentType: values.documentType,
        expiryDate: values.expiryDate ? values.expiryDate.toDate() : null,
        uploadedBy,
      });
      form.resetFields();
      setFileList([]);
    } catch {
      // handled by mutation
    }
  };

  return (
    <Form layout="vertical" form={form} onFinish={handleSubmit}>
      <Form.Item
        label="ประเภทเอกสาร"
        name="documentType"
        rules={[{ required: true, message: 'กรุณาเลือกประเภทเอกสาร' }]}
      >
        <Select
          placeholder="เลือกประเภทเอกสาร"
          options={DOCUMENT_TYPE_OPTIONS.map((option) => ({
            label: option.label,
            value: option.value,
          }))}
        />
      </Form.Item>

      <Form.Item label="วันหมดอายุ (ถ้ามี)" name="expiryDate">
        <DatePicker
          style={{ width: '100%' }}
          format="DD/MM/YYYY"
          placeholder="เลือกวันหมดอายุ"
          disabledDate={(current) => current?.isBefore(dayjs().startOf('day'))}
        />
      </Form.Item>

      <Form.Item label="ไฟล์เอกสาร" required rules={[{ required: true, message: 'กรุณาเลือกไฟล์' }]}>
        <Upload.Dragger
          multiple={false}
          beforeUpload={() => false}
          fileList={fileList}
          onRemove={() => {
            setFileList([]);
            return true;
          }}
          onChange={({ fileList: nextList }) => setFileList(nextList.slice(-1))}
          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">ลากไฟล์มาวาง หรือคลิกเพื่อเลือกเอกสาร</p>
          <p className="ant-upload-hint">รองรับ PDF, JPG, PNG, DOC, DOCX (สูงสุด 10MB)</p>
        </Upload.Dragger>
      </Form.Item>

      <Form.Item style={{ textAlign: 'right' }}>
        <Button
          type="primary"
          htmlType="submit"
          loading={uploadMutation.isPending}
          disabled={!uploadedBy}
        >
          บันทึกเอกสาร
        </Button>
      </Form.Item>
    </Form>
  );
};
