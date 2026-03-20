import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api, { getApiData } from "../services/api";

export default function AuthModal() {
    const {
        authModalOpen,
        authModalMessage,
        handleAuthSuccess,
        closeAuthModal,
    } = useAuth();

    const [mode, setMode] = useState("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Reset form when modal opens/closes
    useEffect(function () {
        if (authModalOpen) {
            setMode("login");
            setEmail("");
            setPassword("");
            setError("");
            setLoading(false);
        }
    }, [authModalOpen]);

    // Close on Escape
    useEffect(function () {
        if (!authModalOpen) return;

        function handleKeyDown(e) {
            if (e.key === "Escape") closeAuthModal();
        }

        document.addEventListener("keydown", handleKeyDown);
        return function () {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [authModalOpen, closeAuthModal]);

    if (!authModalOpen) return null;

    async function handleSubmit(event) {
        event.preventDefault();
        setLoading(true);
        setError("");

        try {
            const endpoint = mode === "login" ? "/auth/login" : "/auth/register";
            await api.post(endpoint, { email, password });

            const session = await api.get("/auth/me");
            handleAuthSuccess(getApiData(session));
        } catch (err) {
            const message =
                err?.response?.data?.message ||
                (mode === "login"
                    ? "Login failed. Please try again."
                    : "Registration failed. Please try again.");
            setError(message);
        } finally {
            setLoading(false);
        }
    }

    function switchMode() {
        setMode(mode === "login" ? "register" : "login");
        setError("");
    }

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={closeAuthModal}
            />

            {/* Modal */}
            <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-[modalSlideUp_0.3s_ease-out]">
                {/* Close button */}
                <button
                    type="button"
                    onClick={closeAuthModal}
                    className="absolute top-4 right-4 z-10 p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                    aria-label="Close"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Header with context-aware messaging */}
                <div className="bg-gradient-to-br from-[#1B4436] to-[#2C5E4F] px-6 py-8 text-center">
                    <div className="w-12 h-12 rounded-full bg-white/15 flex items-center justify-center mx-auto mb-4">
                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-white mb-1">
                        {authModalMessage.headline}
                    </h2>
                    <p className="text-white/70 text-sm leading-relaxed">
                        {authModalMessage.subtext}
                    </p>
                </div>

                {/* Form */}
                <div className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email
                            </label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={function (e) { setEmail(e.target.value); }}
                                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1B4436]/20 focus:border-[#1B4436] transition-colors"
                                placeholder="you@example.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Password
                            </label>
                            <input
                                type="password"
                                required
                                minLength={8}
                                value={password}
                                onChange={function (e) { setPassword(e.target.value); }}
                                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1B4436]/20 focus:border-[#1B4436] transition-colors"
                                placeholder={mode === "register" ? "Minimum 8 characters" : "Enter your password"}
                            />
                        </div>

                        {error && (
                            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full px-4 py-2.5 rounded-xl font-semibold text-white bg-[#1B4436] hover:bg-[#153429] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                        >
                            {loading
                                ? (mode === "login" ? "Signing in..." : "Creating account...")
                                : (mode === "login" ? "Log In" : "Sign Up Free")
                            }
                        </button>
                    </form>

                    {/* Switch mode */}
                    <p className="text-sm text-gray-500 text-center mt-5">
                        {mode === "login" ? (
                            <>
                                Don&apos;t have an account?{" "}
                                <button
                                    type="button"
                                    onClick={switchMode}
                                    className="font-medium text-[#1B4436] hover:underline"
                                >
                                    Create one
                                </button>
                            </>
                        ) : (
                            <>
                                Already have an account?{" "}
                                <button
                                    type="button"
                                    onClick={switchMode}
                                    className="font-medium text-[#1B4436] hover:underline"
                                >
                                    Log In
                                </button>
                            </>
                        )}
                    </p>
                </div>
            </div>
        </div>
    );
}
