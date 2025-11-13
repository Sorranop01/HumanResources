/**
 * Payroll Configuration Service
 * Handles CRUD operations for payroll system configuration
 */

import {
  collection,
  type DocumentData,
  doc,
  getDoc,
  getDocs,
  setDoc,
  Timestamp,
  updateDoc,
} from 'firebase/firestore';
import { db } from '@/shared/lib/firebase';
import {
  type CreatePayrollConfigInput,
  type PayrollConfig,
  PayrollConfigSchema,
  type UpdatePayrollConfigInput,
} from '@/shared/schemas/payrollConfig.schema';

const COLLECTION_NAME = 'payrollConfigs';
const SINGLETON_DOC_ID = 'payroll-config'; // Singleton document

/**
 * Get the payroll config collection reference
 */
const getCollectionRef = () => collection(db, COLLECTION_NAME);

/**
 * Get the payroll config document reference
 */
const getDocRef = (tenantId: string) => doc(db, COLLECTION_NAME, `${tenantId}-${SINGLETON_DOC_ID}`);

/**
 * Convert Firestore Timestamp to Date
 */
function convertTimestamps(data: DocumentData): DocumentData {
  const converted = { ...data };
  if (converted.createdAt instanceof Timestamp) {
    converted.createdAt = converted.createdAt.toDate();
  }
  if (converted.updatedAt instanceof Timestamp) {
    converted.updatedAt = converted.updatedAt.toDate();
  }
  return converted;
}

/**
 * Payroll Configuration Service
 */
export const payrollConfigService = {
  /**
   * Get payroll configuration for a tenant
   * Returns null if not found
   */
  async get(tenantId: string): Promise<PayrollConfig | null> {
    try {
      const docRef = getDocRef(tenantId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      const data = convertTimestamps({ id: docSnap.id, ...docSnap.data() });

      // Validate with Zod schema
      const validation = PayrollConfigSchema.safeParse(data);

      if (!validation.success) {
        console.error('Invalid payroll config data:', validation.error);
        return null;
      }

      return validation.data;
    } catch (error) {
      console.error('Error getting payroll config:', error);
      throw new Error('Failed to get payroll configuration');
    }
  },

  /**
   * Check if payroll config exists for a tenant
   */
  async exists(tenantId: string): Promise<boolean> {
    try {
      const docRef = getDocRef(tenantId);
      const docSnap = await getDoc(docRef);
      return docSnap.exists();
    } catch (error) {
      console.error('Error checking payroll config existence:', error);
      return false;
    }
  },

  /**
   * Create or initialize payroll configuration
   */
  async create(input: CreatePayrollConfigInput): Promise<PayrollConfig> {
    try {
      const docRef = getDocRef(input.tenantId);

      // Check if already exists
      const exists = await this.exists(input.tenantId);
      if (exists) {
        throw new Error('Payroll configuration already exists for this tenant');
      }

      const now = new Date();
      const data: PayrollConfig = {
        id: `${input.tenantId}-${SINGLETON_DOC_ID}`,
        ...input,
        createdAt: now,
        updatedAt: now,
      };

      // Validate before saving
      const validation = PayrollConfigSchema.safeParse(data);
      if (!validation.success) {
        console.error('Validation error:', validation.error);
        throw new Error('Invalid payroll configuration data');
      }

      await setDoc(docRef, {
        ...validation.data,
        createdAt: Timestamp.fromDate(validation.data.createdAt),
        updatedAt: Timestamp.fromDate(validation.data.updatedAt),
      });

      return validation.data;
    } catch (error) {
      console.error('Error creating payroll config:', error);
      throw error;
    }
  },

  /**
   * Update payroll configuration
   */
  async update(
    tenantId: string,
    input: UpdatePayrollConfigInput,
    updatedBy?: string
  ): Promise<void> {
    try {
      const docRef = getDocRef(tenantId);

      // Check if exists
      const exists = await this.exists(tenantId);
      if (!exists) {
        throw new Error('Payroll configuration not found');
      }

      const updateData = {
        ...input,
        updatedAt: Timestamp.fromDate(new Date()),
        ...(updatedBy && { updatedBy }),
      };

      await updateDoc(docRef, updateData);
    } catch (error) {
      console.error('Error updating payroll config:', error);
      throw error;
    }
  },

  /**
   * Get or create payroll configuration
   * If not exists, creates with default values
   */
  async getOrCreate(tenantId: string, organizationName: string): Promise<PayrollConfig> {
    try {
      const existing = await this.get(tenantId);
      if (existing) {
        return existing;
      }

      // Create with defaults
      const input: CreatePayrollConfigInput = {
        organizationName,
        tenantId,
        payFrequency: 'monthly',
        payDay: 25,
        currency: 'THB',
        fiscalYearStartMonth: 1,
        overtimeRates: {
          regularDayRate: 1.5,
          weekendRate: 2.0,
          holidayRate: 3.0,
        },
        socialSecurity: {
          enabled: true,
          employeeRate: 5,
          employerRate: 5,
          maxSalaryBase: 15000,
          minContribution: 0,
          maxContribution: 750,
        },
        providentFund: {
          enabled: false,
          defaultEmployeeRate: 3,
          defaultEmployerRate: 3,
          minContributionRate: 2,
          maxContributionRate: 15,
        },
        tax: {
          enabled: true,
          defaultTaxRate: 0,
          useProgressiveTax: true,
        },
        workingDays: {
          standardWorkDaysPerMonth: 22,
          standardWorkHoursPerDay: 8,
          standardWorkHoursPerWeek: 40,
          workingDays: [1, 2, 3, 4, 5],
        },
        defaultAllowances: {
          transportation: 0,
          housing: 0,
          meal: 0,
          position: 0,
        },
        enableAutomaticPayrollGeneration: false,
        payrollLockDaysBefore: 3,
        enablePayslipEmail: true,
      };

      return await this.create(input);
    } catch (error) {
      console.error('Error in getOrCreate:', error);
      throw error;
    }
  },

  /**
   * List all payroll configurations (for admin purposes)
   */
  async listAll(): Promise<PayrollConfig[]> {
    try {
      const snapshot = await getDocs(getCollectionRef());

      const configs: PayrollConfig[] = [];

      for (const docSnap of snapshot.docs) {
        const data = convertTimestamps({ id: docSnap.id, ...docSnap.data() });
        const validation = PayrollConfigSchema.safeParse(data);

        if (validation.success) {
          configs.push(validation.data);
        } else {
          console.warn(`Invalid config for doc ${docSnap.id}:`, validation.error);
        }
      }

      return configs;
    } catch (error) {
      console.error('Error listing payroll configs:', error);
      throw new Error('Failed to list payroll configurations');
    }
  },
};
