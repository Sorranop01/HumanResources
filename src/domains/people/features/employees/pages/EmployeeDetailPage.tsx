/**
 * EmployeeDetailPage - Display detailed information about a single employee
 */

import { ArrowLeftOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  Descriptions,
  Modal,
  Result,
  Row,
  Space,
  Spin,
  Tabs,
  Tag,
  Typography,
} from 'antd';
import type { FC } from 'react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  DocumentExpiryAlert,
  DocumentList,
  DocumentUpload,
} from '@/domains/people/features/employees/components/DocumentManagement';
import type { EditBankAccountInput } from '@/domains/people/features/employees/components/EditBankAccountModal';
import { EditBankAccountModal } from '@/domains/people/features/employees/components/EditBankAccountModal';
import type { EditBenefitsInput } from '@/domains/people/features/employees/components/EditBenefitsModal';
import { EditBenefitsModal } from '@/domains/people/features/employees/components/EditBenefitsModal';
import type { EditSalaryInput } from '@/domains/people/features/employees/components/EditCompensationModal';
import { EditCompensationModal } from '@/domains/people/features/employees/components/EditCompensationModal';
import type { EditTaxInput } from '@/domains/people/features/employees/components/EditTaxModal';
import { EditTaxModal } from '@/domains/people/features/employees/components/EditTaxModal';
import { useDeleteEmployee } from '@/domains/people/features/employees/hooks/useDeleteEmployee';
import { useEmployee } from '@/domains/people/features/employees/hooks/useEmployee';
import { useUpdateEmployee } from '@/domains/people/features/employees/hooks/useUpdateEmployee';
import type { EmployeeStatus } from '@/domains/people/features/employees/types';
import type { LeaveRequestFormInput } from '@/domains/people/features/leave';
import {
  formDataToLeaveRequestInput,
  LeaveRequestForm,
  LeaveRequestList,
  useCreateLeaveRequest,
} from '@/domains/people/features/leave';
import type {
  SocialSecurity,
  SocialSecurityFormInput,
} from '@/domains/people/features/socialSecurity';
import {
  SocialSecurityCard,
  SocialSecurityForm,
  useCreateSocialSecurity,
  useDeleteSocialSecurity,
  useUpdateSocialSecurity,
} from '@/domains/people/features/socialSecurity';
import { useAuth } from '@/shared/hooks/useAuth';
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
  const { user } = useAuth();
  const { data: employee, isLoading, error } = useEmployee(id);
  const { deleteWithConfirm, isPending: isDeleting } = useDeleteEmployee();
  const updateEmployee = useUpdateEmployee();
  const uploadedByName = user?.displayName || user?.email || undefined;

  // Social Security state
  const [isSocialSecurityModalOpen, setIsSocialSecurityModalOpen] = useState(false);
  const [editingSocialSecurity, setEditingSocialSecurity] = useState<SocialSecurity | undefined>();
  const createSocialSecurity = useCreateSocialSecurity();
  const updateSocialSecurity = useUpdateSocialSecurity();
  const deleteSocialSecurity = useDeleteSocialSecurity();

  // Leave Request state
  const [isLeaveRequestModalOpen, setIsLeaveRequestModalOpen] = useState(false);
  const createLeaveRequest = useCreateLeaveRequest();

  // Edit modals state
  const [isCompensationModalOpen, setIsCompensationModalOpen] = useState(false);
  const [isTaxModalOpen, setIsTaxModalOpen] = useState(false);
  const [isBenefitsModalOpen, setIsBenefitsModalOpen] = useState(false);
  const [isBankAccountModalOpen, setIsBankAccountModalOpen] = useState(false);

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
            salary: employee.salary.baseSalary,
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

  // Edit handlers
  const handleEditCompensation = async (data: EditSalaryInput): Promise<void> => {
    if (!employee) return;

    try {
      await updateEmployee.mutateAsync({
        id: employee.id,
        data: {
          salary: {
            ...employee.salary,
            baseSalary: data.baseSalary,
            currency: data.currency,
            paymentFrequency: data.paymentFrequency,
            ...(data.hourlyRate !== undefined ? { hourlyRate: data.hourlyRate } : {}),
          },
        },
      });
      setIsCompensationModalOpen(false);
    } catch (_error) {
      // Error is already handled by the mutation hook
    }
  };

  const handleEditTax = async (data: EditTaxInput): Promise<void> => {
    if (!employee) return;

    try {
      const updatedTax = {
        ...employee.tax,
        withholdingTax: data.withholdingTax,
      };

      if (data.taxId !== undefined) {
        updatedTax.taxId = data.taxId;
      }

      if (data.withholdingRate !== undefined) {
        updatedTax.withholdingRate = data.withholdingRate;
      }

      if (data.taxReliefs !== undefined) {
        updatedTax.taxReliefs = data.taxReliefs;
      }

      await updateEmployee.mutateAsync({
        id: employee.id,
        data: {
          tax: updatedTax,
        },
      });
      setIsTaxModalOpen(false);
    } catch (_error) {
      // Error is already handled by the mutation hook
    }
  };

  const handleEditBenefits = async (data: EditBenefitsInput): Promise<void> => {
    if (!employee) return;

    try {
      const updatedBenefits = {
        ...employee.benefits,
        healthInsurance: data.healthInsurance,
        lifeInsurance: data.lifeInsurance,
        providentFund: {
          ...employee.benefits?.providentFund,
          isEnrolled: data.providentFund.isEnrolled,
          ...(data.providentFund.employeeContributionRate !== undefined
            ? { employeeContributionRate: data.providentFund.employeeContributionRate }
            : {}),
          ...(data.providentFund.employerContributionRate !== undefined
            ? { employerContributionRate: data.providentFund.employerContributionRate }
            : {}),
        },
        annualLeave: data.annualLeave,
        sickLeave: data.sickLeave,
      };

      if (data.otherBenefits !== undefined) {
        updatedBenefits.otherBenefits = data.otherBenefits;
      }

      await updateEmployee.mutateAsync({
        id: employee.id,
        data: {
          benefits: updatedBenefits,
        },
      });
      setIsBenefitsModalOpen(false);
    } catch (_error) {
      // Error is already handled by the mutation hook
    }
  };

  const handleEditBankAccount = async (data: EditBankAccountInput): Promise<void> => {
    if (!employee) return;

    try {
      const updatedBankAccount = {
        ...employee.bankAccount,
        bankName: data.bankName,
        accountNumber: data.accountNumber,
        accountName: data.accountName,
      };

      if (data.branchName) {
        updatedBankAccount.branchName = data.branchName;
      }

      await updateEmployee.mutateAsync({
        id: employee.id,
        data: {
          bankAccount: updatedBankAccount,
        },
      });
      setIsBankAccountModalOpen(false);
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
                  <Col xs={24}>
                    <Card title="ข้อมูลส่วนตัว" style={{ marginBottom: 16 }}>
                      <Descriptions column={{ xs: 1, sm: 2, md: 2, lg: 3 }} bordered>
                        <Descriptions.Item label="ชื่อ (อังกฤษ)">
                          {employee.firstName}
                        </Descriptions.Item>
                        <Descriptions.Item label="นามสกุล (อังกฤษ)">
                          {employee.lastName}
                        </Descriptions.Item>
                        <Descriptions.Item label="ชื่อเล่น">
                          {employee.nickname || '-'}
                        </Descriptions.Item>

                        <Descriptions.Item label="ชื่อ (ไทย)">
                          {employee.thaiFirstName}
                        </Descriptions.Item>
                        <Descriptions.Item label="นามสกุล (ไทย)">
                          {employee.thaiLastName}
                        </Descriptions.Item>
                        <Descriptions.Item label="เพศ">
                          {employee.gender === 'male'
                            ? 'ชาย'
                            : employee.gender === 'female'
                              ? 'หญิง'
                              : 'อื่นๆ'}
                        </Descriptions.Item>

                        <Descriptions.Item label="วันเกิด" span={1}>
                          {formatThaiDate(employee.dateOfBirth)}
                        </Descriptions.Item>
                        <Descriptions.Item label="อายุ" span={1}>
                          {employee.age} ปี
                        </Descriptions.Item>
                        <Descriptions.Item label="สถานภาพ" span={1}>
                          {employee.maritalStatus === 'single'
                            ? 'โสด'
                            : employee.maritalStatus === 'married'
                              ? 'สมรส'
                              : employee.maritalStatus === 'divorced'
                                ? 'หย่า'
                                : 'หม้าย'}
                        </Descriptions.Item>

                        <Descriptions.Item label="สัญชาติ">{employee.nationality}</Descriptions.Item>
                        <Descriptions.Item label="ศาสนา">
                          {employee.religion || '-'}
                        </Descriptions.Item>
                        <Descriptions.Item label="เลขบัตรประชาชน">
                          {employee.nationalId}
                        </Descriptions.Item>
                      </Descriptions>
                    </Card>

                    <Card title="ข้อมูลติดต่อ" style={{ marginBottom: 16 }}>
                      <Descriptions column={{ xs: 1, sm: 2, md: 2 }} bordered>
                        <Descriptions.Item label="อีเมลบริษัท" span={1}>
                          <a href={`mailto:${employee.email}`}>{employee.email}</a>
                        </Descriptions.Item>
                        <Descriptions.Item label="อีเมลส่วนตัว" span={1}>
                          {employee.personalEmail ? (
                            <a href={`mailto:${employee.personalEmail}`}>
                              {employee.personalEmail}
                            </a>
                          ) : (
                            '-'
                          )}
                        </Descriptions.Item>

                        <Descriptions.Item label="เบอร์โทรศัพท์" span={2}>
                          <a href={`tel:${employee.phoneNumber}`}>{employee.phoneNumber}</a>
                        </Descriptions.Item>

                        <Descriptions.Item label="ผู้ติดต่อฉุกเฉิน" span={2}>
                          <div>
                            <strong>{employee.emergencyContact.name}</strong> (
                            {employee.emergencyContact.relationship})
                            <br />
                            <a href={`tel:${employee.emergencyContact.phoneNumber}`}>
                              {employee.emergencyContact.phoneNumber}
                            </a>
                          </div>
                        </Descriptions.Item>

                        <Descriptions.Item label="ที่อยู่ปัจจุบัน" span={2}>
                          {employee.currentAddress.addressLine1}
                          {employee.currentAddress.addressLine2 &&
                            ` ${employee.currentAddress.addressLine2}`}
                          <br />
                          {`${employee.currentAddress.subDistrict} ${employee.currentAddress.district} ${employee.currentAddress.province} ${employee.currentAddress.postalCode}`}
                        </Descriptions.Item>
                      </Descriptions>
                    </Card>

                    <Card title="ข้อมูลการจ้างงาน" style={{ marginBottom: 16 }}>
                      <Descriptions column={{ xs: 1, sm: 2, md: 3 }} bordered>
                        <Descriptions.Item label="ประเภทการจ้างงาน">
                          <Tag color="blue">
                            {employee.employmentType === 'permanent'
                              ? 'ประจำ'
                              : employee.employmentType === 'contract'
                                ? 'สัญญา'
                                : employee.employmentType === 'probation'
                                  ? 'ทดลองงาน'
                                  : employee.employmentType === 'freelance'
                                    ? 'ฟรีแลนซ์'
                                    : 'ฝึกงาน'}
                          </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="รูปแบบการทำงาน">
                          <Tag color={employee.workType === 'full-time' ? 'green' : 'orange'}>
                            {employee.workType === 'full-time' ? 'Full-time' : 'Part-time'}
                          </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="สถานที่ทำงาน">
                          {employee.workLocation.office}
                        </Descriptions.Item>

                        <Descriptions.Item label="แผนก">{employee.department}</Descriptions.Item>
                        <Descriptions.Item label="ฝ่าย">
                          {employee.division || '-'}
                        </Descriptions.Item>
                        <Descriptions.Item label="ทีม">{employee.team || '-'}</Descriptions.Item>

                        <Descriptions.Item label="ตำแหน่ง">{employee.position}</Descriptions.Item>
                        <Descriptions.Item label="ระดับ">{employee.level || '-'}</Descriptions.Item>
                        <Descriptions.Item label="วันเริ่มงาน">
                          {formatThaiDate(employee.hireDate)}
                        </Descriptions.Item>

                        {employee.probationEndDate && (
                          <Descriptions.Item label="สิ้นสุดทดลองงาน" span={1}>
                            {formatThaiDate(employee.probationEndDate)}
                          </Descriptions.Item>
                        )}
                        {employee.confirmationDate && (
                          <Descriptions.Item label="วันผ่านทดลองงาน" span={1}>
                            {formatThaiDate(employee.confirmationDate)}
                          </Descriptions.Item>
                        )}
                      </Descriptions>
                    </Card>
                  </Col>
                </Row>
              ),
            },
            {
              key: 'compensation',
              label: 'เงินเดือนและสวัสดิการ',
              children: (
                <Row gutter={[16, 16]}>
                  <Col xs={24}>
                    <Card
                      title="ข้อมูลเงินเดือน"
                      style={{ marginBottom: 16 }}
                      extra={
                        <Button
                          type="primary"
                          size="small"
                          icon={<EditOutlined />}
                          onClick={() => setIsCompensationModalOpen(true)}
                        >
                          แก้ไข
                        </Button>
                      }
                    >
                      <Descriptions column={{ xs: 1, sm: 2 }} bordered>
                        <Descriptions.Item label="เงินเดือนพื้นฐาน">
                          {formatMoney(employee.salary.baseSalary)} {employee.salary.currency}
                        </Descriptions.Item>
                        <Descriptions.Item label="รอบการจ่าย">
                          {employee.salary.paymentFrequency === 'monthly'
                            ? 'รายเดือน'
                            : employee.salary.paymentFrequency === 'bi-weekly'
                              ? 'ทุก 2 สัปดาห์'
                              : employee.salary.paymentFrequency === 'weekly'
                                ? 'รายสัปดาห์'
                                : 'รายชั่วโมง'}
                        </Descriptions.Item>

                        {employee.salary.hourlyRate && (
                          <Descriptions.Item label="อัตราต่อชั่วโมง" span={2}>
                            {formatMoney(employee.salary.hourlyRate)} THB/ชม.
                          </Descriptions.Item>
                        )}

                        <Descriptions.Item label="วันที่มีผล" span={2}>
                          {formatThaiDate(employee.salary.effectiveDate)}
                        </Descriptions.Item>
                      </Descriptions>
                    </Card>

                    {employee.allowances && employee.allowances.length > 0 && (
                      <Card title="เบี้ยเลี้ยง" style={{ marginBottom: 16 }}>
                        <Descriptions column={1} bordered>
                          {employee.allowances.map((allowance, index) => (
                            <Descriptions.Item
                              key={`${allowance.type}-${index}`}
                              label={allowance.type}
                            >
                              {formatMoney(allowance.amount)} ({allowance.frequency})
                            </Descriptions.Item>
                          ))}
                        </Descriptions>
                      </Card>
                    )}

                    {employee.benefits && (
                      <Card
                        title="สวัสดิการ"
                        style={{ marginBottom: 16 }}
                        extra={
                          <Button
                            type="primary"
                            size="small"
                            icon={<EditOutlined />}
                            onClick={() => setIsBenefitsModalOpen(true)}
                          >
                            แก้ไข
                          </Button>
                        }
                      >
                        <Descriptions column={{ xs: 1, sm: 2 }} bordered>
                          <Descriptions.Item label="ประกันสุขภาพ">
                            {employee.benefits.healthInsurance ? '✅ มี' : '❌ ไม่มี'}
                          </Descriptions.Item>
                          <Descriptions.Item label="ประกันชีวิต">
                            {employee.benefits.lifeInsurance ? '✅ มี' : '❌ ไม่มี'}
                          </Descriptions.Item>

                          <Descriptions.Item label="กองทุนสำรองเลี้ยงชีพ" span={2}>
                            {employee.benefits.providentFund.isEnrolled
                              ? `✅ เข้าร่วม (พนักงาน ${employee.benefits.providentFund.employeeContributionRate}%, บริษัท ${employee.benefits.providentFund.employerContributionRate}%)`
                              : '❌ ไม่เข้าร่วม'}
                          </Descriptions.Item>

                          <Descriptions.Item label="วันลาพักร้อน">
                            {employee.benefits.annualLeave} วัน/ปี
                          </Descriptions.Item>
                          <Descriptions.Item label="วันลาป่วย">
                            {employee.benefits.sickLeave} วัน/ปี
                          </Descriptions.Item>

                          {employee.benefits.otherBenefits &&
                            employee.benefits.otherBenefits.length > 0 && (
                              <Descriptions.Item label="สวัสดิการอื่นๆ" span={2}>
                                {employee.benefits.otherBenefits.join(', ')}
                              </Descriptions.Item>
                            )}
                        </Descriptions>
                      </Card>
                    )}
                  </Col>
                </Row>
              ),
            },
            {
              key: 'tax',
              label: 'ภาษีและประกันสังคม',
              children: (
                <Row gutter={[16, 16]}>
                  <Col xs={24} md={12}>
                    <Card title="ประกันสังคม">
                      <Descriptions column={1} bordered>
                        <Descriptions.Item label="สถานะ">
                          {employee.socialSecurity.isEnrolled
                            ? '✅ เข้าประกันสังคม'
                            : '❌ ไม่ได้เข้าประกันสังคม'}
                        </Descriptions.Item>

                        {employee.socialSecurity.isEnrolled && (
                          <>
                            {employee.socialSecurity.ssNumber && (
                              <Descriptions.Item label="เลขประกันสังคม">
                                {employee.socialSecurity.ssNumber}
                              </Descriptions.Item>
                            )}
                            {employee.socialSecurity.hospitalName && (
                              <Descriptions.Item label="โรงพยาบาล">
                                {employee.socialSecurity.hospitalName}
                                {employee.socialSecurity.hospitalCode &&
                                  ` (${employee.socialSecurity.hospitalCode})`}
                              </Descriptions.Item>
                            )}
                            {employee.socialSecurity.enrollmentDate && (
                              <Descriptions.Item label="วันที่เข้าร่วม">
                                {formatThaiDate(employee.socialSecurity.enrollmentDate)}
                              </Descriptions.Item>
                            )}
                          </>
                        )}
                      </Descriptions>
                    </Card>
                  </Col>

                  <Col xs={24} md={12}>
                    <Card
                      title="ภาษี"
                      extra={
                        <Button
                          type="primary"
                          size="small"
                          icon={<EditOutlined />}
                          onClick={() => setIsTaxModalOpen(true)}
                        >
                          แก้ไข
                        </Button>
                      }
                    >
                      <Descriptions column={1} bordered>
                        <Descriptions.Item label="หัก ณ ที่จ่าย">
                          {employee.tax.withholdingTax ? '✅ หัก' : '❌ ไม่หัก'}
                        </Descriptions.Item>

                        {employee.tax.taxId && (
                          <Descriptions.Item label="เลขประจำตัวผู้เสียภาษี">
                            {employee.tax.taxId}
                          </Descriptions.Item>
                        )}

                        {employee.tax.withholdingRate && (
                          <Descriptions.Item label="อัตราการหัก">
                            {employee.tax.withholdingRate}%
                          </Descriptions.Item>
                        )}

                        {employee.tax.taxReliefs && employee.tax.taxReliefs.length > 0 && (
                          <Descriptions.Item label="ลดหย่อนภาษี">
                            {employee.tax.taxReliefs.map((relief, index) => (
                              <div key={`${relief.type}-${index}`}>
                                {relief.type}: {formatMoney(relief.amount)} THB
                              </div>
                            ))}
                          </Descriptions.Item>
                        )}
                      </Descriptions>
                    </Card>
                  </Col>

                  <Col xs={24}>
                    <Card
                      title="บัญชีธนาคาร"
                      extra={
                        <Button
                          type="primary"
                          size="small"
                          icon={<EditOutlined />}
                          onClick={() => setIsBankAccountModalOpen(true)}
                        >
                          แก้ไข
                        </Button>
                      }
                    >
                      <Descriptions column={{ xs: 1, sm: 2 }} bordered>
                        <Descriptions.Item label="ธนาคาร">
                          {employee.bankAccount.bankName}
                        </Descriptions.Item>
                        <Descriptions.Item label="สาขา">
                          {employee.bankAccount.branchName || '-'}
                        </Descriptions.Item>

                        <Descriptions.Item label="เลขที่บัญชี">
                          {employee.bankAccount.accountNumber}
                        </Descriptions.Item>
                        <Descriptions.Item label="ชื่อบัญชี">
                          {employee.bankAccount.accountName}
                        </Descriptions.Item>
                      </Descriptions>
                    </Card>
                  </Col>
                </Row>
              ),
            },
            {
              key: 'education',
              label: 'การศึกษาและทักษะ',
              children: (
                <Row gutter={[16, 16]}>
                  <Col xs={24}>
                    {employee.education && employee.education.length > 0 && (
                      <Card title="ประวัติการศึกษา" style={{ marginBottom: 16 }}>
                        {employee.education.map((edu, index) => (
                          <Card
                            key={`${edu.institution}-${index}`}
                            type="inner"
                            style={{ marginBottom: 8 }}
                          >
                            <Descriptions column={{ xs: 1, sm: 2 }} bordered>
                              <Descriptions.Item label="ระดับการศึกษา">
                                {edu.level === 'bachelor'
                                  ? 'ปริญญาตรี'
                                  : edu.level === 'master'
                                    ? 'ปริญญาโท'
                                    : edu.level === 'doctorate'
                                      ? 'ปริญญาเอก'
                                      : edu.level === 'diploma'
                                        ? 'ปวส.'
                                        : 'มัธยมศึกษา'}
                              </Descriptions.Item>
                              <Descriptions.Item label="สถาบัน">{edu.institution}</Descriptions.Item>

                              <Descriptions.Item label="สาขา">{edu.fieldOfStudy}</Descriptions.Item>
                              <Descriptions.Item label="ปีที่สำเร็จการศึกษา">
                                {edu.graduationYear}
                              </Descriptions.Item>

                              {edu.gpa && (
                                <Descriptions.Item label="เกรดเฉลี่ย" span={2}>
                                  {edu.gpa.toFixed(2)}
                                </Descriptions.Item>
                              )}
                            </Descriptions>
                          </Card>
                        ))}
                      </Card>
                    )}

                    {employee.certifications && employee.certifications.length > 0 && (
                      <Card title="ใบอนุญาต / ใบรับรอง">
                        {employee.certifications.map((cert, index) => (
                          <Card
                            key={`${cert.name}-${index}`}
                            type="inner"
                            style={{ marginBottom: 8 }}
                          >
                            <Descriptions column={{ xs: 1, sm: 2 }} bordered>
                              <Descriptions.Item label="ชื่อใบอนุญาต">{cert.name}</Descriptions.Item>
                              <Descriptions.Item label="หน่วยงานที่ออก">
                                {cert.issuingOrganization}
                              </Descriptions.Item>

                              <Descriptions.Item label="วันที่ออก">
                                {formatThaiDate(cert.issueDate)}
                              </Descriptions.Item>
                              {cert.expiryDate && (
                                <Descriptions.Item label="วันหมดอายุ">
                                  {formatThaiDate(cert.expiryDate)}
                                </Descriptions.Item>
                              )}

                              {cert.credentialId && (
                                <Descriptions.Item label="รหัสหนังสือรับรอง" span={2}>
                                  {cert.credentialId}
                                </Descriptions.Item>
                              )}
                            </Descriptions>
                          </Card>
                        ))}
                      </Card>
                    )}
                  </Col>
                </Row>
              ),
            },
            {
              key: 'documents',
              label: 'เอกสารพนักงาน',
              children: (
                <Row gutter={[16, 16]}>
                  <Col span={24}>
                    <DocumentExpiryAlert documents={employee.documents ?? []} />
                  </Col>
                  <Col xs={24} lg={10}>
                    <Card title="อัปโหลดเอกสาร" style={{ marginBottom: 16 }}>
                      <DocumentUpload
                        employeeId={employee.id}
                        uploadedBy={uploadedByName ?? 'system'}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} lg={14}>
                    <Card title="รายการเอกสาร">
                      <DocumentList employeeId={employee.id} documents={employee.documents ?? []} />
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
                <Card>
                  <Typography.Text>ยังไม่มีข้อมูลสิทธิ์การลา</Typography.Text>
                </Card>
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
                  <LeaveRequestList requests={[]} showEmployeeName={false} />
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

      {/* Edit Compensation Modal */}
      {employee && (
        <EditCompensationModal
          open={isCompensationModalOpen}
          onClose={() => setIsCompensationModalOpen(false)}
          onSubmit={handleEditCompensation}
          initialData={{
            baseSalary: employee.salary.baseSalary,
            currency: employee.salary.currency,
            paymentFrequency: employee.salary.paymentFrequency,
            ...(employee.salary.hourlyRate != null
              ? { hourlyRate: employee.salary.hourlyRate }
              : {}),
          }}
          loading={updateEmployee.isPending}
        />
      )}

      {/* Edit Tax Modal */}
      {employee && (
        <EditTaxModal
          open={isTaxModalOpen}
          onClose={() => setIsTaxModalOpen(false)}
          onSubmit={handleEditTax}
          initialData={{
            withholdingTax: employee.tax.withholdingTax,
            ...(employee.tax.taxId !== undefined ? { taxId: employee.tax.taxId } : {}),
            ...(employee.tax.withholdingRate !== undefined
              ? { withholdingRate: employee.tax.withholdingRate }
              : {}),
            ...(employee.tax.taxReliefs !== undefined
              ? { taxReliefs: employee.tax.taxReliefs }
              : {}),
          }}
          loading={updateEmployee.isPending}
        />
      )}

      {/* Edit Benefits Modal */}
      {employee && (
        <EditBenefitsModal
          open={isBenefitsModalOpen}
          onClose={() => setIsBenefitsModalOpen(false)}
          onSubmit={handleEditBenefits}
          initialData={
            employee.benefits ?? {
              healthInsurance: false,
              lifeInsurance: false,
              providentFund: { isEnrolled: false },
              annualLeave: 0,
              sickLeave: 0,
            }
          }
          loading={updateEmployee.isPending}
        />
      )}

      {/* Edit Bank Account Modal */}
      {employee && (
        <EditBankAccountModal
          open={isBankAccountModalOpen}
          onClose={() => setIsBankAccountModalOpen(false)}
          onSubmit={handleEditBankAccount}
          initialData={{
            bankName: employee.bankAccount.bankName,
            accountNumber: employee.bankAccount.accountNumber,
            accountName: employee.bankAccount.accountName,
            ...(employee.bankAccount.branchName
              ? { branchName: employee.bankAccount.branchName }
              : {}),
          }}
          loading={updateEmployee.isPending}
        />
      )}
    </div>
  );
};
