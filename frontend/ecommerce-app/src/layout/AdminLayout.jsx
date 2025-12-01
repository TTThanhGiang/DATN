// src/layout/AdminLayout.jsx
import React from "react";
import Sidebar from "../components/Admin/SideBar";
import { getUser, getRole } from "../utils/auth";
 
// import "../assets/css/portal.css";

export default function AdminLayout({ children }) {
  const user = getUser();
  user.role = getRole();

  return (
    <div className="app">   
      <Sidebar role={user.role} />
        
      <div className="app-wrapper">
        {children}
      </div>
    </div>
  );
}
