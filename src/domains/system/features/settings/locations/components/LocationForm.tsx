import { zodResolver } from '@hookform/resolvers/zod';
import { Form, Input, InputNumber, Modal, Select, Switch } from 'antd';
import type { FC } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  type CreateLocationInput,
  CreateLocationSchema,
  type UpdateLocationInput,
  UpdateLocationSchema,
} from '../schemas/locationSchemas';
import type { Location } from '../types/locationTypes';

const TENANT_ID = 'default';

interface LocationFormProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: CreateLocationInput | UpdateLocationInput) => void;
  initialData?: Location;
  isLoading?: boolean;
}

/**
 * Location Create/Edit Form Modal
 * Handles both creation and updating of locations
 */
export const LocationForm: FC<LocationFormProps> = ({
  visible,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
}) => {
  const isEditMode = !!initialData;

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateLocationInput | UpdateLocationInput>({
    resolver: zodResolver(isEditMode ? UpdateLocationSchema : CreateLocationSchema),
    defaultValues: initialData
      ? {
          code: initialData.code,
          name: initialData.name,
          nameEn: initialData.nameEn,
          type: initialData.type,
          address: initialData.address,
          gpsCoordinates: initialData.gpsCoordinates,
          geofenceRadius: initialData.geofenceRadius,
          capacity: initialData.capacity,
          currentOccupancy: initialData.currentOccupancy,
          supportsRemoteWork: initialData.supportsRemoteWork,
          description: initialData.description,
          isActive: initialData.isActive,
        }
      : {
          tenantId: TENANT_ID,
          code: '',
          name: '',
          type: 'branch',
          address: {
            addressLine1: '',
            district: '',
            subDistrict: '',
            province: '',
            postalCode: '',
            country: 'ประเทศไทย',
          },
          gpsCoordinates: {
            latitude: 0,
            longitude: 0,
          },
          geofenceRadius: 100,
          capacity: undefined,
          currentOccupancy: 0,
          supportsRemoteWork: false,
          isActive: true,
        },
  });

  const handleFormSubmit = (data: CreateLocationInput | UpdateLocationInput) => {
    onSubmit(data);
    reset();
  };

  const handleCancel = () => {
    reset();
    onClose();
  };

  return (
    <Modal
      title={isEditMode ? 'แก้ไขสาขา/สถานที่' : 'เพิ่มสาขา/สถานที่'}
      open={visible}
      onOk={handleSubmit(handleFormSubmit)}
      onCancel={handleCancel}
      confirmLoading={isLoading}
      width={800}
      okText={isEditMode ? 'บันทึก' : 'เพิ่ม'}
      cancelText="ยกเลิก"
    >
      <Form layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item
          label="รหัสสาขา"
          validateStatus={errors.code ? 'error' : ''}
          help={errors.code?.message}
          required
        >
          <Controller
            name="code"
            control={control}
            render={({ field }) => (
              <Input {...field} placeholder="เช่น BKK01" disabled={isEditMode} />
            )}
          />
        </Form.Item>

        <Form.Item
          label="ชื่อสาขา (ไทย)"
          validateStatus={errors.name ? 'error' : ''}
          help={errors.name?.message}
          required
        >
          <Controller
            name="name"
            control={control}
            render={({ field }) => <Input {...field} placeholder="เช่น สาขากรุงเทพ" />}
          />
        </Form.Item>

        <Form.Item
          label="ชื่อสาขา (อังกฤษ)"
          validateStatus={errors.nameEn ? 'error' : ''}
          help={errors.nameEn?.message}
        >
          <Controller
            name="nameEn"
            control={control}
            render={({ field }) => <Input {...field} placeholder="e.g. Bangkok Branch" />}
          />
        </Form.Item>

        <Form.Item
          label="ประเภทสถานที่"
          validateStatus={errors.type ? 'error' : ''}
          help={errors.type?.message}
          required
        >
          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <Select {...field} placeholder="เลือกประเภท">
                <Select.Option value="headquarters">สำนักงานใหญ่</Select.Option>
                <Select.Option value="branch">สาขา</Select.Option>
                <Select.Option value="warehouse">คลังสินค้า</Select.Option>
                <Select.Option value="remote">ทำงานระยะไกล</Select.Option>
                <Select.Option value="coworking">Co-working Space</Select.Option>
                <Select.Option value="client-site">สถานที่ลูกค้า</Select.Option>
              </Select>
            )}
          />
        </Form.Item>

        <Form.Item label="ที่อยู่">
          <Controller
            name="address.addressLine1"
            control={control}
            render={({ field }) => <Input {...field} placeholder="บ้านเลขที่ ถนน" />}
          />
        </Form.Item>

        <Form.Item label="แขวง/ตำบล">
          <Controller
            name="address.subDistrict"
            control={control}
            render={({ field }) => <Input {...field} placeholder="แขวง/ตำบล" />}
          />
        </Form.Item>

        <Form.Item label="เขต/อำเภอ">
          <Controller
            name="address.district"
            control={control}
            render={({ field }) => <Input {...field} placeholder="เขต/อำเภอ" />}
          />
        </Form.Item>

        <Form.Item label="จังหวัด" required>
          <Controller
            name="address.province"
            control={control}
            render={({ field }) => <Input {...field} placeholder="จังหวัด" />}
          />
        </Form.Item>

        <Form.Item label="รหัสไปรษณีย์" required>
          <Controller
            name="address.postalCode"
            control={control}
            render={({ field }) => <Input {...field} placeholder="10100" maxLength={5} />}
          />
        </Form.Item>

        <Form.Item label="พิกัด GPS" style={{ marginBottom: 8 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <Controller
              name="gpsCoordinates.latitude"
              control={control}
              render={({ field }) => (
                <InputNumber
                  {...field}
                  style={{ width: '100%' }}
                  placeholder="Latitude"
                  min={-90}
                  max={90}
                  step={0.000001}
                />
              )}
            />
            <Controller
              name="gpsCoordinates.longitude"
              control={control}
              render={({ field }) => (
                <InputNumber
                  {...field}
                  style={{ width: '100%' }}
                  placeholder="Longitude"
                  min={-180}
                  max={180}
                  step={0.000001}
                />
              )}
            />
          </div>
          {(errors.gpsCoordinates?.latitude || errors.gpsCoordinates?.longitude) && (
            <div style={{ color: '#ff4d4f', fontSize: 12, marginTop: 4 }}>
              {errors.gpsCoordinates?.latitude?.message ||
                errors.gpsCoordinates?.longitude?.message}
            </div>
          )}
        </Form.Item>

        <Form.Item
          label="รัศมี Geofence (เมตร)"
          validateStatus={errors.geofenceRadius ? 'error' : ''}
          help={errors.geofenceRadius?.message}
        >
          <Controller
            name="geofenceRadius"
            control={control}
            render={({ field }) => (
              <InputNumber
                {...field}
                style={{ width: '100%' }}
                placeholder="100"
                min={10}
                max={5000}
              />
            )}
          />
        </Form.Item>

        <Form.Item label="ความจุ (คน)">
          <Controller
            name="capacity"
            control={control}
            render={({ field }) => (
              <InputNumber {...field} style={{ width: '100%' }} placeholder="50" min={1} />
            )}
          />
        </Form.Item>

        <Form.Item label="จำนวนคนปัจจุบัน">
          <Controller
            name="currentOccupancy"
            control={control}
            render={({ field }) => (
              <InputNumber {...field} style={{ width: '100%' }} placeholder="0" min={0} />
            )}
          />
        </Form.Item>

        <Form.Item label="รายละเอียด">
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <Input.TextArea {...field} rows={3} placeholder="รายละเอียดเพิ่มเติม" />
            )}
          />
        </Form.Item>

        <Form.Item label="รองรับการทำงานระยะไกล">
          <Controller
            name="supportsRemoteWork"
            control={control}
            render={({ field }) => <Switch checked={field.value} onChange={field.onChange} />}
          />
        </Form.Item>

        <Form.Item label="สถานะ">
          <Controller
            name="isActive"
            control={control}
            render={({ field }) => (
              <Switch
                checked={field.value}
                onChange={field.onChange}
                checkedChildren="เปิดใช้งาน"
                unCheckedChildren="ปิดใช้งาน"
              />
            )}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};
