import { LoadingOutlined } from '@ant-design/icons';
import { Spin } from 'antd';

interface LoadingSpinnerProps {
  size?: 'small' | 'default' | 'large';
  tip?: string;
  fullscreen?: boolean;
}

export function LoadingSpinner({ size = 'default', tip, fullscreen = false }: LoadingSpinnerProps) {
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
        <Spin
          indicator={<LoadingOutlined style={{ fontSize: size === 'large' ? 48 : 24 }} spin />}
          size={size}
          tip={tip}
        />
      </div>
    );
  }

  // When not fullscreen, wrap in a div to use tip properly (nested pattern)
  if (tip) {
    return (
      <Spin
        indicator={<LoadingOutlined style={{ fontSize: size === 'large' ? 48 : 24 }} spin />}
        size={size}
        tip={tip}
      >
        <div style={{ minHeight: 100 }} />
      </Spin>
    );
  }

  return (
    <Spin
      indicator={<LoadingOutlined style={{ fontSize: size === 'large' ? 48 : 24 }} spin />}
      size={size}
    />
  );
}
