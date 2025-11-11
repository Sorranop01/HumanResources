import { HomeOutlined } from '@ant-design/icons';
import { Breadcrumb, Typography } from 'antd';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

const { Title } = Typography;

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface PageHeaderProps {
  title: string;
  breadcrumbs?: BreadcrumbItem[];
  extra?: ReactNode;
}

export function PageHeader({ title, breadcrumbs, extra }: PageHeaderProps) {
  return (
    <div style={{ marginBottom: 24 }}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumb style={{ marginBottom: 16 }}>
          <Breadcrumb.Item>
            <Link to="/dashboard">
              <HomeOutlined />
            </Link>
          </Breadcrumb.Item>
          {breadcrumbs.map((item) => (
            <Breadcrumb.Item key={item.path || item.label}>
              {item.path ? <Link to={item.path}>{item.label}</Link> : item.label}
            </Breadcrumb.Item>
          ))}
        </Breadcrumb>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2} style={{ margin: 0 }}>
          {title}
        </Title>
        {extra && <div>{extra}</div>}
      </div>
    </div>
  );
}
