import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom'; 
import './App.css';
import { db } from '../firebase-config';
import { collection, getDocs } from 'firebase/firestore';

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
    useEffect(() => {
      const testFirebase = async () => {
        try {
          // ลองดึงข้อมูล (ถ้ายังไม่มี collection ชื่อ users ก็ไม่เป็นไร แค่ไม่ error ก็พอ)
          await getDocs(collection(db, "test_connection")); 
          console.log("Firebase Connected Successfully!");
        } catch (err) {
          console.error("Firebase Connection Error:", err);
        }
      };
      testFirebase();
    }, []);
  return (
    <div className="App">
      <Routes>

        {/* ===== HOME SECTION ===== */}
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

        {/* ===== SHOPPING LIST FLOW ===== */}
        <Route path="/mylists" element={<MyLists />} />
        <Route path="/mylists/create" element={<CreateMyList />} />
        <Route path="/mylists/create/products/:id" element={<Products />} />
        <Route path="/mylists/edit/:id" element={<ListsEdit />} />
        <Route path="/mylists/edit/products/:id" element={<Products />} />
        <Route path="/mylists/:id" element={<MyLists2 />} />
        <Route path="/mylists/compare/:id" element={<MyLists3 />} />

      </Routes>
    </div>
  );
}

export default App;