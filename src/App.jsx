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
  );
}

export default App;
