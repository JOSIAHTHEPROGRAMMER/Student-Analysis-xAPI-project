import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Toaster } from "react-hot-toast";

import { login, setLoading, selectIsAdmin } from "./store/features/authSlice";
import api from "./configs/api";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminEnrollments from "./pages/admin/AdminEnrollments";
import AdminStatements from "./pages/admin/AdminStatements";

// Shown while the auth rehydration request (/api/user/me) is in flight.
// Prevents route guards from flashing a redirect before we know the auth state.
const FullPageLoader = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-[#0d1117]">
    <div className="flex flex-col items-center gap-4">
      <div className="w-8 h-8 rounded-full border-2 border-white/10 border-t-gold animate-spin" />
      <p className="text-xs tracking-[0.15em] uppercase text-[#7b8399]">
        Loading
      </p>
    </div>
  </div>
);

// Blocks rendering until rehydration is complete.
// Prevents route guards from firing before /api/user/me resolves.
const ProtectedRoute = ({ children }) => {
  const { isLoggedIn, isLoading } = useSelector((s) => s.auth);
  if (isLoading) return <FullPageLoader />;
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  return children;
};

const ProtectedAdmin = ({ children }) => {
  const { isLoggedIn, isLoading } = useSelector((s) => s.auth);
  const isAdmin = useSelector(selectIsAdmin);
  if (isLoading) return <FullPageLoader />;
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return children;
};

// Redirects already-authenticated users away from /login
const PublicRoute = ({ children }) => {
  const { isLoggedIn, isLoading } = useSelector((s) => s.auth);
  const isAdmin = useSelector(selectIsAdmin);
  if (isLoading) return <FullPageLoader />;
  if (isLoggedIn)
    return <Navigate to={isAdmin ? "/admin" : "/dashboard"} replace />;
  return children;
};

const App = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    // On mount, check if a JWT exists in localStorage and validate it
    // against the server. If valid, restore the user session into Redux.
    // setLoading(false) is always called in finally so guards unblock.
    const rehydrateUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        dispatch(setLoading(false));
        return;
      }
      dispatch(setLoading(true));
      try {
        const { data } = await api.get("/api/user/me");
        if (data.user) dispatch(login(data.user));
      } catch (error) {
        if (error.response?.status === 401 || error.response?.status === 403) {
          localStorage.removeItem("token");
        }
      } finally {
        dispatch(setLoading(false));
      }
    };

    rehydrateUser();
  }, []);

  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedAdmin>
              <AdminLayout />
            </ProtectedAdmin>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="enrollments" element={<AdminEnrollments />} />
          <Route path="statements" element={<AdminStatements />} />
        </Route>

        {/* Catch-all: unknown routes fall back to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
};

export default App;
