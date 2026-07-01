import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api, { getApiData } from "../services/api";

const AuthContext = createContext(null);

const AUTH_MESSAGES = {
    visited: {
        headline: "Remember where you've been",
        subtext: "Create a free account to track the heritage sites you've explored around the world.",
    },
    bucket: {
        headline: "Start building your list",
        subtext: "Sign up to save places you dream of visiting. Your bucket list stays with you.",
    },
    save: {
        headline: "Don't lose your thoughts",
        subtext: "Sign in to save your notes and ratings. They'll be here when you come back.",
    },
    journey: {
        headline: "Your journey starts here",
        subtext: "Log in to see your visited sites, bucket list, and personal notes — all in one place.",
    },
    default: {
        headline: "Join Heritage Atlas",
        subtext: "Create an account to track your UNESCO World Heritage journey.",
    },
};

// Auth context provider that manages user state, session checking, and provides a requireAuth function for components to trigger login when needed.
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);

    // Auth modal state
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [authModalReason, setAuthModalReason] = useState("default");
    const [pendingAction, setPendingAction] = useState(null);

    // Session check on mount
    useEffect(function checkSessionOnLoad() {
        async function loadSession() {
            try {
                const response = await api.get("/auth/me");
                setUser(getApiData(response));
            } catch (error) {
                if (error?.response?.status === 401 || error?.isExpectedAuthError) {
                    setUser(null);
                } else {
                    console.error("Unexpected auth session check failure", error);
                    setUser(null);
                }
            } finally {
                setAuthLoading(false);
            }
        }

        loadSession();
    }, []);

    // Listen for unauthorized events globally (from axios interceptor)
    useEffect(function setupAuthInterceptorListener() {
        function handleUnauthorized() {
            setUser(null);
        }
        window.addEventListener("auth:unauthorized", handleUnauthorized);
        return function () {
            window.removeEventListener("auth:unauthorized", handleUnauthorized);
        };
    }, []);

    // Open auth modal with context-aware messaging
    // Returns true if already logged in, false if modal was shown.
    // The onSuccess callback is ONLY used after a modal login completes.
    const requireAuth = useCallback(function (reason, onSuccess) {
        if (user) {
            return true;
        }

        setAuthModalReason(reason || "default");
        setPendingAction(function () { return onSuccess; });
        setAuthModalOpen(true);
        return false;
    }, [user]);

    // Called after successful login/register inside the modal
    const handleAuthSuccess = useCallback(function (userData) {
        setUser(userData);
        setAuthModalOpen(false);

        // Run the pending action that triggered the modal
        if (pendingAction) {
            const action = pendingAction;
            setPendingAction(null);
            if (typeof action === "function") {
                const fn = action();
                if (typeof fn === "function") fn();
            }
        }
    }, [pendingAction]);

    // Close the auth modal and clear any pending action
    const closeAuthModal = useCallback(function () {
        setAuthModalOpen(false);
        setPendingAction(null);
    }, []);

    const logout = useCallback(async function () {
        try {
            await api.post("/auth/logout");
        } catch (error) {
            // Proceed with client-side logout even if API fails
        }
        setUser(null);
    }, []);

    const message = AUTH_MESSAGES[authModalReason] || AUTH_MESSAGES.default;

    const value = {
        user,
        setUser,
        authLoading,
        logout,
        requireAuth,
        authModalOpen,
        authModalReason,
        authModalMessage: message,
        handleAuthSuccess,
        closeAuthModal,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

// Custom hook to access auth context, ensuring it's used within the provider.
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
