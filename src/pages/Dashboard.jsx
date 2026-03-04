import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { User } from "lucide-react";
import { Navigate, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { logout, selectIsAdmin } from "../store/features/authSlice";
import { useEnrollment } from "../hooks/useEnrollment";
import StatementBuilder from "../components/StatementBuilder";
import StatementsView from "../components/StatementsView";
import Home from "../components/Home";

const TABS = [
  { id: "home", label: "Home" },
  { id: "create", label: "Create Statement" },
  { id: "view", label: "View Statements" },
];

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user, isLoggedIn } = useSelector((s) => s.auth);
  const isAdmin = useSelector(selectIsAdmin);
  const navigate = useNavigate();
  const { enrollments, fetchEnrollments } = useEnrollment();
  const [activeTab, setActiveTab] = useState("home");

  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (isAdmin) return <Navigate to="/admin" replace />;

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const handleLogout = async () => {
    localStorage.removeItem("token");
    dispatch(logout());
    toast.success("Logged out");
    navigate("/login");
  };

  // enrollment.group is now a populated object { _id, name, slug }
  const enrollmentSummary = enrollments
    .filter((e) => e.course?.courseCode && e.group?.name)
    .map((e) => `${e.course.courseCode}: ${e.group.name}`)
    .join("  ·  ");

  return (
    <div className="flex flex-col min-h-screen bg-navy">
      <header className="sticky top-0 z-10 flex items-center justify-between px-8 py-4 bg-[#111827] border-b border-white/8 backdrop-blur-sm">
        <div className="flex items-center gap-6 text-sm text-[#7b8399]">
          <span className="flex items-center gap-2">
            <User className="w-4 h-4" />
            {user.username}
          </span>
          <span className="hidden sm:flex items-center gap-2">
            <span>✉️</span>
            {user.email}
          </span>
          {enrollmentSummary && (
            <span className="hidden md:block text-[#4a5168]">
              {enrollmentSummary}
            </span>
          )}
        </div>

        <button
          onClick={handleLogout}
          className="px-4 py-2 text-sm text-[#e05c5c] border border-[#e05c5c]/25 rounded-lg transition-all duration-200 hover:bg-[#e05c5c]/10 hover:border-[#e05c5c]/50"
        >
          Logout
        </button>
      </header>

      <nav className="flex gap-1 px-8 bg-[#111827] border-b border-white/8">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`px-5 py-3.5 text-sm font-medium border-b-2 transition-all duration-200 -mb-px ${
              activeTab === id
                ? "text-gold border-gold"
                : "text-[#7b8399] border-transparent hover:text-[#e8eaf0]"
            }`}
          >
            {label}
          </button>
        ))}
      </nav>

      <main className="flex-1 w-full max-w-6xl mx-auto px-8 py-8">
        {activeTab === "home" && <Home onNavigate={setActiveTab} />}
        {activeTab === "create" && <StatementBuilder />}
        {activeTab === "view" && <StatementsView />}
      </main>
    </div>
  );
};

export default Dashboard;
