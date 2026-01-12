import React from 'react';
import { Routes, Route } from 'react-router-dom'; 
import './App.css';

/* ===== Components Imports ===== */
// Auth & Home
import Login from './components/Login/Login';
import Register from './components/Register/register';
import Navbar from './components/Home/Navbar';
import Footer from './components/Home/Footer';
import Home from './components/Home/Home'; 

// Features
import Profile from './components/Profile/Profile';
import Favorites from './components/Favorites/Favorites';
import Categories from './components/Categories/Categories';
import Products from './components/Products/Products'; 

// MyLists Components
import MyLists from './components/MyLists/MyLists';       // หน้า Dashboard รวม
import CreateMyList from './components/MyLists/CreateMyList'; // หน้าสร้าง
import ListsEdit from './components/MyLists/ListsEdit';   // หน้าแก้ไข
import MyLists2 from './components/MyLists/MyLists2';     // หน้ารายละเอียด (Review)
import MyLists3 from './components/MyLists/MyLists3';     // หน้าเปรียบเทียบราคา (Compare)

function App() {
  return (
    <div className="App">
      <Routes>

        {/* ===== HOME SECTION ===== */}
        {/* หมายเหตุ: หน้า Home ใส่ Navbar/Footer ไว้ที่นี่ เพราะในไฟล์ Home อาจจะไม่มี */}
        <Route path="/" element={<><Navbar /><Home /><Footer /></>} />

        {/* ===== AUTH SECTION ===== */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ===== USER FEATURES ===== */}
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/profile" element={<Profile />} />

        {/* ===== PRODUCT & CATEGORY ===== */}
        <Route path="/products" element={<Products />} />
        <Route path="/categories" element={<Categories />} />

        {/* ===== 🛒 SHOPPING LIST FLOW ===== */}

        {/* 1. Dashboard: หน้ารวมรายการทั้งหมด */}
        <Route path="/mylists" element={<MyLists />} />

        {/* 2. Create: หน้าสร้างรายการใหม่ */}
        <Route path="/mylists/create" element={<CreateMyList />} />
        
        {/* 2.1 Add Products (Create Mode): กดเพิ่มสินค้าตอนสร้างรายการใหม่ */}
        {/* Products จะต้องรับ params id ไปเพื่อรู้ว่าต้อง save ลง Draft ID ไหน */}
        <Route path="/mylists/create/products/:id" element={<Products />} />

        {/* 3. Edit: หน้าแก้ไขรายการเดิม */}
        <Route path="/mylists/edit/:id" element={<ListsEdit />} />

        {/* 3.1 Add Products (Edit Mode): กดเพิ่มสินค้าตอนแก้ไขรายการเดิม */}
        <Route path="/mylists/edit/products/:id" element={<Products />} />

        {/* 4. Review: หน้าดูรายละเอียดรายการ (หน้านี้คือที่ทำ Auto Delete LocalStorage) */}
        <Route path="/mylists/:id" element={<MyLists2 />} />

        {/* 5. Compare: หน้าเปรียบเทียบราคา (รับค่าจาก state, ไม่ใช่ localStorage) */}
        <Route path="/mylists/compare/:id" element={<MyLists3 />} />

      </Routes>
    </div>
  );
}

export default App;