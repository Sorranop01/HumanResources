/**
 * Initialize Role Permissions Script
 * Run this script to assign default permissions to roles in Firestore
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

// Role-Permission assignments
const rolePermissions = [
  // ============================================
  // ADMIN - Full access to everything
  // ============================================
  {
    id: 'rp-admin-employees',
    roleId: 'role-admin',
    role: 'admin',
    resource: 'employees',
    permissions: ['read:all', 'create', 'update:all', 'delete'],
    isActive: true,
  },
  {
    id: 'rp-admin-attendance',
    roleId: 'role-admin',
    role: 'admin',
    resource: 'attendance',
    permissions: ['read:all', 'create', 'update:all', 'delete'],
    isActive: true,
  },
  {
    id: 'rp-admin-leave-requests',
    roleId: 'role-admin',
    role: 'admin',
    resource: 'leave-requests',
    permissions: ['read:all', 'create', 'update:all', 'delete'],
    isActive: true,
  },
  {
    id: 'rp-admin-payroll',
    roleId: 'role-admin',
    role: 'admin',
    resource: 'payroll',
    permissions: ['read:all', 'create', 'update:all', 'delete'],
    isActive: true,
  },
  {
    id: 'rp-admin-settings',
    roleId: 'role-admin',
    role: 'admin',
    resource: 'settings',
    permissions: ['read:all', 'create', 'update:all', 'delete'],
    isActive: true,
  },
  {
    id: 'rp-admin-users',
    roleId: 'role-admin',
    role: 'admin',
    resource: 'users',
    permissions: ['read:all', 'create', 'update:all', 'delete'],
    isActive: true,
  },
  {
    id: 'rp-admin-roles',
    roleId: 'role-admin',
    role: 'admin',
    resource: 'roles',
    permissions: ['read:all', 'create', 'update:all', 'delete'],
    isActive: true,
  },
  {
    id: 'rp-admin-audit-logs',
    roleId: 'role-admin',
    role: 'admin',
    resource: 'audit-logs',
    permissions: ['read:all'],
    isActive: true,
  },

  // ============================================
  // HR - Manage employees, attendance, leave, payroll
  // ============================================
  {
    id: 'rp-hr-employees',
    roleId: 'role-hr',
    role: 'hr',
    resource: 'employees',
    permissions: ['read:all', 'create', 'update:all'],
    isActive: true,
  },
  {
    id: 'rp-hr-attendance',
    roleId: 'role-hr',
    role: 'hr',
    resource: 'attendance',
    permissions: ['read:all', 'update:all'],
    isActive: true,
  },
  {
    id: 'rp-hr-leave-requests',
    roleId: 'role-hr',
    role: 'hr',
    resource: 'leave-requests',
    permissions: ['read:all', 'update:all'],
    isActive: true,
  },
  {
    id: 'rp-hr-payroll',
    roleId: 'role-hr',
    role: 'hr',
    resource: 'payroll',
    permissions: ['read:all', 'create', 'update:all'],
    isActive: true,
  },
  {
    id: 'rp-hr-settings',
    roleId: 'role-hr',
    role: 'hr',
    resource: 'settings',
    permissions: ['read:all'],
    isActive: true,
  },
  {
    id: 'rp-hr-users',
    roleId: 'role-hr',
    role: 'hr',
    resource: 'users',
    permissions: ['read:all'],
    isActive: true,
  },
  {
    id: 'rp-hr-roles',
    roleId: 'role-hr',
    role: 'hr',
    resource: 'roles',
    permissions: ['read:all'],
    isActive: true,
  },
  {
    id: 'rp-hr-audit-logs',
    roleId: 'role-hr',
    role: 'hr',
    resource: 'audit-logs',
    permissions: ['read:all'],
    isActive: true,
  },

  // ============================================
  // MANAGER - View employees, manage attendance and leave
  // ============================================
  {
    id: 'rp-manager-employees',
    roleId: 'role-manager',
    role: 'manager',
    resource: 'employees',
    permissions: ['read:all'],
    isActive: true,
  },
  {
    id: 'rp-manager-attendance',
    roleId: 'role-manager',
    role: 'manager',
    resource: 'attendance',
    permissions: ['read:all', 'update:all'],
    isActive: true,
  },
  {
    id: 'rp-manager-leave-requests',
    roleId: 'role-manager',
    role: 'manager',
    resource: 'leave-requests',
    permissions: ['read:all', 'update:all'],
    isActive: true,
  },
  {
    id: 'rp-manager-settings',
    roleId: 'role-manager',
    role: 'manager',
    resource: 'settings',
    permissions: ['read:all'],
    isActive: true,
  },

  // ============================================
  // EMPLOYEE - Own data only
  // ============================================
  {
    id: 'rp-employee-employees',
    roleId: 'role-employee',
    role: 'employee',
    resource: 'employees',
    permissions: ['read:own'],
    isActive: true,
  },
  {
    id: 'rp-employee-attendance',
    roleId: 'role-employee',
    role: 'employee',
    resource: 'attendance',
    permissions: ['read:own', 'create'],
    isActive: true,
  },
  {
    id: 'rp-employee-leave-requests',
    roleId: 'role-employee',
    role: 'employee',
    resource: 'leave-requests',
    permissions: ['read:own', 'create'],
    isActive: true,
  },

  // ============================================
  // AUDITOR - Read-only access to most resources
  // ============================================
  {
    id: 'rp-auditor-employees',
    roleId: 'role-auditor',
    role: 'auditor',
    resource: 'employees',
    permissions: ['read:all'],
    isActive: true,
  },
  {
    id: 'rp-auditor-attendance',
    roleId: 'role-auditor',
    role: 'auditor',
    resource: 'attendance',
    permissions: ['read:all'],
    isActive: true,
  },
  {
    id: 'rp-auditor-leave-requests',
    roleId: 'role-auditor',
    role: 'auditor',
    resource: 'leave-requests',
    permissions: ['read:all'],
    isActive: true,
  },
  {
    id: 'rp-auditor-payroll',
    roleId: 'role-auditor',
    role: 'auditor',
    resource: 'payroll',
    permissions: ['read:all'],
    isActive: true,
  },
  {
    id: 'rp-auditor-audit-logs',
    roleId: 'role-auditor',
    role: 'auditor',
    resource: 'audit-logs',
    permissions: ['read:all'],
    isActive: true,
  },
];

async function initializeRolePermissions() {
  console.log('🚀 Initializing role permissions...\n');

  try {
    for (const rolePerm of rolePermissions) {
      const rolePermRef = doc(db, 'rolePermissions', rolePerm.id);

      await setDoc(rolePermRef, {
        ...rolePerm,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: 'system',
        updatedBy: 'system',
      });

      console.log(
        `✅ Assigned permissions: ${rolePerm.role.toUpperCase()} → ${rolePerm.resource} (${rolePerm.permissions.join(', ')})`
      );
    }

    console.log('\n✨ All role permissions initialized successfully!');
    console.log(
      '\n📊 Summary:\n- Admin: Full access\n- HR: Manage employees, attendance, leave, payroll\n- Manager: View employees, manage attendance and leave\n- Employee: Own data only\n- Auditor: Read-only access'
    );
    process.exit(0);
  } catch (error) {
    console.error('❌ Error initializing role permissions:', error);
    process.exit(1);
  }
}

// Run the script
initializeRolePermissions();
