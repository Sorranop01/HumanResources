# Denormalization Pattern: Role Information in Users

## 📚 Overview

เราใช้ **Denormalization Pattern** สำหรับข้อมูล Role ใน Users เพื่อเพิ่มประสิทธิภาพการอ่านข้อมูล

## 🗂️ Data Structure

### Users Document
```typescript
users / {userId}
  email: "admin@example.com"
  displayName: "ผู้ดูแลระบบ"

  // Role Information (3 Fields)
  role: "admin"              // ✅ Primary: Logic & Security Rules
  roleId: "PN7kF15dAQCb..."  // ✅ Foreign Key: roleDefinitions reference
  roleName: "ผู้ดูแลระบบ"     // ✅ Denormalized: Display name for UI

  isActive: true
  createdAt: Timestamp
  updatedAt: Timestamp
```

### Role Definitions Document
```typescript
roleDefinitions / {roleId}
  role: "admin"
  name: "ผู้ดูแลระบบ"
  description: "มีสิทธิ์เข้าถึงระบบทั้งหมด"
  isActive: true
  isSystemRole: true
```

## 🎯 ทำไมต้อง 3 ฟิลด์?

### 1. `role` (String - Primary Key)
**ใช้สำหรับ:** Logic และ Security Rules

```javascript
// Security Rules (ตรวจสอบเร็ว)
allow read: if request.auth.token.role == 'admin';

// Code Logic
if (user.role === 'admin') {
  // Grant access
}
```

**ข้อดี:**
- ✅ เร็วที่สุด (ไม่ต้อง JOIN)
- ✅ Type-safe
- ✅ ใช้ใน Custom Claims ได้

### 2. `roleId` (String - Foreign Key)
**ใช้สำหรับ:** อ้างอิงความสัมพันธ์

```typescript
// Query users by roleId
const users = await db
  .collection('users')
  .where('roleId', '==', 'PN7kF15dAQCb...')
  .get();

// Update all users when role changes
function onRoleUpdate(roleId: string) {
  // Can find and update all affected users
}
```

**ข้อดี:**
- ✅ ชัดเจนว่าใครใช้ Role ไหน
- ✅ Maintain ง่ายเมื่อ Role เปลี่ยนแปลง
- ✅ Query users by role ได้เร็ว

### 3. `roleName` (String - Denormalized)
**ใช้สำหรับ:** แสดงผลใน UI ทันทีโดยไม่ต้อง JOIN

```typescript
// Display in table WITHOUT extra query
<Table>
  <td>{user.displayName}</td>
  <td>{user.roleName}</td>  {/* ไม่ต้อง fetch roleDefinitions! */}
</Table>
```

**ข้อดี:**
- ✅ แสดงผลเร็วทันทีโดยไม่ต้อง query
- ✅ ลดจำนวน reads (ประหยัดค่าใช้จ่าย)
- ✅ UX ดีขึ้น (ไม่มี loading)

## ⚖️ Trade-offs & Solutions

### ปัญหา: Data Inconsistency
เมื่อเปลี่ยน `name` ใน `roleDefinitions`:
```
roleDefinitions / PN7kF15dAQCb
  name: "ผู้ดูแล" → "ผู้ดูแลระบบ"
```

Users ที่มี `roleName: "ผู้ดูแล"` จะไม่ถูกอัปเดตตามอัตโนมัติ! ❌

### วิธีแก้: Cloud Function Trigger

**ไฟล์:** `functions/src/triggers/roleDefinitionSyncTrigger.ts`

```typescript
export const onRoleDefinitionUpdate = onDocumentUpdated(
  'roleDefinitions/{roleId}',
  async (event) => {
    const beforeName = event.data?.before.data().name;
    const afterName = event.data?.after.data().name;

    // ถ้า name เปลี่ยน → อัปเดตทุก user ที่มี roleId นี้
    if (beforeName !== afterName) {
      const users = await db
        .collection('users')
        .where('roleId', '==', roleId)
        .get();

      // Batch update all users
      const batch = db.batch();
      users.forEach(user => {
        batch.update(user.ref, { roleName: afterName });
      });
      await batch.commit();
    }
  }
);
```

### การทำงาน

1. **ตรวจจับการเปลี่ยนแปลง**
   - Trigger จับได้เมื่อ `roleDefinitions` ถูก update
   - เช็ค `before.name !== after.name`

2. **ค้นหา Users ที่ได้รับผลกระทบ**
   - Query `users` ที่มี `roleId` ตรงกัน
   - ได้ list ของ users ที่ต้องอัปเดต

3. **อัปเดตแบบ Batch**
   - ใช้ Firestore Batch (limit 500 ops/batch)
   - อัปเดต `roleName` ให้เป็นค่าใหม่
   - Commit atomically

## 📊 Performance Comparison

### ❌ Without Denormalization
```typescript
// ต้อง query 2 ครั้ง
const users = await db.collection('users').get();  // 1 read
for (const user of users.docs) {
  const role = await db
    .collection('roleDefinitions')
    .doc(user.roleId)
    .get();  // N reads!

  console.log(`${user.displayName}: ${role.name}`);
}
// Total: 1 + N reads = แพง! 💸
```

### ✅ With Denormalization
```typescript
// query เพียงครั้งเดียว
const users = await db.collection('users').get();  // 1 read
for (const user of users.docs) {
  console.log(`${user.displayName}: ${user.roleName}`);
}
// Total: 1 read = ถูก! ✨
```

**ประหยัด:** (N) reads per page load!

## 🔄 Data Flow

### การสร้าง User ใหม่
```
1. Client → Call createUser({ role: 'admin' })
2. Cloud Function:
   a. Fetch roleDefinitions where role == 'admin'
   b. Get roleId and roleName
   c. Create user with all 3 fields
3. Result: User มีข้อมูล role ครบถ้วน
```

### การแก้ไข Role Name
```
1. Admin แก้ roleDefinitions.name
2. onRoleDefinitionUpdate Trigger:
   a. ตรวจสอบว่า name เปลี่ยนหรือไม่
   b. Query users ที่มี roleId นี้
   c. Batch update roleName ทั้งหมด
3. Result: ข้อมูลใน UI แสดงชื่อใหม่ทันที
```

## 🧪 Testing

### ทดสอบ Sync Mechanism

1. **สร้าง User:**
```bash
pnpm run seed:users
```

2. **ตรวจสอบข้อมูล:**
```typescript
const user = await db.collection('users').doc(userId).get();
console.log(user.data());
// Output:
// {
//   role: 'admin',
//   roleId: 'PN7kF15dAQCb...',
//   roleName: 'ผู้ดูแลระบบ'
// }
```

3. **แก้ไข Role Name:**
```typescript
await db.collection('roleDefinitions').doc(roleId).update({
  name: 'Super Admin'
});
```

4. **ตรวจสอบว่า Sync ทำงาน:**
```typescript
// Wait a moment for trigger to execute
await sleep(2000);

const user = await db.collection('users').doc(userId).get();
console.log(user.data().roleName);
// Output: 'Super Admin' ✅
```

## 📋 Best Practices

### ✅ DO

1. **ใช้ `role` สำหรับ Logic:**
   ```typescript
   if (user.role === 'admin') { ... }
   ```

2. **ใช้ `roleName` สำหรับ Display:**
   ```tsx
   <td>{user.roleName}</td>
   ```

3. **ใช้ `roleId` สำหรับ Query:**
   ```typescript
   where('roleId', '==', roleId)
   ```

### ❌ DON'T

1. **อย่าใช้ `roleName` ใน Logic:**
   ```typescript
   // ❌ Wrong
   if (user.roleName === 'ผู้ดูแลระบบ') { ... }

   // ✅ Correct
   if (user.role === 'admin') { ... }
   ```

2. **อย่า Query roleDefinitions ใน List View:**
   ```typescript
   // ❌ Wrong (N+1 queries)
   users.forEach(async user => {
     const role = await fetchRole(user.roleId);
   });

   // ✅ Correct
   users.forEach(user => {
     console.log(user.roleName);  // Already available
   });
   ```

## 🎓 Summary

| Field | Purpose | Use Case |
|-------|---------|----------|
| `role` | Primary key | Logic, Security Rules, Custom Claims |
| `roleId` | Foreign key | Relationships, Maintenance, Queries |
| `roleName` | Denormalized | UI Display, Performance |

**Trade-off:** เสียค่า write เพิ่มเล็กน้อย (เมื่อแก้ role) แต่ได้ read performance ดีกว่ามาก!

**Consistency:** รักษาด้วย Cloud Function Trigger อัตโนมัติ

**Result:** ⚡ Fast, 💰 Cost-effective, 😊 Better UX
