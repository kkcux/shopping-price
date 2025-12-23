import React from 'react';
import { ShoppingCart } from 'lucide-react';

function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-col-brand">
            <div className="brand white">
              <div className="logo-circle-footer">
                <ShoppingCart size={22} color="#22c55e" strokeWidth={2.5} />
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
            <ul><li>เปรียบเทียบราคาสินค้า</li><li>รายการโปรด</li><li>แจ้งเตือนราคา</li></ul>
          </div>
          <div className="footer-col">
            <h3>หมวดหมู่</h3>
            <ul><li>อาหาร</li><li>เครื่องดื่ม</li><li>ผักและผลไม้</li><li>อิเล็กทรอนิกส์</li></ul>
          </div>
          <div className="footer-col">
            <h3 className="invisible-header">หมวดหมู่</h3>
            <ul><li>อาหารแห้งและเครื่องปรุง</li><li>ขนมและของหวาน</li><li>เนื้อสัตว์</li><li>ของใช้ในบ้าน</li></ul>
          </div>
        </div>
        <div className="footer-divider"></div>
      </div>
    </footer>
  );
}

export default Footer;