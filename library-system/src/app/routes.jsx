// src/app/routes.jsx
import { createBrowserRouter } from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import Admin from "../pages/Admin";
import Books from "../pages/Books";
import LoanCart from "../pages/LoanCart";
import PurchaseCart from "../pages/PurchaseCart";
import MyHistory from "../pages/MyHistory";
import MyLoans from "../pages/MyLoans";
import ProtectedRoute from "../components/ProtectedRoute";

export const router = createBrowserRouter([
  { path: "/", element: <Login /> },
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },

  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/books",
    element: (
      <ProtectedRoute>
        <Books />
      </ProtectedRoute>
    ),
  },
  {
    path: "/cart/loans",
    element: (
      <ProtectedRoute>
        <LoanCart />
      </ProtectedRoute>
    ),
  },
  {
    path: "/cart/purchases",
    element: (
      <ProtectedRoute>
        <PurchaseCart />
      </ProtectedRoute>
    ),
  },
  {
    path: "/me/loans",
    element: (
      <ProtectedRoute>
        <MyLoans />
      </ProtectedRoute>
    ),
  },
  {
    path: "/me/history",
    element: (
      <ProtectedRoute>
        <MyHistory />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin",
    element: (
      <ProtectedRoute role="ADMIN">
        <Admin />
      </ProtectedRoute>
    ),
  },

  { path: "*", element: <Login /> },
]);
