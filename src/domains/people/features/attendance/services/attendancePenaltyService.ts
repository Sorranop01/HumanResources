import { doc, getDoc, updateDoc } from 'firebase/firestore';
import type {
  AttendancePenalty,
  AttendanceRecord,
} from '@/domains/people/features/attendance/types';
import { penaltyPolicyService } from '@/domains/system/features/policies/services/penaltyPolicyService';
import type { PenaltyCalculationInput } from '@/domains/system/features/policies/types/penaltyPolicy';
import { db } from '@/shared/lib/firebase';

const ATTENDANCE_COLLECTION = 'attendance';
const TENANT_ID = 'default';

const withEmployeeSalary = (
  input: PenaltyCalculationInput,
  baseSalary?: number
): PenaltyCalculationInput =>
  baseSalary === undefined ? input : { ...input, employeeSalary: baseSalary };

/**
 * Service for calculating and applying penalties to attendance records
 */
export const attendancePenaltyService = {
  /**
   * Calculate and apply penalties for a completed attendance record
   */
  async calculateAndApplyPenalties(
    record: AttendanceRecord,
    employeeData: {
      employeeId: string;
      departmentId?: string;
      positionId?: string;
      employmentType?: string;
      baseSalary?: number;
    }
  ): Promise<AttendancePenalty[]> {
    try {
      const penalties: AttendancePenalty[] = [];

      // Get all active penalty policies
      const filters: {
        isActive?: boolean;
        department?: string;
        position?: string;
        employmentType?: string;
      } = {
        isActive: true,
      };

      if (employeeData.departmentId) {
        filters.department = employeeData.departmentId;
      }
      if (employeeData.positionId) {
        filters.position = employeeData.positionId;
      }
      if (employeeData.employmentType) {
        filters.employmentType = employeeData.employmentType;
      }

      const policies = await penaltyPolicyService.getAll(TENANT_ID, filters);

      // Calculate late penalty
      if (record.isLate && !record.isExcusedLate && record.minutesLate > 0) {
        const latePolicies = policies.filter((p) => p.type === 'late' && p.autoApply);

        for (const policy of latePolicies) {
          // Check if threshold is met
          if (policy.threshold?.minutes && record.minutesLate < policy.threshold.minutes) {
            continue;
          }

          const penaltyResult = await penaltyPolicyService.calculatePenaltyWithPolicy(
            policy,
            withEmployeeSalary(
              {
                policyId: policy.id,
                employeeId: employeeData.employeeId,
                date: new Date(record.date),
                violationType: 'late',
                minutesLate: record.minutesLate,
              },
              employeeData.baseSalary
            )
          );

          if (penaltyResult.amount > 0) {
            penalties.push({
              policyId: policy.id,
              type: 'late',
              amount: penaltyResult.amount,
              description: `สายงาน ${record.minutesLate} นาที - ${policy.name}`,
            });
          }
        }
      }

      // Calculate early leave penalty
      if (record.isEarlyLeave && !record.isApprovedEarlyLeave && record.minutesEarly > 0) {
        const earlyLeavePolicies = policies.filter((p) => p.type === 'early-leave' && p.autoApply);

        for (const policy of earlyLeavePolicies) {
          // Check if threshold is met
          if (policy.threshold?.minutes && record.minutesEarly < policy.threshold.minutes) {
            continue;
          }

          const penaltyResult = await penaltyPolicyService.calculatePenaltyWithPolicy(
            policy,
            withEmployeeSalary(
              {
                policyId: policy.id,
                employeeId: employeeData.employeeId,
                date: new Date(record.date),
                violationType: 'early-leave',
                minutesLate: record.minutesEarly,
              },
              employeeData.baseSalary
            )
          );

          if (penaltyResult.amount > 0) {
            penalties.push({
              policyId: policy.id,
              type: 'early-leave',
              amount: penaltyResult.amount,
              description: `ออกงานก่อนเวลา ${record.minutesEarly} นาที - ${policy.name}`,
            });
          }
        }
      }

      // Calculate missed clock-out penalty
      if (record.isMissedClockOut) {
        const missedClockOutPolicies = policies.filter(
          (p) => p.type === 'no-clock-out' && p.autoApply
        );

        for (const policy of missedClockOutPolicies) {
          const penaltyResult = await penaltyPolicyService.calculatePenaltyWithPolicy(
            policy,
            withEmployeeSalary(
              {
                policyId: policy.id,
                employeeId: employeeData.employeeId,
                date: new Date(record.date),
                violationType: 'no-clock-out',
              },
              employeeData.baseSalary
            )
          );

          if (penaltyResult.amount > 0) {
            penalties.push({
              policyId: policy.id,
              type: 'no-clock-out',
              amount: penaltyResult.amount,
              description: `ไม่ลงเวลาออกงาน - ${policy.name}`,
            });
          }
        }
      }

      // Update attendance record with penalties
      if (penalties.length > 0 && record.id) {
        await updateDoc(doc(db, ATTENDANCE_COLLECTION, record.id), {
          penaltiesApplied: penalties,
        });
      }

      return penalties;
    } catch (error) {
      console.error('Failed to calculate penalties', error);
      throw new Error('ไม่สามารถคำนวณค่าปรับได้');
    }
  },

  /**
   * Manually add penalty to attendance record
   */
  async addManualPenalty(recordId: string, penalty: AttendancePenalty): Promise<void> {
    try {
      const docRef = doc(db, ATTENDANCE_COLLECTION, recordId);

      // Get existing record to merge penalties
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        throw new Error('Attendance record not found');
      }

      const existingRecord = docSnap.data() as AttendanceRecord;
      const existingPenalties = existingRecord?.penaltiesApplied || [];

      await updateDoc(docRef, {
        penaltiesApplied: [...existingPenalties, penalty],
      });
    } catch (error) {
      console.error('Failed to add manual penalty', error);
      throw new Error('ไม่สามารถเพิ่มค่าปรับได้');
    }
  },

  /**
   * Remove penalty from attendance record
   */
  async removePenalty(recordId: string, policyId: string): Promise<void> {
    try {
      const docRef = doc(db, ATTENDANCE_COLLECTION, recordId);

      // Get existing record to filter penalties
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        throw new Error('Attendance record not found');
      }

      const existingRecord = docSnap.data() as AttendanceRecord;
      const existingPenalties = existingRecord?.penaltiesApplied || [];

      const updatedPenalties = existingPenalties.filter((p) => p.policyId !== policyId);

      await updateDoc(docRef, {
        penaltiesApplied: updatedPenalties,
      });
    } catch (error) {
      console.error('Failed to remove penalty', error);
      throw new Error('ไม่สามารถลบค่าปรับได้');
    }
  },

  /**
   * Calculate total penalty amount for a record
   */
  calculateTotalPenalty(penalties: AttendancePenalty[]): number {
    return penalties.reduce((sum, p) => sum + p.amount, 0);
  },

  /**
   * Get penalty summary for an employee in a date range
   */
  async getPenaltySummary(
    _employeeId: string,
    _startDate: string,
    _endDate: string
  ): Promise<{
    totalAmount: number;
    lateCount: number;
    earlyLeaveCount: number;
    absenceCount: number;
    noClockOutCount: number;
    details: Array<{
      date: string;
      type: string;
      amount: number;
      description: string;
    }>;
  }> {
    try {
      // TODO: This would typically query attendance records with penalties
      // For now, return a placeholder structure
      return {
        totalAmount: 0,
        lateCount: 0,
        earlyLeaveCount: 0,
        absenceCount: 0,
        noClockOutCount: 0,
        details: [],
      };
    } catch (error) {
      console.error('Failed to get penalty summary', error);
      throw new Error('ไม่สามารถดึงข้อมูลสรุปค่าปรับได้');
    }
  },
};
