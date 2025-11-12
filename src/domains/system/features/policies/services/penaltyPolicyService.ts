/**
 * Penalty Policy Service
 * Business logic for penalty policy management and calculations
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
  CreatePenaltyPolicyInput,
  PenaltyCalculationInput,
  PenaltyCalculationResult,
  PenaltyPolicy,
  PenaltyPolicyFilters,
  UpdatePenaltyPolicyInput,
} from '../types/penaltyPolicy';

const COLLECTION_NAME = 'penaltyPolicies';

/**
 * Convert Firestore document to PenaltyPolicy
 */
function docToPenaltyPolicy(id: string, data: any): PenaltyPolicy {
  return {
    id,
    name: data.name,
    nameEn: data.nameEn,
    description: data.description,
    code: data.code,
    type: data.type,
    calculationType: data.calculationType,
    amount: data.amount ?? undefined,
    percentage: data.percentage ?? undefined,
    hourlyRateMultiplier: data.hourlyRateMultiplier ?? undefined,
    dailyRateMultiplier: data.dailyRateMultiplier ?? undefined,
    threshold: data.threshold,
    gracePeriodMinutes: data.gracePeriodMinutes ?? undefined,
    graceOccurrences: data.graceOccurrences ?? undefined,
    isProgressive: data.isProgressive,
    progressiveRules: data.progressiveRules ?? undefined,
    applicableDepartments: data.applicableDepartments,
    applicablePositions: data.applicablePositions,
    applicableEmploymentTypes: data.applicableEmploymentTypes,
    autoApply: data.autoApply,
    requiresApproval: data.requiresApproval,
    maxPenaltyPerMonth: data.maxPenaltyPerMonth ?? undefined,
    maxOccurrencesPerMonth: data.maxOccurrencesPerMonth ?? undefined,
    isActive: data.isActive,
    effectiveDate: data.effectiveDate.toDate(),
    expiryDate: data.expiryDate ? data.expiryDate.toDate() : undefined,
    tenantId: data.tenantId,
    createdAt: data.createdAt.toDate(),
    updatedAt: data.updatedAt.toDate(),
  };
}

export const penaltyPolicyService = {
  /**
   * Create penalty policy
   */
  async create(input: CreatePenaltyPolicyInput): Promise<string> {
    try {
      // Check if code already exists
      const existing = await this.getByCode(input.code);
      if (existing) {
        throw new Error('Policy code already exists');
      }

      // Validate progressive rules if applicable
      if (input.isProgressive && (!input.progressiveRules || input.progressiveRules.length === 0)) {
        throw new Error('Progressive rules are required when isProgressive is true');
      }

      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        name: input.name,
        nameEn: input.nameEn,
        description: input.description,
        code: input.code,
        type: input.type,
        calculationType: input.calculationType,
        amount: input.amount ?? null,
        percentage: input.percentage ?? null,
        hourlyRateMultiplier: input.hourlyRateMultiplier ?? null,
        dailyRateMultiplier: input.dailyRateMultiplier ?? null,
        threshold: input.threshold,
        gracePeriodMinutes: input.gracePeriodMinutes ?? null,
        graceOccurrences: input.graceOccurrences ?? null,
        isProgressive: input.isProgressive,
        progressiveRules: input.progressiveRules ?? null,
        applicableDepartments: input.applicableDepartments,
        applicablePositions: input.applicablePositions,
        applicableEmploymentTypes: input.applicableEmploymentTypes,
        autoApply: input.autoApply,
        requiresApproval: input.requiresApproval,
        maxPenaltyPerMonth: input.maxPenaltyPerMonth ?? null,
        maxOccurrencesPerMonth: input.maxOccurrencesPerMonth ?? null,
        isActive: true,
        effectiveDate: Timestamp.fromDate(input.effectiveDate),
        expiryDate: input.expiryDate ? Timestamp.fromDate(input.expiryDate) : null,
        tenantId: 'default',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      return docRef.id;
    } catch (error) {
      console.error('Failed to create penalty policy', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to create penalty policy');
    }
  },

  /**
   * Get policy by ID
   */
  async getById(id: string): Promise<PenaltyPolicy | null> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap || !docSnap.exists()) {
        return null;
      }

      return docToPenaltyPolicy(docSnap.id, docSnap.data());
    } catch (error) {
      console.error('Failed to fetch penalty policy', error);
      throw new Error('Failed to fetch penalty policy');
    }
  },

  /**
   * Get policy by code
   */
  async getByCode(code: string): Promise<PenaltyPolicy | null> {
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

      return docToPenaltyPolicy(doc.id, doc.data());
    } catch (error) {
      console.error('Failed to fetch penalty policy by code', error);
      throw new Error('Failed to fetch penalty policy');
    }
  },

  /**
   * Get all policies with filters
   */
  async getAll(filters?: PenaltyPolicyFilters): Promise<PenaltyPolicy[]> {
    try {
      const constraints: QueryConstraint[] = [];

      if (filters?.type) {
        constraints.push(where('type', '==', filters.type));
      }

      if (filters?.department) {
        constraints.push(where('applicableDepartments', 'array-contains', filters.department));
      }

      if (filters?.position) {
        constraints.push(where('applicablePositions', 'array-contains', filters.position));
      }

      if (filters?.employmentType) {
        constraints.push(
          where('applicableEmploymentTypes', 'array-contains', filters.employmentType)
        );
      }

      if (filters?.isActive !== undefined) {
        constraints.push(where('isActive', '==', filters.isActive));
      }

      constraints.push(orderBy('createdAt', 'desc'));

      const q = query(collection(db, COLLECTION_NAME), ...constraints);
      const snapshot = await getDocs(q);

      return snapshot.docs.map((doc) => docToPenaltyPolicy(doc.id, doc.data()));
    } catch (error) {
      console.error('Failed to fetch penalty policies', error);
      throw new Error('Failed to fetch penalty policies');
    }
  },

  /**
   * Update policy
   */
  async update(id: string, input: UpdatePenaltyPolicyInput): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap || !docSnap.exists()) {
        throw new Error('Penalty policy not found');
      }

      const updateData: Record<string, any> = {
        updatedAt: Timestamp.now(),
      };

      if (input.name !== undefined) updateData.name = input.name;
      if (input.nameEn !== undefined) updateData.nameEn = input.nameEn;
      if (input.description !== undefined) updateData.description = input.description;
      if (input.calculationType !== undefined) updateData.calculationType = input.calculationType;
      if (input.amount !== undefined) updateData.amount = input.amount;
      if (input.percentage !== undefined) updateData.percentage = input.percentage;
      if (input.hourlyRateMultiplier !== undefined)
        updateData.hourlyRateMultiplier = input.hourlyRateMultiplier;
      if (input.dailyRateMultiplier !== undefined)
        updateData.dailyRateMultiplier = input.dailyRateMultiplier;
      if (input.threshold !== undefined) updateData.threshold = input.threshold;
      if (input.gracePeriodMinutes !== undefined)
        updateData.gracePeriodMinutes = input.gracePeriodMinutes;
      if (input.graceOccurrences !== undefined) updateData.graceOccurrences = input.graceOccurrences;
      if (input.isProgressive !== undefined) updateData.isProgressive = input.isProgressive;
      if (input.progressiveRules !== undefined) updateData.progressiveRules = input.progressiveRules;
      if (input.applicableDepartments !== undefined)
        updateData.applicableDepartments = input.applicableDepartments;
      if (input.applicablePositions !== undefined)
        updateData.applicablePositions = input.applicablePositions;
      if (input.applicableEmploymentTypes !== undefined)
        updateData.applicableEmploymentTypes = input.applicableEmploymentTypes;
      if (input.autoApply !== undefined) updateData.autoApply = input.autoApply;
      if (input.requiresApproval !== undefined) updateData.requiresApproval = input.requiresApproval;
      if (input.maxPenaltyPerMonth !== undefined)
        updateData.maxPenaltyPerMonth = input.maxPenaltyPerMonth;
      if (input.maxOccurrencesPerMonth !== undefined)
        updateData.maxOccurrencesPerMonth = input.maxOccurrencesPerMonth;
      if (input.effectiveDate !== undefined)
        updateData.effectiveDate = Timestamp.fromDate(input.effectiveDate);
      if (input.expiryDate !== undefined)
        updateData.expiryDate = input.expiryDate ? Timestamp.fromDate(input.expiryDate) : null;
      if (input.isActive !== undefined) updateData.isActive = input.isActive;

      await updateDoc(docRef, updateData);
    } catch (error) {
      console.error('Failed to update penalty policy', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to update penalty policy');
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
      console.error('Failed to delete penalty policy', error);
      throw new Error('Failed to delete penalty policy');
    }
  },

  /**
   * Calculate penalty based on policy
   */
  async calculatePenalty(input: PenaltyCalculationInput): Promise<PenaltyCalculationResult> {
    try {
      // Get policy
      const policy = await this.getById(input.policyId);
      if (!policy) {
        throw new Error('Penalty policy not found');
      }

      return this.calculatePenaltyWithPolicy(policy, input);
    } catch (error) {
      console.error('Failed to calculate penalty', error);
      throw new Error('Failed to calculate penalty');
    }
  },

  /**
   * Calculate penalty with full policy object
   */
  calculatePenaltyWithPolicy(
    policy: PenaltyPolicy,
    input: PenaltyCalculationInput
  ): PenaltyCalculationResult {
    // Check if policy type matches violation type
    if (policy.type !== input.violationType) {
      return {
        shouldApply: false,
        amount: 0,
        reason: 'Policy type does not match violation type',
        details: {
          policyCode: policy.code,
          policyName: policy.name,
          calculationType: policy.calculationType,
          threshold: policy.threshold,
          actualViolation: {},
          isWithinGracePeriod: false,
          isWithinCap: true,
          requiresApproval: policy.requiresApproval,
        },
      };
    }

    // Check grace period for late/early-leave
    if (
      (policy.type === 'late' || policy.type === 'early-leave') &&
      policy.gracePeriodMinutes &&
      input.minutesLate
    ) {
      if (input.minutesLate <= policy.gracePeriodMinutes) {
        return {
          shouldApply: false,
          amount: 0,
          reason: 'Within grace period',
          details: {
            policyCode: policy.code,
            policyName: policy.name,
            calculationType: policy.calculationType,
            threshold: policy.threshold,
            actualViolation: { minutes: input.minutesLate },
            isWithinGracePeriod: true,
            isWithinCap: true,
            requiresApproval: policy.requiresApproval,
          },
        };
      }
    }

    // Check threshold
    if (policy.threshold.minutes && input.minutesLate) {
      if (input.minutesLate < policy.threshold.minutes) {
        return {
          shouldApply: false,
          amount: 0,
          reason: `Below threshold (${policy.threshold.minutes} minutes)`,
          details: {
            policyCode: policy.code,
            policyName: policy.name,
            calculationType: policy.calculationType,
            threshold: policy.threshold,
            actualViolation: { minutes: input.minutesLate },
            isWithinGracePeriod: false,
            isWithinCap: true,
            requiresApproval: policy.requiresApproval,
          },
        };
      }
    }

    // Calculate penalty amount
    let amount = 0;
    const occurrenceCount = input.occurrenceCount || 1;

    if (policy.isProgressive && policy.progressiveRules) {
      // Progressive penalty
      const applicableRule = policy.progressiveRules.find((rule) => {
        if (rule.toOccurrence) {
          return occurrenceCount >= rule.fromOccurrence && occurrenceCount <= rule.toOccurrence;
        }
        return occurrenceCount >= rule.fromOccurrence;
      });

      if (applicableRule) {
        if (applicableRule.amount) {
          amount = applicableRule.amount;
        } else if (applicableRule.percentage && input.employeeSalary) {
          amount = (input.employeeSalary * applicableRule.percentage) / 100;
        }
      }
    } else {
      // Non-progressive penalty
      switch (policy.calculationType) {
        case 'fixed':
          amount = policy.amount || 0;
          break;

        case 'percentage':
          if (policy.percentage && input.employeeSalary) {
            amount = (input.employeeSalary * policy.percentage) / 100;
          }
          break;

        case 'hourly-rate':
          if (policy.hourlyRateMultiplier && input.hourlyRate && input.minutesLate) {
            const hours = input.minutesLate / 60;
            amount = hours * input.hourlyRate * policy.hourlyRateMultiplier;
          }
          break;

        case 'daily-rate':
          if (policy.dailyRateMultiplier && input.dailyRate) {
            amount = input.dailyRate * policy.dailyRateMultiplier;
          }
          break;
      }
    }

    // Check cap
    let isWithinCap = true;
    if (policy.maxPenaltyPerMonth && amount > policy.maxPenaltyPerMonth) {
      isWithinCap = false;
      amount = policy.maxPenaltyPerMonth;
    }

    return {
      shouldApply: amount > 0,
      amount: Math.round(amount * 100) / 100, // Round to 2 decimals
      reason: `Penalty applied: ${policy.name}`,
      details: {
        policyCode: policy.code,
        policyName: policy.name,
        calculationType: policy.calculationType,
        threshold: policy.threshold,
        actualViolation: {
          minutes: input.minutesLate,
          occurrences: occurrenceCount,
        },
        isWithinGracePeriod: false,
        isWithinCap,
        requiresApproval: policy.requiresApproval,
      },
    };
  },

  /**
   * Check if employee is subject to this penalty policy
   */
  isApplicable(
    policy: PenaltyPolicy,
    employeeType: string,
    position: string,
    department: string
  ): boolean {
    // Check employee type
    if (
      policy.applicableEmploymentTypes.length > 0 &&
      !policy.applicableEmploymentTypes.includes(employeeType)
    ) {
      return false;
    }

    // Check position
    if (policy.applicablePositions.length > 0 && !policy.applicablePositions.includes(position)) {
      return false;
    }

    // Check department
    if (
      policy.applicableDepartments.length > 0 &&
      !policy.applicableDepartments.includes(department)
    ) {
      return false;
    }

    return true;
  },
};
