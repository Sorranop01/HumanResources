/**
 * EmployeeDetailPage - Display detailed information about a single employee
 */

import { ArrowLeftOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Button, Card, Col, Descriptions, Modal, Result, Row, Space, Spin, Tabs, Tag } from 'antd';
import { type FC, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDeleteEmployee } from '@/domains/people/features/employees/hooks/useDeleteEmployee';
import { useEmployee } from '@/domains/people/features/employees/hooks/useEmployee';
import type { EmployeeStatus } from '@/domains/people/features/employees/types';
import {
  type SocialSecurity,
  SocialSecurityCard,
  SocialSecurityForm,
  type SocialSecurityFormInput,
  useCreateSocialSecurity,
  useDeleteSocialSecurity,
  useUpdateSocialSecurity,
} from '@/domains/people/features/socialSecurity';
import {
  LeaveEntitlementCard,
  LeaveRequestForm,
  LeaveRequestList,
  type LeaveRequestFormInput,
  formDataToLeaveRequestInput,
  useCreateLeaveRequest,
} from '@/domains/people/features/leave';
import { formatThaiDate } from '@/shared/lib/date';
import { formatMoney } from '@/shared/lib/format';

const STATUS_COLORS: Record<EmployeeStatus, string> = {
  active: 'green',
  'on-leave': 'orange',
  resigned: 'red',
  terminated: 'volcano',
};

const STATUS_LABELS: Record<EmployeeStatus, string> = {
  active: 'ทำงานอยู่',
  'on-leave': 'ลา',
  resigned: 'ลาออก',
  terminated: 'เลิกจ้าง',
};

export const EmployeeDetailPage: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: employee, isLoading, error } = useEmployee(id);
  const { deleteWithConfirm, isPending: isDeleting } = useDeleteEmployee();

  // Social Security state
  const [isSocialSecurityModalOpen, setIsSocialSecurityModalOpen] = useState(false);
  const [editingSocialSecurity, setEditingSocialSecurity] = useState<SocialSecurity | undefined>();
  const createSocialSecurity = useCreateSocialSecurity();
  const updateSocialSecurity = useUpdateSocialSecurity();
  const deleteSocialSecurity = useDeleteSocialSecurity();

  // Leave Request state
  const [isLeaveRequestModalOpen, setIsLeaveRequestModalOpen] = useState(false);
  const createLeaveRequest = useCreateLeaveRequest();

  const handleEdit = (): void => {
    if (id) {
      navigate(`/employees/${id}/edit`);
    }
  };

  const handleDelete = (): void => {
    if (employee) {
      const fullName = `${employee.firstName} ${employee.lastName}`;
      deleteWithConfirm(employee.id, fullName, false);

      // Navigate back after successful delete
      if (!isDeleting) {
        setTimeout(() => {
          navigate('/employees');
        }, 1000);
      }
    }
  };

  const handleBack = (): void => {
    navigate('/employees');
  };

  // Social Security handlers
  const handleCreateSocialSecurity = (): void => {
    setEditingSocialSecurity(undefined);
    setIsSocialSecurityModalOpen(true);
  };

  const handleEditSocialSecurity = (data: SocialSecurity): void => {
    setEditingSocialSecurity(data);
    setIsSocialSecurityModalOpen(true);
  };

  const handleDeleteSocialSecurity = (ssId: string): void => {
    Modal.confirm({
      title: 'ยืนยันการลบข้อมูลประกันสังคม',
      content: 'คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลประกันสังคมนี้?',
      okText: 'ลบ',
      okType: 'danger',
      cancelText: 'ยกเลิก',
      onOk: async () => {
        await deleteSocialSecurity.mutateAsync(ssId);
      },
    });
  };

  const handleSocialSecuritySubmit = async (data: SocialSecurityFormInput): Promise<void> => {
    if (!employee) return;

    try {
      if (editingSocialSecurity) {
        // Update existing
        await updateSocialSecurity.mutateAsync({
          id: editingSocialSecurity.id,
          input: {
            hospitalName: data.hospitalName,
            hospitalCode: data.hospitalCode ?? undefined,
            status: data.status,
            employeeContributionRate: data.employeeContributionRate,
            employerContributionRate: data.employerContributionRate,
            notes: data.notes,
          },
        });
      } else {
        // Create new
        await createSocialSecurity.mutateAsync({
          input: {
            employeeId: employee.id,
            socialSecurityNumber: data.socialSecurityNumber,
            registrationDate: new Date(data.registrationDate),
            hospitalName: data.hospitalName,
            hospitalCode: data.hospitalCode ?? undefined,
            employeeContributionRate: data.employeeContributionRate,
            employerContributionRate: data.employerContributionRate,
            notes: data.notes ?? undefined,
          },
          employee: {
            name: `${employee.firstName} ${employee.lastName}`,
            code: employee.employeeCode,
            salary: employee.salary,
          },
        });
      }
      setIsSocialSecurityModalOpen(false);
      setEditingSocialSecurity(undefined);
    } catch (_error) {
      // Error is already handled by the mutation hook
    }
  };

  // Leave Request handlers
  const handleCreateLeaveRequest = (): void => {
    setIsLeaveRequestModalOpen(true);
  };

  const handleLeaveRequestSubmit = async (data: LeaveRequestFormInput): Promise<void> => {
    if (!employee) return;

    try {
      const input = formDataToLeaveRequestInput(data, employee.id);
      await createLeaveRequest.mutateAsync(input);
      setIsLeaveRequestModalOpen(false);
    } catch (_error) {
      // Error is already handled by the mutation hook
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  // Error state
  if (error !== null || !employee) {
    return (
      <Result
        status="404"
        title="ไม่พบข้อมูลพนักงาน"
        subTitle="ไม่พบพนักงานที่คุณกำลังค้นหา"
        extra={
          <Button type="primary" onClick={handleBack}>
            กลับไปหน้ารายการ
          </Button>
        }
      />
    );
  }

  // Now TypeScript knows employee is not null/undefined
  const fullName = `${employee.firstName} ${employee.lastName}`;
  const thaiFullName = `${employee.thaiFirstName} ${employee.thaiLastName}`;

  return (
    <div style={{ padding: '24px' }}>
      {/* Back Button */}
      <Button icon={<ArrowLeftOutlined />} onClick={handleBack} style={{ marginBottom: 16 }}>
        กลับ
      </Button>

      {/* Header Card */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
          <div>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
              {fullName} ({thaiFullName})
            </div>
            <Space style={{ marginTop: 8 }}>
              <Tag color="blue">{employee.employeeCode}</Tag>
              <Tag color={STATUS_COLORS[employee.status]}>{STATUS_LABELS[employee.status]}</Tag>
            </Space>
          </div>
          <Space>
            <Button type="primary" icon={<EditOutlined />} onClick={handleEdit}>
              แก้ไข
            </Button>
            <Button danger icon={<DeleteOutlined />} onClick={handleDelete} loading={isDeleting}>
              ลบ
            </Button>
          </Space>
        </div>
      </Card>

      {/* Tabs */}
      <Card>
        <Tabs
          defaultActiveKey="general"
          items={[
            {
              key: 'general',
              label: 'ข้อมูลทั่วไป',
              children: (
                <Row gutter={[16, 16]}>
                  <Col xs={24} lg={16}>
                    <Descriptions column={2} bordered>
                      <Descriptions.Item label="ชื่อ (อังกฤษ)" span={1}>
                        {employee.firstName}
                      </Descriptions.Item>
                      <Descriptions.Item label="นามสกุล (อังกฤษ)" span={1}>
                        {employee.lastName}
                      </Descriptions.Item>

                      <Descriptions.Item label="ชื่อ (ไทย)" span={1}>
                        {employee.thaiFirstName}
                      </Descriptions.Item>
                      <Descriptions.Item label="นามสกุล (ไทย)" span={1}>
                        {employee.thaiLastName}
                      </Descriptions.Item>

                      <Descriptions.Item label="อีเมล" span={2}>
                        <a href={`mailto:${employee.email}`}>{employee.email}</a>
                      </Descriptions.Item>

                      <Descriptions.Item label="เบอร์โทรศัพท์" span={2}>
                        <a href={`tel:${employee.phoneNumber}`}>{employee.phoneNumber}</a>
                      </Descriptions.Item>

                      <Descriptions.Item label="แผนก" span={1}>
                        {employee.department}
                      </Descriptions.Item>
                      <Descriptions.Item label="ตำแหน่ง" span={1}>
                        {employee.position}
                      </Descriptions.Item>

                      <Descriptions.Item label="เงินเดือน" span={2}>
                        {formatMoney(employee.salary)}
                      </Descriptions.Item>

                      <Descriptions.Item label="วันเกิด" span={1}>
                        {formatThaiDate(employee.dateOfBirth)}
                      </Descriptions.Item>
                      <Descriptions.Item label="วันเริ่มงาน" span={1}>
                        {formatThaiDate(employee.hireDate)}
                      </Descriptions.Item>

                      <Descriptions.Item label="สร้างเมื่อ" span={1}>
                        {formatThaiDate(employee.createdAt)}
                      </Descriptions.Item>
                      <Descriptions.Item label="แก้ไขล่าสุด" span={1}>
                        {formatThaiDate(employee.updatedAt)}
                      </Descriptions.Item>
                    </Descriptions>
                  </Col>

                  <Col xs={24} lg={8}>
                    <Card title="ข้อมูลเพิ่มเติม">
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <div>
                          <strong>User ID:</strong> {employee.userId}
                        </div>
                        {employee.photoURL && (
                          <div>
                            <strong>รูปภาพ:</strong>
                            <br />
                            <img
                              src={employee.photoURL}
                              alt={fullName}
                              style={{ width: '100%', marginTop: 8, borderRadius: 8 }}
                            />
                          </div>
                        )}
                      </Space>
                    </Card>
                  </Col>
                </Row>
              ),
            },
            {
              key: 'socialSecurity',
              label: 'ประกันสังคม',
              children: (
                <SocialSecurityCard
                  employeeId={employee.id}
                  onCreate={handleCreateSocialSecurity}
                  onEdit={handleEditSocialSecurity}
                  onDelete={handleDeleteSocialSecurity}
                />
              ),
            },
            {
              key: 'leaveEntitlements',
              label: 'สิทธิ์การลา',
              children: (
                <div>
                  <LeaveEntitlementCard employeeId={employee.id} />
                </div>
              ),
            },
            {
              key: 'leaveRequests',
              label: 'คำขอลา',
              children: (
                <div>
                  <div style={{ marginBottom: 16, textAlign: 'right' }}>
                    <Button type="primary" onClick={handleCreateLeaveRequest}>
                      สร้างคำขอลา
                    </Button>
                  </div>
                  <LeaveRequestList filters={{ employeeId: employee.id }} />
                </div>
              ),
            },
          ]}
        />
      </Card>

      {/* Social Security Modal */}
      <Modal
        title={editingSocialSecurity ? 'แก้ไขข้อมูลประกันสังคม' : 'เพิ่มข้อมูลประกันสังคม'}
        open={isSocialSecurityModalOpen}
        onCancel={() => {
          setIsSocialSecurityModalOpen(false);
          setEditingSocialSecurity(undefined);
        }}
        footer={null}
        width={800}
      >
        <SocialSecurityForm
          initialData={editingSocialSecurity}
          onSubmit={handleSocialSecuritySubmit}
          onCancel={() => {
            setIsSocialSecurityModalOpen(false);
            setEditingSocialSecurity(undefined);
          }}
          loading={createSocialSecurity.isPending || updateSocialSecurity.isPending}
        />
      </Modal>

      {/* Leave Request Modal */}
      <Modal
        title="สร้างคำขอลา"
        open={isLeaveRequestModalOpen}
        onCancel={() => setIsLeaveRequestModalOpen(false)}
        footer={null}
        width={900}
      >
        <LeaveRequestForm
          onSubmit={handleLeaveRequestSubmit}
          onCancel={() => setIsLeaveRequestModalOpen(false)}
          loading={createLeaveRequest.isPending}
        />
      </Modal>
    </div>
  );
};
