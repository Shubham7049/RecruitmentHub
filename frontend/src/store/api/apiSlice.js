import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { setCredentials, logout } from "../slices/authSlice";

const BASE_URL = import.meta.env.VITE_API_URL || "/api/v1";
const baseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token;
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  // If unauthorized, attempt to rotate access token using refresh token
  if (result.error && result.error.status === 401) {
    // Avoid infinite loop if the refresh call itself returned 401
    const isRefreshCall = typeof args === "string" 
      ? args.includes("refresh-token") 
      : args.url?.includes("refresh-token");

    if (!isRefreshCall) {
      const refreshResult = await baseQuery(
        {
          url: "/users/refresh-token",
          method: "POST",
          body: {},
        },
        api,
        extraOptions
      );

      if (refreshResult.data?.data?.accessToken) {
        // Store new access token
        api.dispatch(
          setCredentials({
            accessToken: refreshResult.data.data.accessToken,
          })
        );
        // Retry the original query with the refreshed token
        result = await baseQuery(args, api, extraOptions);
      } else {
        // Refresh token expired or revoked - perform clean logout
        api.dispatch(logout());
      }
    }
  }

  return result;
};

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    "User",
    "Profile",
    "Company",
    "Job",
    "Application",
    "SavedJob",
    "Interview",
    "Notification",
    "Admin",
  ],
  endpoints: () => ({}),
});
