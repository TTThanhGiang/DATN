// src/layout/AdminLayout.jsx
import React from "react";
import Sidebar from "../components/Admin/Sidebar";
import { getUser, getRole } from "../utils/auth";


export default function AdminLayout({ children }) {
  const user = getUser();
  const role = getRole();

  return (
    <div className="app">   
      <Sidebar vaiTro={role} />
        
      <div className="app-wrapper">
        {children}
      </div>
    </div>
  );
}
