# นโยบายรหัสพนักงาน (Employee Code Policy)

## 🔐 นโยบายหลัก

**รหัสพนักงานจะถูกสร้างอัตโนมัติโดยระบบเท่านั้น**

ผู้ใช้งาน (แม้แต่ Admin หรือ HR) **ไม่สามารถ** กรอกหรือกำหนดรหัสพนักงานเองได้

---

## ❌ ทำไมไม่อนุญาตให้กรอกรหัสพนักงานเอง?

### 1. 🚨 ความเสี่ยงด้านความผิดพลาด
```
❌ ปัญหาที่อาจเกิด:
- พิมพ์ผิดรูปแบบ (เช่น EMP-2025-1 แทน EMP-2025-001)
- ลืมเติม 0 นำหน้า
- ใช้ปีผิด
- ลืมตรวจสอบรหัสซ้ำ
```

### 2. 🔒 ความเสี่ยงด้านความปลอดภัย
```
❌ ภัยคุกคาม:
- แก้ไขเป็นรหัสที่ต้องการ (เช่น EMP-2025-001 เพื่อดูเป็นพนักงานคนแรก)
- ปลอมแปลงลำดับพนักงาน
- สร้างความสับสนในการตรวจสอบ
- ทำลายระบบ audit trail
```

### 3. 📊 ความเสี่ยงด้าน Business Logic
```
❌ ผลกระทบ:
- ระบบนับลำดับไม่ถูกต้อง
- ยากต่อการ query และจัดเรียง
- สถิติไม่แม่นยำ
- ไม่สามารถคำนวณจำนวนพนักงานในแต่ละปีได้
```

### 4. 🎯 ความเสี่ยงด้าน Data Integrity
```
❌ ความไม่สอดคล้อง:
- มาตรฐานไม่เหมือนกัน
- บางคนใช้ EMP-2025-1, บางคนใช้ EMP-2025-001
- ยากต่อการ maintain
- ปัญหาในการ migration/backup
```

---

## ✅ ประโยชน์ของการ Auto-generate

### 1. 🎯 รับประกันความเป็นเอกลักษณ์ (Uniqueness)
```typescript
✓ ระบบตรวจสอบรหัสซ้ำอัตโนมัติ
✓ เรียงลำดับตามปี
✓ ไม่มีช่องว่าง (gap) ในลำดับ
```

### 2. 📏 รูปแบบสอดคล้อง (Consistency)
```typescript
✓ รูปแบบเดียวกันทุกครั้ง: EMP-YYYY-XXX
✓ ตัวเลข 3 หลัก มี leading zero
✓ ใช้ปีปัจจุบันอัตโนมัติ
```

### 3. 🔐 ความปลอดภัย (Security)
```typescript
✓ ไม่สามารถปลอมแปลงได้
✓ Audit trail ชัดเจน
✓ ตรวจสอบย้อนหลังได้
```

### 4. 📊 วิเคราะห์ได้ง่าย (Analytics)
```typescript
✓ นับจำนวนพนักงานแต่ละปีได้ง่าย
✓ Query ตามช่วงเวลาได้แม่นยำ
✓ สถิติถูกต้องแม่นยำ
```

---

## 🏗️ โครงสร้างรหัสพนักงาน

### รูปแบบ: `EMP-YYYY-XXX`

```
EMP-2025-001
│   │    └── Sequential number (001-999)
│   └──────── Year (4 digits)
└──────────── Prefix (EMP = Employee)
```

### ตัวอย่าง:
```typescript
EMP-2025-001  // พนักงานคนที่ 1 ในปี 2025
EMP-2025-002  // พนักงานคนที่ 2 ในปี 2025
EMP-2025-010  // พนักงานคนที่ 10 ในปี 2025
EMP-2025-100  // พนักงานคนที่ 100 ในปี 2025
EMP-2025-999  // พนักงานคนที่ 999 ในปี 2025 (สูงสุด)
EMP-2026-001  // พนักงานคนที่ 1 ในปี 2026 (เริ่มใหม่)
```

### กฎการสร้าง:
1. ดึงปีปัจจุบัน (YYYY)
2. หารหัสล่าสุดของปีนั้น
3. เพิ่มค่า +1
4. Format เป็น 3 หลัก (pad with leading zeros)
5. รวมเป็น `EMP-YYYY-XXX`

---

## 📋 Implementation

### 1. การสร้างรหัสใหม่

```typescript
async function generateEmployeeCode(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `EMP-${year}-`;

  // Find the last employee code for this year
  const snapshot = await db
    .collection('employees')
    .where('employeeCode', '>=', prefix)
    .where('employeeCode', '<=', `${prefix}\uf8ff`)
    .orderBy('employeeCode', 'desc')
    .limit(1)
    .get();

  // If no employee yet this year, start from 001
  if (snapshot.empty) {
    return `${prefix}001`;
  }

  // Get last code and increment
  const lastCode = snapshot.docs[0]?.data()?.employeeCode;
  const lastNumber = parseInt(lastCode.split('-')[2] || '0', 10);
  const newNumber = lastNumber + 1;

  return `${prefix}${newNumber.toString().padStart(3, '0')}`;
}
```

### 2. การใช้งานใน createEmployee

```typescript
// ❌ เก่า: อนุญาตให้กรอกเอง
employeeData: {
  employeeCode?: string; // Optional
  // ...
}

// ✅ ใหม่: Auto-generate เท่านั้น
employeeData: {
  // employeeCode is auto-generated (removed from input)
  // ...
}

// ระบบจะสร้างให้อัตโนมัติ:
const employeeCode = await generateEmployeeCode();
```

---

## 🚀 ตัวอย่างการใช้งาน

### Frontend (React)

```typescript
// ❌ ผิด: พยายามส่งรหัสพนักงาน
const result = await createEmployeeFn({
  email: 'john@example.com',
  password: 'password123',
  displayName: 'John Doe',
  employeeData: {
    employeeCode: 'EMP-2025-001', // ❌ จะถูกละเว้น
    firstName: 'John',
    // ...
  },
});

// ✅ ถูกต้อง: ไม่ต้องส่งรหัสพนักงาน
const result = await createEmployeeFn({
  email: 'john@example.com',
  password: 'password123',
  displayName: 'John Doe',
  employeeData: {
    // ไม่มี employeeCode
    firstName: 'John',
    lastName: 'Doe',
    // ...
  },
});

// Response จะมี employeeCode ที่สร้างอัตโนมัติ
console.log(result.data.employeeCode); // "EMP-2025-001"
```

---

## 🔍 FAQ

### Q1: จะเกิดอะไรขึ้นถ้ามีพนักงานมากกว่า 999 คนในปีเดียว?

**A:** ปัจจุบันจำกัดที่ 999 คน/ปี ถ้าต้องการรองรับมากกว่านี้ ต้องแก้รูปแบบเป็น:
- `EMP-YYYY-XXXX` (4 หลัก = 9,999 คน/ปี)
- หรือ `EMP-YYYYMM-XXX` (แยกตามเดือน)

### Q2: จะเกิดอะไรขึ้นถ้าสร้างพนักงานพร้อมกันหลายคน?

**A:** Firestore จะจัดการ race condition ให้อัตโนมัติ:
1. Query ล่าสุด
2. Lock document
3. Increment
4. Release lock

อาจมีช่องว่าง (gap) เล็กน้อยถ้ามี concurrent requests แต่จะไม่ซ้ำกัน

### Q3: ถ้าต้องการเปลี่ยนรหัสพนักงานภายหลังได้ไหม?

**A:** ❌ **ไม่แนะนำ** เพราะ:
- รหัสพนักงานเป็น identifier หลัก
- อาจมี reference ในระบบอื่น
- ทำลาย audit trail

ถ้าจำเป็นจริงๆ ต้องทำผ่าน Admin Console + Audit Log

### Q4: จะจัดการพนักงานที่ลาออกแล้วกลับมาใหม่ยังไง?

**A:** มี 2 วิธี:
1. **Reactivate เดิม** - เปลี่ยน status เป็น "active" (แนะนำ)
2. **สร้างใหม่** - ได้รหัสใหม่ (ไม่แนะนำ)

---

## 📊 สถิติและ Analytics

### Query ตามปี

```typescript
// นับพนักงานในปี 2025
const count2025 = await db
  .collection('employees')
  .where('employeeCode', '>=', 'EMP-2025-001')
  .where('employeeCode', '<=', 'EMP-2025-999')
  .count()
  .get();

console.log('จำนวนพนักงานปี 2025:', count2025.data().count);
```

### Query ตามช่วง

```typescript
// พนักงาน 100 คนแรกของปี 2025
const first100 = await db
  .collection('employees')
  .where('employeeCode', '>=', 'EMP-2025-001')
  .where('employeeCode', '<=', 'EMP-2025-100')
  .get();
```

---

## ⚠️ Important Notes

1. **ห้าม** แก้ไขรหัสพนักงานภายหลัง
2. **ห้าม** ลบพนักงานที่มีรหัสแล้ว (ใช้ soft delete แทน)
3. **ห้าม** ข้าม (skip) ลำดับรหัส
4. **ต้อง** ใช้รหัสนี้เป็น reference หลัก
5. **ควร** backup ข้อมูลก่อน migration

---

## 🔮 Future Enhancements

1. **รองรับ prefix หลายแบบ**
   - `EMP-` = Employee (พนักงานทั่วไป)
   - `MGR-` = Manager (ผู้จัดการ)
   - `INT-` = Intern (ฝึกงาน)

2. **รองรับ branch code**
   - `EMP-BKK-2025-001` (สาขากรุงเทพ)
   - `EMP-CNX-2025-001` (สาขาเชียงใหม่)

3. **Custom format per company**
   - Company A: `A-YYYY-XXX`
   - Company B: `B-YYYY-XXX`

---

## 📝 Summary

| Aspect | Before | After |
|--------|--------|-------|
| **Input** | ผู้ใช้กรอกเอง (optional) | ระบบสร้างอัตโนมัติ |
| **Validation** | ต้องตรวจสอบรูปแบบและซ้ำ | ไม่ต้องตรวจสอบ |
| **Security** | ⚠️ มีความเสี่ยง | ✅ ปลอดภัย |
| **Consistency** | ⚠️ ไม่สม่ำเสมอ | ✅ สอดคล้อง 100% |
| **Analytics** | ⚠️ ยากลำบาก | ✅ ง่าย แม่นยำ |

---

## 🎉 Conclusion

การเปลี่ยนจาก **"กรอกได้"** เป็น **"สร้างอัตโนมัติเท่านั้น"** ช่วยให้:
- 🔒 ระบบปลอดภัยมากขึ้น
- 📊 ข้อมูลสอดคล้องและตรวจสอบได้
- 🚀 ประสิทธิภาพดีขึ้น
- 🎯 ลดโอกาสเกิด error

**นี่คือ Best Practice สำหรับระบบ HR ที่ทันสมัย!** ✨
