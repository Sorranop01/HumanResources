import { Select } from 'antd';
import type { FC } from 'react';
import { usePositions } from '../hooks/usePositions';

const TENANT_ID = 'default';

interface PositionSelectProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  departmentId?: string; // Optional: filter by department
}

/**
 * Reusable Position Selector Component
 * Use this in forms that need position selection
 */
export const PositionSelect: FC<PositionSelectProps> = ({
  value,
  onChange,
  placeholder = 'เลือกตำแหน่ง',
  disabled = false,
  departmentId,
}) => {
  const { data: positions, isLoading } = usePositions(TENANT_ID, {
    isActive: true,
    ...(departmentId && { departmentId }),
  });

  return (
    <Select
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      loading={isLoading}
      showSearch
      filterOption={(input, option) =>
        (option?.label?.toString() ?? '').toLowerCase().includes(input.toLowerCase())
      }
      options={positions?.map((pos) => ({
        label: `${pos.code} - ${pos.title} (${pos.level})`,
        value: pos.id,
      }))}
      style={{ width: '100%' }}
    />
  );
};
