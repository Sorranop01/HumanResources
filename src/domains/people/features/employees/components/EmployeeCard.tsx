/**
 * EmployeeCard - Display employee information in a card format
 * Used in list views and detail pages
 */

import {
  CalendarOutlined,
  DollarOutlined,
  MailOutlined,
  PhoneOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Avatar, Card, Descriptions, Tag, Typography } from 'antd';
import type { FC } from 'react';
import { formatThaiDate } from '@/shared/lib/date';
import { formatMoney } from '@/shared/lib/format';
import type { Employee, EmployeeStatus } from '../types';

const { Text } = Typography;

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

interface EmployeeCardProps {
  employee: Employee;
  showDetails?: boolean;
  actions?: React.ReactNode;
}

export const EmployeeCard: FC<EmployeeCardProps> = ({ employee, showDetails = true, actions }) => {
  const fullName = `${employee.firstName} ${employee.lastName}`;
  const thaiFullName = `${employee.thaiFirstName} ${employee.thaiLastName}`;

  return (
    <Card hoverable actions={actions !== undefined ? [actions] : []} style={{ height: '100%' }}>
      {/* Header with Avatar */}
      <Card.Meta
        avatar={
          <Avatar
            size={64}
            src={employee.photoURL}
            icon={!employee.photoURL ? <UserOutlined /> : undefined}
          />
        }
        title={
          <div>
            <div>{fullName}</div>
            <Text type="secondary" style={{ fontSize: '14px' }}>
              {thaiFullName}
            </Text>
          </div>
        }
        description={
          <div>
            <Tag color={STATUS_COLORS[employee.status]}>{STATUS_LABELS[employee.status]}</Tag>
            <Tag color="blue">{employee.employeeCode}</Tag>
          </div>
        }
      />

      {/* Details */}
      {showDetails && (
        <Descriptions column={1} size="small" style={{ marginTop: 16 }}>
          <Descriptions.Item
            label={
              <span>
                <MailOutlined /> อีเมล
              </span>
            }
          >
            <a href={`mailto:${employee.email}`}>{employee.email}</a>
          </Descriptions.Item>

          <Descriptions.Item
            label={
              <span>
                <PhoneOutlined /> โทรศัพท์
              </span>
            }
          >
            <a href={`tel:${employee.phoneNumber}`}>{employee.phoneNumber}</a>
          </Descriptions.Item>

          <Descriptions.Item label="แผนก">{employee.department}</Descriptions.Item>

          <Descriptions.Item label="ตำแหน่ง">{employee.position}</Descriptions.Item>

          <Descriptions.Item
            label={
              <span>
                <DollarOutlined /> เงินเดือน
              </span>
            }
          >
            {formatMoney(employee.salary.baseSalary)}
          </Descriptions.Item>

          <Descriptions.Item
            label={
              <span>
                <CalendarOutlined /> วันเริ่มงาน
              </span>
            }
          >
            {formatThaiDate(employee.hireDate)}
          </Descriptions.Item>
        </Descriptions>
      )}
    </Card>
  );
};
