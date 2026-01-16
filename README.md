# โปรเจกต์ Shopping Price Comparison

แอปพลิเคชัน React ที่พัฒนาด้วย Vite สำหรับติดตามราคาสินค้า เชื่อมต่อระบบล็อกอินและฐานข้อมูลด้วย Firebase

##  เทคโนโลยีที่ใช้

- **Frontend Framework:** React + Vite
- **Authentication & Backend:** Firebase (Auth, Firestore)
- **Identity Provider:** Google OAuth

##  สิ่งที่ต้องเตรียมก่อนเริ่ม

ก่อนเริ่มต้นใช้งาน โปรดตรวจสอบว่าเครื่องของคุณมีสิ่งเหล่านี้แล้ว:

- Node.js (แนะนำเวอร์ชัน 16 ขึ้นไป)
- npm หรือ yarn

##  ขั้นตอนการติดตั้ง

1.  **โคลนโปรเจกต์ลงเครื่อง (Clone):**

    ```bash
    git clone [https://github.com/kkcux/shopping-price.git](https://github.com/kkcux/shopping-price.git)
    cd shopping-price
    ```

2.  **ติดตั้ง dependencies:**
    ```bash
    npm install
    ```

## ⚙️ การตั้งค่า (Environment Variables)

ในการรันโปรเจกต์ จำเป็นต้องตั้งค่า Environment Variables สำหรับ Firebase และ Google Auth ก่อน

1.  สร้างไฟล์ชื่อ **`.env`** ไว้ที่โฟลเดอร์หลัก (root) ของโปรเจกต์
2.  คัดลอกค่าด้านล่างนี้ไปใส่ในไฟล์ แล้วแทนที่ `xxxx` ด้วย key จริงของคุณ:

```env
# Google Auth Configuration
VITE_GOOGLE_CLIENT_ID=xxxx

# Firebase Configuration
VITE_FIREBASE_API_KEY=xxxx
VITE_FIREBASE_AUTH_DOMAIN=xxxx
VITE_FIREBASE_PROJECT_ID=xxxx
VITE_FIREBASE_STORAGE_BUCKET=xxxx
VITE_FIREBASE_MESSAGING_SENDER_ID=xxxx
VITE_FIREBASE_APP_ID=xxxx
VITE_FIREBASE_MEASUREMENT_ID=xxxx
```
