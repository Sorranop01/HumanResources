/**
 * Social Security Card Component
 * Displays social security information in a card format
 */

import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Button, Card, Descriptions, Empty, Space, Spin, Tag } from 'antd';
import type { FC } from 'react';
import { useSocialSecurity } from '../hooks/useSocialSecurity';
import type { SocialSecurity } from '../types';

interface SocialSecurityCardProps {
  employeeId: string;
  onEdit?: (data: SocialSecurity) => void;
  onDelete?: (id: string) => void;
  onCreate?: () => void;
}

export const SocialSecurityCard: FC<SocialSecurityCardProps> = ({
  employeeId,
  onEdit,
  onDelete,
  onCreate,
}) => {
  const { data: socialSecurity, isLoading, error } = useSocialSecurity(employeeId);

  if (isLoading) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin size="large" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <Empty description="เกิดข้อผิดพลาดในการโหลดข้อมูล" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      </Card>
    );
  }

  if (!socialSecurity) {
    return (
      <Card>
        <Empty description="ยังไม่มีข้อมูลประกันสังคม" image={Empty.PRESENTED_IMAGE_SIMPLE}>
          {onCreate && (
            <Button type="primary" onClick={onCreate}>
              เพิ่มข้อมูลประกันสังคม
            </Button>
          )}
        </Empty>
      </Card>
    );
  }

  const statusColor =
    socialSecurity.status === 'active'
      ? 'green'
      : socialSecurity.status === 'inactive'
        ? 'red'
        : 'orange';

  const statusLabel =
    socialSecurity.status === 'active'
      ? 'ใช้งาน'
      : socialSecurity.status === 'inactive'
        ? 'ไม่ใช้งาน'
        : 'ระงับ';

  return (
    <Card
      title="ข้อมูลประกันสังคม"
      extra={
        <Space>
          {onEdit && (
            <Button icon={<EditOutlined />} onClick={() => onEdit(socialSecurity)}>
              แก้ไข
            </Button>
          )}
          {onDelete && (
            <Button danger icon={<DeleteOutlined />} onClick={() => onDelete(socialSecurity.id)}>
              ลบ
            </Button>
          )}
        </Space>
      }
    >
      <Descriptions column={{ xs: 1, sm: 1, md: 2 }} bordered>
        <Descriptions.Item label="เลขประกันสังคม">
          {socialSecurity.socialSecurityNumber}
        </Descriptions.Item>
        <Descriptions.Item label="สถานะ">
          <Tag color={statusColor}>{statusLabel}</Tag>
        </Descriptions.Item>

        <Descriptions.Item label="วันที่เริ่มจ่าย">
          {socialSecurity.registrationDate.toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </Descriptions.Item>
        <Descriptions.Item label="โรงพยาบาลประจำ">
          {socialSecurity.hospitalName}
          {socialSecurity.hospitalCode && ` (${socialSecurity.hospitalCode})`}
        </Descriptions.Item>

        <Descriptions.Item label="อัตราพนักงาน">
          {(socialSecurity.employeeContributionRate * 100).toFixed(0)}%
        </Descriptions.Item>
        <Descriptions.Item label="อัตรานายจ้าง">
          {(socialSecurity.employerContributionRate * 100).toFixed(0)}%
        </Descriptions.Item>

        <Descriptions.Item label="ฐานเงินเดือน">
          {socialSecurity.contributionBase.toLocaleString('th-TH', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}{' '}
          บาท
        </Descriptions.Item>
        <Descriptions.Item label="จำนวนเงินรายเดือน">
          <strong>
            {socialSecurity.totalAmount.toLocaleString('th-TH', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{' '}
            บาท
          </strong>
        </Descriptions.Item>

        <Descriptions.Item label="พนักงานจ่าย">
          {socialSecurity.employeeAmount.toLocaleString('th-TH', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}{' '}
          บาท
        </Descriptions.Item>
        <Descriptions.Item label="นายจ้างจ่าย">
          {socialSecurity.employerAmount.toLocaleString('th-TH', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}{' '}
          บาท
        </Descriptions.Item>

        <Descriptions.Item label="ยอดสะสมพนักงาน">
          {socialSecurity.totalEmployeeContribution.toLocaleString('th-TH', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}{' '}
          บาท
        </Descriptions.Item>
        <Descriptions.Item label="ยอดสะสมนายจ้าง">
          {socialSecurity.totalEmployerContribution.toLocaleString('th-TH', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}{' '}
          บาท
        </Descriptions.Item>

        <Descriptions.Item label="ยอดสะสมรวมทั้งหมด" span={2}>
          <strong style={{ fontSize: '16px', color: '#1890ff' }}>
            {socialSecurity.totalContribution.toLocaleString('th-TH', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{' '}
            บาท
          </strong>
        </Descriptions.Item>

        {socialSecurity.lastContributionDate && (
          <Descriptions.Item label="วันที่จ่ายล่าสุด" span={2}>
            {socialSecurity.lastContributionDate.toLocaleDateString('th-TH', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Descriptions.Item>
        )}

        {socialSecurity.notes && (
          <Descriptions.Item label="หมายเหตุ" span={2}>
            {socialSecurity.notes}
          </Descriptions.Item>
        )}
      </Descriptions>
    </Card>
  );
};
