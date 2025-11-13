import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '@/shared/lib/firebase';
import type { CreateGeofenceInput, UpdateGeofenceInput } from '../schemas/geofenceSchema';
import type { GeofenceConfig, GeofenceValidation } from '../types/geofence';

const GEOFENCE_COLLECTION = 'geofence_configs';

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param lat1 Latitude of point 1
 * @param lon1 Longitude of point 1
 * @param lat2 Latitude of point 2
 * @param lon2 Longitude of point 2
 * @returns Distance in meters
 */
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
};

export const geofenceService = {
  /**
   * Get all geofence configurations
   */
  async getAll(filters?: { isActive?: boolean }): Promise<GeofenceConfig[]> {
    try {
      let q = query(collection(db, GEOFENCE_COLLECTION));

      if (filters?.isActive !== undefined) {
        q = query(q, where('isActive', '==', filters.isActive));
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as GeofenceConfig[];
    } catch (error) {
      console.error('Failed to fetch geofence configs', error);
      throw new Error('ไม่สามารถดึงข้อมูลการตั้งค่าพื้นที่ได้');
    }
  },

  /**
   * Get geofence config by ID
   */
  async getById(id: string): Promise<GeofenceConfig | null> {
    try {
      const docSnap = await getDoc(doc(db, GEOFENCE_COLLECTION, id));
      if (!docSnap.exists()) {
        return null;
      }

      return {
        id: docSnap.id,
        ...docSnap.data(),
      } as GeofenceConfig;
    } catch (error) {
      console.error('Failed to fetch geofence config', error);
      throw new Error('ไม่สามารถดึงข้อมูลการตั้งค่าพื้นที่ได้');
    }
  },

  /**
   * Create new geofence config
   */
  async create(input: CreateGeofenceInput, userId: string): Promise<GeofenceConfig> {
    try {
      const now = Timestamp.now();
      const newConfig = {
        ...input,
        createdBy: userId,
        createdAt: now,
      };

      const docRef = await addDoc(collection(db, GEOFENCE_COLLECTION), newConfig);

      return {
        id: docRef.id,
        ...newConfig,
      } as GeofenceConfig;
    } catch (error) {
      console.error('Failed to create geofence config', error);
      throw new Error('ไม่สามารถสร้างการตั้งค่าพื้นที่ได้');
    }
  },

  /**
   * Update geofence config
   */
  async update(id: string, input: UpdateGeofenceInput, userId: string): Promise<void> {
    try {
      const docRef = doc(db, GEOFENCE_COLLECTION, id);
      await updateDoc(docRef, {
        ...input,
        updatedBy: userId,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Failed to update geofence config', error);
      throw new Error('ไม่สามารถอัปเดตการตั้งค่าพื้นที่ได้');
    }
  },

  /**
   * Delete geofence config
   */
  async delete(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, GEOFENCE_COLLECTION, id));
    } catch (error) {
      console.error('Failed to delete geofence config', error);
      throw new Error('ไม่สามารถลบการตั้งค่าพื้นที่ได้');
    }
  },

  /**
   * Validate location against geofences
   */
  async validateLocation(
    latitude: number,
    longitude: number,
    employeeData?: {
      departmentId?: string;
      employmentType?: string;
    }
  ): Promise<GeofenceValidation> {
    try {
      const geofences = await this.getAll({ isActive: true });

      if (geofences.length === 0) {
        return {
          isWithinGeofence: true,
          distanceMeters: 0,
          geofenceId: '',
          geofenceName: 'No geofence configured',
          message: 'ไม่มีการตั้งค่าพื้นที่ตรวจสอบ',
        };
      }

      // Filter geofences based on employee data
      const applicableGeofences = geofences.filter((gf) => {
        // Check department restriction
        if (gf.allowedDepartments && gf.allowedDepartments.length > 0) {
          if (
            !employeeData?.departmentId ||
            !gf.allowedDepartments.includes(employeeData.departmentId)
          ) {
            return false;
          }
        }

        // Check employment type restriction
        if (gf.allowedEmploymentTypes && gf.allowedEmploymentTypes.length > 0) {
          if (
            !employeeData?.employmentType ||
            !gf.allowedEmploymentTypes.includes(employeeData.employmentType)
          ) {
            return false;
          }
        }

        return true;
      });

      // Find nearest geofence
      let nearestGeofence: GeofenceConfig | null = null;
      let minDistance = Number.POSITIVE_INFINITY;

      for (const gf of applicableGeofences) {
        const distance = calculateDistance(latitude, longitude, gf.latitude, gf.longitude);
        if (distance < minDistance) {
          minDistance = distance;
          nearestGeofence = gf;
        }
      }

      if (!nearestGeofence) {
        return {
          isWithinGeofence: false,
          distanceMeters: 0,
          geofenceId: '',
          geofenceName: 'No applicable geofence',
          message: 'ไม่พบพื้นที่ตรวจสอบที่เหมาะสม',
        };
      }

      const isWithin = minDistance <= nearestGeofence.radiusMeters;

      return {
        isWithinGeofence: isWithin,
        distanceMeters: Math.round(minDistance),
        geofenceId: nearestGeofence.id,
        geofenceName: nearestGeofence.name,
        message: isWithin
          ? `อยู่ในพื้นที่ ${nearestGeofence.name} (${Math.round(minDistance)} เมตร)`
          : `อยู่นอกพื้นที่ ${nearestGeofence.name} (${Math.round(minDistance)} เมตร, จำเป็น ${nearestGeofence.radiusMeters} เมตร)`,
      };
    } catch (error) {
      console.error('Failed to validate location', error);
      throw new Error('ไม่สามารถตรวจสอบตำแหน่งได้');
    }
  },

  /**
   * Validate clock-in location
   */
  async validateClockInLocation(
    latitude: number,
    longitude: number,
    employeeData?: {
      departmentId?: string;
      employmentType?: string;
    }
  ): Promise<GeofenceValidation> {
    const validation = await this.validateLocation(latitude, longitude, employeeData);

    // Get geofence to check if enforcement is enabled
    if (validation.geofenceId) {
      const geofence = await this.getById(validation.geofenceId);
      if (geofence && !geofence.enforceForClockIn) {
        // If enforcement is disabled, always allow
        return {
          ...validation,
          isWithinGeofence: true,
          message: `${validation.message} (ไม่บังคับตรวจสอบ)`,
        };
      }
    }

    return validation;
  },

  /**
   * Validate clock-out location
   */
  async validateClockOutLocation(
    latitude: number,
    longitude: number,
    employeeData?: {
      departmentId?: string;
      employmentType?: string;
    }
  ): Promise<GeofenceValidation> {
    const validation = await this.validateLocation(latitude, longitude, employeeData);

    // Get geofence to check if enforcement is enabled
    if (validation.geofenceId) {
      const geofence = await this.getById(validation.geofenceId);
      if (geofence && !geofence.enforceForClockOut) {
        // If enforcement is disabled, always allow
        return {
          ...validation,
          isWithinGeofence: true,
          message: `${validation.message} (ไม่บังคับตรวจสอบ)`,
        };
      }
    }

    return validation;
  },
};
