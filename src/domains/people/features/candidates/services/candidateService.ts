import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '@/shared/lib/firebase';
import type {
  Candidate,
  CandidateApplicationInput,
  CandidateStatus,
  CandidateUpdateInput,
} from '../schemas';
import { CandidateSchema } from '../schemas';

const CANDIDATES_COLLECTION = 'candidates';

export const candidateKeys = {
  all: ['candidates'] as const,
  lists: () => [...candidateKeys.all, 'list'] as const,
  list: (filters?: { status?: CandidateStatus; position?: string }) =>
    [...candidateKeys.lists(), { filters }] as const,
  details: () => [...candidateKeys.all, 'detail'] as const,
  detail: (id: string) => [...candidateKeys.details(), id] as const,
  stats: () => [...candidateKeys.all, 'stats'] as const,
};

/**
 * Convert Firestore Timestamp to Date (recursively handles nested objects and arrays)
 */
function convertTimestamps(data: unknown): unknown {
  // Handle null or undefined
  if (data === null || data === undefined) {
    return data;
  }

  // Convert Timestamp to Date
  if (data instanceof Timestamp) {
    return data.toDate();
  }

  // Handle arrays - recursively convert each element
  if (Array.isArray(data)) {
    return data.map((item) => convertTimestamps(item));
  }

  // Handle objects - recursively convert each property
  if (typeof data === 'object') {
    const converted: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(data)) {
      converted[key] = convertTimestamps(value);
    }

    return converted;
  }

  // Return primitive values as-is
  return data;
}

/**
 * Convert Firestore document to Candidate with Zod validation
 * ✅ Layer 2: Service Layer Validation
 */
function docToCandidate(id: string, data: any): Candidate | null {
  // Convert all timestamps recursively
  const converted = {
    id,
    ...(convertTimestamps(data) as Record<string, unknown>),
  };

  // ✅ Validate with Zod schema
  const validation = CandidateSchema.safeParse(converted);

  if (!validation.success) {
    console.warn(
      `⚠️ Skipping invalid candidate ${id}:`,
      'Schema validation failed. Check data integrity.'
    );
    if (import.meta.env.DEV) {
      console.error('Validation errors:', validation.error.errors);
    }
    return null;
  }

  return validation.data as Candidate;
}

export const candidateService = {
  async getAll(filters?: { status?: CandidateStatus; position?: string }): Promise<Candidate[]> {
    let q = query(collection(db, CANDIDATES_COLLECTION), orderBy('appliedAt', 'desc'));

    if (filters?.status) {
      q = query(q, where('status', '==', filters.status));
    }
    if (filters?.position) {
      q = query(q, where('positionId', '==', filters.position));
    }

    const snapshot = await getDocs(q);

    // ✅ Use docToCandidate with validation
    const candidates = snapshot.docs
      .map((docSnap) => docToCandidate(docSnap.id, docSnap.data()))
      .filter((candidate): candidate is Candidate => candidate !== null);

    return candidates;
  },

  async getById(id: string): Promise<Candidate | null> {
    const docRef = doc(db, CANDIDATES_COLLECTION, id);
    const snapshot = await getDoc(docRef);

    if (!snapshot.exists()) {
      return null;
    }

    return docToCandidate(snapshot.id, snapshot.data());
  },

  async create(data: CandidateApplicationInput): Promise<string> {
    const docRef = await addDoc(collection(db, CANDIDATES_COLLECTION), {
      ...data,
      status: 'new',
      appliedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      source: 'website',
    });
    return docRef.id;
  },

  async update(id: string, data: CandidateUpdateInput): Promise<void> {
    const docRef = doc(db, CANDIDATES_COLLECTION, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  },

  async delete(id: string): Promise<void> {
    const docRef = doc(db, CANDIDATES_COLLECTION, id);
    await deleteDoc(docRef);
  },

  async getStats(): Promise<{
    total: number;
    new: number;
    screening: number;
    interview: number;
    offer: number;
    hired: number;
    rejected: number;
  }> {
    const snapshot = await getDocs(collection(db, CANDIDATES_COLLECTION));
    const stats = {
      total: 0,
      new: 0,
      screening: 0,
      interview: 0,
      offer: 0,
      hired: 0,
      rejected: 0,
    };

    // ✅ Validate candidates and only count valid ones
    snapshot.forEach((docSnap) => {
      const candidate = docToCandidate(docSnap.id, docSnap.data());
      if (candidate) {
        stats.total++;
        const status = candidate.status;
        if (status in stats) {
          stats[status]++;
        }
      }
    });

    return stats;
  },
};
