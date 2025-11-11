import { Layout } from 'antd';
import type { FC, ReactNode } from 'react';
import { useState } from 'react';
import { AppHeader } from './AppHeader';
import { AppSidebar } from './AppSidebar';

const { Content } = Layout;

interface AppLayoutProps {
  children: ReactNode;
}

/**
 * Main application layout component
 * Includes Header, Sidebar, and Content area
 */
export const AppLayout: FC<AppLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);

  const handleToggle = () => {
    setCollapsed(!collapsed);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Sidebar */}
      <AppSidebar collapsed={collapsed} />

      {/* Main Layout */}
      <Layout>
        {/* Header */}
        <AppHeader collapsed={collapsed} onToggle={handleToggle} />

        {/* Content Area */}
        <Content
          style={{
            margin: '24px',
            padding: '24px',
            background: '#f0f2f5',
            minHeight: 280,
            overflow: 'initial',
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};
