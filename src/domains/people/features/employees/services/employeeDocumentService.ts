/**
 * Employee Document Service
 * Handles upload/delete operations for employee documents
 */

import {
  arrayUnion,
  type DocumentData,
  doc,
  getDoc,
  Timestamp,
  updateDoc,
} from 'firebase/firestore';
import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import type { DocumentRecord, DocumentType } from '@/domains/people/features/employees/types';
import { db, storage } from '@/shared/lib/firebase';

const EMPLOYEE_COLLECTION = 'employees';

export interface UploadEmployeeDocumentInput {
  employeeId: string;
  file: File;
  documentType: DocumentType;
  uploadedBy: string;
  expiryDate?: Date | null;
}

export interface DeleteEmployeeDocumentInput {
  employeeId: string;
  fileURL: string;
}

export const employeeDocumentService = {
  /**
   * Upload document to Firebase Storage and append to employee record
   */
  async upload(input: UploadEmployeeDocumentInput): Promise<DocumentRecord> {
    const { employeeId, file, documentType, uploadedBy, expiryDate } = input;
    const safeFileName = file.name.replace(/\s+/g, '_');
    const timestamp = Date.now();
    const storagePath = `employees/${employeeId}/documents/${timestamp}-${safeFileName}`;
    const storageRef = ref(storage, storagePath);

    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);

    const documentRecord: DocumentRecord = {
      type: documentType,
      fileName: file.name,
      fileURL: downloadURL,
      uploadDate: new Date(),
      uploadedBy,
      storagePath,
      ...(expiryDate ? { expiryDate } : {}),
    };

    const firestoreRecord = {
      ...documentRecord,
      uploadDate: Timestamp.fromDate(documentRecord.uploadDate),
      expiryDate: documentRecord.expiryDate ? Timestamp.fromDate(documentRecord.expiryDate) : null,
    };

    const docRef = doc(db, EMPLOYEE_COLLECTION, employeeId);
    await updateDoc(docRef, {
      documents: arrayUnion(firestoreRecord),
      updatedAt: Timestamp.now(),
    });

    return documentRecord;
  },

  /**
   * Delete document metadata and optionally remove file from storage
   */
  async delete(input: DeleteEmployeeDocumentInput): Promise<void> {
    const { employeeId, fileURL } = input;
    const docRef = doc(db, EMPLOYEE_COLLECTION, employeeId);
    const snapshot = await getDoc(docRef);

    if (!snapshot.exists()) {
      throw new Error('ไม่พบข้อมูลพนักงาน');
    }

    const data = snapshot.data() as DocumentData;
    const currentDocs = (data.documents ?? []) as DocumentRecord[];
    const targetDoc = currentDocs.find((docItem) => docItem.fileURL === fileURL);
    const filteredDocs = currentDocs.filter((docItem) => docItem.fileURL !== fileURL);

    await updateDoc(docRef, {
      documents: filteredDocs,
      updatedAt: Timestamp.now(),
    });

    if (targetDoc?.storagePath) {
      try {
        const storageRef = ref(storage, targetDoc.storagePath);
        await deleteObject(storageRef);
      } catch (storageError) {
        console.warn('ไม่สามารถลบไฟล์ใน Storage ได้', storageError);
      }
    }
  },
};
