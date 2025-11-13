import { CheckCircleOutlined, CloseCircleOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { Alert, Button, Card, Spin, Tag } from 'antd';
import type { FC } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useLocations } from '@/domains/system/features/settings/locations/hooks/useLocations';
import type { Location } from '@/domains/system/features/settings/locations/types/locationTypes';
import type { LocationData } from '../types';
import { checkMultipleGeofences, formatDistance, getCurrentLocation } from '../utils/geofencing';

const TENANT_ID = 'default';

interface GeofenceCheckProps {
  /**
   * Callback when geofence check is complete
   */
  onCheckComplete?: (result: {
    isValid: boolean;
    location?: Location;
    userLocation: LocationData;
    distance?: number;
  }) => void;
  /**
   * Show detailed information
   */
  showDetails?: boolean;
  /**
   * Auto-check on mount
   */
  autoCheck?: boolean;
}

/**
 * GeofenceCheck Component
 * Validates if user is within allowed location geofence for attendance
 */
export const GeofenceCheck: FC<GeofenceCheckProps> = ({
  onCheckComplete,
  showDetails = true,
  autoCheck = false,
}) => {
  const [isChecking, setIsChecking] = useState(false);
  const [userLocation, setUserLocation] = useState<LocationData | null>(null);
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    nearestLocation?: Location;
    distance?: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: locations, isLoading: locationsLoading } = useLocations(TENANT_ID, {
    isActive: true,
  });

  const handleCheckLocation = useCallback(async () => {
    setIsChecking(true);
    setError(null);

    try {
      // Get user's current location
      const currentLocation = await getCurrentLocation();
      setUserLocation(currentLocation);

      // Check against all active locations
      if (!locations || locations.length === 0) {
        setError('ไม่มีสถานที่ที่ตั้งในระบบ กรุณาติดต่อผู้ดูแลระบบ');
        setIsChecking(false);
        return;
      }

      const result = checkMultipleGeofences(currentLocation, locations);
      setValidationResult(result);

      // Call callback
      if (onCheckComplete) {
        onCheckComplete({
          isValid: result.isValid,
          userLocation: currentLocation,
          ...(result.nearestLocation ? { location: result.nearestLocation } : {}),
          ...(result.distance !== undefined ? { distance: result.distance } : {}),
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการตรวจสอบตำแหน่ง';
      setError(errorMessage);
    } finally {
      setIsChecking(false);
    }
  }, [locations, onCheckComplete]);

  useEffect(() => {
    if (autoCheck && !isChecking && !userLocation) {
      handleCheckLocation();
    }
  }, [autoCheck, handleCheckLocation, isChecking, userLocation]);

  if (locationsLoading) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: 24 }}>
          <Spin />
          <p style={{ marginTop: 16 }}>กำลังโหลดข้อมูลสถานที่...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card
      title={
        <span>
          <EnvironmentOutlined /> ตรวจสอบตำแหน่งที่ตั้ง (Geofence)
        </span>
      }
    >
      {!userLocation && !validationResult && (
        <div style={{ textAlign: 'center', padding: 24 }}>
          <EnvironmentOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />
          <p style={{ marginBottom: 16 }}>กรุณาอนุญาตการเข้าถึงตำแหน่งของคุณเพื่อตรวจสอบว่าคุณอยู่ในพื้นที่ทำงาน</p>
          <Button
            type="primary"
            size="large"
            onClick={handleCheckLocation}
            loading={isChecking}
            icon={<EnvironmentOutlined />}
          >
            ตรวจสอบตำแหน่ง
          </Button>
        </div>
      )}

      {error && (
        <Alert
          type="error"
          message="ไม่สามารถตรวจสอบตำแหน่งได้"
          description={error}
          showIcon
          style={{ marginBottom: 16 }}
          action={
            <Button size="small" onClick={handleCheckLocation} loading={isChecking}>
              ลองอีกครั้ง
            </Button>
          }
        />
      )}

      {validationResult && (
        <div>
          {validationResult.isValid ? (
            <Alert
              type="success"
              message="อยู่ในพื้นที่ทำงาน"
              description={
                <div>
                  <p>
                    <CheckCircleOutlined /> คุณอยู่ในพื้นที่:{' '}
                    <strong>{validationResult.nearestLocation?.name}</strong>
                  </p>
                  {showDetails && validationResult.distance !== undefined && (
                    <p style={{ marginTop: 8, fontSize: 12 }}>
                      ระยะห่าง: <Tag color="green">{formatDistance(validationResult.distance)}</Tag>
                    </p>
                  )}
                </div>
              }
              showIcon
              style={{ marginBottom: 16 }}
            />
          ) : (
            <Alert
              type="warning"
              message="นอกพื้นที่ทำงาน"
              description={
                <div>
                  <p>
                    <CloseCircleOutlined /> คุณอยู่นอกพื้นที่ทำงานที่กำหนด
                  </p>
                  {validationResult.nearestLocation && showDetails && (
                    <div style={{ marginTop: 8 }}>
                      <p style={{ fontSize: 12 }}>
                        สถานที่ใกล้ที่สุด: <strong>{validationResult.nearestLocation.name}</strong>
                      </p>
                      {validationResult.distance !== undefined && (
                        <p style={{ fontSize: 12 }}>
                          ระยะห่าง:{' '}
                          <Tag color="orange">{formatDistance(validationResult.distance)}</Tag>
                          <span style={{ marginLeft: 8, color: '#666' }}>
                            (ต้องอยู่ภายใน {validationResult.nearestLocation.geofenceRadius}m)
                          </span>
                        </p>
                      )}
                    </div>
                  )}
                  <p style={{ marginTop: 12, fontSize: 12, color: '#666' }}>
                    หากคุณทำงานระยะไกล กรุณาติ๊กเครื่องหมาย "ทำงานระยะไกล" ก่อนลงเวลา
                  </p>
                </div>
              }
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}

          {showDetails && userLocation && (
            <div style={{ fontSize: 12, color: '#666', marginTop: 16 }}>
              <p>
                <strong>ตำแหน่งของคุณ:</strong>
              </p>
              <p>
                Latitude: {userLocation.latitude.toFixed(6)}, Longitude:{' '}
                {userLocation.longitude.toFixed(6)}
              </p>
              {userLocation.accuracy && <p>ความแม่นยำ: ±{Math.round(userLocation.accuracy)}m</p>}
            </div>
          )}

          <div style={{ marginTop: 16 }}>
            <Button onClick={handleCheckLocation} loading={isChecking}>
              ตรวจสอบอีกครั้ง
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};
