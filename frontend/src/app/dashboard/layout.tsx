"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.push("/auth/login");
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-indigo-600">
                  Steer Health
                </h1>
              </div>
            </div>
            <div className="flex items-center">
              <button
                onClick={() => {
                  localStorage.removeItem("accessToken");
                  router.push("/auth/login");
                }}
                className="ml-4 px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
