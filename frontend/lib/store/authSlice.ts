import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { clearAuthCookies, setAuthCookies } from "@/lib/auth/cookies";

type User = {
  _id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  picture?: string;
  role?: string;
};

type Tokens = {
  accessToken: string;
  refreshToken?: string;
};

type AuthState = {
  user: User | null;
  tokens: Tokens | null;
};

const initialState: AuthState = {
  user:
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("user") || "null")
      : null,
  tokens:
    typeof window !== "undefined"
      ? { accessToken: localStorage.getItem("accessToken") || "" }
      : null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuth(state, action: PayloadAction<{ user: User; tokens: Tokens }>) {
      state.user = action.payload.user;
      state.tokens = action.payload.tokens;

      if (typeof window !== "undefined") {
        localStorage.setItem("accessToken", action.payload.tokens.accessToken);
        localStorage.setItem("user", JSON.stringify(action.payload.user));
        if (action.payload.tokens.refreshToken) {
          localStorage.setItem(
            "refreshToken",
            action.payload.tokens.refreshToken,
          );
        }

        setAuthCookies({
          accessToken: action.payload.tokens.accessToken,
          role: action.payload.user.role,
        });
      }
    },
    logout(state) {
      state.user = null;
      state.tokens = null;

      if (typeof window !== "undefined") {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");

        clearAuthCookies();
      }
    },
    updateProfile(state, action: PayloadAction<Partial<User>>) {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        if (typeof window !== "undefined") {
          localStorage.setItem("user", JSON.stringify(state.user));
        }
      }
    },
  },
});

export const { setAuth, logout, updateProfile } = authSlice.actions;
export default authSlice.reducer;
