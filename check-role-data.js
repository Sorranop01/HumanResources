// Quick script to check roleDefinitions data in Firestore Emulator
import admin from 'firebase-admin';

// Initialize with emulator
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';

admin.initializeApp({
  projectId: 'human-b4c2c',
});

const db = admin.firestore();

async function checkRoleData() {
  try {
    console.log('Fetching roleDefinitions from Firestore Emulator...\n');

    const snapshot = await db.collection('roleDefinitions').limit(3).get();

    if (snapshot.empty) {
      console.log('No roleDefinitions found!');
      return;
    }

    snapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`\n=== Document ID: ${doc.id} ===`);
      console.log(`Role: ${data.role}`);
      console.log(`Name: ${data.name}`);
      console.log(`isActive: ${data.isActive}`);
      console.log(`isSystemRole: ${data.isSystemRole}`);

      // Check timestamp types
      console.log(`\ncreatedAt type: ${typeof data.createdAt}`);
      console.log(`createdAt value:`, data.createdAt);

      if (data.createdAt && typeof data.createdAt.toDate === 'function') {
        console.log(`createdAt.toDate():`, data.createdAt.toDate());
      }

      console.log(`\nupdatedAt type: ${typeof data.updatedAt}`);
      console.log(`updatedAt value:`, data.updatedAt);

      if (data.updatedAt && typeof data.updatedAt.toDate === 'function') {
        console.log(`updatedAt.toDate():`, data.updatedAt.toDate());
      }

      console.log('\n' + '='.repeat(50));
    });

    console.log('\n✅ Check complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkRoleData();
