import { createSlice } from "@reduxjs/toolkit";
import { tokenStorage } from "../../utils/tokenStorage";

const initialToken = tokenStorage.getToken();
const initialUser = tokenStorage.getUser();

const initialState = {
  user: initialUser,
  token: initialToken,
  isAuthenticated: !!initialToken,
  isLoading: false,
  isInitializing: !!initialToken, // True if we have a token that needs validation on boot
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, accessToken, token } = action.payload;
      const validToken = accessToken || token;

      if (user) {
        state.user = user;
        tokenStorage.setUser(user);
      }
      if (validToken) {
        state.token = validToken;
        tokenStorage.setToken(validToken);
        state.isAuthenticated = true;
      }
      state.isLoading = false;
      state.isInitializing = false;
    },
    setUser: (state, action) => {
      state.user = action.payload;
      tokenStorage.setUser(action.payload);
      state.isLoading = false;
      state.isInitializing = false;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setInitializing: (state, action) => {
      state.isInitializing = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.isInitializing = false;
      tokenStorage.clear();
    },
  },
});

export const {
  setCredentials,
  setUser,
  setLoading,
  setInitializing,
  logout,
} = authSlice.actions;

export const selectCurrentUser = (state) => state.auth.user;
export const selectCurrentToken = (state) => state.auth.token;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectUserRole = (state) => state.auth.user?.role;
export const selectAuthLoading = (state) => state.auth.isLoading;
export const selectIsInitializing = (state) => state.auth.isInitializing;

export default authSlice.reducer;
