import type { QueryConstraint } from 'firebase/firestore';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import {
  type CreatePositionInput,
  type PositionFiltersType,
  PositionSchema,
  type UpdatePositionInput,
} from '@/domains/people/features/positions/schemas';
import type {
  OrgChartNode,
  Position,
  PositionStats,
} from '@/domains/people/features/positions/types';
import { db } from '@/shared/lib/firebase';

const COLLECTION = 'positions';

/**
 * Query Keys Factory (TanStack Query)
 * Centralized management of query keys for cache invalidation
 */
export const positionKeys = {
  all: ['positions'] as const,
  lists: () => [...positionKeys.all, 'list'] as const,
  list: (filters?: PositionFiltersType) => [...positionKeys.lists(), filters ?? {}] as const,
  details: () => [...positionKeys.all, 'detail'] as const,
  detail: (id: string) => [...positionKeys.details(), id] as const,
  stats: () => [...positionKeys.all, 'stats'] as const,
  orgChart: () => [...positionKeys.all, 'orgChart'] as const,
  orgChartByPosition: (positionId: string) => [...positionKeys.orgChart(), positionId] as const,
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
 * Position Service
 */
export const positionService = {
  /**
   * Get all positions with optional filters
   */
  async getAll(filters?: PositionFiltersType): Promise<Position[]> {
    try {
      const constraints: QueryConstraint[] = [];

      // Apply filters
      if (filters?.status) {
        constraints.push(where('status', '==', filters.status));
      }

      if (filters?.level) {
        constraints.push(where('level', '==', filters.level));
      }

      if (filters?.department) {
        constraints.push(where('department', '==', filters.department));
      }

      if (filters?.parentPositionId) {
        constraints.push(where('parentPositionId', '==', filters.parentPositionId));
      }

      if (filters?.hasVacancy) {
        constraints.push(where('vacancy', '>', 0));
      }

      // Default ordering
      constraints.push(orderBy('createdAt', 'desc'));

      // Execute query
      const positionsCol = collection(db, COLLECTION);
      const q = query(positionsCol, ...constraints);
      const snapshot = await getDocs(q);

      // Parse and validate each document
      const positions: Position[] = [];

      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        const converted = convertTimestamps(data) as Record<string, unknown>;

        // Validate with Zod
        const result = PositionSchema.safeParse({
          id: docSnap.id,
          ...converted,
        });

        if (result.success) {
          positions.push(result.data);
        } else {
          console.error(`Invalid position data for ID ${docSnap.id}:`, result.error);
        }
      }

      return positions;
    } catch (error) {
      console.error('Failed to fetch positions:', error);
      throw new Error('ไม่สามารถดึงข้อมูลตำแหน่งได้');
    }
  },

  /**
   * Get position by ID
   */
  async getById(id: string): Promise<Position | null> {
    try {
      const docRef = doc(db, COLLECTION, id);
      const snapshot = await getDoc(docRef);

      if (!snapshot.exists()) {
        return null;
      }

      const data = snapshot.data();
      const converted = convertTimestamps(data) as Record<string, unknown>;

      // Validate with Zod
      const result = PositionSchema.safeParse({
        id: snapshot.id,
        ...converted,
      });

      if (!result.success) {
        console.error('Invalid position data:', result.error);
        return null;
      }

      return result.data;
    } catch (error) {
      console.error('Failed to fetch position:', error);
      throw new Error('ไม่สามารถดึงข้อมูลตำแหน่งได้');
    }
  },

  /**
   * Create a new position
   */
  async create(data: CreatePositionInput): Promise<string> {
    try {
      // Check if position code already exists
      const exists = await positionService.isPositionCodeExists(data.positionCode);
      if (exists) {
        throw new Error(`รหัสตำแหน่ง ${data.positionCode} มีอยู่แล้วในระบบ`);
      }

      // Get parent position name if parentPositionId is provided
      let parentPositionName: string | undefined;
      if (data.parentPositionId) {
        const parentPosition = await positionService.getById(data.parentPositionId);
        if (parentPosition) {
          parentPositionName = parentPosition.nameTH;
        }
      }

      // Create new position document
      const newDocRef = doc(collection(db, COLLECTION));

      // Calculate vacancy
      const vacancy = data.headcount - (data.currentEmployees ?? 0);

      const positionData = {
        ...data,
        parentPositionName,
        currentEmployees: 0, // Default value
        vacancy,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(newDocRef, positionData);

      return newDocRef.id;
    } catch (error) {
      console.error('Failed to create position:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('ไม่สามารถสร้างตำแหน่งได้');
    }
  },

  /**
   * Update position
   */
  async update(id: string, data: Partial<UpdatePositionInput>): Promise<void> {
    try {
      // Check if position code is being changed
      if (data.positionCode) {
        const exists = await positionService.isPositionCodeExists(data.positionCode, id);
        if (exists) {
          throw new Error(`รหัสตำแหน่ง ${data.positionCode} มีอยู่แล้วในระบบ`);
        }
      }

      // Get parent position name if parentPositionId is provided
      let parentPositionName: string | undefined;
      if (data.parentPositionId) {
        const parentPosition = await positionService.getById(data.parentPositionId);
        if (parentPosition) {
          parentPositionName = parentPosition.nameTH;
        }
      } else if (data.parentPositionId === null || data.parentPositionId === '') {
        // Clear parent position
        parentPositionName = undefined;
      }

      // Calculate vacancy if headcount or currentEmployees changed
      const currentData = await positionService.getById(id);
      if (!currentData) {
        throw new Error('ไม่พบข้อมูลตำแหน่ง');
      }

      const headcount = data.headcount ?? currentData.headcount;
      const currentEmployees = data.currentEmployees ?? currentData.currentEmployees;
      const vacancy = headcount - currentEmployees;

      const docRef = doc(db, COLLECTION, id);
      await updateDoc(docRef, {
        ...data,
        ...(parentPositionName !== undefined && { parentPositionName }),
        vacancy,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Failed to update position:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('ไม่สามารถอัปเดตตำแหน่งได้');
    }
  },

  /**
   * Delete position (hard delete)
   */
  async delete(id: string): Promise<void> {
    try {
      // Check if position has child positions
      const children = await positionService.getAll({
        parentPositionId: id,
      });

      if (children.length > 0) {
        throw new Error('ไม่สามารถลบตำแหน่งนี้ได้ เนื่องจากมีตำแหน่งลูกอยู่ กรุณาลบหรือย้ายตำแหน่งลูกก่อน');
      }

      const docRef = doc(db, COLLECTION, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Failed to delete position:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('ไม่สามารถลบตำแหน่งได้');
    }
  },

  /**
   * Check if position code exists (for validation)
   */
  async isPositionCodeExists(positionCode: string, excludeId?: string): Promise<boolean> {
    try {
      const positionsCol = collection(db, COLLECTION);
      const q = query(positionsCol, where('positionCode', '==', positionCode));
      const snapshot = await getDocs(q);

      // If excludeId is provided, check if the found document is not the same as excludeId
      if (excludeId) {
        return snapshot.docs.some((doc) => doc.id !== excludeId);
      }

      return !snapshot.empty;
    } catch (error) {
      console.error('Failed to check position code existence:', error);
      return false;
    }
  },

  /**
   * Get organization chart hierarchy
   */
  async getOrgChart(): Promise<OrgChartNode[]> {
    try {
      // Get all active positions
      const positions = await positionService.getAll({ status: 'active' });

      // Build hierarchy tree
      const buildTree = (parentId: string | undefined): OrgChartNode[] => {
        return positions
          .filter((p) => p.parentPositionId === parentId)
          .map((p) => ({
            id: p.id,
            name: p.nameTH,
            positionCode: p.positionCode,
            level: p.level,
            department: p.department,
            headcount: p.headcount,
            currentEmployees: p.currentEmployees,
            vacancy: p.vacancy,
            children: buildTree(p.id),
          }));
      };

      // Start from root positions (no parent)
      return buildTree(undefined);
    } catch (error) {
      console.error('Failed to fetch org chart:', error);
      throw new Error('ไม่สามารถดึงข้อมูลแผนผังองค์กรได้');
    }
  },

  /**
   * Get position statistics
   */
  async getStats(): Promise<PositionStats> {
    try {
      const positions = await positionService.getAll({ status: 'active' });

      const stats: PositionStats = {
        totalPositions: positions.length,
        totalHeadcount: positions.reduce((sum, p) => sum + p.headcount, 0),
        totalEmployees: positions.reduce((sum, p) => sum + p.currentEmployees, 0),
        totalVacancies: positions.reduce((sum, p) => sum + p.vacancy, 0),
        positionsByLevel: {
          executive: 0,
          'senior-management': 0,
          'middle-management': 0,
          supervisor: 0,
          staff: 0,
          junior: 0,
        },
        positionsByDepartment: {},
      };

      // Count by level
      for (const position of positions) {
        stats.positionsByLevel[position.level] += 1;

        // Count by department
        if (!stats.positionsByDepartment[position.department]) {
          stats.positionsByDepartment[position.department] = 0;
        }
        stats.positionsByDepartment[position.department] += 1;
      }

      return stats;
    } catch (error) {
      console.error('Failed to fetch position stats:', error);
      throw new Error('ไม่สามารถดึงข้อมูลสถิติตำแหน่งได้');
    }
  },

  /**
   * Search positions by keyword (name or code)
   */
  async search(keyword: string): Promise<Position[]> {
    try {
      const positions = await positionService.getAll();

      const lowerKeyword = keyword.toLowerCase();
      return positions.filter(
        (p) =>
          p.nameTH.toLowerCase().includes(lowerKeyword) ||
          p.positionCode.toLowerCase().includes(lowerKeyword) ||
          p.nameEN?.toLowerCase().includes(lowerKeyword)
      );
    } catch (error) {
      console.error('Failed to search positions:', error);
      throw new Error('ไม่สามารถค้นหาตำแหน่งได้');
    }
  },
};
