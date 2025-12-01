// src/components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { getUser } from "../utils/auth";

export default function ProtectedRoute({ children, vai_tro }) {
  const user = getUser();

  if (!user) return <Navigate to="/login" replace />;

  // Nếu route yêu cầu role cụ thể mà user không có quyền
  if (vai_tro && user.vai_tro !== vai_tro) {
    return <Navigate to="/" replace />;
  }

  return children;
}
