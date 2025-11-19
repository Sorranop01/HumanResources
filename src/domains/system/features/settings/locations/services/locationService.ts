import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  type QueryConstraint,
  query,
  serverTimestamp,
  type Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '@/shared/lib/firebase';
import type {
  CreateLocationInput,
  Location,
  LocationDocument,
  LocationFilters,
  UpdateLocationInput,
} from '../types/locationTypes';

const COLLECTION = 'locations';

const mapDocToLocation = (id: string, data: LocationDocument): Location => ({
  id,
  ...data,
});

export const getAllLocations = async (
  tenantId: string,
  filters?: LocationFilters
): Promise<Location[]> => {
  try {
    const constraints: QueryConstraint[] = [
      where('tenantId', '==', tenantId),
      orderBy('type', 'asc'),
      orderBy('code', 'asc'),
    ];

    if (filters?.isActive !== undefined) {
      constraints.push(where('isActive', '==', filters.isActive));
    }
    if (filters?.type) {
      constraints.push(where('type', '==', filters.type));
    }
    if (filters?.province) {
      constraints.push(where('address.province', '==', filters.province));
    }
    if (filters?.supportsRemoteWork !== undefined) {
      constraints.push(where('supportsRemoteWork', '==', filters.supportsRemoteWork));
    }

    const q = query(collection(db, COLLECTION), ...constraints);
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => mapDocToLocation(doc.id, doc.data() as LocationDocument));
  } catch (error) {
    console.error('❌ Failed to get locations:', error);
    throw new Error('ไม่สามารถดึงข้อมูลสถานที่ได้');
  }
};

export const getLocationById = async (id: string): Promise<Location | null> => {
  try {
    const docRef = doc(db, COLLECTION, id);
    const snapshot = await getDoc(docRef);

    if (!snapshot.exists()) {
      return null;
    }

    return mapDocToLocation(snapshot.id, snapshot.data() as LocationDocument);
  } catch (error) {
    console.error('❌ Failed to get location by ID:', error);
    throw new Error('ไม่สามารถดึงข้อมูลสถานที่ได้');
  }
};

export const getLocationByCode = async (
  tenantId: string,
  code: string
): Promise<Location | null> => {
  try {
    const q = query(
      collection(db, COLLECTION),
      where('tenantId', '==', tenantId),
      where('code', '==', code.toUpperCase())
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return null;
    }

    const docSnap = snapshot.docs[0];
    if (!docSnap) {
      return null;
    }
    return mapDocToLocation(docSnap.id, docSnap.data() as LocationDocument);
  } catch (error) {
    console.error('❌ Failed to get location by code:', error);
    throw new Error('ไม่สามารถดึงข้อมูลสถานที่ได้');
  }
};

export const createLocation = async (
  input: CreateLocationInput,
  userId: string
): Promise<string> => {
  try {
    const existing = await getLocationByCode(input.tenantId, input.code);
    if (existing) {
      throw new Error(`รหัสสถานที่ "${input.code}" มีอยู่แล้ว`);
    }

    const data: LocationDocument = {
      ...input,
      code: input.code.toUpperCase(),
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp,
      createdBy: userId,
      updatedBy: userId,
    };

    const docRef = await addDoc(collection(db, COLLECTION), data);
    return docRef.id;
  } catch (error) {
    console.error('❌ Failed to create location:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('ไม่สามารถสร้างสถานที่ได้');
  }
};

export const updateLocation = async (
  id: string,
  input: UpdateLocationInput,
  userId: string
): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION, id);
    const existing = await getDoc(docRef);

    if (!existing.exists()) {
      throw new Error('ไม่พบสถานที่ที่ต้องการแก้ไข');
    }

    const updateData = {
      ...input,
      ...(input.code && { code: input.code.toUpperCase() }),
      updatedAt: serverTimestamp(),
      updatedBy: userId,
    };

    await updateDoc(docRef, updateData);
  } catch (error) {
    console.error('❌ Failed to update location:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('ไม่สามารถอัปเดตสถานที่ได้');
  }
};

export const deleteLocation = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION, id);
    const existing = await getDoc(docRef);

    if (!existing.exists()) {
      throw new Error('ไม่พบสถานที่ที่ต้องการลบ');
    }

    await deleteDoc(docRef);
  } catch (error) {
    console.error('❌ Failed to delete location:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('ไม่สามารถลบสถานที่ได้');
  }
};

export const locationService = {
  getAll: getAllLocations,
  getById: getLocationById,
  getByCode: getLocationByCode,
  create: createLocation,
  update: updateLocation,
  delete: deleteLocation,
};
