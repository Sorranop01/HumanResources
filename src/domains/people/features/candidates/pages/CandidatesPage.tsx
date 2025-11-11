import { Result } from 'antd';
import { PageHeader } from '@/shared/ui/components/PageHeader';

export const CandidatesPage = () => {
  return (
    <div>
      <PageHeader
        title="Candidates Management"
        breadcrumbs={[{ label: 'Dashboard', path: '/' }, { label: 'Candidates' }]}
      />
      <Result
        status="info"
        title="Feature In Development"
        subTitle="The candidates management page is currently under construction."
      />
    </div>
  );
};
