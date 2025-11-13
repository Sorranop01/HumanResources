/**
 * Re-export all types from schemas (Single Source of Truth)
 * Following @/standards/10-Single-Source-of-Truth-Zod.md
 */
export type {
  Candidate,
  CandidateApplicationInput,
  CandidateStatus,
  CandidateUpdateInput,
  Education,
  EducationLevel,
  ExperienceLevel,
  WorkExperience,
} from '../schemas';
