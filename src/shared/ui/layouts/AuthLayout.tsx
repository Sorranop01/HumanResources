import { Card, Layout } from 'antd';
import type { ReactNode } from 'react';

const { Content } = Layout;

interface AuthLayoutProps {
  children: ReactNode;
  title?: string;
}

export function AuthLayout({ children, title = 'HumanResources' }: AuthLayoutProps) {
  return (
    <Layout
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <Content
        style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '24px' }}
      >
        <Card
          style={{
            width: '100%',
            maxWidth: 450,
            boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <h1 style={{ fontSize: 32, fontWeight: 'bold', color: '#1890ff', margin: 0 }}>
              {title}
            </h1>
            <p style={{ color: '#666', marginTop: 8 }}>HR Management System</p>
          </div>
          {children}
        </Card>
      </Content>
    </Layout>
  );
}
