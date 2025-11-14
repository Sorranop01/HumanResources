import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  Timestamp as FirestoreTimestamp,
  getDoc,
  getDocs,
  orderBy,
  type QueryConstraint,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '@/shared/lib/firebase';
import { PositionSchema } from '../schemas/positionSchemas';
import type {
  CreatePositionInput,
  Position,
  PositionDocument,
  PositionFilters,
  UpdatePositionInput,
} from '../types/positionTypes';

const COLLECTION = 'positions';

/**
 * Convert Firestore Timestamp to Date
 */
function convertTimestamps(data: unknown): unknown {
  if (data === null || data === undefined) {
    return data;
  }

  if (data instanceof FirestoreTimestamp) {
    return data.toDate();
  }

  if (Array.isArray(data)) {
    return data.map((item) => convertTimestamps(item));
  }

  if (typeof data === 'object') {
    const converted: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      converted[key] = convertTimestamps(value);
    }
    return converted;
  }

  return data;
}

/**
 * Convert Firestore document to Position with Zod validation
 * ✅ Layer 2: Service Layer Validation
 */
function docToPosition(id: string, data: any): Position | null {
  const converted = {
    id,
    ...(convertTimestamps(data) as Record<string, unknown>),
  };

  const validation = PositionSchema.safeParse(converted);

  if (!validation.success) {
    console.warn(
      `⚠️ Skipping invalid position ${id}:`,
      'Schema validation failed. Check data integrity.'
    );
    if (import.meta.env.DEV) {
      console.error('Validation errors:', validation.error.errors);
    }
    return null;
  }

  return validation.data;
}

export const getAllPositions = async (
  tenantId: string,
  filters?: PositionFilters
): Promise<Position[]> => {
  try {
    const constraints: QueryConstraint[] = [
      where('tenantId', '==', tenantId),
      orderBy('level', 'asc'),
      orderBy('code', 'asc'),
    ];

    if (filters?.isActive !== undefined) {
      constraints.push(where('isActive', '==', filters.isActive));
    }
    if (filters?.departmentId) {
      constraints.push(where('departmentId', '==', filters.departmentId));
    }
    if (filters?.level) {
      constraints.push(where('level', '==', filters.level));
    }
    if (filters?.category) {
      constraints.push(where('category', '==', filters.category));
    }
    if (filters?.isPublic !== undefined) {
      constraints.push(where('isPublic', '==', filters.isPublic));
    }

    const q = query(collection(db, COLLECTION), ...constraints);
    const snapshot = await getDocs(q);

    // ✅ Use docToPosition with validation
    const positions = snapshot.docs
      .map((docSnap) => docToPosition(docSnap.id, docSnap.data()))
      .filter((pos): pos is Position => pos !== null);

    return positions;
  } catch (error) {
    console.error('❌ Failed to get positions:', error);
    throw new Error('ไม่สามารถดึงข้อมูลตำแหน่งได้');
  }
};

export const getPositionById = async (id: string): Promise<Position | null> => {
  try {
    const docRef = doc(db, COLLECTION, id);
    const snapshot = await getDoc(docRef);

    if (!snapshot.exists()) {
      return null;
    }

    return docToPosition(snapshot.id, snapshot.data());
  } catch (error) {
    console.error('❌ Failed to get position by ID:', error);
    throw new Error('ไม่สามารถดึงข้อมูลตำแหน่งได้');
  }
};

export const getPositionByCode = async (
  tenantId: string,
  code: string
): Promise<Position | null> => {
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
    return docToPosition(docSnap.id, docSnap.data());
  } catch (error) {
    console.error('❌ Failed to get position by code:', error);
    throw new Error('ไม่สามารถดึงข้อมูลตำแหน่งได้');
  }
};

export const createPosition = async (
  input: CreatePositionInput,
  userId: string
): Promise<string> => {
  try {
    const existing = await getPositionByCode(input.tenantId, input.code);
    if (existing) {
      throw new Error(`รหัสตำแหน่ง "${input.code}" มีอยู่แล้ว`);
    }

    const data: any = {
      ...input,
      code: input.code.toUpperCase(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy: userId,
      updatedBy: userId,
    };

    const docRef = await addDoc(collection(db, COLLECTION), data);
    return docRef.id;
  } catch (error) {
    console.error('❌ Failed to create position:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('ไม่สามารถสร้างตำแหน่งได้');
  }
};

export const updatePosition = async (
  id: string,
  input: UpdatePositionInput,
  userId: string
): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION, id);

    const existing = await getDoc(docRef);
    if (!existing.exists()) {
      throw new Error('ไม่พบตำแหน่งที่ต้องการแก้ไข');
    }

    if (input.code) {
      const existingData = existing.data() as PositionDocument;
      const codeUpper = input.code.toUpperCase();

      if (codeUpper !== existingData.code) {
        const duplicate = await getPositionByCode(existingData.tenantId, codeUpper);
        if (duplicate && duplicate.id !== id) {
          throw new Error(`รหัสตำแหน่ง "${codeUpper}" มีอยู่แล้ว`);
        }
      }
    }

    const updateData = {
      ...input,
      ...(input.code && { code: input.code.toUpperCase() }),
      updatedAt: serverTimestamp(),
      updatedBy: userId,
    };

    await updateDoc(docRef, updateData);
  } catch (error) {
    console.error('❌ Failed to update position:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('ไม่สามารถอัปเดตตำแหน่งได้');
  }
};

export const deletePosition = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION, id);

    const existing = await getDoc(docRef);
    if (!existing.exists()) {
      throw new Error('ไม่พบตำแหน่งที่ต้องการลบ');
    }

    await deleteDoc(docRef);
  } catch (error) {
    console.error('❌ Failed to delete position:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('ไม่สามารถลบตำแหน่งได้');
  }
};

export const positionService = {
  getAll: getAllPositions,
  getById: getPositionById,
  getByCode: getPositionByCode,
  create: createPosition,
  update: updatePosition,
  delete: deletePosition,
};
