# MMB Workshop — Local MongoDB

โปรเจกต์เวอร์ชันนี้เปลี่ยน data layer จาก Supabase มาเป็น MongoDB ที่รันอยู่บนเครื่องเดียวกับเว็บ

## โครงสร้าง

Browser -> Next.js `/api/db` -> MongoDB `127.0.0.1:27017` -> database `mmb_workshop`

> Browser จะไม่เชื่อม MongoDB โดยตรง เพื่อไม่เปิด connection string และเพื่อให้ควบคุมสิทธิ์ผ่าน server/API ได้

## ติดตั้งครั้งแรก

1. ติดตั้ง Node.js
2. ติดตั้ง MongoDB Community Server for Windows
3. เปิด PowerShell ในโฟลเดอร์โปรเจกต์
4. รัน:

```powershell
npm i
npm run dev:all
```

`dev:all` จะ:
- ตรวจว่า port 27018 มี MongoDB ทำงานอยู่หรือไม่
- ถ้ามีอยู่แล้ว จะใช้ตัวนั้น
- ถ้ายังไม่มี จะค้นหา `mongod.exe` จาก MongoDB Community Server และเปิดให้
- ใช้โฟลเดอร์ `.mongodb-data` ในโปรเจกต์เป็นที่เก็บฐานข้อมูล (เฉพาะกรณีที่สคริปต์เป็นคนเปิด mongod)
- เปิด Next.js development server

จากนั้นเปิด:
- Web: http://localhost:3000
- DB health: http://localhost:3000/api/db

## ค่าเชื่อมต่อ

ไฟล์ `.env`

```env
MONGODB_URI=mongodb://127.0.0.1:27017
MONGODB_DB=mmb_workshop
```

## Admin เริ่มต้น

แอปเดิมมีฟังก์ชันสร้าง Admin อัตโนมัติเมื่อยังไม่มี Admin:
- username: `admin`
- PIN: `1234`

ควรเปลี่ยน PIN ก่อนนำไปใช้งานจริง

## หมายเหตุ

รูปภาพจำนวนมาก/ไฟล์วิดีโอไม่ควรเก็บเป็น Base64 ขนาดใหญ่ใน MongoDB ระยะยาว
สำหรับระบบใช้งานจริงควรเก็บไฟล์บน NAS/Shared Folder/Object Storage แล้วเก็บ path หรือ URL ไว้ใน MongoDB
