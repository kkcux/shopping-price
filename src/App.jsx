import React from 'react';
import { Routes, Route } from 'react-router-dom'; 
import './App.css';

// Components Imports
import Login from './components/Login/Login';
import Register from './components/Register/register';
import Navbar from './components/Home/Navbar';
import Footer from './components/Home/Footer';
import Home from './components/Home/Home'; 
import Profile from './components/Profile/Profile';
import Favorites from './components/Favorites/Favorites';
import Categories from './components/Categories/Categories';

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

        {/* ===== HOME ===== */}
        <Route
          path="/"
          element={
            <>
              <Navbar />
              <Home />
              <Footer />
            </>
          }
        />

        {/* ===== AUTH ===== */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ===== FEATURES ===== */}
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/profile" element={<Profile />} />

        {/* ===== MYLISTS ===== */}

        {/* 1. หน้ารวมรายการ */}
        <Route path="/mylists" element={<MyLists />} />

        {/* 2. สร้างรายการใหม่ (static มาก่อน dynamic) */}
        <Route path="/mylists/create" element={<CreateMyList />} />

        {/* 3. แก้ไขรายการ */}
        <Route path="/mylists/edit/:id" element={<ListsEdit />} />

        {/* 4. หน้ารายละเอียดรายการ (MyLists2) */}
        <Route path="/mylists/:id" element={<MyLists2 />} />

        {/* 5. หน้าเปรียบเทียบราคา (MyLists3) ✅ ใช้ id */}
        <Route path="/mylists/compare/:id" element={<MyLists3 />} />

<Route path="/categories" element={<Categories />} />
      </Routes>
    </div>
  );
}

export default App;
