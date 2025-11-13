import { ApartmentOutlined } from '@ant-design/icons';
import { Card, Spin, Tree } from 'antd';
import type { DataNode } from 'antd/es/tree';
import type { FC } from 'react';
import { useMemo } from 'react';
import { useDepartmentTree } from '../hooks/useDepartments';
import type { DepartmentTree as DepartmentTreeType } from '../types/departmentTypes';

const TENANT_ID = 'default';

/**
 * Convert DepartmentTree to Ant Design Tree DataNode
 */
const convertToTreeData = (nodes: DepartmentTreeType[]): DataNode[] => {
  return nodes.map((node) => ({
    title: `${node.code} - ${node.name}`,
    key: node.id,
    icon: <ApartmentOutlined />,
    children: node.children ? convertToTreeData(node.children) : [],
  }));
};

interface DepartmentTreeProps {
  onSelect?: (departmentId: string) => void;
}

export const DepartmentTree: FC<DepartmentTreeProps> = ({ onSelect }) => {
  const { data: tree, isLoading } = useDepartmentTree(TENANT_ID);

  const treeData = useMemo(() => {
    if (!tree) return [];
    return convertToTreeData(tree);
  }, [tree]);

  const handleSelect = (selectedKeys: React.Key[]) => {
    if (selectedKeys.length > 0 && onSelect) {
      onSelect(selectedKeys[0] as string);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
        </div>
      </Card>
    );
  }

  return (
    <Card title="โครงสร้างแผนก">
      {treeData.length > 0 ? (
        <Tree showIcon defaultExpandAll treeData={treeData} onSelect={handleSelect} />
      ) : (
        <p style={{ textAlign: 'center', color: '#999' }}>ยังไม่มีข้อมูลแผนก</p>
      )}
    </Card>
  );
};
