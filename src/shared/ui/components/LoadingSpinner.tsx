import { LoadingOutlined } from '@ant-design/icons';
import { Spin } from 'antd';

interface LoadingSpinnerProps {
  size?: 'small' | 'default' | 'large';
  tip?: string;
  fullscreen?: boolean;
}

export function LoadingSpinner({ size = 'default', tip, fullscreen = false }: LoadingSpinnerProps) {
  const spinner = (
    <Spin
      indicator={<LoadingOutlined style={{ fontSize: size === 'large' ? 48 : 24 }} spin />}
      size={size}
      tip={tip}
    />
  );

  if (fullscreen) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          width: '100vw',
        }}
      >
        {spinner}
      </div>
    );
  }

  return spinner;
}
