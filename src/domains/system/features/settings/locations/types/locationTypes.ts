import type { Timestamp } from 'firebase/firestore';

export type LocationType =
  | 'headquarters'
  | 'branch'
  | 'warehouse'
  | 'remote'
  | 'coworking'
  | 'client-site';

export type LocationAddress = {
  addressLine1: string;
  addressLine2?: string;
  subDistrict: string;
  district: string;
  province: string;
  postalCode: string;
  country: string;
};

export type LocationCoordinates = {
  latitude: number;
  longitude: number;
};

export type Location = {
  id: string;
  code: string;
  name: string;
  nameEn: string;
  type: LocationType;
  address: LocationAddress;
  coordinates?: LocationCoordinates;
  geofenceRadius?: number;
  timezone: string;
  phone?: string;
  email?: string;
  capacity?: number;
  currentEmployeeCount?: number;
  isActive: boolean;
  supportsRemoteWork: boolean;
  tenantId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
  updatedBy: string;
};

export type CreateLocationInput = Omit<
  Location,
  'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'
>;

export type UpdateLocationInput = Partial<
  Omit<Location, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>
>;

export type LocationFilters = {
  isActive?: boolean;
  type?: LocationType;
  province?: string;
  supportsRemoteWork?: boolean;
};

export type LocationDocument = Omit<Location, 'id'>;
