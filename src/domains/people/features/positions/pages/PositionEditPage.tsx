import { ArrowLeftOutlined } from '@ant-design/icons';
import { Button, Spin, Typography } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { PositionForm } from '@/domains/people/features/positions/components/PositionForm';
import { usePosition } from '@/domains/people/features/positions/hooks/usePosition';
import { useUpdatePosition } from '@/domains/people/features/positions/hooks/useUpdatePosition';
import type { PositionFormInput } from '@/domains/people/features/positions/schemas';

const { Title } = Typography;

export const PositionEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: position, isLoading } = usePosition(id);
  const { mutateAsync: updatePosition, isPending } = useUpdatePosition();

  const handleSubmit = async (data: PositionFormInput) => {
    if (!id) return;

    try {
      await updatePosition({ id, data });
      navigate(`/positions/${id}`);
    } catch (error) {
      console.error('Failed to update position:', error);
    }
  };

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
      <div style={{ marginBottom: 24 }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(`/positions/${id}`)}
          style={{ marginBottom: 16 }}
        >
          กลับ
        </Button>
        <Title level={2} style={{ margin: 0 }}>
          แก้ไขตำแหน่ง: {position.nameTH}
        </Title>
      </div>

      <PositionForm
        initialData={position}
        onSubmit={handleSubmit}
        loading={isPending}
        submitText="บันทึกการแก้ไข"
      />
    </div>
  );
};
