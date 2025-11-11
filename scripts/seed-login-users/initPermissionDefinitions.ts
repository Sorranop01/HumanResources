/**
 * Initialize Permission Definitions Script
 * Run this script to create default permission definitions in Firestore
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

// Default permission definitions (for each resource)
const permissionDefinitions = [
  {
    id: 'perm-employees',
    resource: 'employees',
    name: 'พนักงาน',
    description: 'จัดการข้อมูลพนักงาน สร้าง แก้ไข และลบข้อมูลพนักงาน',
    permissions: ['read:all', 'read:own', 'create', 'update:all', 'update:own', 'delete'],
    isActive: true,
  },
  {
    id: 'perm-attendance',
    resource: 'attendance',
    name: 'เวลาทำงาน',
    description: 'จัดการข้อมูลเวลาทำงาน บันทึกเวลาเข้า-ออก',
    permissions: ['read:all', 'read:own', 'create', 'update:all', 'update:own', 'delete'],
    isActive: true,
  },
  {
    id: 'perm-leave-requests',
    resource: 'leave-requests',
    name: 'การลา',
    description: 'จัดการคำขอลา ยื่นคำขอ อนุมัติ/ปฏิเสธ',
    permissions: ['read:all', 'read:own', 'create', 'update:all', 'update:own', 'delete'],
    isActive: true,
  },
  {
    id: 'perm-payroll',
    resource: 'payroll',
    name: 'เงินเดือน',
    description: 'จัดการข้อมูลเงินเดือนและการจ่ายเงิน',
    permissions: ['read:all', 'create', 'update:all', 'delete'],
    isActive: true,
  },
  {
    id: 'perm-settings',
    resource: 'settings',
    name: 'การตั้งค่า',
    description: 'จัดการการตั้งค่าระบบ',
    permissions: ['read:all', 'create', 'update:all', 'delete'],
    isActive: true,
  },
  {
    id: 'perm-users',
    resource: 'users',
    name: 'ผู้ใช้งาน',
    description: 'จัดการบัญชีผู้ใช้งานในระบบ',
    permissions: ['read:all', 'create', 'update:all', 'delete'],
    isActive: true,
  },
  {
    id: 'perm-roles',
    resource: 'roles',
    name: 'บทบาท',
    description: 'จัดการบทบาทและสิทธิ์การเข้าถึง',
    permissions: ['read:all', 'create', 'update:all', 'delete'],
    isActive: true,
  },
  {
    id: 'perm-audit-logs',
    resource: 'audit-logs',
    name: 'ประวัติการใช้งาน',
    description: 'ดูประวัติการใช้งานและการเปลี่ยนแปลงในระบบ',
    permissions: ['read:all'],
    isActive: true,
  },
];

async function initializePermissionDefinitions() {
  console.log('🚀 Initializing permission definitions...\n');

  try {
    for (const permDef of permissionDefinitions) {
      const permRef = doc(db, 'permissionDefinitions', permDef.id);

      await setDoc(permRef, {
        ...permDef,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: 'system',
        updatedBy: 'system',
      });

      console.log(`✅ Created permission definition: ${permDef.name} (${permDef.resource})`);
    }

    console.log('\n✨ All permission definitions initialized successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error initializing permission definitions:', error);
    process.exit(1);
  }
}

// Run the script
initializePermissionDefinitions();
