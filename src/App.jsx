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
import MyLists3 from './components/MyLists/MyLists3';

// ✅ หน้า OTP (ตามไฟล์จริงของคุณ)
import VerifyCode from './components/Register/VerifyCode';
import VerifySuccess from './components/Register/VerifySuccess';
import ResetPassword from './components/Register/ResetPassword';

import { FavoritesProvider } from './context/FavoritesContext';
import ForgotPassword from './components/Login/ForgotPassword';

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
      <FavoritesProvider>
      <Routes>

        {/* ===== HOME SECTION ===== */}
        <Route path="/" element={<><Navbar /><Home /><Footer /></>} />

        {/* ===== AUTH SECTION ===== */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ✅ หน้า OTP */}
        <Route path="/verify" element={<VerifyCode />} />

        {/* ✅ หน้า “ยืนยันรหัสสำเร็จ” */}
        <Route path="/verify-success" element={<VerifySuccess />} />

        {/* ✅ หน้า “เปลี่ยนรหัสผ่านใหม่” */}
        <Route path="/reset-password" element={<ResetPassword />} />

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

        <Route path="/mylists/compare/:id" element={<MyLists3 />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

      </Routes>
      </FavoritesProvider>
    </div>
  );
}

export default App;
