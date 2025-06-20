import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AutoLogout from "./components/AutoLogout"; // import the new component
import SetAvatar from "./components/SetAvatar";
import Chat from "./pages/Chat";
import Login from "./pages/Login";
import Register from "./pages/Register";

export default function App() {
  return (
    <BrowserRouter>
      <AutoLogout>
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/setAvatar" element={<SetAvatar />} />
          <Route path="/" element={<Chat />} />
        </Routes>
      </AutoLogout>
    </BrowserRouter>
  );
}
