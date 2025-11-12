/**
 * Overtime Policy Service
 * Business logic for overtime policy management and calculations
 */

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  type QueryConstraint,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '@/shared/lib/firebase';
import type {
  CreateOvertimePolicyInput,
  OvertimeCalculationInput,
  OvertimeCalculationResult,
  OvertimePolicy,
  OvertimePolicyFilters,
  OvertimeType,
  UpdateOvertimePolicyInput,
} from '../types/overtimePolicy';

const COLLECTION_NAME = 'overtimePolicies';

/**
 * Convert Firestore document to OvertimePolicy
 */
function docToOvertimePolicy(id: string, data: any): OvertimePolicy {
  return {
    id,
    name: data.name,
    nameEn: data.nameEn,
    description: data.description,
    code: data.code,
    eligibleEmployeeTypes: data.eligibleEmployeeTypes,
    eligiblePositions: data.eligiblePositions,
    eligibleDepartments: data.eligibleDepartments,
    rules: data.rules,
    requiresApproval: data.requiresApproval,
    approvalThresholdHours: data.approvalThresholdHours ?? undefined,
    autoApproveUnder: data.autoApproveUnder ?? undefined,
    holidayRate: data.holidayRate,
    weekendRate: data.weekendRate,
    nightShiftRate: data.nightShiftRate ?? undefined,
    trackBySystem: data.trackBySystem,
    allowManualEntry: data.allowManualEntry,
    paymentMethod: data.paymentMethod,
    paymentFrequency: data.paymentFrequency,
    isActive: data.isActive,
    effectiveDate: data.effectiveDate.toDate(),
    expiryDate: data.expiryDate ? data.expiryDate.toDate() : undefined,
    tenantId: data.tenantId,
    createdAt: data.createdAt.toDate(),
    updatedAt: data.updatedAt.toDate(),
  };
}

/**
 * Get overtime type based on date
 */
function getOvertimeTypeFromDate(date: Date): OvertimeType {
  const dayOfWeek = date.getDay();

  // Check if weekend (Saturday = 6, Sunday = 0)
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return 'weekend';
  }

  // Default to weekday
  return 'weekday';
}

export const overtimePolicyService = {
  /**
   * Create overtime policy
   */
  async create(input: CreateOvertimePolicyInput): Promise<string> {
    try {
      // Check if code already exists
      const existing = await this.getByCode(input.code);
      if (existing) {
        throw new Error('Policy code already exists');
      }

      // Validate rules
      if (input.rules.length === 0) {
        throw new Error('At least one overtime rule is required');
      }

      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        name: input.name,
        nameEn: input.nameEn,
        description: input.description,
        code: input.code,
        eligibleEmployeeTypes: input.eligibleEmployeeTypes,
        eligiblePositions: input.eligiblePositions,
        eligibleDepartments: input.eligibleDepartments,
        rules: input.rules,
        requiresApproval: input.requiresApproval,
        approvalThresholdHours: input.approvalThresholdHours ?? null,
        autoApproveUnder: input.autoApproveUnder ?? null,
        holidayRate: input.holidayRate,
        weekendRate: input.weekendRate,
        nightShiftRate: input.nightShiftRate ?? null,
        trackBySystem: input.trackBySystem,
        allowManualEntry: input.allowManualEntry,
        paymentMethod: input.paymentMethod,
        paymentFrequency: input.paymentFrequency,
        isActive: true,
        effectiveDate: Timestamp.fromDate(input.effectiveDate),
        expiryDate: input.expiryDate ? Timestamp.fromDate(input.expiryDate) : null,
        tenantId: 'default',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      return docRef.id;
    } catch (error) {
      console.error('Failed to create overtime policy', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to create overtime policy');
    }
  },

  /**
   * Get policy by ID
   */
  async getById(id: string): Promise<OvertimePolicy | null> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap || !docSnap.exists()) {
        return null;
      }

      return docToOvertimePolicy(docSnap.id, docSnap.data());
    } catch (error) {
      console.error('Failed to fetch overtime policy', error);
      throw new Error('Failed to fetch overtime policy');
    }
  },

  /**
   * Get policy by code
   */
  async getByCode(code: string): Promise<OvertimePolicy | null> {
    try {
      const q = query(collection(db, COLLECTION_NAME), where('code', '==', code));

      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      if (!doc) {
        return null;
      }

      return docToOvertimePolicy(doc.id, doc.data());
    } catch (error) {
      console.error('Failed to fetch overtime policy by code', error);
      throw new Error('Failed to fetch overtime policy');
    }
  },

  /**
   * Get all policies with filters
   */
  async getAll(filters?: OvertimePolicyFilters): Promise<OvertimePolicy[]> {
    try {
      const constraints: QueryConstraint[] = [];

      if (filters?.department) {
        constraints.push(where('eligibleDepartments', 'array-contains', filters.department));
      }

      if (filters?.position) {
        constraints.push(where('eligiblePositions', 'array-contains', filters.position));
      }

      if (filters?.employeeType) {
        constraints.push(where('eligibleEmployeeTypes', 'array-contains', filters.employeeType));
      }

      if (filters?.isActive !== undefined) {
        constraints.push(where('isActive', '==', filters.isActive));
      }

      constraints.push(orderBy('createdAt', 'desc'));

      const q = query(collection(db, COLLECTION_NAME), ...constraints);
      const snapshot = await getDocs(q);

      return snapshot.docs.map((doc) => docToOvertimePolicy(doc.id, doc.data()));
    } catch (error) {
      console.error('Failed to fetch overtime policies', error);
      throw new Error('Failed to fetch overtime policies');
    }
  },

  /**
   * Update policy
   */
  async update(id: string, input: UpdateOvertimePolicyInput): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap || !docSnap.exists()) {
        throw new Error('Overtime policy not found');
      }

      const updateData: Record<string, any> = {
        updatedAt: Timestamp.now(),
      };

      if (input.name !== undefined) updateData.name = input.name;
      if (input.nameEn !== undefined) updateData.nameEn = input.nameEn;
      if (input.description !== undefined) updateData.description = input.description;
      if (input.eligibleEmployeeTypes !== undefined)
        updateData.eligibleEmployeeTypes = input.eligibleEmployeeTypes;
      if (input.eligiblePositions !== undefined)
        updateData.eligiblePositions = input.eligiblePositions;
      if (input.eligibleDepartments !== undefined)
        updateData.eligibleDepartments = input.eligibleDepartments;
      if (input.rules !== undefined) updateData.rules = input.rules;
      if (input.requiresApproval !== undefined) updateData.requiresApproval = input.requiresApproval;
      if (input.approvalThresholdHours !== undefined)
        updateData.approvalThresholdHours = input.approvalThresholdHours;
      if (input.autoApproveUnder !== undefined) updateData.autoApproveUnder = input.autoApproveUnder;
      if (input.holidayRate !== undefined) updateData.holidayRate = input.holidayRate;
      if (input.weekendRate !== undefined) updateData.weekendRate = input.weekendRate;
      if (input.nightShiftRate !== undefined) updateData.nightShiftRate = input.nightShiftRate;
      if (input.trackBySystem !== undefined) updateData.trackBySystem = input.trackBySystem;
      if (input.allowManualEntry !== undefined) updateData.allowManualEntry = input.allowManualEntry;
      if (input.paymentMethod !== undefined) updateData.paymentMethod = input.paymentMethod;
      if (input.paymentFrequency !== undefined) updateData.paymentFrequency = input.paymentFrequency;
      if (input.effectiveDate !== undefined)
        updateData.effectiveDate = Timestamp.fromDate(input.effectiveDate);
      if (input.expiryDate !== undefined)
        updateData.expiryDate = input.expiryDate ? Timestamp.fromDate(input.expiryDate) : null;
      if (input.isActive !== undefined) updateData.isActive = input.isActive;

      await updateDoc(docRef, updateData);
    } catch (error) {
      console.error('Failed to update overtime policy', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to update overtime policy');
    }
  },

  /**
   * Delete policy
   */
  async delete(id: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Failed to delete overtime policy', error);
      throw new Error('Failed to delete overtime policy');
    }
  },

  /**
   * Calculate overtime pay based on policy
   */
  calculateOvertimePay(input: OvertimeCalculationInput): OvertimeCalculationResult {
    // This is a placeholder that would need the full policy object
    // In real implementation, you'd fetch the policy first
    throw new Error('Use calculateOvertimePayWithPolicy instead');
  },

  /**
   * Calculate overtime pay with full policy object
   */
  calculateOvertimePayWithPolicy(
    policy: OvertimePolicy,
    overtimeHours: number,
    overtimeType: OvertimeType,
    hourlyRate: number,
    date: Date
  ): OvertimeCalculationResult {
    // Find applicable rule
    const rule = policy.rules.find((r) => r.type === overtimeType);

    if (!rule) {
      throw new Error(`No overtime rule found for type: ${overtimeType}`);
    }

    let effectiveHours = overtimeHours;
    let isWithinLimit = true;
    let exceedsLimit: OvertimeCalculationResult['exceedsLimit'];

    // Apply rounding if specified
    if (rule.conditions?.roundingMinutes) {
      const totalMinutes = overtimeHours * 60;
      const roundedMinutes =
        Math.floor(totalMinutes / rule.conditions.roundingMinutes) *
        rule.conditions.roundingMinutes;
      effectiveHours = roundedMinutes / 60;
    }

    // Check minimum hours
    if (rule.conditions?.minHours && effectiveHours < rule.conditions.minHours) {
      effectiveHours = 0; // Below minimum, no OT pay
    }

    // Check maximum hours per day
    if (rule.conditions?.maxHoursPerDay && effectiveHours > rule.conditions.maxHoursPerDay) {
      isWithinLimit = false;
      exceedsLimit = {
        type: 'day',
        limit: rule.conditions.maxHoursPerDay,
        actual: effectiveHours,
      };
      effectiveHours = rule.conditions.maxHoursPerDay;
    }

    // Calculate pay
    const amount = effectiveHours * hourlyRate * rule.rate;

    // Check if approval required
    const requiresApproval =
      policy.requiresApproval &&
      policy.approvalThresholdHours !== undefined &&
      overtimeHours > policy.approvalThresholdHours;

    return {
      hours: effectiveHours,
      rate: rule.rate,
      amount,
      type: overtimeType,
      requiresApproval,
      isWithinLimit,
      exceedsLimit,
    };
  },

  /**
   * Check if employee is eligible for overtime based on policy
   */
  isEligible(
    policy: OvertimePolicy,
    employeeType: string,
    position: string,
    department: string
  ): boolean {
    // Check employee type
    if (
      policy.eligibleEmployeeTypes.length > 0 &&
      !policy.eligibleEmployeeTypes.includes(employeeType)
    ) {
      return false;
    }

    // Check position
    if (policy.eligiblePositions.length > 0 && !policy.eligiblePositions.includes(position)) {
      return false;
    }

    // Check department
    if (
      policy.eligibleDepartments.length > 0 &&
      !policy.eligibleDepartments.includes(department)
    ) {
      return false;
    }

    return true;
  },

  /**
   * Get overtime type from date (helper)
   */
  getOvertimeType(date: Date, isHoliday = false): OvertimeType {
    if (isHoliday) {
      return 'holiday';
    }

    return getOvertimeTypeFromDate(date);
  },

  /**
   * Calculate total overtime for a period
   */
  calculatePeriodOvertime(
    policy: OvertimePolicy,
    overtimeRecords: Array<{
      date: Date;
      hours: number;
      type: OvertimeType;
    }>,
    hourlyRate: number
  ): {
    totalHours: number;
    totalAmount: number;
    byType: Record<OvertimeType, { hours: number; amount: number }>;
  } {
    let totalHours = 0;
    let totalAmount = 0;
    const byType: Record<OvertimeType, { hours: number; amount: number }> = {
      weekday: { hours: 0, amount: 0 },
      weekend: { hours: 0, amount: 0 },
      holiday: { hours: 0, amount: 0 },
      'after-hours': { hours: 0, amount: 0 },
    };

    for (const record of overtimeRecords) {
      const result = this.calculateOvertimePayWithPolicy(
        policy,
        record.hours,
        record.type,
        hourlyRate,
        record.date
      );

      totalHours += result.hours;
      totalAmount += result.amount;

      byType[record.type].hours += result.hours;
      byType[record.type].amount += result.amount;
    }

    return {
      totalHours,
      totalAmount,
      byType,
    };
  },
};
