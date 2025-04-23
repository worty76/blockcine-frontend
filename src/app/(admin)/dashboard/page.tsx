"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";

// Layout Components
import DashboardHeader from "@/components/admin/DashboardHeader";
import Sidebar from "@/components/admin/Sidebar";

// Main Content
import OverviewTab from "@/components/admin/dashboard/OverviewTab";

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Add overlay when sidebar is open on mobile
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [sidebarOpen]);

  // Check if user is authenticated to protect admin routes
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  return (
    <>
      {/* Backdrop overlay for mobile */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/70 z-20 backdrop-blur-sm"
          onClick={toggleSidebar}
        />
      )}

      <div className="min-h-screen bg-gradient-to-b from-[#0A0A10] to-[#121218] text-white">
        <div className="flex h-screen">
          <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

          <div className="flex-1 flex flex-col md:ml-64 relative">
            <DashboardHeader toggleSidebar={toggleSidebar} />

            <main className="flex-1 overflow-y-auto p-4 md:p-6">
              <div className="max-w-7xl mx-auto">
                {/* Page Title */}
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-white">
                      Dashboard Overview
                    </h1>
                    <p className="text-gray-400 mt-1">
                      Welcome back! Heres whats happening with your platform
                      today.
                    </p>
                  </div>
                </div>

                {/* Main Content */}
                <OverviewTab />
              </div>
            </main>

            <footer className="px-6 py-4 bg-black/40 border-t border-gray-800">
              <div className="text-center text-xs text-gray-500">
                Admin Panel v1.0 - © 2023 BookApp. All rights reserved.
              </div>
            </footer>
          </div>
        </div>
      </div>
    </>
  );
}
