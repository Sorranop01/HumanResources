import { ArrowLeftOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { OrgChart } from '@/domains/people/features/positions/components/OrgChart';

const { Title } = Typography;

export const OrgChartPage = () => {
  const navigate = useNavigate();

  const handleSelectPosition = (positionId: string) => {
    navigate(`/positions/${positionId}`);
  };

  return (
    <div style={{ padding: '24px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
        }}
      >
        <div>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/positions')}
            style={{ marginBottom: 16 }}
          >
            กลับไปรายการตำแหน่ง
          </Button>
          <Title level={2} style={{ margin: 0 }}>
            แผนผังโครงสร้างองค์กร
          </Title>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate('/positions/create')}
        >
          เพิ่มตำแหน่ง
        </Button>
      </div>

      <OrgChart onSelectPosition={handleSelectPosition} />
    </div>
  );
};
