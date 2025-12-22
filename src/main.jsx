<<<<<<< HEAD
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom' // 1. เพิ่มบรรทัดนี้
import './index.css'
import App from './App.jsx'
=======
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
>>>>>>> eecc526f8cd5d825c595c4fc4e4f39dc4588bf9d

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
<<<<<<< HEAD
  </StrictMode>,
)
=======
  </StrictMode>
);
>>>>>>> eecc526f8cd5d825c595c4fc4e4f39dc4588bf9d
