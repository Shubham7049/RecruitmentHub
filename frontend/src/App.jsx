import React from "react";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { Briefcase } from "lucide-react";
import { AppRoutes } from "./routes/AppRoutes";
import { useGetCurrentUserQuery } from "./store/api/authApi";
import { tokenStorage } from "./utils/tokenStorage";
import { Spinner } from "./components/common/Spinner";
import { useAuth } from "./hooks/useAuth";

export const App = () => {
  const hasToken = !!tokenStorage.getToken();
  const { isInitializing } = useAuth();

  // Attempt to re-hydrate the full current user session if a token exists in storage
  const { isLoading, isFetching } = useGetCurrentUserQuery(undefined, {
    skip: !hasToken,
  });

  // Display clean splash screen while restoring session to prevent route flash
  if (hasToken && (isLoading || isFetching) && isInitializing) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-600 text-white shadow-xl shadow-primary-600/30 mb-4 animate-pulse">
          <Briefcase className="h-7 w-7" />
        </div>
        <Spinner size="md" label="Verifying session..." />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: "#ffffff",
            color: "#0f172a",
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
            borderRadius: "0.75rem",
            border: "1px solid #e2e8f0",
            padding: "0.75rem 1rem",
            fontSize: "0.875rem",
            fontWeight: "500",
          },
          success: {
            iconTheme: {
              primary: "#10b981",
              secondary: "#ffffff",
            },
          },
          error: {
            iconTheme: {
              primary: "#f43f5e",
              secondary: "#ffffff",
            },
          },
        }}
      />
      <AppRoutes />
    </BrowserRouter>
  );
};

export default App;
