import { useState, useCallback, useEffect } from "react";

interface GoogleAuthState {
  isAuthenticated: boolean;
  accessToken: string | null;
  isLoading: boolean;
  error: string | null;
}

export function useGoogleAuth() {
  const [authState, setAuthState] = useState<GoogleAuthState>({
    isAuthenticated: false,
    accessToken: null,
    isLoading: false,
    error: null,
  });

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;

      const { success, data, error } = event.data;

      if (success && data) {
        setAuthState({
          isAuthenticated: true,
          accessToken: data.accessToken,
          isLoading: false,
          error: null,
        });
      } else if (error) {
        setAuthState((prev) => ({
          ...prev,
          isLoading: false,
          error: error,
        }));
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const initiateAuth = useCallback(async () => {
    setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch("/api/auth/google");
      const { url } = await response.json();

      const width = 500;
      const height = 600;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;

      window.open(
        url,
        "Google Auth",
        `width=${width},height=${height},left=${left},top=${top}`
      );

      setTimeout(() => {
        setAuthState((prev) => {
          if (prev.isLoading) {
            return {
              ...prev,
              isLoading: false,
              error: "Authentication timed out",
            };
          }
          return prev;
        });
      }, 120000);
    } catch (error) {
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to initialize authentication",
      }));
    }
  }, []);

  return {
    ...authState,
    initiateAuth,
  };
}
