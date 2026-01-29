# Flow ระบบ Shopping Price (แบบคร่าวๆ)

## ภาพรวม

แอป **Shopping Price** เป็นเว็บแอป React สำหรับติดตามราคาสินค้า เปรียบเทียบราคาจากหลายร้าน (เช่น Lotus, Makro, Big C) มีระบบล็อกอิน รายการโปรด รายการซื้อของ (My Lists) และเปรียบเทียบราคา

---

## 1. โครงสร้างหลัก (Tech Stack)

```
┌─────────────────────────────────────────────────────────────┐
│  Frontend: React + Vite + React Router                       │
│  Auth: Firebase Auth (Email/Password + Google OAuth)         │
│  DB: Firestore                                               │
│  Storage: Firebase Storage + Cloudinary (รูปโปรไฟล์)          │
│  ข้อมูลสินค้า: JSON / JSONL (public/data, src/data)          │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Flow การเข้าสู่ระบบ (Auth)

```
[ผู้ใช้เปิดเว็บ]
       │
       ▼
┌──────────────┐     ไม่ล็อกอิน      ┌─────────────────┐
│  หน้าแรก /   │ ◄─────────────────► │  Login /        │
│  หน้าอื่นๆ   │     กด Login        │  Register       │
└──────────────┘                     └────────┬────────┘
       │                                            │
       │ ล็อกอินแล้ว                                │ ลืมรหัส
       ▼                                            ▼
  Firebase Auth                            Forgot Password
  (onAuthStateChanged)                     → Reset Password
       │
       ▼
  โหลดข้อมูล user จาก Firestore (favorites, profile ฯลฯ)
```

- **Guest (ไม่ล็อกอิน):** รายการโปรดเก็บใน **LocalStorage**
- **ล็อกอินแล้ว:** รายการโปรด / My Lists อ่าน-เขียนผ่าน **Firestore** (users/{uid}, shopping_lists)

---

## 3. Flow หน้าหลัก (Home)

```
[Home]
   │
   ├── โหลดสินค้าแนะนำจาก public/data (home_products, categories)
   │
   ├── แสดง ProductSection (สไลด์สินค้า)
   │      ├── กด ♥ → เพิ่ม/ลบ Favorites (Context → Firestore หรือ LocalStorage)
   │      └── กด "เพิ่มลง My List" → เปิด AddToListModal
   │
   ├── AddToListModal
   │      ├── ไม่ล็อกอิน → เปิด AuthRequiredModal
   │      └── ล็อกอินแล้ว → เลือก List มีอยู่ หรือ สร้างใหม่ → เพิ่มสินค้าลง List
   │
   └── ลิงก์ไป Categories / Products / My Lists / Profile / Favorites
```

---

## 4. Flow สินค้า & หมวดหมู่

```
[Categories]                    [Products]
     │                               │
     │ เลือกหมวดหมู่                 │ รับ state (selectedCategory) หรือจาก URL
     ▼                               ▼
  แสดงหมวด (จาก categories_index,   โหลดสินค้าจาก public/data (ตาม category)
  categoryMap)                            │
     │                                     ├── กรอง: ทั้งหมด / โปรด / แนะนำ / ยอดนิยม / โปรโมชั่น
     └──────────► ไป /products พร้อม state ├── ค้นหา (search) → ใช้ fullSearchIndex (JSONL)
                                           ├── เพิ่มโปรด (FavoritesContext)
                                           └── เพิ่มลง List (AddToListModal)
```

- ข้อมูลสินค้าอยู่ที่ `public/data/` (categories, all_retailers_products_merged_v1.jsonl ฯลฯ)
- Products ใช้ทั้ง category และ full-text search ผ่าน index

---

## 5. Flow รายการซื้อของ (My Lists)

```
[My Lists]
   │
   ├── ไม่ล็อกอิน → แสดงปุ่มให้ไป Login
   │
   └── ล็อกอินแล้ว
          │
          ├── โหลด List: LocalStorage + Firestore (merge ไม่ให้ ID ซ้ำ)
          │
          ├── [สร้างรายการใหม่] → /mylists/create (CreateMyList)
          │         │
          │         └── ตั้งชื่อ List → ไปเลือกสินค้า /mylists/create/products/:id (Products)
          │
          ├── [แก้ไขรายการ] → /mylists/edit/:id (ListsEdit)
          │         │
          │         └── แก้ชื่อ / ลบรายการ / ไปเลือกสินค้าเพิ่ม → /mylists/edit/products/:id
          │
          └── [เปรียบเทียบราคา] → /mylists/compare/:id (MyLists3)
                    └── ดูราคาเปรียบเทียบระหว่างร้าน
```

- List เก็บทั้งใน **LocalStorage** และ **Firestore** (collection `shopping_lists`, field `userId`)
- หน้า Products รับ `targetListId` จาก URL เพื่อรู้ว่ากำลังเพิ่มสินค้าเข้า List ไหน

---

## 6. Flow อื่นๆ ที่สำคัญ

| ฟีเจอร์          | Flow สั้นๆ                                                                                                 |
| ---------------- | ---------------------------------------------------------------------------------------------------------- |
| **Favorites**    | FavoritesContext → ล็อกอิน = Firestore `users/{uid}.favorites`, ไม่ล็อกอิน = LocalStorage `favoritesItems` |
| **Profile**      | แก้ชื่อ/อีเมล, อัปโหลดรูปโปรไฟล์ (Cloudinary), ข้อมูลใน Firestore                                          |
| **Notification** | แสดงรายการแจ้งเตือน (ถ้ามีใช้ในระบบ)                                                                       |

---

## 7. โครงเส้นทาง (Routes) หลัก

| Path                           | หน้าที่                          |
| ------------------------------ | -------------------------------- |
| `/`                            | หน้าแรก (Navbar + Home + Footer) |
| `/login`                       | ล็อกอิน                          |
| `/register`                    | สมัครสมาชิก                      |
| `/forgot-password`             | ลืมรหัสผ่าน                      |
| `/reset-password`              | ตั้งรหัสผ่านใหม่                 |
| `/favorites`                   | รายการโปรด                       |
| `/profile`                     | โปรไฟล์                          |
| `/products`                    | หน้ารายการสินค้า                 |
| `/categories`                  | หน้าหมวดหมู่                     |
| `/mylists`                     | รายการซื้อของของฉัน              |
| `/mylists/create`              | สร้างรายการใหม่                  |
| `/mylists/create/products/:id` | เลือกสินค้าใส่รายการ (สร้าง)     |
| `/mylists/edit/:id`            | แก้ไขรายการ                      |
| `/mylists/edit/products/:id`   | เลือกสินค้าใส่รายการ (แก้ไข)     |
| `/mylists/compare/:id`         | เปรียบเทียบราคารายการ            |

---

## 8. สรุป Flow ข้อมูลหลัก

```
                    ┌─────────────┐
                    │   Firebase  │
                    │  Auth       │
                    └──────┬──────┘
                           │ onAuthStateChanged
         ┌─────────────────┼─────────────────┐
         ▼                 ▼                 ▼
   users/{uid}      shopping_lists     LocalStorage
   (favorites,       (รายการซื้อของ)    (guest favorites,
    profile)                              myLists ก่อน sync)
```

ถ้าต้องการลงรายละเอียด flow ย่อยของหน้าใดเป็นพิเศษ (เช่น AddToListModal, FavoritesContext หรือ My Lists merge) บอกได้เลยว่าจะให้เขียนต่อส่วนไหน
