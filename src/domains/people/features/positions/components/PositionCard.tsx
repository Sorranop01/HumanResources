import { BankOutlined, TeamOutlined, TrophyOutlined, UserOutlined } from '@ant-design/icons';
import { Card, Col, Descriptions, Divider, List, Row, Statistic, Tag } from 'antd';
import type { FC } from 'react';
import type { PositionLevel, PositionStatus } from '@/domains/people/features/positions/schemas';
import type { Position } from '@/domains/people/features/positions/types';
import { formatMoney } from '@/shared/lib/format';

interface PositionCardProps {
  position: Position;
}

const STATUS_COLORS: Record<PositionStatus, string> = {
  active: 'green',
  inactive: 'red',
};

const STATUS_LABELS: Record<PositionStatus, string> = {
  active: 'เปิดใช้งาน',
  inactive: 'ปิดใช้งาน',
};

const LEVEL_LABELS: Record<PositionLevel, string> = {
  executive: 'ผู้บริหารระดับสูง',
  'senior-management': 'ผู้บริหารอาวุโส',
  'middle-management': 'ผู้บริหารระดับกลาง',
  supervisor: 'หัวหน้างาน',
  staff: 'พนักงาน',
  junior: 'พนักงานระดับเริ่มต้น',
};

export const PositionCard: FC<PositionCardProps> = ({ position }) => {
  return (
    <div>
      {/* Statistics */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="จำนวนตำแหน่ง" value={position.headcount} prefix={<TeamOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="พนักงานปัจจุบัน"
              value={position.currentEmployees}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="ตำแหน่งว่าง"
              value={position.vacancy}
              valueStyle={{ color: position.vacancy > 0 ? '#ff7a45' : '#3f8600' }}
              prefix={<BankOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="อัตราการครอง"
              value={
                position.headcount > 0
                  ? ((position.currentEmployees / position.headcount) * 100).toFixed(1)
                  : 0
              }
              suffix="%"
              prefix={<TrophyOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Basic Information */}
      <Card title="ข้อมูลพื้นฐาน" style={{ marginBottom: 24 }}>
        <Descriptions bordered column={{ xs: 1, sm: 2, md: 2 }}>
          <Descriptions.Item label="รหัสตำแหน่ง">{position.positionCode}</Descriptions.Item>
          <Descriptions.Item label="ชื่อตำแหน่ง (ไทย)">{position.nameTH}</Descriptions.Item>
          <Descriptions.Item label="ชื่อตำแหน่ง (อังกฤษ)">{position.nameEN || '-'}</Descriptions.Item>
          <Descriptions.Item label="ระดับตำแหน่ง">{LEVEL_LABELS[position.level]}</Descriptions.Item>
          <Descriptions.Item label="แผนก/ฝ่าย">{position.department}</Descriptions.Item>
          <Descriptions.Item label="ตำแหน่งหัวหน้า">
            {position.parentPositionName || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="สถานะ">
            <Tag color={STATUS_COLORS[position.status]}>{STATUS_LABELS[position.status]}</Tag>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Salary Range */}
      <Card title="ช่วงเงินเดือน" style={{ marginBottom: 24 }}>
        <Descriptions bordered column={1}>
          <Descriptions.Item label="เงินเดือนขั้นต่ำ">
            {formatMoney(position.salaryRange.min)}
          </Descriptions.Item>
          <Descriptions.Item label="เงินเดือนขั้นสูง">
            {formatMoney(position.salaryRange.max)}
          </Descriptions.Item>
          <Descriptions.Item label="ช่วงเงินเดือน">
            <strong>
              {formatMoney(position.salaryRange.min)} - {formatMoney(position.salaryRange.max)}
            </strong>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Job Description */}
      <Card title="รายละเอียดงาน (Job Description)" style={{ marginBottom: 24 }}>
        <Descriptions bordered column={1}>
          <Descriptions.Item label="ภาพรวมของงาน">
            {position.jobDescription.overview}
          </Descriptions.Item>
        </Descriptions>

        <Divider orientation="left">ความรับผิดชอบ</Divider>
        <List
          dataSource={position.jobDescription.responsibilities}
          renderItem={(item) => <List.Item>{item}</List.Item>}
          bordered
        />

        <Divider orientation="left">คุณสมบัติที่ต้องการ</Divider>
        <List
          dataSource={position.jobDescription.requirements}
          renderItem={(item) => <List.Item>{item}</List.Item>}
          bordered
        />

        <Divider orientation="left">วุฒิการศึกษา/ประสบการณ์</Divider>
        <List
          dataSource={position.jobDescription.qualifications}
          renderItem={(item) => <List.Item>{item}</List.Item>}
          bordered
        />

        <Divider orientation="left">ทักษะที่จำเป็น</Divider>
        <List
          dataSource={position.jobDescription.skills}
          renderItem={(item) => <List.Item>{item}</List.Item>}
          bordered
        />

        {position.jobDescription.competencies &&
          position.jobDescription.competencies.length > 0 && (
            <>
              <Divider orientation="left">สมรรถนะหลัก</Divider>
              <List
                dataSource={position.jobDescription.competencies}
                renderItem={(item) => <List.Item>{item}</List.Item>}
                bordered
              />
            </>
          )}
      </Card>
    </div>
  );
};
