MMB Mobile Save UX patch

วางไฟล์ทั้งหมดใน ZIP ทับที่ root ของโปรเจกต์ เช่น D:\web\web

แก้หลัก ๆ:
- ปุ่มบันทึกติดล่างบนมือถือในหน้าตั้งค่าที่มีการแก้ข้อมูล
- หน้า Staff: ปุ่มบันทึก/ยกเลิกติดล่าง และ required ชื่อจะเลื่อน+โฟกัสให้อัตโนมัติ
- หน้า JOB และ Inspection ที่มี bottom action จะซ่อน Bottom Navigation เพื่อไม่ให้ทับปุ่ม
- Popup/Dialog/Alert/Sheet/Drawer รองรับความสูงมือถือ, scroll และ safe-area; footer action ติดล่าง
- Popup แก้ข้อมูลลูกค้าใน JOB มีปุ่มบันทึกติดล่างตลอดเวลา

หน้าสร้างหลักที่ตรวจแล้วและมี bottom save bar อยู่ก่อนแล้ว:
- ลูกค้าใหม่
- รถใหม่
- เปิด JOB ใหม่
- ใบเบิกอะไหล่ใหม่
