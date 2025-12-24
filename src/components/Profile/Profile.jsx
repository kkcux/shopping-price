import React from 'react';
// เพิ่ม import Crown และ Check เข้ามาใช้งานใน Popup
import { Camera, User, Mail, Info, Crown, Check } from 'lucide-react';
import Navbar from '../Home/Navbar';
import Footer from '../Home/Footer';
import './Profile.css';


const Profile = () => {
  // ข้อมูลสมมติสำหรับแสดงในส่วนสมาชิก
  const memberships = [
    { id: 1, name: 'Tops', label: 'TOPS ไม่เป็นสมาชิก', color: '#ff0000', bgColor: '#fff0f0' },
    { id: 2, name: "Lotus's", label: "LOTUS's ไม่เป็นสมาชิก", color: '#00b050', bgColor: '#f0fff0' },
    { id: 3, name: 'Big C', label: 'BIG C ไม่เป็นสมาชิก', color: '#8dc63f', bgColor: '#f9fff0' },
    { id: 4, name: 'Makro', label: 'MAKRO ไม่เป็นสมาชิก', color: '#ed1c24', bgColor: '#fff0f0' },
  ];

  return (
    <>
      <Navbar />
      <div className="profile-page-container">
        <div className="profile-card">
          
          {/* Header */}
          <div className="profile-header">
            <h1>ข้อมูลโปรไฟล์</h1>
            <p>กรอกข้อมูลโปรไฟล์ของคุณเพื่อให้ข้อมูลออกมามีประสิทธิภาพ</p>
          </div>

          {/* Profile Image Upload */}
          <div className="profile-image-section">
            <div className="image-upload-circle">
              <Camera size={40} color="#666" strokeWidth={1.5} />
              <span>เลือกรูปโปรไฟล์</span>
            </div>
          </div>

          {/* Form Inputs */}
          <form className="profile-form">
            
            <div className="form-group">
              <label>ชื่อโปรไฟล์</label>
              <div className="input-wrapper">
                <User className="input-icon" size={20} />
                <input type="text" placeholder="กรอกชื่อโปรไฟล์" />
              </div>
            </div>

            <div className="form-group">
              <label>อีเมล</label>
              <div className="input-wrapper">
                <Mail className="input-icon" size={20} />
                <input type="email" placeholder="กรอกอีเมลของคุณ" />
              </div>
            </div>

            {/* Membership Section */}
            <div className="membership-section">
              <label>การเป็นสมาชิก</label>
              <div className="membership-list">
                {memberships.map((item) => (
                  <div key={item.id} className="membership-item">
                    <div className="membership-left">
                      {/* ส่วนแสดงโลโก้ */}
                      <div className="membership-logo" style={{ color: item.color, borderColor: item.color }}>
                        {item.name}
                      </div>
                      
                      <div className="membership-status">
                        {/* --- ส่วน Tooltip เริ่มตรงนี้ --- */}
                        <div className="info-tooltip-wrapper">
                          <Info size={18} color="#999" className="info-icon" />
                          
                          {/* Popup Content */}
                          <div className="benefit-popup">
                            <div className="popup-header">
                              <div className="crown-icon-bg">
                                <Crown size={24} color="white" />
                              </div>
                              <h3>สิทธิประโยชน์ของสมาชิก {item.name}</h3>
                            </div>
                            
                            <ul className="benefit-list">
                              <li><Check size={16} /> สะสมคะแนน {item.name} ทุกการซื้อ</li>
                              <li><Check size={16} /> แลกคะแนนเป็นคูปองส่วนลดได้</li>
                              <li><Check size={16} /> ส่วนลดพิเศษเฉพาะสมาชิกในหมวดสินค้าต่าง ๆ</li>
                              <li><Check size={16} /> สิทธิ์แลกซื้อสินค้าราคาพิเศษเฉพาะสมาชิก</li>
                            </ul>

                            <div className="popup-footer-link">
                              สนใจ <a href="#">สมัครสมาชิก</a>
                            </div>

                            <button type="button" className="popup-btn-ok">เข้าใจแล้ว</button>
                          </div>
                        </div>
                        {/* --- ส่วน Tooltip จบตรงนี้ --- */}

                        <span>{item.label}</span>
                      </div>
                    </div>
                    <button type="button" className="apply-link">สมัคร</button>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="form-actions">
              <button type="submit" className="btn-save">บันทึก</button>
              <button type="button" className="btn-cancel">ยกเลิก</button>
            </div>

          </form>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Profile;