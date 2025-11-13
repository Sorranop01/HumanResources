import { FormOutlined, TeamOutlined } from '@ant-design/icons';
import { Card, Space, Tabs } from 'antd';
import { useState } from 'react';
import { PageHeader } from '@/shared/ui/components/PageHeader';
import { CandidateApplicationForm } from '../components/CandidateApplicationForm';
import { CandidateStats } from '../components/CandidateStats';
import { CandidateTable } from '../components/CandidateTable';
import { useCandidates } from '../hooks/useCandidates';

export const CandidatesPage = () => {
  const [activeTab, setActiveTab] = useState('management');
  const { data: candidates = [], isLoading } = useCandidates();

  return (
    <div>
      <PageHeader
        title="Candidates Management"
        breadcrumbs={[{ label: 'Dashboard', path: '/' }, { label: 'Candidates' }]}
      />

      <Space direction="vertical" size="large" style={{ width: '100%', padding: '24px' }}>
        <CandidateStats />

        <Card>
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={[
              {
                key: 'management',
                label: (
                  <span>
                    <TeamOutlined />
                    จัดการผู้สมัคร
                  </span>
                ),
                children: <CandidateTable candidates={candidates} loading={isLoading} />,
              },
              {
                key: 'application',
                label: (
                  <span>
                    <FormOutlined />
                    ฟอร์มสมัครงาน
                  </span>
                ),
                children: <CandidateApplicationForm />,
              },
            ]}
          />
        </Card>
      </Space>
    </div>
  );
};
