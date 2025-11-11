/**
 * Social Security Service
 * Business logic and data operations for social security management
 */

import {
  collection,
  type DocumentData,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '@/shared/lib/firebase';
import type {
  CreateSocialSecurityInput,
  SocialSecurity,
  SocialSecurityContribution,
  SocialSecurityFilters,
  UpdateSocialSecurityInput,
} from '../types';

const COLLECTION_NAME = 'socialSecurity';
const MAX_SS_BASE = 15000; // ฐานเงินเดือนสูงสุดสำหรับประกันสังคม (บาท)

/**
 * Convert Firestore document to SocialSecurity type
 */
function docToSocialSecurity(id: string, data: DocumentData): SocialSecurity {
  return {
    id,
    employeeId: data.employeeId,
    employeeName: data.employeeName,
    employeeCode: data.employeeCode,
    socialSecurityNumber: data.socialSecurityNumber,
    registrationDate: data.registrationDate.toDate(),
    status: data.status,
    hospitalName: data.hospitalName,
    hospitalCode: data.hospitalCode,
    employeeContributionRate: data.employeeContributionRate,
    employerContributionRate: data.employerContributionRate,
    contributionBase: data.contributionBase,
    employeeAmount: data.employeeAmount,
    employerAmount: data.employerAmount,
    totalAmount: data.totalAmount,
    totalEmployeeContribution: data.totalEmployeeContribution,
    totalEmployerContribution: data.totalEmployerContribution,
    totalContribution: data.totalContribution,
    notes: data.notes,
    lastContributionDate: data.lastContributionDate?.toDate(),
    tenantId: data.tenantId,
    createdAt: data.createdAt.toDate(),
    updatedAt: data.updatedAt.toDate(),
  };
}

export const socialSecurityService = {
  /**
   * Get social security by employee ID
   */
  async getByEmployeeId(employeeId: string): Promise<SocialSecurity | null> {
    try {
      const q = query(collection(db, COLLECTION_NAME), where('employeeId', '==', employeeId));
      const snapshot = await getDocs(q);

      if (snapshot.empty) return null;

      const docSnap = snapshot.docs[0];
      return docToSocialSecurity(docSnap.id, docSnap.data());
    } catch (error) {
      console.error('Failed to fetch social security by employee ID', error);
      throw new Error('ไม่สามารถดึงข้อมูลประกันสังคมได้');
    }
  },

  /**
   * Get social security by ID
   */
  async getById(id: string): Promise<SocialSecurity | null> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap || !docSnap.exists()) return null;

      return docToSocialSecurity(docSnap.id, docSnap.data());
    } catch (error) {
      console.error('Failed to fetch social security by ID', error);
      throw new Error('ไม่สามารถดึงข้อมูลประกันสังคมได้');
    }
  },

  /**
   * Get all social security records
   */
  async getAll(filters?: SocialSecurityFilters): Promise<SocialSecurity[]> {
    try {
      let q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));

      if (filters?.status) {
        q = query(q, where('status', '==', filters.status));
      }

      if (filters?.employeeId) {
        q = query(q, where('employeeId', '==', filters.employeeId));
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => docToSocialSecurity(doc.id, doc.data()));
    } catch (error) {
      console.error('Failed to fetch social security records', error);
      throw new Error('ไม่สามารถดึงข้อมูลประกันสังคมได้');
    }
  },

  /**
   * Create social security record
   */
  async create(
    input: CreateSocialSecurityInput,
    employee: { name: string; code: string; salary: number }
  ): Promise<string> {
    try {
      const docRef = doc(collection(db, COLLECTION_NAME));

      const contributionBase = Math.min(employee.salary, MAX_SS_BASE);
      const employeeRate = input.employeeContributionRate ?? 0.05;
      const employerRate = input.employerContributionRate ?? 0.05;

      const employeeAmount = contributionBase * employeeRate;
      const employerAmount = contributionBase * employerRate;

      await setDoc(docRef, {
        employeeId: input.employeeId,
        employeeName: employee.name,
        employeeCode: employee.code,
        socialSecurityNumber: input.socialSecurityNumber,
        registrationDate: Timestamp.fromDate(input.registrationDate),
        status: 'active',
        hospitalName: input.hospitalName,
        hospitalCode: input.hospitalCode ?? null,
        employeeContributionRate: employeeRate,
        employerContributionRate: employerRate,
        contributionBase,
        employeeAmount,
        employerAmount,
        totalAmount: employeeAmount + employerAmount,
        totalEmployeeContribution: 0,
        totalEmployerContribution: 0,
        totalContribution: 0,
        notes: input.notes ?? null,
        lastContributionDate: null,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        tenantId: 'default',
      });

      return docRef.id;
    } catch (error) {
      console.error('Failed to create social security', error);
      throw new Error('ไม่สามารถสร้างข้อมูลประกันสังคมได้');
    }
  },

  /**
   * Update social security
   */
  async update(id: string, input: UpdateSocialSecurityInput): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);

      const updateData: Record<string, unknown> = {
        updatedAt: Timestamp.now(),
      };

      if (input.hospitalName !== undefined) {
        updateData.hospitalName = input.hospitalName;
      }
      if (input.hospitalCode !== undefined) {
        updateData.hospitalCode = input.hospitalCode;
      }
      if (input.status !== undefined) {
        updateData.status = input.status;
      }
      if (input.employeeContributionRate !== undefined) {
        updateData.employeeContributionRate = input.employeeContributionRate;
      }
      if (input.employerContributionRate !== undefined) {
        updateData.employerContributionRate = input.employerContributionRate;
      }
      if (input.notes !== undefined) {
        updateData.notes = input.notes;
      }

      await updateDoc(docRef, updateData);
    } catch (error) {
      console.error('Failed to update social security', error);
      throw new Error('ไม่สามารถอัปเดตข้อมูลประกันสังคมได้');
    }
  },

  /**
   * Delete social security
   */
  async delete(id: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Failed to delete social security', error);
      throw new Error('ไม่สามารถลบข้อมูลประกันสังคมได้');
    }
  },

  /**
   * Calculate contribution amounts
   */
  calculateContribution(
    baseSalary: number,
    employeeRate = 0.05,
    employerRate = 0.05
  ): {
    contributionBase: number;
    employeeAmount: number;
    employerAmount: number;
    totalAmount: number;
  } {
    const base = Math.min(baseSalary, MAX_SS_BASE);
    const employeeAmount = Math.round(base * employeeRate * 100) / 100;
    const employerAmount = Math.round(base * employerRate * 100) / 100;

    return {
      contributionBase: base,
      employeeAmount,
      employerAmount,
      totalAmount: employeeAmount + employerAmount,
    };
  },

  /**
   * Check if employee has social security record
   */
  async hasRecord(employeeId: string): Promise<boolean> {
    try {
      const record = await this.getByEmployeeId(employeeId);
      return record !== null;
    } catch (_error) {
      return false;
    }
  },

  /**
   * Update contribution totals (called when a contribution is recorded)
   */
  async updateContributionTotals(
    id: string,
    employeeAmount: number,
    employerAmount: number
  ): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap || !docSnap.exists()) {
        throw new Error('Social security record not found');
      }

      const current = docSnap.data();

      await updateDoc(docRef, {
        totalEmployeeContribution: current.totalEmployeeContribution + employeeAmount,
        totalEmployerContribution: current.totalEmployerContribution + employerAmount,
        totalContribution: current.totalContribution + employeeAmount + employerAmount,
        lastContributionDate: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Failed to update contribution totals', error);
      throw new Error('ไม่สามารถอัปเดตยอดสะสมประกันสังคมได้');
    }
  },

  /**
   * Get contributions history for a social security record
   */
  async getContributions(socialSecurityId: string): Promise<SocialSecurityContribution[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME, socialSecurityId, 'contributions'),
        orderBy('year', 'desc'),
        orderBy('month', 'desc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          socialSecurityId,
          payrollId: data.payrollId,
          month: data.month,
          year: data.year,
          contributionDate: data.contributionDate.toDate(),
          contributionBase: data.contributionBase,
          employeeAmount: data.employeeAmount,
          employerAmount: data.employerAmount,
          totalAmount: data.totalAmount,
          status: data.status,
          paidAt: data.paidAt?.toDate(),
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
        } as SocialSecurityContribution;
      });
    } catch (error) {
      console.error('Failed to fetch contributions', error);
      throw new Error('ไม่สามารถดึงข้อมูลประวัติการจ่ายได้');
    }
  },
};
