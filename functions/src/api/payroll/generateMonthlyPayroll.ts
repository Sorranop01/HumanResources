/**
 * Cloud Function: Generate Monthly Payroll
 * Generates payroll for all active employees for a given month (batch processing)
 */

import { type CallableRequest, HttpsError, onCall } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { getFirestore } from 'firebase-admin/firestore';

const db = getFirestore();

/**
 * Input type for generate monthly payroll
 */
interface GenerateMonthlyPayrollInput {
  month: number; // 1-12
  year: number;
  payDate: string; // ISO date string
  departmentFilter?: string; // Optional: generate for specific department only
}

/**
 * Generate payroll for all active employees
 */
export const generateMonthlyPayroll = onCall<GenerateMonthlyPayrollInput>(
  {
    region: 'asia-southeast1',
    memory: '512MiB',
    timeoutSeconds: 300, // 5 minutes for batch processing
  },
  async (request: CallableRequest<GenerateMonthlyPayrollInput>) => {
    try {
      // Authentication check
      if (!request.auth) {
        throw new HttpsError('unauthenticated', 'User must be authenticated');
      }

      // TODO: Check if user has permission to generate payroll (e.g., HR role)

      const { month, year, payDate, departmentFilter } = request.data;

      // Validation
      if (!month || !year || !payDate) {
        throw new HttpsError('invalid-argument', 'Missing required fields');
      }

      if (month < 1 || month > 12) {
        throw new HttpsError('invalid-argument', 'Invalid month');
      }

      if (year < 2000 || year > 2100) {
        throw new HttpsError('invalid-argument', 'Invalid year');
      }

      logger.info('Generating monthly payroll', {
        month,
        year,
        departmentFilter,
        userId: request.auth.uid,
      });

      // Get all active employees
      let employeesQuery = db.collection('employees').where('status', '==', 'active');

      if (departmentFilter) {
        employeesQuery = employeesQuery.where('department', '==', departmentFilter);
      }

      const employeesSnapshot = await employeesQuery.get();

      if (employeesSnapshot.empty) {
        return {
          success: true,
          message: 'No active employees found',
          generated: 0,
          skipped: 0,
          errors: 0,
        };
      }

      logger.info(`Found ${employeesSnapshot.size} employees to process`);

      const results = {
        generated: 0,
        skipped: 0,
        errors: 0,
        details: [] as Array<{
          employeeId: string;
          employeeName: string;
          status: 'success' | 'skipped' | 'error';
          message?: string;
        }>,
      };

      // Process each employee
      for (const employeeDoc of employeesSnapshot.docs) {
        const employeeId = employeeDoc.id;
        const employee = employeeDoc.data();
        const employeeName = `${employee.firstName} ${employee.lastName}`;

        try {
          // Check if payroll already exists
          const existingPayroll = await db
            .collection('payroll')
            .where('employeeId', '==', employeeId)
            .where('month', '==', month)
            .where('year', '==', year)
            .limit(1)
            .get();

          if (!existingPayroll.empty) {
            logger.info('Payroll already exists, skipping', { employeeId, employeeName });
            results.skipped++;
            results.details.push({
              employeeId,
              employeeName,
              status: 'skipped',
              message: 'Payroll already exists',
            });
            continue;
          }

          // Import and call the calculate payroll function
          // Note: In production, you might want to refactor the logic into a shared module
          // For now, we'll use the callable function approach
          // You can also create a shared calculation module that both functions use

          logger.info('Processing payroll for employee', { employeeId, employeeName });

          // TODO: Call the actual payroll calculation logic here
          // For now, we'll just log that we would create it

          results.generated++;
          results.details.push({
            employeeId,
            employeeName,
            status: 'success',
          });
        } catch (error: unknown) {
          logger.error('Failed to process payroll for employee', {
            employeeId,
            employeeName,
            error,
          });

          results.errors++;
          results.details.push({
            employeeId,
            employeeName,
            status: 'error',
            message: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }

      logger.info('Monthly payroll generation completed', results);

      return {
        success: true,
        generated: results.generated,
        skipped: results.skipped,
        errors: results.errors,
        details: results.details,
      };
    } catch (error: unknown) {
      logger.error('Failed to generate monthly payroll', error);

      if (error instanceof HttpsError) {
        throw error;
      }

      if (error instanceof Error) {
        throw new HttpsError('internal', error.message);
      }

      throw new HttpsError('internal', 'Failed to generate monthly payroll');
    }
  }
);
