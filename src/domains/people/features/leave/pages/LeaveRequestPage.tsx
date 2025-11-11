import { CalendarOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Card, Col, Modal, Row, Space, Spin, Tabs, Typography } from 'antd';
import type { FC } from 'react';
import { useState } from 'react';
import { LeaveEntitlementCard } from '../components/LeaveEntitlementCard';
import { LeaveRequestForm } from '../components/LeaveRequestForm';
import { LeaveRequestList } from '../components/LeaveRequestList';
import { useLeaveEntitlements } from '../hooks/useLeaveEntitlements';
import { useLeaveRequests } from '../hooks/useLeaveRequests';

const { Title } = Typography;

/**
 * Leave Request Page
 * Main page for managing leave requests and viewing leave entitlements
 */
export const LeaveRequestPage: FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('my-requests');

  // Fetch current user's leave data
  const { data: leaveRequests = [], isLoading: isLoadingRequests } = useLeaveRequests({
    status: undefined,
  });
  const { data: leaveEntitlements = [], isLoading: isLoadingEntitlements } = useLeaveEntitlements();

  const handleCreateSuccess = () => {
    setIsCreateModalOpen(false);
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
              children: isLoadingRequests ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <Spin size="large" />
                </div>
              ) : (
                <LeaveRequestList requests={leaveRequests} showEmployeeName={false} />
              ),
            },
            {
              key: 'all-requests',
              label: 'คำขอลาทั้งหมด',
              children: (
                <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                  <p>ฟีเจอร์นี้สำหรับผู้จัดการและ HR เท่านั้น</p>
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
        width={600}
        destroyOnClose
      >
        <LeaveRequestForm onSuccess={handleCreateSuccess} onCancel={() => setIsCreateModalOpen(false)} />
      </Modal>
    </div>
  );
};
