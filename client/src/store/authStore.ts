import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
    id: string;
    username: string;
    token: string;
}

interface AuthState {
    user: User | null;
    isGuest: boolean;
    login: (user: User) => void;
    logout: () => void;
    setGuest: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isGuest: false,
            login: (user) => set({ user, isGuest: false }),
            logout: () => set({ user: null, isGuest: false }),
            setGuest: () => set({ isGuest: true, user: null })
        }),
        { name: 'dart-auth-storage' }
    )
)
