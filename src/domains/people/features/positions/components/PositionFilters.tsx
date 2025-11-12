import { ClearOutlined, FilterOutlined } from '@ant-design/icons';
import { Button, Card, Col, Form, Row, Select, Switch } from 'antd';
import type { FC } from 'react';
import type {
  PositionFiltersType,
  PositionLevel,
  PositionStatus,
} from '@/domains/people/features/positions/schemas';

const { Option } = Select;

interface PositionFiltersProps {
  filters: PositionFiltersType;
  onFiltersChange: (filters: PositionFiltersType) => void;
}

const DEPARTMENTS = [
  'ฝ่ายบริหาร',
  'ฝ่ายบุคคล',
  'ฝ่ายการเงินและบัญชี',
  'ฝ่ายขาย',
  'ฝ่ายการตลาด',
  'ฝ่ายไอที',
  'ฝ่ายปฏิบัติการ',
  'ฝ่ายผลิต',
  'ฝ่ายวิจัยและพัฒนา',
  'ฝ่ายบริการลูกค้า',
  'ฝ่ายจัดซื้อ',
  'ฝ่ายโลจิสติกส์',
];

const POSITION_LEVELS: { value: PositionLevel; label: string }[] = [
  { value: 'executive', label: 'ผู้บริหารระดับสูง' },
  { value: 'senior-management', label: 'ผู้บริหารอาวุโส' },
  { value: 'middle-management', label: 'ผู้บริหารระดับกลาง' },
  { value: 'supervisor', label: 'หัวหน้างาน' },
  { value: 'staff', label: 'พนักงาน' },
  { value: 'junior', label: 'พนักงานระดับเริ่มต้น' },
];

const STATUS_OPTIONS: { value: PositionStatus; label: string }[] = [
  { value: 'active', label: 'เปิดใช้งาน' },
  { value: 'inactive', label: 'ปิดใช้งาน' },
];

export const PositionFilters: FC<PositionFiltersProps> = ({ filters, onFiltersChange }) => {
  const handleClearFilters = () => {
    onFiltersChange({});
  };

  return (
    <Card
      title={
        <span>
          <FilterOutlined /> ตัวกรอง
        </span>
      }
      style={{ marginBottom: 24 }}
      extra={
        <Button
          icon={<ClearOutlined />}
          onClick={handleClearFilters}
          disabled={Object.keys(filters).length === 0}
        >
          ล้างตัวกรอง
        </Button>
      }
    >
      <Form layout="vertical">
        <Row gutter={16}>
          <Col xs={24} sm={12} md={6}>
            <Form.Item label="สถานะ">
              <Select
                value={filters.status}
                onChange={(value) => onFiltersChange({ ...filters, status: value })}
                placeholder="ทั้งหมด"
                allowClear
              >
                {STATUS_OPTIONS.map((status) => (
                  <Option key={status.value} value={status.value}>
                    {status.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Form.Item label="ระดับตำแหน่ง">
              <Select
                value={filters.level}
                onChange={(value) => onFiltersChange({ ...filters, level: value })}
                placeholder="ทั้งหมด"
                allowClear
              >
                {POSITION_LEVELS.map((level) => (
                  <Option key={level.value} value={level.value}>
                    {level.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Form.Item label="แผนก/ฝ่าย">
              <Select
                value={filters.department}
                onChange={(value) => onFiltersChange({ ...filters, department: value })}
                placeholder="ทั้งหมด"
                allowClear
                showSearch
              >
                {DEPARTMENTS.map((dept) => (
                  <Option key={dept} value={dept}>
                    {dept}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Form.Item label="มีตำแหน่งว่าง">
              <Switch
                checked={filters.hasVacancy ?? false}
                onChange={(checked) =>
                  onFiltersChange({ ...filters, hasVacancy: checked || undefined })
                }
                checkedChildren="มี"
                unCheckedChildren="ทั้งหมด"
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Card>
  );
};
