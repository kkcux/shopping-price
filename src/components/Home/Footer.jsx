import React from 'react';
import { ShoppingCart } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          
          {/* คอลัมน์ที่ 1: แบรนด์และรายละเอียด */}
          <div className="footer-col-brand">
            <div className="brand">
              <div className="logo-circle-footer">
                <ShoppingCart size={22} strokeWidth={2.5} />
              </div>
              PriceFinder
            </div>
            <p className="footer-desc">
              เปรียบเทียบราคาสินค้าจากร้านค้าชั้นนำ เพื่อให้คุณได้สินค้าคุณภาพดีในราคาที่ดีที่สุด
            </p>
          </div>

          {/* คอลัมน์ที่ 2: บริการหลัก */}
          <div className="footer-col">
            <h3>บริการ</h3>
            <ul>
              <li>เปรียบเทียบราคาสินค้า</li>
              <li>รายการโปรด</li>
              <li>แจ้งเตือนราคา</li>
            </ul>
          </div>

          {/* คอลัมน์ที่ 3: หมวดหมู่หลัก (ชุดที่ 1) */}
          <div className="footer-col">
            <h3>หมวดหมู่</h3>
            <ul>
              <li>อาหารสดและแช่แข็ง</li>
              <li>อาหารแห้งและเครื่องปรุง</li>
              <li>ของใช้ในบ้าน</li>
              <li>สุขภาพและความงาม</li>
            </ul>
          </div>

          {/* คอลัมน์ที่ 4: หมวดหมู่เพิ่มเติม (ชุดที่ 2) */}
          <div className="footer-col">
            <h3 className="invisible-header">หมวดหมู่เพิ่มเติม</h3>
            <ul>
              <li>แม่และเด็ก</li>
              <li>เครื่องใช้ไฟฟ้า</li>
              <li>เครื่องมือช่างและอุปกรณ์</li>
              <li>สัตว์เลี้ยง</li>
            </ul>
          </div>

        </div>
        
        {/* ส่วนลิขสิทธิ์ด้านล่างสุด จัดให้อยู่กึ่งกลาง */}
        <div className="footer-divider"></div>
        <div className="footer-bottom-content">
          <p>© 2025 PriceFinder. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;