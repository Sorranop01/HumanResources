/**
 * Cloud Function: Create Candidate
 * ✅ Layer 3 - Zod Validation at Cloud Function Level
 *
 * Public endpoint for candidate applications (no authentication required)
 */

import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions/v2';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { defineInt } from 'firebase-functions/params';
import { CloudFunctionCreateCandidateSchema } from '@/domains/people/features/candidates/schemas/index.js';

const timeoutSeconds = defineInt('FUNCTION_TIMEOUT_SECONDS');
const db = getFirestore();

/**
 * Create Candidate Function
 * POST /createCandidate
 *
 * Public endpoint - no authentication required
 * Anyone can apply to open positions
 */
export const createCandidate = onCall(
  {
    region: 'asia-southeast1',
    timeoutSeconds: timeoutSeconds.value() || 60,
    cors: true,
  },
  async (request) => {
    const { data } = request;

    logger.info('Create candidate request received');

    // ===== 1. Input Validation with Zod =====
    const validation = CloudFunctionCreateCandidateSchema.safeParse(data);

    if (!validation.success) {
      const errorMessages = validation.error.issues
        .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
        .join(', ');

      logger.error('Zod validation failed', {
        errors: validation.error.issues,
        errorCount: validation.error.issues.length,
      });

      throw new HttpsError(
        'invalid-argument',
        `การตรวจสอบข้อมูลล้มเหลว: ${errorMessages}`,
        validation.error.issues
      );
    }

    // Use validated data (100% type-safe)
    const { candidateData } = validation.data;

    try {
      // ===== 2. Check for duplicate email =====
      const existingQuery = await db
        .collection('candidates')
        .where('email', '==', candidateData.email)
        .limit(1)
        .get();

      if (!existingQuery.empty) {
        throw new HttpsError('already-exists', 'อีเมลนี้เคยสมัครงานแล้ว กรุณาใช้อีเมลอื่น หรือติดต่อ HR');
      }

      // ===== 3. Validate position exists (optional check) =====
      const positionQuery = await db
        .collection('positions')
        .where('title', '==', candidateData.positionApplied)
        .where('isActive', '==', true)
        .limit(1)
        .get();

      if (positionQuery.empty) {
        logger.warn(`Position not found: ${candidateData.positionApplied}`);
        // Don't block - allow application anyway
      }

      // ===== 4. Create candidate record =====
      const now = FieldValue.serverTimestamp();
      const candidateRef = db.collection('candidates').doc();

      const candidateRecord = {
        // Personal Information
        firstName: candidateData.firstName,
        lastName: candidateData.lastName,
        email: candidateData.email,
        phone: candidateData.phone,
        dateOfBirth: candidateData.dateOfBirth || null,
        nationality: candidateData.nationality || null,
        address: candidateData.address || null,

        // Position Information
        positionApplied: candidateData.positionApplied,
        expectedSalary: candidateData.expectedSalary || null,
        availableDate: candidateData.availableDate || null,

        // Experience & Skills
        experienceLevel: candidateData.experienceLevel || null,
        yearsOfExperience: candidateData.yearsOfExperience || null,
        skills: candidateData.skills || [],
        languages: candidateData.languages || [],

        // Education & Experience
        education: candidateData.education || [],
        workExperience: candidateData.workExperience || [],

        // Documents & Links
        resumeUrl: candidateData.resumeUrl || null,
        portfolioUrl: candidateData.portfolioUrl || null,
        linkedInUrl: candidateData.linkedInUrl || null,

        // Application Status
        status: 'new',
        notes: null,
        interviewDate: null,
        interviewer: null,

        // Application Source
        source: 'website',

        // Metadata
        tenantId: 'default',
        appliedAt: now,
        createdAt: now,
        updatedAt: now,
        createdBy: null, // Public application
        updatedBy: null,
      };

      await candidateRef.set(candidateRecord);

      logger.info(`Candidate created successfully: ${candidateRef.id}`, {
        email: candidateData.email,
        position: candidateData.positionApplied,
      });

      // ===== 5. Return success response =====
      return {
        success: true,
        message: 'ส่งใบสมัครเรียบร้อยแล้ว! ทีมงาน HR จะติดต่อกลับภายใน 3-5 วันทำการ',
        data: {
          id: candidateRef.id,
          email: candidateData.email,
          positionApplied: candidateData.positionApplied,
          status: 'new',
        },
      };
    } catch (error) {
      // Re-throw HttpsError
      if (error instanceof HttpsError) {
        throw error;
      }

      logger.error('Failed to create candidate', {
        error,
        email: candidateData.email,
      });

      throw new HttpsError('internal', 'เกิดข้อผิดพลาดในการส่งใบสมัคร กรุณาลองใหม่อีกครั้ง');
    }
  }
);
