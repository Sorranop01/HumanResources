/**
 * UserRoleCard Component
 * Display user's current role information with assignment details
 */

import { ClockCircleOutlined, SafetyOutlined, SwapOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Card, Descriptions, Spin, Tag, Typography } from 'antd';
import type { FC } from 'react';
import { useState } from 'react';
import { useAuth } from '@/domains/system/features/auth/hooks/useAuth';
import { ROLE_LABELS } from '@/shared/constants/roles';
import type { User } from '@/shared/types';
import { useEffectiveRole } from '../hooks/useEffectiveRole';
import { useRevokeRole } from '../hooks/useUserRoleManagement';
import { AssignRoleModal } from './AssignRoleModal';

const { Text, Title } = Typography;

interface UserRoleCardProps {
  user: User;
}

/**
 * Card showing user's role information
 */
export const UserRoleCard: FC<UserRoleCardProps> = ({ user }) => {
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const { user: currentUser } = useAuth();
  const { data: effectiveRoleInfo, isLoading } = useEffectiveRole(user.id);
  const { mutate: revokeRole, isPending: isRevoking } = useRevokeRole();

  const handleRevokeRole = () => {
    if (!currentUser?.id) return;

    revokeRole({
      userId: user.id,
      revokedByUserId: currentUser.id,
      reason: 'ยกเลิกโดยผู้ดูแลระบบ',
    });
  };

  if (isLoading) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: 24 }}>
          <Spin />
        </div>
      </Card>
    );
  }

  const hasAssignment = effectiveRoleInfo?.source === 'assignment';
  const effectiveRole = effectiveRoleInfo?.effectiveRole;
  const assignment = effectiveRoleInfo?.assignment;

  return (
    <>
      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <SafetyOutlined />
            <span>ข้อมูลบทบาท</span>
          </div>
        }
        extra={
          <Button
            type="primary"
            icon={<SwapOutlined />}
            onClick={() => setIsAssignModalOpen(true)}
            size="small"
          >
            มอบหมายบทบาท
          </Button>
        }
      >
        <Descriptions column={1} size="small">
          <Descriptions.Item label={<Text strong>บทบาทปัจจุบัน</Text>}>
            <Tag
              color={
                effectiveRole === 'admin'
                  ? 'red'
                  : effectiveRole === 'hr'
                    ? 'blue'
                    : effectiveRole === 'manager'
                      ? 'purple'
                      : effectiveRole === 'employee'
                        ? 'green'
                        : 'orange'
              }
              style={{ fontSize: '14px', padding: '4px 12px' }}
            >
              {effectiveRole ? ROLE_LABELS[effectiveRole] : '-'}
            </Tag>
          </Descriptions.Item>

          <Descriptions.Item label={<Text strong>แหล่งที่มา</Text>}>
            {hasAssignment ? (
              <Tag icon={<SwapOutlined />} color="blue">
                มอบหมายพิเศษ
              </Tag>
            ) : (
              <Tag icon={<UserOutlined />} color="default">
                บทบาทเริ่มต้น
              </Tag>
            )}
          </Descriptions.Item>

          <Descriptions.Item label={<Text strong>บทบาทเริ่มต้น</Text>}>
            <Tag color="default">{ROLE_LABELS[user.role]}</Tag>
          </Descriptions.Item>
        </Descriptions>

        {hasAssignment && assignment && (
          <div
            style={{
              marginTop: 16,
              padding: 12,
              background: '#e6f4ff',
              borderRadius: 6,
              border: '1px solid #91caff',
            }}
          >
            <Title level={5} style={{ margin: 0, marginBottom: 8, fontSize: '14px' }}>
              รายละเอียดการมอบหมาย
            </Title>

            <div style={{ fontSize: '12px', lineHeight: '20px' }}>
              <div>
                <Text strong>มอบหมายโดย:</Text> <Text>{assignment.assignedBy}</Text>
              </div>
              <div>
                <Text strong>วันที่มอบหมาย:</Text>{' '}
                <Text>
                  {new Date(assignment.createdAt).toLocaleDateString('th-TH', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </Text>
              </div>
              {assignment.expiresAt && (
                <div>
                  <ClockCircleOutlined /> <Text strong>วันหมดอายุ:</Text>{' '}
                  <Text>
                    {new Date(assignment.expiresAt).toLocaleDateString('th-TH', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </Text>
                </div>
              )}
              {assignment.reason && (
                <div style={{ marginTop: 4 }}>
                  <Text strong>เหตุผล:</Text> <Text type="secondary">{assignment.reason}</Text>
                </div>
              )}
            </div>

            <div style={{ marginTop: 12 }}>
              <Button danger size="small" onClick={handleRevokeRole} loading={isRevoking}>
                ยกเลิกการมอบหมาย
              </Button>
            </div>
          </div>
        )}
      </Card>

      <AssignRoleModal
        open={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        user={user}
      />
    </>
  );
};
