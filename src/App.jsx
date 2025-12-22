import React from 'react';
import Login from './components/Login/Login';
import './App.css';
import Register from './components/Register/register';

import Navbar from './components/Home/Navbar';
import Footer from './components/Home/Footer';
import Hero from './components/Home/hero';

import Home from './Home';


function App() {
  return (
    <div className="App">
      <Navbar />
      <Hero />
      <Home />
      <Footer />
      
    </div>
    
  );
}

export default App;
