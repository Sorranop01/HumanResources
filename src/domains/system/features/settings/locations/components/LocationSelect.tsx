import { Select } from 'antd';
import type { FC } from 'react';
import { useLocations } from '../hooks/useLocations';

const TENANT_ID = 'default';

interface LocationSelectProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

/**
 * Reusable Location Selector Component
 * Use this in forms that need location/branch selection
 */
export const LocationSelect: FC<LocationSelectProps> = ({
  value,
  onChange,
  placeholder = 'เลือกสาขา/สถานที่',
  disabled = false,
}) => {
  const { data: locations, isLoading } = useLocations(TENANT_ID, { isActive: true });

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
      options={locations?.map((loc) => ({
        label: `${loc.code} - ${loc.name}`,
        value: loc.id,
      }))}
      style={{ width: '100%' }}
    />
  );
};
