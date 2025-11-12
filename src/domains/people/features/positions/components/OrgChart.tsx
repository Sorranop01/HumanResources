import { BankOutlined, TeamOutlined, UserOutlined, WarningOutlined } from '@ant-design/icons';
import { Card, Empty, Space, Tag, Tree } from 'antd';
import type { DataNode } from 'antd/es/tree';
import type { FC } from 'react';
import { useOrgChart } from '@/domains/people/features/positions/hooks/useOrgChart';
import type { PositionLevel } from '@/domains/people/features/positions/schemas';
import type { OrgChartNode } from '@/domains/people/features/positions/types';

interface OrgChartProps {
  onSelectPosition?: (positionId: string) => void;
}

const LEVEL_COLORS: Record<PositionLevel, string> = {
  executive: '#722ed1',
  'senior-management': '#1890ff',
  'middle-management': '#13c2c2',
  supervisor: '#52c41a',
  staff: '#faad14',
  junior: '#fa8c16',
};

const LEVEL_LABELS: Record<PositionLevel, string> = {
  executive: 'ผู้บริหารระดับสูง',
  'senior-management': 'ผู้บริหารอาวุโส',
  'middle-management': 'ผู้บริหารระดับกลาง',
  supervisor: 'หัวหน้างาน',
  staff: 'พนักงาน',
  junior: 'พนักงานระดับเริ่มต้น',
};

/**
 * Convert OrgChartNode to Ant Design Tree DataNode
 */
function convertToTreeData(nodes: OrgChartNode[]): DataNode[] {
  return nodes.map((node) => ({
    key: node.id,
    title: (
      <div style={{ padding: '8px 0' }}>
        <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: 4 }}>{node.name}</div>
        <Space size="small" wrap>
          <Tag color={LEVEL_COLORS[node.level]} style={{ margin: 0 }}>
            {LEVEL_LABELS[node.level]}
          </Tag>
          <Tag icon={<BankOutlined />} color="blue" style={{ margin: 0 }}>
            {node.department}
          </Tag>
          <Tag icon={<TeamOutlined />} style={{ margin: 0 }}>
            Headcount: {node.headcount}
          </Tag>
          <Tag icon={<UserOutlined />} color="green" style={{ margin: 0 }}>
            พนักงาน: {node.currentEmployees}
          </Tag>
          {node.vacancy > 0 && (
            <Tag icon={<WarningOutlined />} color="orange" style={{ margin: 0 }}>
              ว่าง: {node.vacancy}
            </Tag>
          )}
        </Space>
        <div style={{ fontSize: '12px', color: '#888', marginTop: 4 }}>
          รหัส: {node.positionCode}
        </div>
      </div>
    ),
    children:
      node.children && node.children.length > 0 ? convertToTreeData(node.children) : undefined,
  }));
}

export const OrgChart: FC<OrgChartProps> = ({ onSelectPosition }) => {
  const { data: orgChartData, isLoading } = useOrgChart();

  if (isLoading) {
    return <Card loading={true} />;
  }

  if (!orgChartData || orgChartData.length === 0) {
    return (
      <Card>
        <Empty description="ไม่พบข้อมูลโครงสร้างองค์กร" />
      </Card>
    );
  }

  const treeData = convertToTreeData(orgChartData);

  return (
    <Card title="แผนผังโครงสร้างองค์กร" style={{ marginBottom: 24 }}>
      <Tree
        showLine
        defaultExpandAll
        treeData={treeData}
        onSelect={(selectedKeys) => {
          if (selectedKeys.length > 0 && onSelectPosition) {
            onSelectPosition(selectedKeys[0] as string);
          }
        }}
        style={{
          background: '#f5f5f5',
          padding: '16px',
          borderRadius: '8px',
        }}
      />
    </Card>
  );
};
