// src/components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { AuthService } from "../services/auth.service";

export default function ProtectedRoute({ children, role }) {
  const user = AuthService.currentUser();
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/dashboard" replace />;
  return children;
}
