<<<<<<< HEAD
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom'; // 1. เพิ่ม Navigate ตรงนี้
import Login from './components/Login/Login';
import Register from './components/Register/register';
import './App.css';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </div>
=======
import { Routes, Route } from "react-router-dom";
import Login from "./components/Login/Login";
import Register from "./components/Register/register";
import "./App.css";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Routes>
>>>>>>> eecc526f8cd5d825c595c4fc4e4f39dc4588bf9d
  );
}

export default App;