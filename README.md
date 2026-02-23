# โปรเจกต์ Shopping Price 🛒

แอปพลิเคชัน React ที่พัฒนาด้วย Vite สำหรับติดตามราคาสินค้า เชื่อมต่อระบบล็อกอินและฐานข้อมูลด้วย Firebase และ Cloudinary

## 🚀 เทคโนโลยีที่ใช้

- **Frontend Framework:** React + Vite
- **Authentication & Backend:** Firebase (Auth, Firestore, Storage)
- **Image Storage:** Cloudinary
- **Identity Provider:** Google OAuth

## 🛠 สิ่งที่ต้องเตรียมก่อนเริ่ม

ก่อนเริ่มต้นใช้งาน โปรดตรวจสอบว่าเครื่องของคุณมีสิ่งเหล่านี้แล้ว:

- Node.js (แนะนำเวอร์ชัน 16 ขึ้นไป)
- npm หรือ yarn
- Firebase Account
- Cloudinary Account

## 📥 ขั้นตอนการติดตั้ง

1. **โคลนโปรเจกต์ลงเครื่อง (Clone):**

   ```bash
   git clone https://github.com/kkcux/shopping-price.git
   cd shopping-price
   ```

2. **ติดตั้ง dependencies:**

   ```bash
   npm install
   ```

3. **รันโปรเจกต์:**

   ```bash
   npm run dev
   ```

---

## ⚙️ การตั้งค่า Environment Variables (.env)

สร้างไฟล์ `.env` ที่โฟลเดอร์หลัก (root) ของโปรเจกต์ และเพิ่มค่าต่อไปนี้:

### 1. Firebase Configuration

ไปที่ [Firebase Console](https://console.firebase.google.com/) → Project Settings → General → Your apps → Web app

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### 2. Cloudinary Configuration

ไปที่ [Cloudinary Console](https://console.cloudinary.com/) → Settings → Security

```env
# Cloudinary Configuration
# Format: cloudinary://api_key:api_secret@cloud_name
VITE_CLOUDINARY_URL=cloudinary://your_api_key:your_api_secret@your_cloud_name
```

**ตัวอย่าง:**
```env
VITE_CLOUDINARY_URL=cloudinary://123456789:abcdefghijk@dqunjp3dj
```

### 3. Google Maps API (Optional)

```env
# Google Maps API Key (ถ้าใช้)
GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# (Optional) Base URL ของ backend API สำหรับ production
# ถ้าไม่ใส่ ระบบจะเรียก /api/... ที่โดเมนเดียวกับเว็บ
# ตัวอย่าง: https://api.ideatrade1.com
VITE_API_BASE_URL=
```

---

## 🔐 การตั้งค่า Firebase Authentication

### 1. เปิดใช้งาน Authentication Methods

1. ไปที่ [Firebase Console](https://console.firebase.google.com/)
2. เลือกโปรเจกต์ของคุณ
3. ไปที่ **Authentication** → **Sign-in method**
4. เปิดใช้งาน:
   - **Email/Password** (Enable)
   - **Google** (Enable)

### 2. ตั้งค่า Google OAuth

1. ในหน้า **Sign-in method** → คลิก **Google**
2. เปิดใช้งาน **Enable**
3. ตั้งค่า **Project support email**
4. คลิก **Save**

### 3. ตั้งค่า Authorized domains

1. ในหน้า **Authentication** → **Settings** → **Authorized domains**
2. เพิ่ม domain ที่ต้องการ:
   - `localhost` (สำหรับ development)
   - Domain ของคุณ (สำหรับ production)

---

## 📁 การตั้งค่า Cloudinary

### 1. สร้าง Upload Preset

1. ไปที่ [Cloudinary Console](https://console.cloudinary.com/)
2. ไปที่ **Settings** → **Upload**
3. คลิก **Add upload preset**
4. ตั้งค่าดังนี้:
   - **Preset name:** `ml_default`
   - **Signing mode:** เลือก **Unsigned** (สำคัญ!)
   - **Asset folder:** `profile-images` (optional)
   - **Use filename:** `true`
   - **Unique filename:** `true`
   - **Overwrite:** `false`
5. คลิก **Save**

### 2. ตั้งค่า Folder Structure

Cloudinary จะจัดเก็บรูปโปรไฟล์ในโครงสร้างดังนี้:
```
profile-images/
  └── {userId}/
      └── {timestamp}_profile.jpg
```

**หมายเหตุ:** 
- Folder `profile-images` จะถูกสร้างอัตโนมัติเมื่ออัปโหลดรูปแรก
- แต่ละ user จะมี folder ของตัวเองตาม `userId`

---

## 🔒 การตั้งค่า Firebase Rules

### 1. Firestore Rules

1. ไปที่ [Firebase Console](https://console.firebase.google.com/)
2. เลือกโปรเจกต์ของคุณ
3. ไปที่ **Firestore Database** → **Rules**
4. Copy เนื้อหาจากไฟล์ `firestore.rules` ในโปรเจกต์
5. Paste ลงใน Rules editor
6. คลิก **Publish**

**ไฟล์ `firestore.rules`:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      // อนุญาตให้ query โดย email ได้ (สำหรับ password reset)
      allow list: if request.auth == null && request.query.limit <= 1;
      
      // อนุญาตให้ user อ่านข้อมูลของตัวเองได้
      allow read: if request.auth != null && request.auth.uid == userId;
      
      // อนุญาตให้ user เขียนข้อมูลของตัวเองได้
      allow write: if request.auth != null && request.auth.uid == userId;
      
      // อนุญาตให้สร้าง document ใหม่ได้
      allow create: if request.auth != null && request.auth.uid == userId;
    }
    
    // Rules อื่นๆ
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 🚀 การ Deploy Rules

### วิธีที่ 1: ใช้ Firebase CLI (แนะนำ)

1. ติดตั้ง Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

2. Login Firebase:
   ```bash
   firebase login
   ```

3. Initialize Firebase (ถ้ายังไม่ได้ทำ):
   ```bash
   firebase init
   ```

4. Deploy Rules:
   ```bash
   firebase deploy --only firestore:rules
   ```

### วิธีที่ 2: ตั้งค่าใน Firebase Console

1. Copy เนื้อหาจากไฟล์ `firestore.rules`
2. ไปที่ Firebase Console → Rules
3. Paste เนื้อหาลงใน Rules editor
4. คลิก **Publish**

---

## 📝 สรุปขั้นตอนการตั้งค่า

### ✅ Checklist

- [ ] สร้างไฟล์ `.env` และตั้งค่า Environment Variables
- [ ] เปิดใช้งาน Firebase Authentication (Email/Password และ Google)
- [ ] ตั้งค่า Firestore Rules
- [ ] ตั้งค่า Storage Rules
- [ ] สร้าง Cloudinary Upload Preset (`ml_default`)
- [ ] ตั้งค่า Cloudinary Asset Folder (`profile-images`)
- [ ] Deploy Rules ไปที่ Firebase

---

## 🎯 Features

- ✅ User Authentication (Email/Password และ Google OAuth)
- ✅ Password Reset via Email
- ✅ Profile Management
- ✅ Profile Picture Upload (Cloudinary)
- ✅ Image Crop & Resize
- ✅ Firestore Database
- ✅ Real-time Data Sync

---

## 📚 เอกสารเพิ่มเติม

- [Firebase Documentation](https://firebase.google.com/docs)
- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [React Router Documentation](https://reactrouter.com/)
- [Vite Documentation](https://vitejs.dev/)

---

## 🐛 Troubleshooting

### ปัญหา: CORS Error เมื่ออัปโหลดรูป

**แก้ไข:**
1. ตรวจสอบว่า Cloudinary Upload Preset เป็น **Unsigned**
2. ตรวจสอบว่า `VITE_CLOUDINARY_URL` ถูกต้อง
3. Restart dev server หลังจากแก้ไข `.env`

### ปัญหา: Firebase Permission Denied

**แก้ไข:**
1. ตรวจสอบว่า Firestore Rules และ Storage Rules ถูก deploy แล้ว
2. ตรวจสอบว่า user login แล้ว
3. ตรวจสอบว่า `userId` ตรงกับ `request.auth.uid`

### ปัญหา: รูปไม่แสดง

**แก้ไข:**
1. ตรวจสอบว่า Cloudinary Upload Preset ตั้งค่าถูกต้อง
2. ตรวจสอบว่า transformation URL ถูกต้อง
3. ตรวจสอบ Network tab ใน Browser DevTools

---

## 📄 License

MIT License

---

## 👥 Contributors

- [Your Name]

---

## 🙏 Acknowledgments

- Firebase Team
- Cloudinary Team
- React Community
