/**
 * Debug script to check leave balances data in Firestore emulator
 * Run with: node debug-leave-data.js
 */

import { initializeApp } from 'firebase/app';
import { collection, getDocs, getFirestore, query, where } from 'firebase/firestore';

// Firebase config for emulator
const firebaseConfig = {
  apiKey: 'demo-key',
  authDomain: 'demo-project.firebaseapp.com',
  projectId: 'human-b4c2c',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Connect to emulator
import { connectFirestoreEmulator } from 'firebase/firestore';

connectFirestoreEmulator(db, 'localhost', 8888);

async function debugLeaveData() {
  console.log('🔍 Debugging Leave Balances Data...\n');

  // 1. Check if leaveBalances collection exists and has data
  console.log('1️⃣ Checking leaveBalances collection...');
  try {
    const leaveBalancesSnapshot = await getDocs(collection(db, 'leaveBalances'));
    console.log(`   ✅ Found ${leaveBalancesSnapshot.size} documents in leaveBalances\n`);

    if (leaveBalancesSnapshot.size > 0) {
      console.log('   📋 Sample documents:');
      leaveBalancesSnapshot.docs.slice(0, 3).forEach((doc, index) => {
        const data = doc.data();
        console.log(`   ${index + 1}. ${doc.id}`);
        console.log(`      - employeeId: ${data.employeeId}`);
        console.log(`      - employeeName: ${data.employeeName}`);
        console.log(`      - leaveTypeName: ${data.leaveTypeName}`);
        console.log(`      - totalDays: ${data.totalDays}`);
        console.log(`      - remainingDays: ${data.remainingDays}`);
        console.log(`      - year: ${data.year}`);
        console.log('');
      });
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}\n`);
  }

  // 2. Check employees collection
  console.log('2️⃣ Checking employees collection...');
  try {
    const employeesSnapshot = await getDocs(collection(db, 'employees'));
    console.log(`   ✅ Found ${employeesSnapshot.size} employees\n`);

    if (employeesSnapshot.size > 0) {
      console.log('   👥 Sample employees:');
      employeesSnapshot.docs.slice(0, 3).forEach((doc, index) => {
        const data = doc.data();
        console.log(`   ${index + 1}. ${doc.id}`);
        console.log(`      - name: ${data.firstName} ${data.lastName}`);
        console.log(`      - email: ${data.email}`);
        console.log(`      - userId: ${data.userId || 'N/A'}`);
        console.log('');
      });
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}\n`);
  }

  // 3. Check users collection
  console.log('3️⃣ Checking users collection...');
  try {
    const usersSnapshot = await getDocs(collection(db, 'users'));
    console.log(`   ✅ Found ${usersSnapshot.size} users\n`);

    if (usersSnapshot.size > 0) {
      console.log('   👤 Sample users:');
      usersSnapshot.docs.slice(0, 3).forEach((doc, index) => {
        const data = doc.data();
        console.log(`   ${index + 1}. ${doc.id}`);
        console.log(`      - email: ${data.email}`);
        console.log(`      - employeeId: ${data.employeeId || 'N/A'}`);
        console.log(`      - role: ${data.role}`);
        console.log('');
      });
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}\n`);
  }

  // 4. Test a specific query with first employee
  console.log('4️⃣ Testing query with first employee...');
  try {
    const employeesSnapshot = await getDocs(collection(db, 'employees'));
    if (employeesSnapshot.size > 0) {
      const firstEmployee = employeesSnapshot.docs[0];
      const employeeId = firstEmployee.id;
      const employeeData = firstEmployee.data();

      console.log(`   Testing with employeeId: ${employeeId}`);
      console.log(`   Employee name: ${employeeData.firstName} ${employeeData.lastName}\n`);

      const q = query(collection(db, 'leaveBalances'), where('employeeId', '==', employeeId));
      const results = await getDocs(q);

      console.log(`   ✅ Query returned ${results.size} leave balances\n`);

      if (results.size > 0) {
        console.log('   📊 Leave balances for this employee:');
        results.docs.forEach((doc) => {
          const data = doc.data();
          console.log(`   - ${data.leaveTypeName}: ${data.remainingDays}/${data.totalDays} days`);
        });
      }
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}\n`);
  }

  console.log('\n✅ Debug complete!');
  process.exit(0);
}

debugLeaveData().catch((error) => {
  console.error('❌ Debug failed:', error);
  process.exit(1);
});
