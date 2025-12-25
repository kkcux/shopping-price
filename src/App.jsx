import React from 'react';
import { Routes, Route } from 'react-router-dom'; 
import Login from './components/Login/Login';
import Register from './components/Register/register';
import './App.css';

import Navbar from './components/Home/Navbar';
import Footer from './components/Home/Footer';
import Hero from './components/Home/hero';
import Home from './components/Home/Home'; 
import MyLists from './components/MyLists/MyLists'; 
import Profile from './components/Profile/Profile';
import ListsEdit from './components/MyLists/ListsEdit';
import MyLists2 from './components/MyLists/MyLists2';
import MyLists3 from './components/MyLists/MyLists3';
import Favorites from './components/Favorites/Favorites';
import CreateMyList from './components/MyLists/CreateMyList';

function App() {
  return (
    <div className="App">
      <Routes>
        
        {/* หน้า Home (path "/") */}
        <Route path="/" element={
          <>
            <Navbar />
            <Hero />
            <Home />
            <Footer />
          </>
        } />

        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Features */}
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/profile" element={<Profile />} />

        {/* ===== MyLists Routes (จัดระเบียบใหม่) ===== */}
        
        {/* 1. หน้าหลัก แสดงรายการทั้งหมด */}
        <Route path="/mylists" element={<MyLists />} />

        {/* 2. หน้าสร้างรายการใหม่ (ต้องวางไว้ก่อน :id) */}
        <Route path="/mylists/create" element={<CreateMyList />} />

        {/* 3. หน้ารายละเอียด (รับ ID) -> ใช้ Component MyLists2 */}
        <Route path="/mylists/:id" element={<MyLists2 />} />

        {/* 4. หน้าแก้ไข (รับ ID) -> ใช้ Component ListsEdit */}
        <Route path="/mylists/:id/edit" element={<ListsEdit />} />

        {/* 5. หน้าผลลัพธ์การเปรียบเทียบ */}
        <Route path="/mylists/mylists3" element={<MyLists3 />} />

      </Routes>
    </div>
  );
}

export default App;