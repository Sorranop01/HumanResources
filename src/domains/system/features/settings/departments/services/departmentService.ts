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
import { DepartmentSchema } from '../schemas/departmentSchemas';
import type {
  CreateDepartmentInput,
  Department,
  DepartmentDocument,
  DepartmentFilters,
  DepartmentTree,
  UpdateDepartmentInput,
} from '../types/departmentTypes';

const COLLECTION = 'departments';

/**
 * Convert Firestore Timestamp to Date (recursively handles nested objects)
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
 * Convert Firestore document to Department with Zod validation
 * ✅ Layer 2: Service Layer Validation
 */
function docToDepartment(id: string, data: any): Department | null {
  const converted = {
    id,
    ...(convertTimestamps(data) as Record<string, unknown>),
  };

  const validation = DepartmentSchema.safeParse(converted);

  if (!validation.success) {
    console.warn(
      `⚠️ Skipping invalid department ${id}:`,
      'Schema validation failed. Check data integrity.'
    );
    if (import.meta.env.DEV) {
      console.error('Validation errors:', validation.error.errors);
    }
    return null;
  }

  return validation.data;
}

/**
 * Get all departments with optional filters
 */
export const getAllDepartments = async (
  tenantId: string,
  filters?: DepartmentFilters
): Promise<Department[]> => {
  try {
    const constraints: QueryConstraint[] = [
      where('tenantId', '==', tenantId),
      orderBy('level', 'asc'),
      orderBy('code', 'asc'),
    ];

    if (filters?.isActive !== undefined) {
      constraints.push(where('isActive', '==', filters.isActive));
    }

    if (filters?.parentDepartmentId !== undefined) {
      constraints.push(where('parentDepartmentId', '==', filters.parentDepartmentId));
    }

    if (filters?.level !== undefined) {
      constraints.push(where('level', '==', filters.level));
    }

    if (filters?.managerId !== undefined) {
      constraints.push(where('managerId', '==', filters.managerId));
    }

    const q = query(collection(db, COLLECTION), ...constraints);
    const snapshot = await getDocs(q);

    // ✅ Use docToDepartment with validation
    const departments = snapshot.docs
      .map((docSnap) => docToDepartment(docSnap.id, docSnap.data()))
      .filter((dept): dept is Department => dept !== null);

    return departments;
  } catch (error) {
    console.error('❌ Failed to get departments:', error);
    throw new Error('ไม่สามารถดึงข้อมูลแผนกได้');
  }
};

/**
 * Get department by ID
 */
export const getDepartmentById = async (id: string): Promise<Department | null> => {
  try {
    const docRef = doc(db, COLLECTION, id);
    const snapshot = await getDoc(docRef);

    if (!snapshot.exists()) {
      return null;
    }

    return docToDepartment(snapshot.id, snapshot.data());
  } catch (error) {
    console.error('❌ Failed to get department by ID:', error);
    throw new Error('ไม่สามารถดึงข้อมูลแผนกได้');
  }
};

/**
 * Get department by code
 */
export const getDepartmentByCode = async (
  tenantId: string,
  code: string
): Promise<Department | null> => {
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
    return docToDepartment(docSnap.id, docSnap.data());
  } catch (error) {
    console.error('❌ Failed to get department by code:', error);
    throw new Error('ไม่สามารถดึงข้อมูลแผนกได้');
  }
};

/**
 * Create a new department
 */
export const createDepartment = async (
  input: CreateDepartmentInput,
  userId: string
): Promise<string> => {
  try {
    // Check if code already exists
    const existing = await getDepartmentByCode(input.tenantId, input.code);
    if (existing) {
      throw new Error(`รหัสแผนก "${input.code}" มีอยู่แล้ว`);
    }

    // Validate parent-child relationship
    if (input.parentDepartmentId) {
      const parent = await getDepartmentById(input.parentDepartmentId);
      if (!parent) {
        throw new Error('ไม่พบแผนกหลักที่ระบุ');
      }
      if (parent.tenantId !== input.tenantId) {
        throw new Error('แผนกหลักต้องอยู่ใน Tenant เดียวกัน');
      }
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
    console.error('❌ Failed to create department:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('ไม่สามารถสร้างแผนกได้');
  }
};

/**
 * Update department
 */
export const updateDepartment = async (
  id: string,
  input: UpdateDepartmentInput,
  userId: string
): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION, id);

    // Check if exists
    const existing = await getDoc(docRef);
    if (!existing.exists()) {
      throw new Error('ไม่พบแผนกที่ต้องการแก้ไข');
    }

    // Prevent self-referencing parent
    if (input.parentDepartmentId === id) {
      throw new Error('แผนกไม่สามารถเป็นแผนกหลักของตัวเองได้');
    }

    // Validate code uniqueness if changed
    if (input.code) {
      const existingData = existing.data() as DepartmentDocument;
      const codeUpper = input.code.toUpperCase();

      if (codeUpper !== existingData.code) {
        const duplicate = await getDepartmentByCode(existingData.tenantId, codeUpper);
        if (duplicate && duplicate.id !== id) {
          throw new Error(`รหัสแผนก "${codeUpper}" มีอยู่แล้ว`);
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
    console.error('❌ Failed to update department:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('ไม่สามารถอัปเดตแผนกได้');
  }
};

/**
 * Delete department
 */
export const deleteDepartment = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION, id);

    // Check if exists
    const existing = await getDoc(docRef);
    if (!existing.exists()) {
      throw new Error('ไม่พบแผนกที่ต้องการลบ');
    }

    // Check if has children
    const existingData = existing.data() as DepartmentDocument;
    const children = await getAllDepartments(existingData.tenantId, {
      parentDepartmentId: id,
    });

    if (children.length > 0) {
      throw new Error('ไม่สามารถลบแผนกที่มีแผนกย่อยได้');
    }

    await deleteDoc(docRef);
  } catch (error) {
    console.error('❌ Failed to delete department:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('ไม่สามารถลบแผนกได้');
  }
};

/**
 * Build department tree (hierarchical structure)
 */
export const buildDepartmentTree = (departments: Department[]): DepartmentTree[] => {
  const departmentMap = new Map<string, DepartmentTree>();
  const rootDepartments: DepartmentTree[] = [];

  // Create map of all departments
  for (const dept of departments) {
    departmentMap.set(dept.id, { ...dept, children: [] });
  }

  // Build tree structure
  for (const dept of departmentMap.values()) {
    if (dept.parentDepartmentId) {
      const parent = departmentMap.get(dept.parentDepartmentId);
      if (parent) {
        parent.children = parent.children || [];
        parent.children.push(dept);
      }
    } else {
      rootDepartments.push(dept);
    }
  }

  return rootDepartments;
};

export const departmentService = {
  getAll: getAllDepartments,
  getById: getDepartmentById,
  getByCode: getDepartmentByCode,
  create: createDepartment,
  update: updateDepartment,
  delete: deleteDepartment,
  buildTree: buildDepartmentTree,
};
