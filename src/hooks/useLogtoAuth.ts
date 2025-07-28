"use client";

export function useLogtoAuth() {
  return {
    isAuthenticated: false,
    user: null,
    isLoading: false,
    getAccessToken: async () => "",
  };
}
