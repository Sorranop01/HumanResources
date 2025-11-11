/**
 * Initialize Role Definitions Script
 * Run this script to create default role definitions in Firestore
 */

import { initializeApp } from 'firebase/app';
import { doc, getFirestore, serverTimestamp, setDoc } from 'firebase/firestore';

// Firebase config (from your .env)
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Default role definitions
const roleDefinitions = [
  {
    id: 'role-admin',
    role: 'admin',
    name: 'ผู้ดูแลระบบ',
    description: 'มีสิทธิ์เต็มในการจัดการระบบทั้งหมด',
    isActive: true,
    isSystemRole: true,
  },
  {
    id: 'role-hr',
    role: 'hr',
    name: 'ฝ่ายทรัพยากรบุคคล',
    description: 'จัดการข้อมูลพนักงาน การลา และเงินเดือน',
    isActive: true,
    isSystemRole: true,
  },
  {
    id: 'role-manager',
    role: 'manager',
    name: 'ผู้จัดการ',
    description: 'อนุมัติการลา ดูข้อมูลทีมงาน และจัดการเวลาทำงาน',
    isActive: true,
    isSystemRole: true,
  },
  {
    id: 'role-employee',
    role: 'employee',
    name: 'พนักงาน',
    description: 'บันทึกเวลาทำงาน ยื่นคำขอลา และดูข้อมูลส่วนตัว',
    isActive: true,
    isSystemRole: true,
  },
  {
    id: 'role-auditor',
    role: 'auditor',
    name: 'ผู้ตรวจสอบ',
    description: 'ดูข้อมูลและ audit logs สำหรับการตรวจสอบ (อ่านอย่างเดียว)',
    isActive: true,
    isSystemRole: true,
  },
];

async function initializeRoleDefinitions() {
  console.log('🚀 Initializing role definitions...\n');

  try {
    for (const roleDef of roleDefinitions) {
      const roleRef = doc(db, 'roleDefinitions', roleDef.id);

      await setDoc(roleRef, {
        ...roleDef,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: 'system',
        updatedBy: 'system',
      });

      console.log(`✅ Created role: ${roleDef.name} (${roleDef.role})`);
    }

    console.log('\n✨ All role definitions initialized successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error initializing roles:', error);
    process.exit(1);
  }
}

// Run the script
initializeRoleDefinitions();
