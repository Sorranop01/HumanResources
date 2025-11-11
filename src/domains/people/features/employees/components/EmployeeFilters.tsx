/**
 * EmployeeFilters - Filter component for employee list
 * Provides status, department, and search filters
 */

import { FilterOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Card, Col, Form, Input, Row, Select } from 'antd';
import type { FC } from 'react';
import type { EmployeeFilters as EmployeeFiltersType } from '../schemas';

const { Option } = Select;

interface EmployeeFiltersProps {
  filters: EmployeeFiltersType;
  onFiltersChange: (filters: EmployeeFiltersType) => void;
  loading?: boolean;
}

const DEPARTMENTS = [
  'ฝ่ายบุคคล',
  'ฝ่ายการเงิน',
  'ฝ่ายขาย',
  'ฝ่ายการตลาด',
  'ฝ่ายไอที',
  'ฝ่ายปฏิบัติการ',
  'ฝ่ายผลิต',
];

const POSITIONS = ['ผู้จัดการ', 'หัวหน้าแผนก', 'พนักงานอาวุโส', 'พนักงาน', 'พนักงานฝึกหัด', 'ที่ปรึกษา'];

export const EmployeeFilters: FC<EmployeeFiltersProps> = ({
  filters,
  onFiltersChange,
  loading = false,
}) => {
  const handleFilterChange = (key: keyof EmployeeFiltersType, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value || undefined,
    });
  };

  const handleClearFilters = (): void => {
    onFiltersChange({});
  };

  const hasActiveFilters =
    filters.status !== undefined ||
    filters.department !== undefined ||
    filters.position !== undefined ||
    (filters.search !== undefined && filters.search !== '');

  return (
    <Card size="small">
      <Form layout="vertical">
        <Row gutter={[16, 16]}>
          {/* Search */}
          <Col xs={24} sm={12} md={6}>
            <Form.Item label="ค้นหา" style={{ marginBottom: 0 }}>
              <Input
                placeholder="ชื่อ, รหัส, อีเมล..."
                prefix={<SearchOutlined />}
                value={filters.search ?? ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                allowClear
                disabled={loading}
              />
            </Form.Item>
          </Col>

          {/* Status Filter */}
          <Col xs={24} sm={12} md={6}>
            <Form.Item label="สถานะ" style={{ marginBottom: 0 }}>
              <Select
                placeholder="ทั้งหมด"
                value={filters.status ?? null}
                onChange={(value: string) => handleFilterChange('status', value)}
                allowClear
                disabled={loading}
              >
                <Option value="active">ทำงานอยู่</Option>
                <Option value="on-leave">ลา</Option>
                <Option value="resigned">ลาออก</Option>
                <Option value="terminated">เลิกจ้าง</Option>
              </Select>
            </Form.Item>
          </Col>

          {/* Department Filter */}
          <Col xs={24} sm={12} md={6}>
            <Form.Item label="แผนก" style={{ marginBottom: 0 }}>
              <Select
                placeholder="ทั้งหมด"
                value={filters.department ?? null}
                onChange={(value: string) => handleFilterChange('department', value)}
                allowClear
                showSearch
                disabled={loading}
              >
                {DEPARTMENTS.map((dept) => (
                  <Option key={dept} value={dept}>
                    {dept}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          {/* Position Filter */}
          <Col xs={24} sm={12} md={6}>
            <Form.Item label="ตำแหน่ง" style={{ marginBottom: 0 }}>
              <Select
                placeholder="ทั้งหมด"
                value={filters.position ?? null}
                onChange={(value: string) => handleFilterChange('position', value)}
                allowClear
                showSearch
                disabled={loading}
              >
                {POSITIONS.map((pos) => (
                  <Option key={pos} value={pos}>
                    {pos}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <Row style={{ marginTop: 8 }}>
            <Col span={24}>
              <Button
                type="link"
                icon={<FilterOutlined />}
                onClick={handleClearFilters}
                disabled={loading}
              >
                ล้างตัวกรอง
              </Button>
            </Col>
          </Row>
        )}
      </Form>
    </Card>
  );
};
