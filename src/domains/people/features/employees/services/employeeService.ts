import {
  addDoc,
  collection,
  type DocumentData,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  type QueryConstraint,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '@/shared/lib/firebase';
import type { Employee } from '@/shared/types';

const COLLECTION = 'employees';
const employeesCol = collection(db, COLLECTION);

export const employeeService = {
  /**
   * Get all employees
   */
  async getAll(filters?: { status?: string; department?: string }): Promise<Employee[]> {
    const constraints: QueryConstraint[] = [];

    if (filters?.status) {
      constraints.push(where('status', '==', filters.status));
    }

    if (filters?.department) {
      constraints.push(where('department', '==', filters.department));
    }

    constraints.push(orderBy('createdAt', 'desc'));

    const q = query(employeesCol, ...constraints);
    const snapshot = await getDocs(q);

    return snapshot.docs.map(
      (d) =>
        ({
          id: d.id,
          ...(d.data() as DocumentData),
        }) as Employee
    );
  },

  /**
   * Get employee by ID
   */
  async getById(id: string): Promise<Employee | null> {
    const docRef = doc(db, COLLECTION, id);
    const snapshot = await getDoc(docRef);

    if (!snapshot.exists()) {
      return null;
    }

    return {
      id: snapshot.id,
      ...(snapshot.data() as DocumentData),
    } as Employee;
  },

  /**
   * Create new employee
   */
  async create(data: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const now = new Date();

    const docRef = await addDoc(employeesCol, {
      ...data,
      createdAt: now,
      updatedAt: now,
    });

    return docRef.id;
  },

  /**
   * Update employee
   */
  async update(id: string, data: Partial<Employee>): Promise<void> {
    const docRef = doc(db, COLLECTION, id);

    await updateDoc(docRef, {
      ...data,
      updatedAt: new Date(),
    });
  },

  /**
   * Delete employee
   */
  async delete(id: string): Promise<void> {
    const docRef = doc(db, COLLECTION, id);
    await deleteDoc(docRef);
  },
};
