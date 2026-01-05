import React from 'react';
import { Bell, Percent } from 'lucide-react';
import './NotificationList.css';

const NotificationList = () => {
  // ข้อมูลจำลอง (Mock Data) ตามรูปภาพตัวอย่าง
  const notifications = [
    { id: 1, title: 'เลย์รสซาวครีม', desc: 'ลดราคา\nเหลือซองละ 25 บาทเท่านั้น !!' },
    { id: 2, title: 'ไก่ย่างรสดั้งเดิม', desc: 'ลดราคา\nเหลือซองละ 10 บาทเท่านั้น !!' },
    { id: 3, title: 'น้ำมันถั่วเหลือง', desc: 'ลดราคา\nเหลือขวดละ 60 บาทเท่านั้น !!' },
    { id: 4, title: 'นมจืดเมจิ', desc: 'ลดราคา\nเหลือขวดละ 30 บาทเท่านั้น !!' },
    { id: 5, title: 'คอนเน่', desc: 'ลดราคา\nเหลือซองละ 30 บาทเท่านั้น !!' },
    { id: 6, title: 'ซอสหอยนางรม', desc: 'ลดราคา\nเหลือขวดละ 50 บาทเท่านั้น !!' },
  ];

  return (
    <div className="notification-card fade-in-down">
      
      {/* Header */}
      <div className="notification-header">
        <Bell size={20} className="header-icon" />
        <h3>การแจ้งเตือนโปรโมชั่นสินค้า</h3>
      </div>

      {/* List Items */}
      <div className="notification-body">
        {notifications.map((item) => (
          <div key={item.id} className="notification-item">
            <div className="notif-text">
              <h4>{item.title}</h4>
              {/* ใช้ css white-space: pre-line เพื่อให้ \n ขึ้นบรรทัดใหม่ */}
              <p>{item.desc}</p>
            </div>
            <div className="notif-badge">
              <div className="percent-circle">
                <Percent size={14} strokeWidth={3} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="notification-footer">
        <button className="btn-see-more">ดูเพิ่มเติม</button>
      </div>

    </div>
  );
};

export default NotificationList;