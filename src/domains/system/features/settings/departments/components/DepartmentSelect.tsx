import { Select } from 'antd';
import type { FC } from 'react';
import { useDepartments } from '../hooks/useDepartments';

const TENANT_ID = 'default';

interface DepartmentSelectProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

/**
 * Reusable Department Selector Component
 * Use this in forms that need department selection
 */
export const DepartmentSelect: FC<DepartmentSelectProps> = ({
  value,
  onChange,
  placeholder = 'เลือกแผนก',
  disabled = false,
}) => {
  const { data: departments, isLoading } = useDepartments(TENANT_ID, { isActive: true });

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
      options={departments?.map((dept) => ({
        label: `${dept.code} - ${dept.name}`,
        value: dept.id,
      }))}
      style={{ width: '100%' }}
    />
  );
};
