import React from 'react';
import { Routes, Route } from 'react-router-dom'; // ลบ Navigate ออกเพราะไม่ได้ใช้แล้ว
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
        
        {/* หน้า Home (path "/") : รวม Navbar, Hero, Home, Footer ไว้ด้วยกัน */}
        <Route path="/" element={
          <>
            <Navbar />
            <Hero />
            <Home />
            <Footer />
          </>
        } />

        {/* หน้า Login และ Register (แยกออกมาต่างหาก ไม่ติด Navbar มาด้วย) */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/mylists" element={<MyLists />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/mylists/createmylists" element={<CreateMyList />} />
        <Route path="/mylists/listsedit" element={<ListsEdit />} />
        <Route path="/mylists/mylists2" element={<MyLists2 />} />
        <Route path="/mylists/mylists3" element={<MyLists3 />} />
        <Route path="/favorites" element={<Favorites />} />
      </Routes>
    </div>
  );
}

export default App;