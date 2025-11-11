import type { QueryConstraint } from 'firebase/firestore';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import {
  type EmployeeFilters,
  type EmployeeFormInput,
  EmployeeSchema,
} from '@/domains/people/features/employees/schemas';
import type { Employee } from '@/domains/people/features/employees/types';
import { db } from '@/shared/lib/firebase';

const COLLECTION = 'employees';

/**
 * Query Keys Factory (TanStack Query)
 * Centralized management of query keys for cache invalidation
 */
export const employeeKeys = {
  all: ['employees'] as const,
  lists: () => [...employeeKeys.all, 'list'] as const,
  list: (filters?: EmployeeFilters) => [...employeeKeys.lists(), filters ?? {}] as const,
  details: () => [...employeeKeys.all, 'detail'] as const,
  detail: (id: string) => [...employeeKeys.details(), id] as const,
};

/**
 * Convert Firestore Timestamp to Date (recursively handles nested objects and arrays)
 */
function convertTimestamps(data: unknown): unknown {
  // Handle null or undefined
  if (data === null || data === undefined) {
    return data;
  }

  // Convert Timestamp to Date
  if (data instanceof Timestamp) {
    return data.toDate();
  }

  // Handle arrays - recursively convert each element
  if (Array.isArray(data)) {
    return data.map((item) => convertTimestamps(item));
  }

  // Handle objects - recursively convert each property
  if (typeof data === 'object') {
    const converted: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(data)) {
      converted[key] = convertTimestamps(value);
    }

    return converted;
  }

  // Return primitive values as-is
  return data;
}

/**
 * Employee Service
 */
export const employeeService = {
  /**
   * Get all employees with optional filters
   */
  async getAll(filters?: EmployeeFilters): Promise<Employee[]> {
    try {
      const constraints: QueryConstraint[] = [];

      // Apply filters
      if (filters?.status) {
        constraints.push(where('status', '==', filters.status));
      }

      if (filters?.department) {
        constraints.push(where('department', '==', filters.department));
      }

      if (filters?.position) {
        constraints.push(where('position', '==', filters.position));
      }

      // Default ordering
      constraints.push(orderBy('createdAt', 'desc'));

      // Execute query
      const employeesCol = collection(db, COLLECTION);
      const q = query(employeesCol, ...constraints);
      const snapshot = await getDocs(q);

      // Parse and validate each document
      const employees: Employee[] = [];

      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        const converted = convertTimestamps(data) as Record<string, unknown>;

        // Validate with Zod
        const result = EmployeeSchema.safeParse({
          id: docSnap.id,
          ...converted,
        });

        if (result.success) {
          employees.push(result.data);
        } else {
          console.error(`Invalid employee data for ID ${docSnap.id}:`, result.error);
        }
      }

      return employees;
    } catch (error) {
      console.error('Failed to fetch employees:', error);
      throw new Error('ไม่สามารถดึงข้อมูลพนักงานได้');
    }
  },

  /**
   * Get employee by ID
   */
  async getById(id: string): Promise<Employee | null> {
    try {
      const docRef = doc(db, COLLECTION, id);
      const snapshot = await getDoc(docRef);

      if (!snapshot.exists()) {
        return null;
      }

      const data = snapshot.data();
      const converted = convertTimestamps(data) as Record<string, unknown>;

      // Validate with Zod
      const result = EmployeeSchema.safeParse({
        id: snapshot.id,
        ...converted,
      });

      if (!result.success) {
        console.error(`Invalid employee data for ID ${id}:`, result.error);
        throw new Error('ข้อมูลพนักงานไม่ถูกต้อง');
      }

      return result.data;
    } catch (error) {
      console.error(`Failed to fetch employee ${id}:`, error);
      throw new Error('ไม่สามารถดึงข้อมูลพนักงานได้');
    }
  },

  /**
   * Create new employee by calling a Cloud Function
   */
  async create(payload: { password?: string; employeeData: EmployeeFormInput }): Promise<unknown> {
    if (!payload.password) {
      throw new Error('Password is required to create a new employee.');
    }

    try {
      const functions = getFunctions();
      const createEmployeeFunction = httpsCallable(functions, 'createEmployee');

      const { employeeData, password } = payload;

      const result = await createEmployeeFunction({
        email: employeeData.email,
        password,
        displayName: `${employeeData.firstName} ${employeeData.lastName}`,
        employeeData: {
          ...employeeData,
          // Convert date strings from form to Date objects
          dateOfBirth: new Date(employeeData.dateOfBirth),
          hireDate: new Date(employeeData.hireDate),
        },
      });

      return result.data;
    } catch (error) {
      console.error('Failed to create employee via cloud function:', error);
      // You can check error.code and error.message to provide more specific feedback
      throw new Error('ไม่สามารถสร้างข้อมูลพนักงานได้');
    }
  },

  /**
   * Update employee
   */
  async update(id: string, data: Partial<Employee>): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION, id);

      // Remove id from update data
      const { id: _id, createdAt: _createdAt, ...updateData } = data;

      await updateDoc(docRef, {
        ...updateData,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error(`Failed to update employee ${id}:`, error);
      throw new Error('ไม่สามารถอัปเดตข้อมูลพนักงานได้');
    }
  },

  /**
   * Delete employee (soft delete - set status to terminated)
   */
  async softDelete(id: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION, id);

      await updateDoc(docRef, {
        status: 'terminated',
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error(`Failed to soft delete employee ${id}:`, error);
      throw new Error('ไม่สามารถลบข้อมูลพนักงานได้');
    }
  },

  /**
   * Hard delete employee (permanent)
   * Use with caution - this is irreversible
   */
  async delete(id: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error(`Failed to delete employee ${id}:`, error);
      throw new Error('ไม่สามารถลบข้อมูลพนักงานได้');
    }
  },

  /**
   * Check if employee code exists
   */
  async isEmployeeCodeExists(code: string, excludeId?: string): Promise<boolean> {
    try {
      const employeesCol = collection(db, COLLECTION);
      const q = query(employeesCol, where('employeeCode', '==', code));
      const snapshot = await getDocs(q);

      if (excludeId) {
        return snapshot.docs.some((d) => d.id !== excludeId);
      }

      return !snapshot.empty;
    } catch (error) {
      console.error('Failed to check employee code:', error);
      return false;
    }
  },

  /**
   * Search employees by keyword (firstName, lastName, email, employeeCode)
   */
  async search(keyword: string): Promise<Employee[]> {
    try {
      // Note: Firestore doesn't support full-text search
      // For production, consider using Algolia or Firebase Extensions
      const employees = await this.getAll();

      const searchTerm = keyword.toLowerCase();

      return employees.filter((emp) => {
        const fullName = `${emp.firstName} ${emp.lastName}`.toLowerCase();
        const thaiFullName = `${emp.thaiFirstName} ${emp.thaiLastName}`.toLowerCase();

        return (
          fullName.includes(searchTerm) ||
          thaiFullName.includes(searchTerm) ||
          emp.email.toLowerCase().includes(searchTerm) ||
          emp.employeeCode.toLowerCase().includes(searchTerm)
        );
      });
    } catch (error) {
      console.error('Failed to search employees:', error);
      throw new Error('ไม่สามารถค้นหาพนักงานได้');
    }
  },
};
