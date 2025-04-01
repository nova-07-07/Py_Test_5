import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  const token = localStorage.getItem("token"); // Retrieve token
  console.log("🔍 Checking token in ProtectedRoute:", token);

  if (!token) {
    console.log("❌ No token found, redirecting to Sign In...");
    return <Navigate to="/signin" replace />;
  }

  console.log("✅ Token found, granting access to dashboard.");
  return <Outlet />;
};

export default ProtectedRoute;
