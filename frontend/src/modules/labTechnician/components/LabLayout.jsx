import React, { useState } from "react";
import LabSidebar from "./LabSidebar";

const LabLayout = ({ children, title }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSidebarToggle = () => {
    setCollapsed((prev) => !prev);
  };

  const closeMobileSidebar = () => {
    setMobileOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#0B1220] text-gray-100">

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 lg:hidden"
          onClick={closeMobileSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 lg:translate-x-0 ${
          mobileOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >
        <LabSidebar
          collapsed={collapsed}
          onToggle={handleSidebarToggle}
          mobileOpen={mobileOpen}
          onNavigate={closeMobileSidebar}
        />
      </div>

      {/* Main Content */}
      <main
        className={`min-w-0 min-h-screen transition-all duration-300 ${
          collapsed ? "lg:ml-16" : "lg:ml-64"
        }`}
      >

        {/* Header */}
        <header className="sticky top-0 z-30 bg-[#0B1220]/90 backdrop-blur-xl border-b border-[#1E293B] px-3 sm:px-5 lg:px-6 py-4">

          <div className="flex items-center justify-between gap-3 min-w-0">

            {/* Mobile Menu + Page Title */}
            <div className="flex items-center gap-3 min-w-0">

              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="lg:hidden flex-shrink-0 p-2 rounded-lg border border-[#1E293B] text-gray-300 hover:text-cyan-400 hover:bg-white/5 transition"
                aria-label="Open navigation menu"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="w-5 h-5"
                >
                  <path d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              <h1 className="min-w-0 text-base sm:text-lg font-semibold text-gray-100 tracking-tight truncate">
                {title}
              </h1>

            </div>

            {/* Online Status */}
            <div className="flex items-center gap-2 text-xs text-gray-400 flex-shrink-0">

              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />

              <span className="hidden sm:inline">
                Online
              </span>

            </div>

          </div>

        </header>

        {/* Page Content */}
        <div className="min-w-0 p-3 sm:p-5 lg:p-6 text-gray-200">
          {children}
        </div>

      </main>

    </div>
  );
};

export default LabLayout;