import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../configs/api";
import { login } from "../store/features/authSlice";

const STATS = [
  { value: "20", label: "Unique Verbs" },
  { value: "2", label: "Courses" },
  { value: "∞", label: "Statements" },
];

const EMPTY_FORM = {
  identifier: "",
  password: "",
};

const Label = ({ htmlFor, children }) => (
  <label
    htmlFor={htmlFor}
    className="text-[0.72rem] font-medium tracking-[0.09em] uppercase text-[#7b8399]"
  >
    {children}
  </label>
);

const Input = ({ isFocused, ...props }) => (
  <input
    {...props}
    className={`w-full bg-white/3 border rounded-lg px-4 py-3 text-sm text-[#e8eaf0] outline-none appearance-none transition-all duration-200 placeholder:text-[#7b8399] ${
      isFocused
        ? "border-gold shadow-[0_0_0_3px_var(--gold-dim)]"
        : "border-white/8 hover:border-white/[0.14]"
    }`}
  />
);

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY_FORM);
  const [isLoading, setIsLoading] = useState(false);
  const [focused, setFocused] = useState(null);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const focus = (name) => () => setFocused(name);
  const blur = () => setFocused(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsLoading(true);
    try {
      const { data } = await api.post("/api/user/login", {
        identifier: form.identifier,
        password: form.password,
      });

      if (data.token) localStorage.setItem("token", data.token);
      dispatch(login(data.user));
      toast.success("Welcome back.");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-navy relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
            maskImage:
              "radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)",
          }}
        />
        <div className="absolute w-125 h-125 -top-36 -left-24 rounded-full blur-[80px] bg-[radial-gradient(circle,rgba(201,168,76,0.12)_0%,transparent_70%)]" />
        <div className="absolute w-100 h-100 -bottom-24 right-[30%] rounded-full blur-[80px] bg-[radial-gradient(circle,rgba(59,130,246,0.08)_0%,transparent_70%)]" />
      </div>

      {/* Left panel */}
      <aside className="hidden lg:flex w-105 shrink-0 relative z-10 border-r border-white/8 bg-linear-to-b from-[#1a2235] to-navy">
        <div className="flex flex-col p-14 w-full">
          <div className="flex items-center gap-3 mb-20">
            <div className="w-9 h-9 border border-gold/80 rounded-lg flex items-center justify-center relative">
              <div className="absolute inset-1 bg-gold/25 rounded" />
              <div className="w-2.5 h-2.5 bg-gold rounded-sm relative z-10" />
            </div>
            <span className="text-xs font-medium tracking-[0.18em] uppercase text-[#7b8399]">
              COMP&nbsp;3609 &amp; COMP&nbsp;3610
            </span>
          </div>

          <div className="flex-1">
            <h1 className="font-display text-[2.6rem] leading-[1.15] font-normal text-[#e8eaf0] mb-6">
              Track your
              <br />
              <em className="italic text-gold">
                learning
                <br />
                journey.
              </em>
            </h1>
            <p className="text-sm leading-relaxed text-[#7b8399] max-w-65">
              Record, reflect, and share your progress through xAPI statements
              built for Game Programming and Big Data.
            </p>
          </div>

          <div className="flex gap-8 pt-10 border-t border-white/8">
            {STATS.map(({ value, label }) => (
              <div key={label} className="flex flex-col gap-1">
                <span className="font-display text-[1.75rem] text-gold leading-none">
                  {value}
                </span>
                <span className="text-[0.68rem] tracking-widest uppercase text-[#7b8399]">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Right panel */}
      <main className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-105 bg-[#111827] border border-white/8 rounded-2xl p-10 animate-[fadeUp_0.45s_cubic-bezier(0.22,1,0.36,1)_both]">
          {/* Header */}
          <header className="mb-7">
            <p className="text-[0.68rem] tracking-[0.15em] uppercase text-gold mb-2">
              Learning Analytics
            </p>
            <h2 className="font-display text-[1.85rem] font-normal text-[#e8eaf0] mb-1">
              Welcome back.
            </h2>
            <p className="text-sm text-[#7b8399]">
              Sign in with your email or username
            </p>
          </header>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-5"
            noValidate
          >
            {/* Identifier */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="identifier">Email or Username</Label>
              <Input
                id="identifier"
                name="identifier"
                type="text"
                value={form.identifier}
                onChange={handleChange}
                onFocus={focus("identifier")}
                onBlur={blur}
                placeholder="john@example.com or john.doe"
                required
                isFocused={focused === "identifier"}
                autoComplete="username"
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                onFocus={focus("password")}
                onBlur={blur}
                placeholder="••••••••"
                required
                isFocused={focused === "password"}
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 w-full flex items-center justify-center gap-2.5 px-6 py-3.5 bg-gold text-navy text-sm font-medium tracking-wide rounded-lg transition-all duration-200 hover:bg-[#d4b05a] hover:shadow-gold hover:-translate-y-px active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <span className="w-4 h-4 border-2 border-navy/25 border-t-navy rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4">
                    <path
                      d="M3 8h10M9 4l4 4-4 4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </>
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Login;
