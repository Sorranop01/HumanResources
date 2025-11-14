import {
  FileTextOutlined,
  HomeOutlined,
  LinkedinOutlined,
  LinkOutlined,
  MailOutlined,
  PhoneOutlined,
} from '@ant-design/icons';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Badge,
  Button,
  Card,
  Col,
  Descriptions,
  Divider,
  Form,
  Input,
  Modal,
  Row,
  Select,
  Space,
  Tag,
  Timeline,
  Typography,
} from 'antd';
import { Timestamp } from 'firebase/firestore';
import type { FC } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useUpdateCandidate } from '../hooks/useUpdateCandidate';
import type { Candidate, CandidateUpdateInput } from '../schemas';
import { CandidateStatusSchema, CandidateUpdateSchema } from '../schemas';

const { Text, Paragraph } = Typography;
const { TextArea } = Input;

interface CandidateDetailModalProps {
  candidate: Candidate;
  open: boolean;
  onClose: () => void;
}

export const CandidateDetailModal: FC<CandidateDetailModalProps> = ({
  candidate,
  open,
  onClose,
}) => {
  const updateCandidate = useUpdateCandidate();

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<CandidateUpdateInput>({
    resolver: zodResolver(CandidateUpdateSchema),
    defaultValues: {
      status: candidate.status,
      notes: candidate.notes ?? '',
      interviewDate: candidate.interviewDate ?? '',
      interviewer: candidate.interviewer ?? '',
    },
  });

  const onSubmit = async (data: CandidateUpdateInput) => {
    try {
      await updateCandidate.mutateAsync({ id: candidate.id, data });
      onClose();
    } catch (error) {
      console.error('Failed to update candidate:', error);
    }
  };

  const statusOptions = CandidateStatusSchema.options.map((status) => ({
    label: getStatusLabel(status),
    value: status,
  }));

  return (
    <Modal
      title={`ข้อมูลผู้สมัคร: ${candidate.firstName} ${candidate.lastName}`}
      open={open}
      onCancel={onClose}
      width={1000}
      footer={null}
    >
      <Row gutter={[16, 16]}>
        <Col span={16}>
          <Card title="ข้อมูลส่วนตัว" size="small">
            <Descriptions column={2} size="small">
              <Descriptions.Item label="ชื่อ-นามสกุล">
                {candidate.firstName} {candidate.lastName}
              </Descriptions.Item>
              <Descriptions.Item label="วันเกิด">{candidate.dateOfBirth ?? '-'}</Descriptions.Item>
              <Descriptions.Item
                label={
                  <>
                    <MailOutlined /> อีเมล
                  </>
                }
              >
                <a href={`mailto:${candidate.email}`}>{candidate.email}</a>
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <>
                    <PhoneOutlined /> โทรศัพท์
                  </>
                }
              >
                {candidate.phone}
              </Descriptions.Item>
              <Descriptions.Item label="สัญชาติ">{candidate.nationality ?? '-'}</Descriptions.Item>
              <Descriptions.Item
                label={
                  <>
                    <HomeOutlined /> ที่อยู่
                  </>
                }
              >
                {candidate.address ?? '-'}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <Card title="ข้อมูลการสมัคร" size="small" style={{ marginTop: 16 }}>
            <Descriptions column={2} size="small">
              <Descriptions.Item label="ตำแหน่งที่สมัคร">
                <Tag color="blue">{candidate.positionName}</Tag>
                {candidate.departmentName && <Tag color="green">{candidate.departmentName}</Tag>}
              </Descriptions.Item>
              <Descriptions.Item label="เงินเดือนที่คาดหวัง">
                {candidate.expectedSalary
                  ? `${candidate.expectedSalary.toLocaleString()} บาท`
                  : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="วันที่สามารถเริ่มงาน">
                {candidate.availableDate ?? '-'}
              </Descriptions.Item>
              <Descriptions.Item label="ประสบการณ์">
                {candidate.yearsOfExperience !== undefined
                  ? `${candidate.yearsOfExperience} ปี`
                  : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="ระดับประสบการณ์">
                {candidate.experienceLevel ?? '-'}
              </Descriptions.Item>
              <Descriptions.Item label="ภาษา">
                {candidate.languages.length > 0
                  ? candidate.languages.map((lang) => <Tag key={lang}>{lang}</Tag>)
                  : '-'}
              </Descriptions.Item>
            </Descriptions>

            {candidate.skills.length > 0 && (
              <>
                <Divider orientation="left" style={{ marginTop: 12, marginBottom: 12 }}>
                  ทักษะ
                </Divider>
                <Space wrap>
                  {candidate.skills.map((skill) => (
                    <Tag key={skill} color="processing">
                      {skill}
                    </Tag>
                  ))}
                </Space>
              </>
            )}
          </Card>

          {candidate.education.length > 0 && (
            <Card title="ประวัติการศึกษา" size="small" style={{ marginTop: 16 }}>
              <Timeline
                items={candidate.education.map((edu) => ({
                  children: (
                    <div>
                      <Text strong>{edu.degree}</Text> - {edu.field}
                      <br />
                      <Text type="secondary">{edu.institution}</Text>
                      <br />
                      <Text type="secondary">
                        สำเร็จปี {edu.graduationYear}
                        {edu.gpa && ` • GPA: ${edu.gpa}`}
                      </Text>
                    </div>
                  ),
                }))}
              />
            </Card>
          )}

          {candidate.workExperience.length > 0 && (
            <Card title="ประสบการณ์ทำงาน" size="small" style={{ marginTop: 16 }}>
              <Timeline
                items={candidate.workExperience.map((work) => ({
                  color: work.current ? 'green' : 'blue',
                  children: (
                    <div>
                      <Text strong>{work.title}</Text> • {work.company}
                      <br />
                      <Text type="secondary">
                        {work.startDate} - {work.current ? 'ปัจจุบัน' : (work.endDate ?? 'N/A')}
                      </Text>
                      {work.description && (
                        <>
                          <br />
                          <Paragraph ellipsis={{ rows: 2, expandable: true }}>
                            {work.description}
                          </Paragraph>
                        </>
                      )}
                    </div>
                  ),
                }))}
              />
            </Card>
          )}

          <Card title="เอกสารและลิงก์" size="small" style={{ marginTop: 16 }}>
            <Space direction="vertical">
              {candidate.resumeUrl && (
                <a href={candidate.resumeUrl} target="_blank" rel="noopener noreferrer">
                  <FileTextOutlined /> Resume/CV
                </a>
              )}
              {candidate.portfolioUrl && (
                <a href={candidate.portfolioUrl} target="_blank" rel="noopener noreferrer">
                  <LinkOutlined /> Portfolio
                </a>
              )}
              {candidate.linkedInUrl && (
                <a href={candidate.linkedInUrl} target="_blank" rel="noopener noreferrer">
                  <LinkedinOutlined /> LinkedIn
                </a>
              )}
            </Space>
          </Card>
        </Col>

        <Col span={8}>
          <Card title="จัดการสถานะ" size="small">
            <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
              <Form.Item
                label="สถานะ"
                validateStatus={errors.status ? 'error' : ''}
                help={errors.status?.message}
                required
              >
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => <Select {...field} options={statusOptions} />}
                />
              </Form.Item>

              <Form.Item label="วันนัดสัมภาษณ์" validateStatus={errors.interviewDate ? 'error' : ''}>
                <Controller
                  name="interviewDate"
                  control={control}
                  render={({ field }) => <Input {...field} type="date" />}
                />
              </Form.Item>

              <Form.Item label="ผู้สัมภาษณ์" validateStatus={errors.interviewer ? 'error' : ''}>
                <Controller
                  name="interviewer"
                  control={control}
                  render={({ field }) => <Input {...field} placeholder="ชื่อผู้สัมภาษณ์" />}
                />
              </Form.Item>

              <Form.Item label="บันทึกเพิ่มเติม" validateStatus={errors.notes ? 'error' : ''}>
                <Controller
                  name="notes"
                  control={control}
                  render={({ field }) => (
                    <TextArea {...field} rows={4} placeholder="บันทึกความคิดเห็นหรือข้อมูลเพิ่มเติม" />
                  )}
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  loading={updateCandidate.isPending}
                  disabled={!isDirty}
                >
                  บันทึกการเปลี่ยนแปลง
                </Button>
              </Form.Item>
            </Form>
          </Card>

          <Card title="ข้อมูลระบบ" size="small" style={{ marginTop: 16 }}>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="สถานะปัจจุบัน">
                <Badge
                  color={getStatusColor(candidate.status)}
                  text={getStatusLabel(candidate.status)}
                />
              </Descriptions.Item>
              <Descriptions.Item label="วันที่สมัคร">
                {formatCandidateDate(candidate.appliedAt)}
              </Descriptions.Item>
              <Descriptions.Item label="อัปเดตล่าสุด">
                {formatCandidateDate(candidate.updatedAt)}
              </Descriptions.Item>
              <Descriptions.Item label="แหล่งที่มา">
                <Tag>{candidate.source}</Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>
    </Modal>
  );
};

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    new: 'ใหม่',
    screening: 'คัดกรอง',
    interview: 'สัมภาษณ์',
    offer: 'เสนอตำแหน่ง',
    hired: 'รับเข้าทำงาน',
    rejected: 'ปฏิเสธ',
  };
  return labels[status] ?? status;
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    new: 'blue',
    screening: 'cyan',
    interview: 'orange',
    offer: 'purple',
    hired: 'green',
    rejected: 'red',
  };
  return colors[status] ?? 'default';
}

function formatCandidateDate(value: Timestamp | Date | string | number | null | undefined): string {
  if (!value) {
    return '-';
  }
  if (value instanceof Timestamp) {
    return value.toDate().toLocaleDateString('th-TH');
  }
  if (value instanceof Date) {
    return value.toLocaleDateString('th-TH');
  }
  return new Date(value).toLocaleDateString('th-TH');
}
