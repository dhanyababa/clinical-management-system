import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";

const NAV_ITEMS = [
  {
    label: "Dashboard",
    path: "/pharmacist/dashboard",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="w-5 h-5"
      >
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    label: "Prescriptions",
    path: "/pharmacist/prescriptions",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="w-5 h-5"
      >
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
        <rect x="9" y="3" width="6" height="4" rx="1" />
        <path d="M9 12h6M9 16h4" />
      </svg>
    ),
  },
  {
    label: "Medicines",
    path: "/pharmacist/medicines",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="w-5 h-5"
      >
        <path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
      </svg>
    ),
  },
  {
    label: "Stock & Batches",
    path: "/pharmacist/stock",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="w-5 h-5"
      >
        <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  },
  {
    label: "Bills",
    path: "/pharmacist/bills",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="w-5 h-5"
      >
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
        <path d="M9 14l2 2 4-4" />
      </svg>
    ),
  },
];


const PharmacistSidebar = ({
  collapsed,
  onToggle,
  onNavigate,
  onClose,
}) => {
  const { user, logout } = useAuth();

  const displayName = user?.first_name
    ? `${user.first_name} ${user.last_name || ""}`.trim()
    : user?.username || "Pharmacist";

  return (
    <aside
      className={`
        relative h-screen
        w-64
        ${collapsed ? "lg:w-16" : "lg:w-64"}
        transition-[width] duration-300
      `}
    >
      <div
        className="
          h-full
          flex flex-col
          bg-[#101b2e]
          border-r border-[#26344c]
          shadow-xl
        "
      >

        {/* Sidebar header */}
        <div
          className={`
            flex h-[73px] shrink-0
            items-center
            border-b border-[#26344c]
            ${collapsed ? "lg:justify-center" : "justify-between"}
            px-3
          `}
        >

          <div
            className={`
              flex min-w-0 items-center gap-2
              ${collapsed ? "lg:hidden" : ""}
            `}
          >
            <span className="h-2 w-2 shrink-0 rounded-full bg-red-400" />

            <span
              className="
                truncate text-base font-bold
                tracking-widest text-red-400
              "
            >
              PHARMACY
            </span>
          </div>

          {/* Desktop collapse button */}
          <button
            type="button"
            onClick={onToggle}
            className="
              hidden lg:flex
              h-9 w-9 shrink-0
              items-center justify-center
              rounded-lg
              text-gray-400
              hover:bg-white/10
              hover:text-red-400
              transition
            "
            aria-label={
              collapsed
                ? "Expand pharmacy sidebar"
                : "Collapse pharmacy sidebar"
            }
            title={
              collapsed
                ? "Expand sidebar"
                : "Collapse sidebar"
            }
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

          {/* Mobile close button */}
          <button
            type="button"
            onClick={onClose}
            className="
              lg:hidden
              flex h-9 w-9 shrink-0
              items-center justify-center
              rounded-lg
              text-gray-400
              hover:bg-white/10
              hover:text-white
              transition
            "
            aria-label="Close pharmacy navigation"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-5 w-5"
            >
              <path
                d="M6 6l12 12M18 6L6 18"
                strokeLinecap="round"
              />
            </svg>
          </button>

        </div>


        {/* Navigation */}
        <nav
          className="
            flex-1 min-h-0
            overflow-y-auto overflow-x-hidden
            py-4 space-y-1
          "
          aria-label="Pharmacy navigation"
        >
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onNavigate}
              title={collapsed ? item.label : undefined}
              className={({ isActive }) =>
                `
                  flex items-center
                  gap-3
                  mx-2
                  px-3 py-3
                  rounded-xl
                  text-sm font-medium
                  no-underline
                  transition-all duration-200
                  ${
                    collapsed
                      ? "lg:justify-center lg:px-2"
                      : ""
                  }
                  ${
                    isActive
                      ? "bg-red-400/15 text-red-300 border border-red-400/30"
                      : "text-gray-400 border border-transparent hover:bg-white/5 hover:text-white"
                  }
                `
              }
            >
              <span className="flex shrink-0 items-center justify-center">
                {item.icon}
              </span>

              <span
                className={`
                  min-w-0 truncate
                  ${collapsed ? "lg:hidden" : ""}
                `}
              >
                {item.label}
              </span>
            </NavLink>
          ))}
        </nav>


        {/* User and logout */}
        <div className="shrink-0 border-t border-[#26344c] p-3">

          <div
            className={`
              mb-3 min-w-0 rounded-lg
              bg-white/[0.04] p-3
              ${collapsed ? "lg:hidden" : ""}
            `}
          >
            <p className="truncate text-sm font-semibold text-gray-100">
              {displayName}
            </p>

            <p className="mt-1 text-xs text-red-400">
              Pharmacist
            </p>
          </div>

          <button
            type="button"
            onClick={logout}
            title={collapsed ? "Logout" : undefined}
            className={`
              flex w-full items-center gap-3
              rounded-lg
              px-3 py-2.5
              text-sm font-medium
              text-red-400
              hover:bg-red-400/10
              hover:text-red-300
              transition
              ${collapsed ? "lg:justify-center" : ""}
            `}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-5 w-5 shrink-0"
            >
              <path
                d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"
                strokeLinecap="round"
              />
              <path
                d="M16 17l5-5-5-5M21 12H9"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            <span className={collapsed ? "lg:hidden" : ""}>
              Logout
            </span>
          </button>

        </div>

      </div>
    </aside>
  );
};

export default PharmacistSidebar;