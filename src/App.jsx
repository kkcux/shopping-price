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

// ✅ Import Products
import Products from './components/Products/Products'; 

function App() {
  return (
    <div className="App">
      <Routes>

        {/* ===== HOME ===== */}
        <Route path="/" element={<><Navbar /><Home /><Footer /></>} />

        {/* ===== AUTH ===== */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ===== FEATURES ===== */}
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/profile" element={<Profile />} />

        {/* ===== PRODUCT ===== */}
        <Route path="/products" element={<Products />} />
        <Route path="/categories" element={<Categories />} />

        {/* ✅ เพิ่ม Route สำหรับการเพิ่มสินค้าตาม ID ของรายการ (List ID) */}
        {/* กรณี: กำลังแก้ไขรายการ (Edit) แล้วกดเพิ่มสินค้า */}
        <Route path="/mylists/edit/products/:id" element={<Products />} />
        
        {/* กรณี: กำลังสร้างรายการใหม่ (Create) แล้วกดเพิ่มสินค้า (ถ้ามี id ชั่วคราว) */}
        <Route path="/mylists/create/products/:id" element={<Products />} />


        {/* ===== MYLISTS ===== */}
        <Route path="/mylists" element={<MyLists />} />
        <Route path="/mylists/create" element={<CreateMyList />} />
        <Route path="/mylists/edit/:id" element={<ListsEdit />} />
        <Route path="/mylists/:id" element={<MyLists2 />} />
        <Route path="/mylists/compare/:id" element={<MyLists3 />} />

      </Routes>
    </div>
  );
}

export default App;