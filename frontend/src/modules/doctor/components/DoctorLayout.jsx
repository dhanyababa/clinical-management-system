import React, { useEffect, useState } from "react";
import { HiMenu } from "react-icons/hi";
import DoctorSidebar from "./DoctorSidebar";

const DoctorLayout = ({ children, title }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!mobileOpen) return;

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [mobileOpen]);

  return (
    <div className="min-h-screen bg-[#060d1a] text-white">

      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <DoctorSidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed((prev) => !prev)}
        />
      </div>

      {/* Mobile Sidebar Backdrop */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/65 lg:hidden"
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={`
          fixed inset-y-0 left-0 z-50
          transition-transform duration-300
          lg:hidden
          ${
            mobileOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >
        <DoctorSidebar
          collapsed={false}
          onToggle={() => setMobileOpen(false)}
          onNavigate={() => setMobileOpen(false)}
          mobile
        />
      </div>

      {/* Main Content */}
      <main
        className={`
          min-w-0 min-h-screen
          transition-all duration-300
          ${collapsed ? "lg:ml-16" : "lg:ml-64"}
        `}
      >
        {/* Header */}
        <header
          className="
            sticky top-0 z-30
            bg-[#060d1a]/90
            backdrop-blur
            border-b border-[#1e2d4a]
            px-4 sm:px-6
            py-4
            flex items-center justify-between
            gap-3
          "
        >
          <div className="flex items-center gap-3 min-w-0">

            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation menu"
              className="
                lg:hidden
                shrink-0
                p-2
                rounded-lg
                border border-[#1e2d4a]
                text-blue-400
                hover:bg-white/10
                transition
              "
            >
              <HiMenu size={23} />
            </button>

            <h1 className="text-lg sm:text-xl font-semibold text-white tracking-tight truncate">
              {title}
            </h1>
          </div>

          <div className="w-2 h-2 shrink-0 rounded-full bg-blue-400 animate-pulse" />
        </header>

        {/* Page Content */}
        <div className="min-w-0 p-3 sm:p-4 lg:p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DoctorLayout;