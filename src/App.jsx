import React from 'react';
import { Routes, Route } from 'react-router-dom'; 
import './App.css';

// Components Imports
import Login from './components/Login/Login';
import Register from './components/Register/register';
import Navbar from './components/Home/Navbar';
import Footer from './components/Home/Footer';
import Hero from './components/Home/hero';
import Home from './components/Home/Home'; 
import Profile from './components/Profile/Profile';
import Favorites from './components/Favorites/Favorites';

// MyLists Components
import MyLists from './components/MyLists/MyLists'; 
import CreateMyList from './components/MyLists/CreateMyList';
import MyLists2 from './components/MyLists/MyLists2';
import MyLists3 from './components/MyLists/MyLists3';
import ListsEdit from './components/MyLists/ListsEdit';

function App() {
  return (
    <div className="App">
      <Routes>
        
        {/* หน้า Home (path "/") */}
        <Route path="/" element={
          <>
            <Navbar />
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

        {/* ===== MyLists Routes (เรียงลำดับใหม่เพื่อความถูกต้อง) ===== */}
        
        {/* 1. หน้าหลัก แสดงรายการทั้งหมด */}
        <Route path="/mylists" element={<MyLists />} />

        {/* 2. หน้าสร้างรายการใหม่ (Static Path ต้องมาก่อน Dynamic Path) */}
        <Route path="/mylists/create" element={<CreateMyList />} />

        {/* 3. หน้าผลลัพธ์การเปรียบเทียบ (Static Path) */}
        <Route path="/mylists/mylists3" element={<MyLists3 />} />

        {/* 4. หน้าแก้ไขรายการ (แก้ Path ให้ตรงกับ navigate ใน MyLists2) */}
        {/* จากเดิม /mylists/:id/edit เปลี่ยนเป็น /mylists/edit/:id */}
        <Route path="/mylists/edit/:id" element={<ListsEdit />} />

        {/* 5. หน้ารายละเอียด (Dynamic Path :id ไว้ท้ายสุดของกลุ่มนี้) */}
        <Route path="/mylists/:id" element={<MyLists2 />} />

      </Routes>
    </div>
  );
}

export default App;