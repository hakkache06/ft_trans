import jwtDecode from "jwt-decode";
import React, { createContext } from "react";
import { useLocation } from "react-router-dom";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import ky from "ky";
import { Socket } from "socket.io-client";

export function useQuery() {
  const { search } = useLocation();

  return React.useMemo(() => new URLSearchParams(search), [search]);
}

interface AuthState {
  user: User | null;
  id: string | null;
  token: string | null;
  tfa_required: boolean;
  login: (token: string) => void;
  logout: () => void;
  setUser: (user: User) => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      id: null,
      token: null,
      tfa_required: false,
      login: (token: string) => {
        const payload = jwtDecode(token) as any;
        set({ token, tfa_required: payload.tfa_required, id: payload.id });
      },
      logout: () => {
        set({ token: null, tfa_required: false, id: null, user: null });
      },
      setUser: (user: User) => set({ user }),
    }),
    {
      name: "auth",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export const useUsers = create<{
  friends: User[];
  pending: User[];
  online: string[];
  blocklist: string[];
  fetchFriends: () => Promise<void>;
  setFriends: (friends: User[]) => void;
  setOnline: (online: string[]) => void;
  setBlocklist: (blocklist: string[]) => void;
}>((set) => ({
  friends: [],
  pending: [],
  online: [],
  blocklist: [],
  fetchFriends: async () => {
    const response = await api.get("friends");
    const { friends, pending } = await response.json<{
      friends: User[];
      pending: User[];
    }>();
    set({ friends, pending });
  },
  setFriends: (friends: User[]) =>
    set({
      friends,
    }),
  setOnline: (online: string[]) =>
    set({
      online,
    }),
  setBlocklist: (blocklist: string[]) =>
    set({
      blocklist,
    }),
}));

export const api = ky.extend({
  prefixUrl: import.meta.env.VITE_BACKEND_URL,
  hooks: {
    beforeRequest: [
      (options) => {
        const token = useAuth.getState().token;

        if (token) {
          options.headers.set("Authorization", `Bearer ${token}`);
        }
      },
    ],
    afterResponse: [
      async (request, options, response) => {
        if (response.status === 401) {
          useAuth.getState().logout();
          return response;
        }
      },
    ],
  },
});

export const SocketContext = createContext<Socket | undefined>(undefined);
