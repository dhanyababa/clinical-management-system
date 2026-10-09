import React, { useEffect, useState } from "react";
import PharmacistLayout from "../components/PharmacistLayout";
import { useAuth } from "../../../context/AuthContext";
import {
  getIncomingPrescriptions,
  getMedicines,
  getMedicineBills,
} from "../api/pharmacistApi";
import { useNavigate } from "react-router-dom";

const StatCard = ({ label, value, color, icon }) => (
  <div className="min-w-0 bg-[#0d1629] border border-[#1e2d4a] rounded-xl p-4 sm:p-5 lg:p-6 transition-colors hover:border-[#344766]">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className={`text-3xl sm:text-4xl font-bold break-words ${color}`}>
          {value}
        </p>
        <p className="text-xs sm:text-sm text-gray-400 mt-2">
          {label}
        </p>
      </div>

      <span
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/5 text-2xl"
        aria-hidden="true"
      >
        {icon}
      </span>
    </div>
  </div>
);

const PharmacistDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [prescriptions, setPrescriptions] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      getIncomingPrescriptions(),
      getMedicines(),
      getMedicineBills(),
    ])
      .then(([pRes, mRes, bRes]) => {
        setPrescriptions(pRes.data || []);
        setMedicines(mRes.results || mRes.data || []);
        setBills(bRes.results || bRes.data || []);
      })
      .catch(() => setError("Failed to load dashboard data."))
      .finally(() => setLoading(false));
  }, []);

  const pendingBills = bills.filter(
    (b) => b.payment_status === "Pending"
  ).length;

  const name = user?.first_name
    ? `${user.first_name} ${user.last_name || ""}`.trim()
    : user?.username || "Pharmacist";

  return (
    <PharmacistLayout title="Dashboard">
      <div className="w-full min-w-0">

        {/* Welcome section */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white break-words">
            Welcome,{" "}
            <span className="text-red-400">
              {name}
            </span>{" "}
            💊
          </h2>

          <p className="text-gray-400 text-sm sm:text-base mt-2">
            {new Date().toLocaleDateString("en-IN", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        {/* Dashboard statistics */}
        <div className="grid grid-cols-1 min-[400px]:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-5 mb-6 sm:mb-8">
          <StatCard
            label="Pending Prescriptions"
            value={loading ? "—" : prescriptions.length}
            color="text-amber-400"
            icon="📋"
          />

          <StatCard
            label="Total Medicines"
            value={loading ? "—" : medicines.length}
            color="text-cyan-400"
            icon="💊"
          />

          <StatCard
            label="Pending Bills"
            value={loading ? "—" : pendingBills}
            color="text-red-400"
            icon="🧾"
          />
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-5 bg-red-500/10 border border-red-400/30 text-red-300 text-sm px-3 sm:px-4 py-3 rounded-xl break-words">
            {error}
          </div>
        )}

        {/* Incoming prescriptions */}
        <div className="w-full min-w-0 bg-[#0d1629] border border-[#1e2d4a] rounded-xl overflow-hidden mb-6 sm:mb-8">

          {/* Table header */}
          <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-[#1e2d4a] flex flex-col min-[400px]:flex-row min-[400px]:items-center min-[400px]:justify-between gap-3">
            <h3 className="text-base sm:text-lg font-semibold text-white">
              Incoming Prescriptions
            </h3>

            <button
              type="button"
              onClick={() => navigate("/pharmacist/prescriptions")}
              className="self-start min-[400px]:self-auto text-sm text-red-400 hover:text-red-300 font-medium transition whitespace-nowrap"
            >
              View all →
            </button>
          </div>

          {/* Horizontally scrollable table */}
          <div className="w-full max-w-full overflow-x-auto">
            <table className="min-w-[750px] w-full text-sm">
              <thead>
                <tr className="bg-[#101c30] border-b border-[#1e2d4a] text-gray-400 text-xs uppercase tracking-wider">
                  <th className="px-4 sm:px-5 py-4 text-left">
                    Code
                  </th>
                  <th className="px-4 sm:px-5 py-4 text-left">
                    Patient
                  </th>
                  <th className="px-4 sm:px-5 py-4 text-left">
                    Doctor
                  </th>
                  <th className="px-4 sm:px-5 py-4 text-left">
                    Items
                  </th>
                  <th className="px-4 sm:px-5 py-4 text-left">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  [...Array(3)].map((_, i) => (
                    <tr
                      key={i}
                      className="border-b border-[#1e2d4a]"
                    >
                      {[...Array(5)].map((_, j) => (
                        <td
                          key={j}
                          className="px-4 sm:px-5 py-4"
                        >
                          <div className="h-4 bg-[#1e2d4a] rounded animate-pulse w-24" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : prescriptions.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-center text-gray-400 py-12 px-4 text-sm"
                    >
                      No pending prescriptions.
                    </td>
                  </tr>
                ) : (
                  prescriptions.slice(0, 5).map((rx) => (
                    <tr
                      key={rx.prescription_code}
                      className="border-b border-[#1e2d4a] hover:bg-[#111d35] transition-colors"
                    >
                      <td className="px-4 sm:px-5 py-4">
                        <span className="inline-block font-mono text-xs text-red-300 bg-red-400/10 border border-red-400/20 px-2.5 py-1 rounded-md whitespace-nowrap">
                          {rx.prescription_code}
                        </span>
                      </td>

                      <td className="px-4 sm:px-5 py-4 text-white font-medium">
                        {rx.patient_name || "—"}
                      </td>

                      <td className="px-4 sm:px-5 py-4 text-gray-300">
                        Dr. {rx.doctor_name || "—"}
                      </td>

                      <td className="px-4 sm:px-5 py-4 text-gray-400 whitespace-nowrap">
                        {rx.items?.length || 0} item(s)
                      </td>

                      <td className="px-4 sm:px-5 py-4">
                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/pharmacist/prescriptions/${rx.prescription_code}`
                            )
                          }
                          className="text-xs sm:text-sm text-white bg-red-500 hover:bg-red-400 px-4 py-2 rounded-lg transition font-medium whitespace-nowrap"
                        >
                          Dispense
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 min-[400px]:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-5">
          {[
            {
              label: "Manage Medicines",
              path: "/pharmacist/medicines",
              icon: "💊",
            },
            {
              label: "Stock & Batches",
              path: "/pharmacist/stock",
              icon: "📦",
            },
            {
              label: "View Bills",
              path: "/pharmacist/bills",
              icon: "🧾",
            },
          ].map((item) => (
            <button
              key={item.path}
              type="button"
              onClick={() => navigate(item.path)}
              className="min-w-0 bg-[#0d1629] border border-[#1e2d4a] hover:border-red-400/40 hover:bg-[#111d35] rounded-xl p-4 sm:p-6 text-left transition-all"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-400/10 mb-3">
                <span className="text-2xl" aria-hidden="true">
                  {item.icon}
                </span>
              </div>

              <p className="text-white font-semibold text-sm sm:text-base">
                {item.label}
              </p>

              <p className="mt-2 text-xs text-gray-500">
                Open section →
              </p>
            </button>
          ))}
        </div>

      </div>
    </PharmacistLayout>
  );
};

export default PharmacistDashboard;
// 199