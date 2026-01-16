import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom'; 
import './App.css';
import { db } from './firebase-config';
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
import MyLists from './components/MyLists/MyLists';       
import CreateMyList from './components/MyLists/CreateMyList'; 
import ListsEdit from './components/MyLists/ListsEdit';   

// ❌ ลบหรือ Comment บรรทัดนี้ออก เพราะเราไม่ได้ใช้แล้ว
// import MyLists2 from './components/MyLists/MyLists2';     

import MyLists3 from './components/MyLists/MyLists3';     

function App() {
    useEffect(() => {
      const testFirebase = async () => {
        try {
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
        
        {/* Route นี้ Comment ไว้อยู่แล้ว ถูกต้องครับ */}
        {/* <Route path="/mylists/:id" element={<MyLists2 />} /> */}
        
        <Route path="/mylists/compare/:id" element={<MyLists3 />} />

      </Routes>
    </div>
  );
}

export default App;