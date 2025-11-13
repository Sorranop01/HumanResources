import { CalendarOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Card, Col, Modal, Row, Space, Spin, Tabs, Typography } from 'antd';
import type { FC } from 'react';
import { useState } from 'react';
import { useAuth } from '@/shared/hooks/useAuth';
import { LeaveEntitlementCard } from '../components/LeaveEntitlementCard';
import { LeaveRequestForm } from '../components/LeaveRequestForm';
import { LeaveRequestList } from '../components/LeaveRequestList';
import { useCreateLeaveRequest } from '../hooks/useCreateLeaveRequest';
import { useLeaveEntitlements } from '../hooks/useLeaveEntitlements';
import { useLeaveRequests } from '../hooks/useLeaveRequests';
import { formDataToLeaveRequestInput, type LeaveRequestFormInput } from '../schemas';

const { Title } = Typography;

/**
 * Leave Request Page
 * Main page for managing leave requests and viewing leave entitlements
 */
export const LeaveRequestPage: FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('my-requests');
  const { employeeId, user } = useAuth();

  // Fetch current user's leave requests
  const { data: myLeaveRequests = [], isLoading: isLoadingMyRequests } = useLeaveRequests({
    employeeId: employeeId ?? undefined,
  });

  // Fetch all leave requests (for HR/Manager)
  const { data: allLeaveRequests = [], isLoading: isLoadingAllRequests } = useLeaveRequests();

  const { data: leaveEntitlements = [], isLoading: isLoadingEntitlements } =
    useLeaveEntitlements(employeeId);

  // Check if user can view all requests (HR or Manager)
  const canViewAllRequests =
    user?.role === 'hr' || user?.role === 'manager' || user?.role === 'admin';

  const createLeaveRequestMutation = useCreateLeaveRequest();

  const handleFormSubmit = (data: LeaveRequestFormInput) => {
    if (!employeeId) {
      // Should not happen if the form is only available for logged-in users
      return;
    }
    const input = formDataToLeaveRequestInput(data, employeeId);
    createLeaveRequestMutation.mutate(input, {
      onSuccess: () => {
        setIsCreateModalOpen(false);
      },
    });
  };

  return (
    <div style={{ padding: '24px' }}>
      {/* Page Header */}
      <Row justify="space-between" align="middle" style={{ marginBottom: '24px' }}>
        <Col>
          <Space>
            <CalendarOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
            <Title level={2} style={{ margin: 0 }}>
              การจัดการคำขอลา
            </Title>
          </Space>
        </Col>
        <Col>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsCreateModalOpen(true)}
            size="large"
            disabled={!employeeId}
          >
            ขอลา
          </Button>
        </Col>
      </Row>

      {/* Leave Entitlements Section */}
      <Card title="สิทธิ์การลาของฉัน" style={{ marginBottom: '24px' }}>
        {isLoadingEntitlements ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Spin size="large" />
          </div>
        ) : leaveEntitlements.length > 0 ? (
          <Row gutter={[16, 16]}>
            {leaveEntitlements.map((entitlement) => (
              <Col xs={24} sm={12} md={8} lg={6} key={entitlement.id}>
                <LeaveEntitlementCard entitlement={entitlement} />
              </Col>
            ))}
          </Row>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            <CalendarOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
            <p>ยังไม่มีข้อมูลสิทธิ์การลา</p>
          </div>
        )}
      </Card>

      {/* Leave Requests Section */}
      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'my-requests',
              label: 'คำขอลาของฉัน',
              children: (
                <LeaveRequestList
                  requests={myLeaveRequests}
                  isLoading={isLoadingMyRequests}
                  showEmployeeName={false}
                />
              ),
            },
            {
              key: 'all-requests',
              label: 'คำขอลาทั้งหมด',
              children: canViewAllRequests ? (
                <LeaveRequestList
                  requests={allLeaveRequests}
                  isLoading={isLoadingAllRequests}
                  showEmployeeName={true}
                />
              ) : (
                <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                  <CalendarOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
                  <p>คุณไม่มีสิทธิ์ดูคำขอลาทั้งหมด</p>
                  <p style={{ fontSize: '12px' }}>ฟีเจอร์นี้สำหรับผู้จัดการ, HR และ Admin เท่านั้น</p>
                </div>
              ),
            },
          ]}
        />
      </Card>

      {/* Create Leave Request Modal */}
      <Modal
        title="สร้างคำขอลา"
        open={isCreateModalOpen}
        onCancel={() => setIsCreateModalOpen(false)}
        footer={null}
        width={800}
        destroyOnHidden
      >
        <LeaveRequestForm
          onSubmit={handleFormSubmit}
          onCancel={() => setIsCreateModalOpen(false)}
          loading={createLeaveRequestMutation.isPending}
        />
      </Modal>
    </div>
  );
};
