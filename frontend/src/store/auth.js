import { create } from "zustand";

export const useAuthStore = create((set) => ({
    user: JSON.parse(localStorage.getItem("user")) || null, // ✅ Load from localStorage on start
    login: (userData) => {
        localStorage.setItem("user", JSON.stringify(userData)); // ✅ Save user
        set({ user: userData });
    },
    logout: () => {
        localStorage.removeItem("user");
        localStorage.removeItem("token"); // ✅ Clear token
        set({ user: null });
    },
}));
