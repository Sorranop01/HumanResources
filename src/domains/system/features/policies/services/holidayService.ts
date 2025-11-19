/**
 * Holiday Service
 * Business logic for holiday calendar management
 */

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
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '@/shared/lib/firebase';
import { PublicHolidaySchema } from '../schemas/holidaySchema';
import type {
  CreatePublicHolidayInput,
  HolidayCheckResult,
  PublicHoliday,
  PublicHolidayFilters,
  UpdatePublicHolidayInput,
  WorkingDaysCalculationInput,
  WorkingDaysCalculationResult,
} from '../types/holiday';

const COLLECTION_NAME = 'holidays';

/**
 * Convert Firestore Timestamp to Date (recursively)
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
 * Convert Firestore document to PublicHoliday with Zod validation
 * ✅ Layer 2: Service Layer Validation
 */
function docToPublicHoliday(id: string, data: any): PublicHoliday | null {
  const converted = {
    id,
    ...(convertTimestamps(data) as Record<string, unknown>),
  };

  const validation = PublicHolidaySchema.safeParse(converted);

  if (!validation.success) {
    console.warn(
      `⚠️ Skipping invalid holiday ${id}:`,
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
 * Check if date is weekend (Saturday or Sunday)
 */
function isWeekend(date: Date): boolean {
  const dayOfWeek = date.getDay();
  return dayOfWeek === 0 || dayOfWeek === 6;
}

/**
 * Normalize date to midnight UTC
 */
function normalizeDate(date: Date): Date {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
}

export const holidayService = {
  /**
   * Create public holiday
   */
  async create(tenantId: string, input: CreatePublicHolidayInput): Promise<string> {
    try {
      // Check if holiday already exists on this date
      const existing = await this.getByDate(tenantId, input.date);
      if (existing.length > 0) {
        throw new Error('A holiday already exists on this date');
      }

      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        name: input.name,
        nameEn: input.nameEn,
        description: input.description,
        date: FirestoreTimestamp.fromDate(normalizeDate(input.date)),
        year: input.year,
        type: input.type,
        isSubstituteDay: input.isSubstituteDay,
        originalDate: input.originalDate ? FirestoreTimestamp.fromDate(input.originalDate) : null,
        workPolicy: input.workPolicy,
        overtimeRate: input.overtimeRate,
        locations: input.locations,
        regions: input.regions,
        applicableDepartments: input.applicableDepartments,
        applicablePositions: input.applicablePositions,
        isActive: true,
        tenantId,
        createdAt: FirestoreTimestamp.now(),
        updatedAt: FirestoreTimestamp.now(),
      });

      return docRef.id;
    } catch (error) {
      console.error('Failed to create public holiday', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to create public holiday');
    }
  },

  /**
   * Get holiday by ID
   */
  async getById(id: string): Promise<PublicHoliday | null> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap || !docSnap.exists()) {
        return null;
      }

      // ✅ Use validation
      return docToPublicHoliday(docSnap.id, docSnap.data());
    } catch (error) {
      console.error('Failed to fetch public holiday', error);
      throw new Error('Failed to fetch public holiday');
    }
  },

  /**
   * Get holidays by date
   */
  async getByDate(tenantId: string, date: Date): Promise<PublicHoliday[]> {
    try {
      const normalized = normalizeDate(date);
      const q = query(
        collection(db, COLLECTION_NAME),
        where('tenantId', '==', tenantId),
        where('date', '==', FirestoreTimestamp.fromDate(normalized)),
        where('isActive', '==', true)
      );

      const snapshot = await getDocs(q);
      // ✅ Filter null results from validation
      return snapshot.docs
        .map((doc) => docToPublicHoliday(doc.id, doc.data()))
        .filter((h): h is PublicHoliday => h !== null);
    } catch (error) {
      console.error('Failed to fetch holidays by date', error);
      throw new Error('Failed to fetch holidays');
    }
  },

  /**
   * Get all holidays with filters
   */
  async getAll(tenantId: string, filters?: PublicHolidayFilters): Promise<PublicHoliday[]> {
    try {
      const constraints: QueryConstraint[] = [where('tenantId', '==', tenantId)];

      if (filters?.year) {
        constraints.push(where('year', '==', filters.year));
      }

      if (filters?.type) {
        constraints.push(where('type', '==', filters.type));
      }

      if (filters?.location) {
        constraints.push(where('locations', 'array-contains', filters.location));
      }

      if (filters?.region) {
        constraints.push(where('regions', 'array-contains', filters.region));
      }

      if (filters?.department) {
        constraints.push(where('applicableDepartments', 'array-contains', filters.department));
      }

      if (filters?.isActive !== undefined) {
        constraints.push(where('isActive', '==', filters.isActive));
      }

      constraints.push(orderBy('date', 'asc'));

      const q = query(collection(db, COLLECTION_NAME), ...constraints);
      const snapshot = await getDocs(q);

      // ✅ Filter null results from validation
      return snapshot.docs
        .map((doc) => docToPublicHoliday(doc.id, doc.data()))
        .filter((h): h is PublicHoliday => h !== null);
    } catch (error) {
      console.error('Failed to fetch public holidays', error);
      throw new Error('Failed to fetch public holidays');
    }
  },

  /**
   * Update holiday
   */
  async update(id: string, input: UpdatePublicHolidayInput): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap || !docSnap.exists()) {
        throw new Error('Public holiday not found');
      }

      const updateData: Record<string, unknown> = {
        updatedAt: FirestoreTimestamp.now(),
      };

      if (input.name !== undefined) updateData.name = input.name;
      if (input.nameEn !== undefined) updateData.nameEn = input.nameEn;
      if (input.description !== undefined) updateData.description = input.description;
      if (input.date !== undefined)
        updateData.date = FirestoreTimestamp.fromDate(normalizeDate(input.date));
      if (input.type !== undefined) updateData.type = input.type;
      if (input.isSubstituteDay !== undefined) updateData.isSubstituteDay = input.isSubstituteDay;
      if (input.originalDate !== undefined)
        updateData.originalDate = input.originalDate
          ? FirestoreTimestamp.fromDate(input.originalDate)
          : null;
      if (input.workPolicy !== undefined) updateData.workPolicy = input.workPolicy;
      if (input.overtimeRate !== undefined) updateData.overtimeRate = input.overtimeRate;
      if (input.locations !== undefined) updateData.locations = input.locations;
      if (input.regions !== undefined) updateData.regions = input.regions;
      if (input.applicableDepartments !== undefined)
        updateData.applicableDepartments = input.applicableDepartments;
      if (input.applicablePositions !== undefined)
        updateData.applicablePositions = input.applicablePositions;
      if (input.isActive !== undefined) updateData.isActive = input.isActive;

      await updateDoc(docRef, updateData);
    } catch (error) {
      console.error('Failed to update public holiday', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to update public holiday');
    }
  },

  /**
   * Delete holiday
   */
  async delete(id: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Failed to delete public holiday', error);
      throw new Error('Failed to delete public holiday');
    }
  },

  /**
   * Check if a date is a holiday
   */
  async isHoliday(
    tenantId: string,
    date: Date,
    location?: string,
    region?: string,
    department?: string
  ): Promise<HolidayCheckResult> {
    try {
      const holidays = await this.getByDate(tenantId, date);

      // Find applicable holiday
      const applicableHoliday = holidays.find((holiday) => {
        // Check location
        if (
          location &&
          Array.isArray(holiday.locations) &&
          holiday.locations.length > 0 &&
          !holiday.locations.includes(location)
        ) {
          return false;
        }

        // Check region
        if (
          region &&
          Array.isArray(holiday.regions) &&
          holiday.regions.length > 0 &&
          !holiday.regions.includes(region)
        ) {
          return false;
        }

        // Check department
        if (
          department &&
          Array.isArray(holiday.applicableDepartments) &&
          holiday.applicableDepartments.length > 0 &&
          !holiday.applicableDepartments.includes(department)
        ) {
          return false;
        }

        return true;
      });

      if (applicableHoliday) {
        return {
          isHoliday: true,
          holiday: applicableHoliday,
          holidayName: applicableHoliday.name,
          workPolicy: applicableHoliday.workPolicy,
          overtimeRate: applicableHoliday.overtimeRate,
          isPaidLeave: true, // Public holidays are typically paid
        };
      }

      return {
        isHoliday: false,
        workPolicy: 'optional',
        isPaidLeave: false,
      };
    } catch (error) {
      console.error('Failed to check if date is holiday', error);
      throw new Error('Failed to check holiday');
    }
  },

  /**
   * Calculate working days between two dates
   */
  async calculateWorkingDays(
    tenantId: string,
    input: WorkingDaysCalculationInput
  ): Promise<WorkingDaysCalculationResult> {
    try {
      const { startDate, endDate, includeWeekends, location, region, department } = input;

      let totalDays = 0;
      let workingDays = 0;
      let weekendDays = 0;
      let holidayCount = 0;
      const holidayDates: Date[] = [];

      const currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        totalDays++;

        const isWeekendDay = isWeekend(currentDate);
        if (isWeekendDay) {
          weekendDays++;
          if (!includeWeekends) {
            currentDate.setDate(currentDate.getDate() + 1);
            continue;
          }
        }

        // Check if holiday
        const holidayCheck = await this.isHoliday(
          tenantId,
          currentDate,
          location,
          region,
          department
        );
        if (holidayCheck.isHoliday) {
          holidayCount++;
          holidayDates.push(new Date(currentDate));
        } else {
          workingDays++;
        }

        currentDate.setDate(currentDate.getDate() + 1);
      }

      return {
        totalDays,
        workingDays,
        weekendDays,
        holidays: holidayCount,
        holidayDates,
      };
    } catch (error) {
      console.error('Failed to calculate working days', error);
      throw new Error('Failed to calculate working days');
    }
  },

  /**
   * Get holidays for a year
   */
  async getYearHolidays(
    tenantId: string,
    year: number,
    filters?: PublicHolidayFilters
  ): Promise<PublicHoliday[]> {
    return this.getAll(tenantId, { ...filters, year });
  },

  /**
   * Get holidays for a date range
   */
  async getHolidaysInRange(
    tenantId: string,
    startDate: Date,
    endDate: Date
  ): Promise<PublicHoliday[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('tenantId', '==', tenantId),
        where('date', '>=', FirestoreTimestamp.fromDate(normalizeDate(startDate))),
        where('date', '<=', FirestoreTimestamp.fromDate(normalizeDate(endDate))),
        where('isActive', '==', true),
        orderBy('date', 'asc')
      );

      const snapshot = await getDocs(q);
      // ✅ Filter null results from validation
      return snapshot.docs
        .map((doc) => docToPublicHoliday(doc.id, doc.data()))
        .filter((h): h is PublicHoliday => h !== null);
    } catch (error) {
      console.error('Failed to fetch holidays in range', error);
      throw new Error('Failed to fetch holidays in range');
    }
  },
};
