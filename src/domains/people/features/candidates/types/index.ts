import type { Timestamp } from 'firebase/firestore';

/**
 * Status of the candidate in the hiring pipeline.
 */
export type CandidateStatus = 'new' | 'screening' | 'interview' | 'offer' | 'hired' | 'rejected';

/**
 * Represents a single candidate document in Firestore.
 */
export interface Candidate {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  positionApplied: string;
  status: CandidateStatus;
  resumeUrl: string | null;
  notes: string;
  appliedAt: Timestamp;
  updatedAt: Timestamp;
}
