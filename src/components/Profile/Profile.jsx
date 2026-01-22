import React, { useRef, useState, useEffect } from 'react';
import { Camera, User, Mail, Info, Crown, Check } from 'lucide-react';
import { updateProfile, onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase-config"; 
import Navbar from '../Home/Navbar';
import Footer from '../Home/Footer';
import './Profile.css';

const Profile = () => {
  const fileInputRef = useRef(null);
  
  const [profileImage, setProfileImage] = useState(null);
  const [name, setName] = useState(""); 
  const [email, setEmail] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState(null);

  useEffect(() => {
    // 1. ดึงจาก LocalStorage (ถ้ามี)
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        // ป้องกันรูปเสีย: ถ้าเป็น blob (รูปชั่วคราว) ไม่ต้องเอามาโชว์
        if (userData.photoURL && !userData.photoURL.startsWith('blob:')) {
           setProfileImage(userData.photoURL);
        }
        if (userData.name) setName(userData.name);
        if (userData.email) setEmail(userData.email);
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }

    // 2. ดึงจาก Firebase (ตัวจริง)
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setFirebaseUser(currentUser); 

        // ⭐ ส่วนที่เพิ่ม: สั่งให้หน้าจออัปเดตข้อมูลทันทีที่เจอ User
        if (currentUser.displayName) setName(currentUser.displayName);
        if (currentUser.email) setEmail(currentUser.email);
        if (currentUser.photoURL) setProfileImage(currentUser.photoURL);

        // อัปเดตข้อมูลใหม่ลง LocalStorage ด้วย
        const freshUserData = {
            uid: currentUser.uid,
            email: currentUser.email,
            name: currentUser.displayName,
            photoURL: currentUser.photoURL
        };
        localStorage.setItem('user', JSON.stringify(freshUserData));

      } else {
        setFirebaseUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setProfileImage(imageUrl);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!firebaseUser) {
        alert("ไม่พบข้อมูลผู้ใช้จากระบบ Firebase กรุณาลองล็อกอินใหม่");
        return;
    }

    try {
        // 1. อัปเดตชื่อขึ้น Server
        await updateProfile(firebaseUser, {
            displayName: name
        });
        
        // 2. อัปเดตลงเครื่อง (ระวังเรื่องรูป Blob)
        const storedUser = localStorage.getItem('user');
        let currentUserData = {};
        if (storedUser) currentUserData = JSON.parse(storedUser);

        // เช็คว่ารูปปัจจุบันเป็นรูปจริงหรือเปล่า
        let photoToSave = currentUserData.photoURL;
        if (profileImage && !profileImage.startsWith('blob:')) {
            photoToSave = profileImage;
        }

        const updatedUserData = {
            ...currentUserData,
            name: name,
            photoURL: photoToSave
        };
        localStorage.setItem('user', JSON.stringify(updatedUserData));

        setShowPopup(true);

    } catch (error) {
        console.error("Error updating profile:", error);
        alert("เกิดข้อผิดพลาด: " + error.message);
    }
  };

  const closePopup = () => {
    setShowPopup(false);
  };

  const handleRegisterClick = (url) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const memberships = [
    { 
      id: 1, 
      name: "Lotus's", 
      label: "Lotus's ไม่เป็นสมาชิก", 
      bgIcon: '#eafff0',
      color: '#00b050',
      logo: 'https://corporate.lotuss.com/images/2023/02/cover-logo-lotuss-060323.jpg',
      registerUrl: 'https://www.lotuss.com/th'
    },
    { 
      id: 2, 
      name: 'Big C', 
      label: 'Big C ไม่เป็นสมาชิก', 
      bgIcon: '#f4ffe0',
      color: '#8dc63f',
      logo: 'https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcSlLdbffklYPCCfrhKihAv0yGlVjV__NwsYG36F-_hdtTqDGQ97Y3ur0jEvPsFNYH-_CPZQ9Ynu',
      registerUrl: 'https://www.bigc.co.th/auth/register'
    },
    { 
      id: 3, 
      name: 'Makro', 
      label: 'Makro ไม่เป็นสมาชิก', 
      bgIcon: '#fff0f0',
      color: '#ed1c24',
      logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR1weBQ9rq_nOC5CSMa2dFW9Ez5CFXKKy4Q3Q&s',
      registerUrl: 'https://www.makro.pro/register'
    },
  ];

  return (
    <div className="page-wrapper">
      <Navbar />
      
      <div className="profile-content-section">
        <div className="profile-card fade-in-up">
          
          <div className="profile-header">
            <h1>ตั้งค่าโปรไฟล์</h1>
            <p>จัดการข้อมูลส่วนตัวและการเป็นสมาชิกของคุณ</p>
          </div>

          <div className="profile-image-section">
            <div className="image-upload-wrapper" onClick={handleImageClick}>
              <div className="image-circle">
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="profile-preview" />
                ) : (
                  <div className="placeholder-content">
                    <Camera size={40} className="placeholder-icon" strokeWidth={1.5} />
                    <span className="upload-text">เปลี่ยนรูปโปรไฟล์</span>
                  </div>
                )}
              </div>
              
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                style={{ display: 'none' }} 
                accept="image/*"
              />
            </div>
          </div>

          <form className="profile-form" onSubmit={handleSave}>
            
            <div className="form-group">
              <label>ชื่อที่ใช้แสดง</label>
              <div className="input-wrapper">
                <User className="input-icon" size={20} />
                <input 
                  type="text" 
                  placeholder="เช่น Somchai Jaidee" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label>อีเมล</label>
              <div className="input-wrapper">
                <Mail className="input-icon" size={20} />
                <input 
                  type="email" 
                  placeholder="name@example.com" 
                  value={email}
                  readOnly 
                  style={{ backgroundColor: '#f3f4f6', cursor: 'not-allowed', color: '#6b7280' }} 
                />
              </div>
            </div>

            <div className="divider"></div>

            <div className="membership-section">
              <label className="section-label">สถานะสมาชิกร้านค้า</label>
              <div className="membership-list">
                {memberships.map((item) => (
                  <div key={item.id} className="membership-item">
                    <div className="membership-left">
                      <div className="membership-logo-box" style={{ color: item.color, backgroundColor: item.bgIcon }}>
                        {item.logo ? <img src={item.logo} alt={item.name} className="membership-logo-img" /> : item.name}
                      </div>
                      <div className="membership-info">
                        <span className="ms-name">{item.name}</span>
                        <div className="ms-status-row">
                          <span className="status-text">{item.label}</span>
                          <div className="info-tooltip-wrapper">
                            <Info size={16} className="info-icon" />
                            <div className="benefit-popup">
                              <div className="popup-header">
                                <div className="crown-icon-bg"><Crown size={24} color="white" /></div>
                                <div className="popup-title-text">
                                  <h3>สิทธิประโยชน์</h3>
                                  <span>สมาชิก {item.name}</span>
                                </div>
                              </div>
                              <ul className="benefit-list">
                                <li><Check size={16} /> สะสมคะแนนทุกยอดการใช้จ่าย</li>
                                <li><Check size={16} /> แลกคะแนนเป็นส่วนลดเงินสด</li>
                                <li><Check size={16} /> สินค้าราคาพิเศษเฉพาะสมาชิก</li>
                              </ul>
                              <div className="popup-footer">
                                <button type="button" className="popup-btn-ok">เข้าใจแล้ว</button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <button type="button" className="btn-apply-member" onClick={() => handleRegisterClick(item.registerUrl)}>
                      สมัคร
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-save">บันทึกข้อมูล</button>
              <button type="button" className="btn-cancel">ยกเลิก</button>
            </div>

          </form>
        </div>
      </div>

      {showPopup && (
        <div className="profile-modal-overlay">
          <div className="profile-modal-content fade-in-scale">
            <div className="profile-modal-icon-wrapper">
              <Check size={40} className="profile-modal-check-icon" />
            </div>
            <h2 className="profile-modal-title">บันทึกข้อมูลแล้ว</h2>
            <p className="profile-modal-subtitle">ข้อมูลถูกอัปเดตเรียบร้อยแล้ว</p>
            <button className="profile-modal-btn-close" onClick={closePopup}>
              เข้าใจแล้ว
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Profile;