import type { DocumentType } from '@/domains/people/features/employees/types';

export const DOCUMENT_TYPE_OPTIONS: Array<{
  value: DocumentType;
  label: string;
  description: string;
}> = [
  { value: 'contract', label: 'สัญญาจ้าง', description: 'สัญญาแรงงาน/ข้อตกลงการจ้างงาน' },
  { value: 'national-id', label: 'บัตรประชาชน', description: 'สำเนาบัตรประชาชนหรือเอกสารราชการ' },
  { value: 'degree-certificate', label: 'วุฒิการศึกษา', description: 'ประกาศนียบัตรหรือทรานสคริปต์' },
  { value: 'tax-document', label: 'เอกสารภาษี', description: 'เอกสารภาษี เช่น ภงด.1/ภงด.91' },
  { value: 'medical-certificate', label: 'ใบรับรองแพทย์', description: 'ใบรับรองแพทย์หรือเอกสารสุขภาพ' },
  { value: 'other', label: 'อื่น ๆ', description: 'เอกสารประเภทอื่น' },
];

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = DOCUMENT_TYPE_OPTIONS.reduce(
  (acc, option) => {
    acc[option.value] = option.label;
    return acc;
  },
  {
    resume: 'Resume',
    'house-registration': 'ทะเบียนบ้าน',
    transcript: 'Transcript',
    'work-permit': 'ใบอนุญาตทำงาน',
    nda: 'NDA',
    photo: 'Photo',
  } as Record<DocumentType, string>
);
