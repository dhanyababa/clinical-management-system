import React, { useState } from "react";
import PharmacistSidebar from "./PharmacistSidebar";

const PharmacistLayout = ({ children, title }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobileSidebar = () => {
    setMobileOpen(false);
  };

  const handleSidebarToggle = () => {
    setCollapsed((prev) => !prev);
  };

  return (
    <div className="min-h-screen bg-[#060d1a] text-white">

      {/* Mobile sidebar backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 lg:hidden"
          onClick={closeMobileSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed inset-y-0 left-0 z-50
          transform transition-transform duration-300
          lg:translate-x-0
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <PharmacistSidebar
          collapsed={collapsed}
          onToggle={handleSidebarToggle}
          onNavigate={closeMobileSidebar}
          onClose={closeMobileSidebar}
        />
      </div>

      {/* Main content */}
      <main
        className={`
          min-w-0 min-h-screen
          transition-all duration-300
          ${collapsed ? "lg:ml-16" : "lg:ml-64"}
        `}
      >

        {/* Page header */}
        <header
          className="
            sticky top-0 z-30
            bg-[#060d1a]/95 backdrop-blur-xl
            border-b border-[#1e2d4a]
            px-4 sm:px-5 lg:px-6
            py-4
            flex items-center justify-between
            gap-3
          "
        >
          <div className="flex min-w-0 items-center gap-3">

            {/* Mobile menu button */}
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="
                lg:hidden
                flex h-10 w-10 shrink-0
                items-center justify-center
                rounded-lg
                border border-[#1e2d4a]
                bg-[#101b2e]
                text-gray-300
                hover:text-red-400
                hover:border-red-400/40
                transition
              "
              aria-label="Open pharmacy navigation"
              aria-expanded={mobileOpen}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-5 w-5"
              >
                <path
                  d="M4 7h16M4 12h16M4 17h16"
                  strokeLinecap="round"
                />
              </svg>
            </button>

            {/* Page title */}
            <h1
              className="
                min-w-0
                text-lg sm:text-xl lg:text-2xl
                font-semibold
                text-white
                tracking-tight
                break-words
              "
            >
              {title}
            </h1>
          </div>

          {/* Existing status indicator */}
          <div
            className="h-2.5 w-2.5 shrink-0 rounded-full bg-red-400 animate-pulse"
            aria-label="Pharmacy status"
          />
        </header>

        {/* Page content */}
        <div className="w-full min-w-0 p-3 sm:p-5 lg:p-6">
          {children}
        </div>

      </main>
    </div>
  );
};

export default PharmacistLayout;