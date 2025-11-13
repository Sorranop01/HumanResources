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
  CreatePositionInput,
  Position,
  PositionDocument,
  PositionFilters,
  UpdatePositionInput,
} from '../types/positionTypes';

const COLLECTION = 'positions';

const mapDocToPosition = (id: string, data: PositionDocument): Position => ({
  id,
  ...data,
});

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

    return snapshot.docs.map((doc) => mapDocToPosition(doc.id, doc.data() as PositionDocument));
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

    return mapDocToPosition(snapshot.id, snapshot.data() as PositionDocument);
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

    const doc = snapshot.docs[0];
    if (!doc) {
      return null;
    }
    return mapDocToPosition(doc.id, doc.data() as PositionDocument);
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

    const data: PositionDocument = {
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
