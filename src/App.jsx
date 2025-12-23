import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom'; // 1. เพิ่ม Navigate ตรงนี้
import Login from './components/Login/Login';
import Register from './components/Register/register';
import './App.css';

import Navbar from './components/Home/Navbar';
import Footer from './components/Home/Footer';
import Hero from './components/Home/hero';

import Home from './Home';


function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
      
      <Navbar />
      <Hero />
      <Home />
      <Footer />
      
    </div>
    
  );
}

export default App;
