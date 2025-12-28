import React from 'react';
import { ShoppingCart } from 'lucide-react';
import './Footer.css'; // อย่าลืม import ไฟล์ CSS ที่แยกออกมา

function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          
          {/* Brand Column */}
          <div className="footer-col-brand">
            <div className="brand" style={{ color: 'white' }}> {/* เพิ่ม style color white ให้มั่นใจว่าเป็นสีขาว */}
              <div className="logo-circle-footer">
                {/* แก้สีไอคอนเป็น #10B77E (จากเดิม #22c55e) */}
                <ShoppingCart size={22} color="#10B77E" strokeWidth={2.5} />
              </div>
              PriceFinder
            </div>
            <p className="footer-desc">
              เปรียบเทียบราคาสินค้าจากร้านค้าชั้นนำ<br/>
              เพื่อให้คุณได้สินค้าคุณภาพดีในราคาที่ดี<br/>
              ที่สุด
            </p>
          </div>

          <div className="footer-col">
            <h3>บริการ</h3>
            <ul>
              <li>เปรียบเทียบราคาสินค้า</li>
              <li>รายการโปรด</li>
              <li>แจ้งเตือนราคา</li>
            </ul>
          </div>

          <div className="footer-col">
            <h3>หมวดหมู่</h3>
            <ul>
              <li>อาหาร</li>
              <li>เครื่องดื่ม</li>
              <li>ผักและผลไม้</li>
              <li>อิเล็กทรอนิกส์</li>
            </ul>
          </div>

          <div className="footer-col">
            {/* Class invisible-header ไว้ดันบรรทัดให้ตรงกันเฉยๆ */}
            <h3 className="invisible-header">หมวดหมู่</h3> 
            <ul>
              <li>อาหารแห้งและเครื่องปรุง</li>
              <li>ขนมและของหวาน</li>
              <li>เนื้อสัตว์</li>
              <li>ของใช้ในบ้าน</li>
            </ul>
          </div>
        </div>
        
        <div className="footer-divider"></div>
        {/* เพิ่ม Copyright ด้านล่างเส้นแบ่งหน่อยก็ดีครับ */}
        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: '#d1fae5', fontWeight: 300 }}>
           &copy; {new Date().getFullYear()} PriceFinder. All rights reserved.
        </p>

      </div>
    </footer>
  );
}

export default Footer;