import { onCall } from 'firebase-functions/v2/https';
import { REGION } from '../../config/constants.js';
import { db } from '../../config/firebase.js';
import { verifyAuth } from '../../middleware/auth.js';
import { createInternalError } from '../../utils/errors.js';
import { logError, logInfo } from '../../utils/logger.js';

interface GetEmployeesRequest {
  status?: string;
  department?: string;
  limit?: number;
}

/**
 * Get list of employees
 * Requires authentication
 */
export const getEmployees = onCall(
  {
    region: REGION,
    cors: true,
  },
  async (request) => {
    try {
      // Verify authentication
      const uid = await verifyAuth(request);
      logInfo('getEmployees called', { uid });

      // Get request data
      const { status, department, limit = 100 } = request.data as GetEmployeesRequest;

      // Build query
      let query = db.collection('employees').limit(limit);

      if (status) {
        query = query.where('status', '==', status) as FirebaseFirestore.Query;
      }

      if (department) {
        query = query.where('department', '==', department) as FirebaseFirestore.Query;
      }

      // Execute query
      const snapshot = await query.get();

      const employees = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      logInfo('getEmployees success', { count: employees.length });

      return {
        success: true,
        data: employees,
        total: employees.length,
      };
    } catch (error: unknown) {
      logError('getEmployees failed', error);

      if (error instanceof Error && 'code' in error) {
        throw error; // Re-throw HttpsError
      }

      throw createInternalError('ไม่สามารถดึงข้อมูลพนักงานได้');
    }
  }
);
