import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Agendamentos from "./pages/Agendamentos";
import Dashboard from "./pages/Dashboard";
import "./App.css";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/agendamentos" element={<Agendamentos />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
