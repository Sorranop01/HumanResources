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
  // Convert breadcrumbs to Ant Design items format
  const breadcrumbItems = breadcrumbs
    ? [
        {
          title: (
            <Link to="/dashboard">
              <HomeOutlined />
            </Link>
          ),
        },
        ...breadcrumbs.map((item) => ({
          title: item.path ? <Link to={item.path}>{item.label}</Link> : item.label,
        })),
      ]
    : [];

  return (
    <div style={{ marginBottom: 24 }}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumb items={breadcrumbItems} style={{ marginBottom: 16 }} />
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
