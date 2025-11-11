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
} from 'firebase/firestore';
import { db } from '@/shared/lib/firebase';
import type { Candidate, CandidateFormInput } from '../schemas';
import { CandidateSchema } from '../schemas';

const CANDIDATES_COLLECTION = 'candidates';

export const candidateKeys = {
  all: ['candidates'] as const,
  lists: () => [...candidateKeys.all, 'list'] as const,
  list: (filters: string = '') => [...candidateKeys.lists(), { filters }] as const,
  details: () => [...candidateKeys.all, 'detail'] as const,
  detail: (id: string) => [...candidateKeys.details(), id] as const,
};

const convertTimestamps = (data: Record<string, unknown>) => {
  const converted: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value instanceof Timestamp) {
      converted[key] = value.toDate();
    } else {
      converted[key] = value;
    }
  }
  return converted;
};

export const candidateService = {
  async getAll(): Promise<Candidate[]> {
    const q = query(collection(db, CANDIDATES_COLLECTION), orderBy('appliedAt', 'desc'));
    const snapshot = await getDocs(q);
    const candidates: Candidate[] = [];
    snapshot.forEach((doc) => {
      const data = convertTimestamps(doc.data());
      const parseResult = CandidateSchema.safeParse({ id: doc.id, ...data });
      if (parseResult.success) {
        candidates.push(parseResult.data);
      } else {
        console.error('Invalid candidate data:', parseResult.error);
      }
    });
    return candidates;
  },

  async getById(id: string): Promise<Candidate | null> {
    const docRef = doc(db, CANDIDATES_COLLECTION, id);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) {
      return null;
    }
    const data = convertTimestamps(snapshot.data());
    const parseResult = CandidateSchema.safeParse({ id: snapshot.id, ...data });
    if (parseResult.success) {
      return parseResult.data;
    }
    console.error('Invalid candidate data:', parseResult.error);
    return null;
  },

  async create(data: CandidateFormInput): Promise<string> {
    const docRef = await addDoc(collection(db, CANDIDATES_COLLECTION), {
      ...data,
      appliedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  },

  async update(id: string, data: Partial<CandidateFormInput>): Promise<void> {
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
};
