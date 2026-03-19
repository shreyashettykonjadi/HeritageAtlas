import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

export default function Login() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      await api.post("/auth/login", {
        email,
        password,
      });

      const session = await api.get("/auth/me");
      setUser(session?.data ?? null);
      navigate("/");
    } catch (err) {
      const message = err?.response?.data?.message || "Login failed. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-2xl bg-white border border-gray-100 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.2)] p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
        <p className="text-sm text-gray-500 mt-1">Sign in to your Heritage Atlas account.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={function (e) { setEmail(e.target.value); }}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1B4436]/20 focus:border-[#1B4436]"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={function (e) { setPassword(e.target.value); }}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1B4436]/20 focus:border-[#1B4436]"
              placeholder="Enter your password"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 px-4 py-2.5 rounded-xl font-semibold text-white bg-[#1B4436] hover:bg-[#153429] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Signing in..." : "Log In"}
          </button>
        </form>

        <p className="text-sm text-gray-600 mt-5">
          Don&apos;t have an account?{" "}
          <Link to="/register" className="font-medium text-[#1B4436] hover:underline">Create one</Link>
        </p>
      </div>
    </div>
  );
}
