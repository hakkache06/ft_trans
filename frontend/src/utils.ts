import jwtDecode from "jwt-decode";
import React, { createContext } from "react";
import { useLocation } from "react-router-dom";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import ky from "ky";
import { router } from "./main";
import { Socket } from "socket.io-client";

export function useQuery() {
  const { search } = useLocation();

  return React.useMemo(() => new URLSearchParams(search), [search]);
}

interface BearState {
  token: string | null;
  tfa_required: boolean;
  login: (token: string) => void;
  logout: () => void;
}

export const useAuth = create<BearState>()(
  persist(
    (set) => ({
      token: null,
      tfa_required: false,
      login: (token: string) =>
        set({ token, tfa_required: (jwtDecode(token) as any).tfa_required }),
      logout: () => {
        set({ token: null, tfa_required: false });
        router.navigate("/login");
      },
    }),
    {
      name: "auth",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

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
