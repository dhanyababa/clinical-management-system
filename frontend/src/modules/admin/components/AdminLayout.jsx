import React, { useEffect, useState } from "react";
import { HiMenu } from "react-icons/hi";
import AdminSidebar from "./AdminSidebar";

const AdminLayout = ({ children, title }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close the mobile menu when Escape is pressed.
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
    <div
      className="min-h-screen bg-cover bg-center text-white"
      style={{
        backgroundImage:
          "url('https://images.pexels.com/photos/263402/pexels-photo-263402.jpeg')",
      }}
    >
      <div className="min-h-screen bg-[#020617]/90">

        {/* Desktop Sidebar */}
        <div className="hidden lg:block fixed top-0 left-0 h-screen z-40">
          <AdminSidebar
            collapsed={collapsed}
            onToggle={() => setCollapsed((prev) => !prev)}
          />
        </div>

        {/* Mobile / Tablet Backdrop */}
        {mobileOpen && (
          <button
            type="button"
            aria-label="Close navigation menu"
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 z-40 bg-black/65 lg:hidden"
          />
        )}

        {/* Mobile / Tablet Sidebar */}
        <div
          className={`
            fixed top-0 left-0 z-50 h-screen
            transition-transform duration-300
            lg:hidden
            ${
              mobileOpen
                ? "translate-x-0"
                : "-translate-x-full"
            }
          `}
        >
          <AdminSidebar
            collapsed={false}
            onToggle={() => setMobileOpen(false)}
            onNavigate={() => setMobileOpen(false)}
          />
        </div>

        {/* Main Content */}
        <main
          className={`
            min-w-0 min-h-screen
            transition-all duration-300
            ${
              collapsed
                ? "lg:ml-16"
                : "lg:ml-64"
            }
          `}
        >
          {/* Top Bar */}
          <header
            className="
              sticky top-0 z-30
              bg-[#020617]/90
              backdrop-blur-md
              border-b border-[#1e2d4a]
              px-4 sm:px-6
              py-4
              flex items-center justify-between
              gap-3
              shadow-sm
            "
          >
            <div className="flex items-center gap-3 min-w-0">

              {/* Mobile Menu Button */}
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                aria-label="Open navigation menu"
                className="
                  lg:hidden
                  flex-shrink-0
                  p-2
                  rounded-lg
                  border border-[#1e2d4a]
                  bg-[#0b1220]
                  text-[#D4AF37]
                  hover:bg-[#1e2d4a]
                  transition
                "
              >
                <HiMenu size={23} />
              </button>

              <h1 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-100 truncate">
                {title}
              </h1>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-sm text-gray-300 hidden sm:block">
                System Active
              </span>

              <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
            </div>
          </header>

          {/* Page Content */}
          <div
            className="
              min-w-0
              p-3 sm:p-4 lg:p-6
              text-sm sm:text-base
              leading-relaxed
              text-gray-100
            "
          >
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;