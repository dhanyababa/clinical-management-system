import React, { useState } from "react";
import ReceptionSidebar from "./ReceptionSidebar";

const ReceptionLayout = ({ children, title }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen min-w-0 bg-[#060d1a] text-white">

      {/* Mobile sidebar backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed inset-y-0 left-0 z-50
          transition-transform duration-300
          lg:translate-x-0
          ${
            mobileOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >
        <ReceptionSidebar
          collapsed={collapsed}
          onToggle={() => {
            if (window.innerWidth < 1024) {
              setMobileOpen(false);
            } else {
              setCollapsed((p) => !p);
            }
          }}
          mobileOpen={mobileOpen}
          onNavigate={() => setMobileOpen(false)}
        />
      </div>

      {/* Main content */}
      <main
        className={`
          flex-1 min-w-0 w-full
          transition-all duration-300
          ${
            collapsed
              ? "lg:ml-16"
              : "lg:ml-64"
          }
        `}
      >

        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-[#060d1a]/90 backdrop-blur border-b border-[#1e2d4a] px-3 sm:px-4 lg:px-6 py-3 sm:py-4">

          <div className="flex items-center justify-between gap-3 min-w-0">

            <div className="flex items-center gap-3 min-w-0">

              {/* Mobile menu button */}
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="lg:hidden shrink-0 p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition"
                aria-label="Open reception navigation"
              >
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>

              <h1 className="text-base sm:text-lg lg:text-xl font-semibold text-white tracking-tight break-words min-w-0">
                {title}
              </h1>

            </div>

            <div className="w-2 h-2 shrink-0 rounded-full bg-emerald-400 animate-pulse" />

          </div>

        </header>

        {/* Page content */}
        <div className="w-full min-w-0 p-3 sm:p-4 lg:p-6">
          {children}
        </div>

      </main>

    </div>
  );
};

export default ReceptionLayout;