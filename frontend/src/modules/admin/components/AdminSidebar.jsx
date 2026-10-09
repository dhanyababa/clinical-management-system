import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";

const NAV_ITEMS = [
  { label: "Dashboard", path: "/admin/dashboard" },
  { label: "Staff", path: "/admin/staff" },
  { label: "Doctors", path: "/admin/doctors" },
  { label: "Receptionists", path: "/admin/receptionists" },
  { label: "Lab Technicians", path: "/admin/lab-technicians" },
  { label: "Pharmacists", path: "/admin/pharmacists" },
  { label: "Audit Logs", path: "/admin/audit-logs" },
];

const AdminSidebar = ({
  collapsed = false,
  onToggle,
  onNavigate,
}) => {
  const { user, logout } = useAuth();

  return (
    <aside
      className={`
        h-screen
        flex flex-col
        transition-all duration-300
        ${collapsed ? "w-16" : "w-64"}
      `}
    >
      <div className="h-full bg-[#0b1220] border-r border-[#1e2d4a] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-5 border-b border-[#1e2d4a]">

          {!collapsed && (
            <span className="text-[#D4AF37] font-bold text-lg tracking-widest">
              CMS
            </span>
          )}

          <button
            type="button"
            onClick={onToggle}
            aria-label={collapsed ? "Expand sidebar" : "Toggle sidebar"}
            className="text-gray-300 hover:text-[#D4AF37] text-xl transition"
          >
            ☰
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 min-h-0 overflow-y-auto py-4 space-y-2 px-2">

          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              title={item.label}
              onClick={onNavigate}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-[15px] font-medium transition
                ${
                  isActive
                    ? "bg-[#D4AF37] text-[#0b1220] font-semibold shadow"
                    : "text-gray-300 hover:bg-[#1e2d4a] hover:text-white"
                }`
              }
            >
              {!collapsed && item.label}
            </NavLink>
          ))}

        </nav>

        {/* User Section */}
        <div className="border-t border-[#1e2d4a] p-4 flex-shrink-0">

          {!collapsed && (
            <div className="mb-3">
              <p className="text-gray-100 font-semibold text-sm break-words">
                {user?.username || "Admin"}
              </p>

              <p className="text-xs text-gray-400">
                Administrator
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={logout}
            title="Logout"
            className="w-full text-left text-red-400 hover:text-red-300 text-sm font-medium"
          >
            {collapsed ? "↪" : "Logout"}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;