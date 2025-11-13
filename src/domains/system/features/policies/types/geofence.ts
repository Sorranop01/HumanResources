import type { Timestamp } from 'firebase/firestore';

/**
 * Geofence configuration for office locations
 */
export interface GeofenceConfig {
  id: string;
  name: string;
  description?: string;

  // Location
  latitude: number;
  longitude: number;
  radiusMeters: number;

  // Address
  address?: string;

  // Validation settings
  isActive: boolean;
  enforceForClockIn: boolean;
  enforceForClockOut: boolean;
  allowedDepartments?: string[]; // Optional: restrict to specific departments
  allowedEmploymentTypes?: string[]; // Optional: restrict to employment types

  // Metadata
  createdBy: string;
  createdAt: Timestamp;
  updatedBy?: string;
  updatedAt?: Timestamp;
}

/**
 * Geofence validation result
 */
export interface GeofenceValidation {
  isWithinGeofence: boolean;
  distanceMeters: number;
  geofenceId: string;
  geofenceName: string;
  message: string;
}
