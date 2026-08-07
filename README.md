# Kids AR Animal Photos V6

ชุดนี้เปลี่ยน Animal Name Adventure จาก Emoji เป็นภาพสัตว์จริงแบบแยกไฟล์จำนวน 80 ภาพ

## ไฟล์สำคัญ

- `animal-game.html`
- `animal-game.js`
- `animal-data.json`
- `kids-game.css`
- `shared-game.js`
- `images/animals/*.jpg`

## วิธีติดตั้ง

คัดลอกไฟล์ทั้งหมดในชุดนี้ไปไว้ในโฟลเดอร์ HomeDashboard
โดยรักษาโครงสร้าง `images/animals/` ไว้ตามเดิม

## วิธีทดลอง

เปิดผ่าน Live Server:

`http://127.0.0.1:5500/animal-game.html`

ห้ามเปิดด้วยการดับเบิลคลิกไฟล์โดยตรง เพราะ `fetch("animal-data.json")`
อาจถูกเบราว์เซอร์บล็อก

## ระบบเกม

- ภาพสัตว์จริง 80 ภาพ
- เกมละ 10 คำถาม
- คำถามไม่ซ้ำกันภายในเกม
- คะแนนเต็ม 100
- เลือกด้วยนิ้วและท่าจีบ
- ตอบด้วยเสียงภาษาอังกฤษ
- เสียงถามและเฉลยแบบช้า
