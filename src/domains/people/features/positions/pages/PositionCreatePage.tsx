import { ArrowLeftOutlined } from '@ant-design/icons';
import { Button, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { PositionForm } from '@/domains/people/features/positions/components/PositionForm';
import { useCreatePosition } from '@/domains/people/features/positions/hooks/useCreatePosition';
import type { PositionFormInput } from '@/domains/people/features/positions/schemas';

const { Title } = Typography;

export const PositionCreatePage = () => {
  const navigate = useNavigate();
  const { mutateAsync: createPosition, isPending } = useCreatePosition();

  const handleSubmit = async (data: PositionFormInput) => {
    try {
      await createPosition(data);
      navigate('/positions');
    } catch (error) {
      console.error('Failed to create position:', error);
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: 24 }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/positions')}
          style={{ marginBottom: 16 }}
        >
          กลับ
        </Button>
        <Title level={2} style={{ margin: 0 }}>
          เพิ่มตำแหน่งใหม่
        </Title>
      </div>

      <PositionForm onSubmit={handleSubmit} loading={isPending} submitText="สร้างตำแหน่ง" />
    </div>
  );
};
