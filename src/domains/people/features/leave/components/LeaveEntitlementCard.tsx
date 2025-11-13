/**
 * Leave Entitlement Card Component
 * Displays a summary of a single leave entitlement.
 */

import { Card, Progress, Statistic } from 'antd';
import type { FC } from 'react';
import type { LeaveEntitlement } from '../types';

interface LeaveEntitlementCardProps {
  entitlement: LeaveEntitlement;
}

export const LeaveEntitlementCard: FC<LeaveEntitlementCardProps> = ({ entitlement }) => {
  const { leaveTypeName, leaveTypeCode, totalEntitlement, used, pending, remaining } = entitlement;

  const percent = totalEntitlement > 0 ? Math.round((used / totalEntitlement) * 100) : 0;

  const iconMap: Record<string, string> = {
    ANNUAL: '🏖️',
    SICK: '🤒',
    PERSONAL: '👤',
    MATERNITY: '🤱',
    PATERNITY: '👨',
    TRAINING: '🎓',
    UNPAID: '⏸️',
  };

  const icon = iconMap[leaveTypeCode] || '📄';

  return (
    <Card hoverable>
      <Statistic
        title={
          <div style={{ display: 'flex', alignItems: 'center', fontSize: '16px' }}>
            <span style={{ fontSize: '24px', marginRight: '8px' }}>{icon}</span>
            {leaveTypeName}
          </div>
        }
        value={remaining}
        suffix={<span style={{ fontSize: '14px' }}> / {totalEntitlement} วัน</span>}
        valueStyle={{
          color: remaining > 0 ? '#1890ff' : '#bfbfbf',
          fontWeight: 500,
        }}
      />
      <Progress
        percent={percent}
        size="small"
        status={percent > 80 ? 'exception' : 'normal'}
        showInfo={false}
        style={{ marginTop: '12px' }}
      />
      <div
        style={{
          marginTop: '12px',
          display: 'flex',
          justifyContent: 'space-between',
          color: '#8c8c8c',
        }}
      >
        <span>ใช้ไป: {used} วัน</span>
        {pending > 0 && <span>รออนุมัติ: {pending} วัน</span>}
      </div>
    </Card>
  );
};
