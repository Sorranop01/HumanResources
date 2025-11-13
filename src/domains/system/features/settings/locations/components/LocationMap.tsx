import { EnvironmentOutlined } from '@ant-design/icons';
import { Card, Empty, Spin, Tag } from 'antd';
import type { FC } from 'react';
import { useEffect, useRef, useState } from 'react';
import { useLocations } from '../hooks/useLocations';
import type { Location } from '../types/locationTypes';

const TENANT_ID = 'default';

interface LocationMapProps {
  /**
   * Optional: Show only specific locations by IDs
   */
  locationIds?: string[];
  /**
   * Height of the map container
   */
  height?: number | string;
  /**
   * Callback when a location marker is clicked
   */
  onLocationClick?: (location: Location) => void;
}

/**
 * LocationMap Component
 * Displays locations on a Google Map with markers and geofence circles
 *
 * NOTE: This component requires Google Maps API key to be configured.
 * For now, it shows a placeholder with location cards until Google Maps is integrated.
 *
 * TODO: Integrate with Google Maps API
 * - Add Google Maps script to index.html
 * - Configure API key in environment variables
 * - Replace placeholder with actual Google Maps component
 */
export const LocationMap: FC<LocationMapProps> = ({
  locationIds,
  height = 500,
  onLocationClick,
}) => {
  const { data: allLocations, isLoading } = useLocations(TENANT_ID, { isActive: true });
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  // Filter locations if specific IDs are provided
  const locations =
    locationIds && allLocations
      ? allLocations.filter((loc) => locationIds.includes(loc.id))
      : allLocations;

  useEffect(() => {
    // TODO: Initialize Google Maps here
    // This is where we would load the map and add markers
    if (mapRef.current && locations && locations.length > 0) {
      // Placeholder for Google Maps initialization
      console.log('Locations ready for map:', locations);
    }
  }, [locations]);

  const handleLocationClick = (location: Location) => {
    setSelectedLocation(location);
    if (onLocationClick) {
      onLocationClick(location);
    }
  };

  if (isLoading) {
    return (
      <Card style={{ height }}>
        <div style={{ textAlign: 'center', padding: '100px 0' }}>
          <Spin size="large" />
          <p style={{ marginTop: 16 }}>กำลังโหลดตำแหน่งที่ตั้ง...</p>
        </div>
      </Card>
    );
  }

  if (!locations || locations.length === 0) {
    return (
      <Card style={{ height }}>
        <Empty description="ไม่มีข้อมูลตำแหน่งที่ตั้ง" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      </Card>
    );
  }

  return (
    <Card
      title={
        <span>
          <EnvironmentOutlined /> แผนที่ตำแหน่งที่ตั้ง ({locations.length} สถานที่)
        </span>
      }
      style={{ height }}
    >
      {/* Map Container - Placeholder */}
      <div
        ref={mapRef}
        style={{
          width: '100%',
          height: 'calc(100% - 60px)',
          backgroundColor: '#f0f2f5',
          borderRadius: 8,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Placeholder Map Background */}
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#e6f7ff',
            backgroundImage: `
              linear-gradient(rgba(0,0,0,0.02) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,0,0,0.02) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px',
          }}
        >
          <div style={{ textAlign: 'center', maxWidth: 600 }}>
            <EnvironmentOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />
            <h3>Google Maps Integration (Coming Soon)</h3>
            <p style={{ color: '#666' }}>แผนที่และ markers จะแสดงที่นี่เมื่อเชื่อมต่อ Google Maps API</p>
            <div style={{ marginTop: 24 }}>
              <h4>Location Preview:</h4>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                  gap: 16,
                  marginTop: 16,
                }}
              >
                {locations.map((location) => (
                  <Card
                    key={location.id}
                    size="small"
                    hoverable
                    onClick={() => handleLocationClick(location)}
                    style={{
                      border:
                        selectedLocation?.id === location.id ? '2px solid #1890ff' : undefined,
                    }}
                  >
                    <div style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 8 }}>
                      {location.name}
                    </div>
                    <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>
                      {location.address.province}
                    </div>
                    {location.gpsCoordinates && (
                      <div style={{ fontSize: 12, marginBottom: 4 }}>
                        <Tag color="green" icon={<EnvironmentOutlined />}>
                          {location.gpsCoordinates.latitude.toFixed(6)},{' '}
                          {location.gpsCoordinates.longitude.toFixed(6)}
                        </Tag>
                      </div>
                    )}
                    {location.geofenceRadius && (
                      <div style={{ fontSize: 12 }}>
                        <Tag color="blue">Geofence: {location.geofenceRadius}m</Tag>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Location Info */}
      {selectedLocation && (
        <div
          style={{
            position: 'absolute',
            bottom: 16,
            left: 16,
            right: 16,
            padding: 16,
            backgroundColor: 'white',
            borderRadius: 8,
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          }}
        >
          <h4 style={{ margin: 0, marginBottom: 8 }}>{selectedLocation.name}</h4>
          <p style={{ margin: 0, fontSize: 12, color: '#666' }}>
            {selectedLocation.address.addressLine1}, {selectedLocation.address.district},{' '}
            {selectedLocation.address.province}
          </p>
          {selectedLocation.gpsCoordinates && (
            <p style={{ margin: '8px 0 0 0', fontSize: 12 }}>
              <Tag icon={<EnvironmentOutlined />}>
                {selectedLocation.gpsCoordinates.latitude},{' '}
                {selectedLocation.gpsCoordinates.longitude}
              </Tag>
              {selectedLocation.geofenceRadius && (
                <Tag color="blue">Radius: {selectedLocation.geofenceRadius}m</Tag>
              )}
            </p>
          )}
        </div>
      )}
    </Card>
  );
};
