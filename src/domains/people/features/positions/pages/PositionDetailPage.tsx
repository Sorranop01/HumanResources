import { ArrowLeftOutlined, BankOutlined, EditOutlined } from '@ant-design/icons';
import { Button, Row, Space, Spin, Typography } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { PositionCard } from '@/domains/people/features/positions/components/PositionCard';
import { usePosition } from '@/domains/people/features/positions/hooks/usePosition';

const { Title } = Typography;

export const PositionDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: position, isLoading } = usePosition(id);

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px',
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (!position) {
    return (
      <div style={{ padding: '24px' }}>
        <Title level={3}>ไม่พบข้อมูลตำแหน่ง</Title>
        <Button onClick={() => navigate('/positions')}>กลับไปหน้ารายการ</Button>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>
          รายละเอียดตำแหน่ง: {position.nameTH}
        </Title>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/positions')}>
            กลับ
          </Button>
          <Button
            type="default"
            icon={<BankOutlined />}
            onClick={() => navigate('/positions/org-chart')}
          >
            ดูแผนผังองค์กร
          </Button>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => navigate(`/positions/${id}/edit`)}
          >
            แก้ไข
          </Button>
        </Space>
      </Row>

      <PositionCard position={position} />
    </div>
  );
};
