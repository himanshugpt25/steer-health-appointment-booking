"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { checkRefreshToken } from "@/utils/auth";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = async () => {
      // Skip auth check for login and register pages
      if (pathname === "/auth/login" || pathname === "/auth/register") {
        return;
      }

      // First check if we have an access token
      const accessToken = localStorage.getItem("accessToken");

      if (accessToken) {
        // If we have an access token and we're on auth pages, redirect to dashboard
        if (pathname === "/auth/login" || pathname === "/auth/register") {
          router.push("/dashboard");
          return;
        }
        // If we have an access token and we're not on auth pages, stay where we are
        return;
      }

      // If no access token, try to refresh
      const hasValidToken = await checkRefreshToken();
      if (hasValidToken) {
        // If refresh successful and we're on auth pages, redirect to dashboard
        if (pathname === "/auth/login" || pathname === "/auth/register") {
          router.push("/dashboard");
        }
      } else {
        // Only redirect to login if we're not already there and both access token and refresh failed
        if (pathname !== "/auth/login" && pathname !== "/auth/register") {
          router.push("/auth/login");
        }
      }
    };

    checkAuth();
  }, [pathname, router]);

  return <>{children}</>;
}
