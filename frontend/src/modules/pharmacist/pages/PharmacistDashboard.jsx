// import React, { useEffect, useState } from "react";
// import PharmacistLayout from "../components/PharmacistLayout";
// import { useAuth } from "../../../context/AuthContext";
// import {
//   getIncomingPrescriptions,
//   getMedicines,
//   getMedicineBills,
// } from "../api/pharmacistApi";
// import { useNavigate } from "react-router-dom";

// const StatCard = ({ label, value, color, icon }) => (
//   <div className="bg-[#0d1629] border border-[#1e2d4a] rounded-xl p-5">
//     <div className="flex items-start justify-between">
//       <div>
//         <p className={`text-3xl font-bold ${color}`}>{value}</p>
//         <p className="text-xs text-gray-500 mt-1">{label}</p>
//       </div>
//       <span className={`text-xl ${color} opacity-60`}>{icon}</span>
//     </div>
//   </div>
// );

// const PharmacistDashboard = () => {
//   const { user } = useAuth();
//   const navigate = useNavigate();
//   const [prescriptions, setPrescriptions] = useState([]);
//   const [medicines, setMedicines] = useState([]);
//   const [bills, setBills] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     Promise.all([
//       getIncomingPrescriptions(),
//       getMedicines(),
//       getMedicineBills(),
//     ])
//       .then(([pRes, mRes, bRes]) => {
//         setPrescriptions(pRes.data || []);
//         setMedicines(mRes.results || mRes.data || []);
//         setBills(bRes.results || bRes.data || []);
//       })
//       .catch(() => setError("Failed to load dashboard data."))
//       .finally(() => setLoading(false));
//   }, []);

//   const pendingBills = bills.filter((b) => b.payment_status === "Pending").length;

//   const name = user?.first_name
//     ? `${user.first_name} ${user.last_name || ""}`.trim()
//     : user?.username || "Pharmacist";

//   return (
//     <PharmacistLayout title="Dashboard">
//       <div className="mb-6">
//         <h2 className="text-2xl font-bold text-white">
//           Welcome, <span className="text-red-400">{name}</span> 💊
//         </h2>
//         <p className="text-gray-400 text-sm mt-1">
//           {new Date().toLocaleDateString("en-IN", {
//             weekday: "long", year: "numeric", month: "long", day: "numeric",
//           })}
//         </p>
//       </div>

//       <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
//         <StatCard label="Pending Prescriptions" value={loading ? "—" : prescriptions.length} color="text-yellow-400" icon="📋" />
//         <StatCard label="Total Medicines" value={loading ? "—" : medicines.length} color="text-red-400" icon="💊" />
//         <StatCard label="Pending Bills" value={loading ? "—" : pendingBills} color="text-orange-400" icon="🧾" />
//       </div>

//       {error && (
//         <div className="mb-4 bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg">
//           {error}
//         </div>
//       )}

//       {/* Incoming Prescriptions Table */}
//       <div className="bg-[#0d1629] border border-[#1e2d4a] rounded-xl overflow-hidden mb-6">
//         <div className="px-5 py-4 border-b border-[#1e2d4a] flex items-center justify-between">
//           <h3 className="text-sm font-semibold text-white">Incoming Prescriptions</h3>
//           <button onClick={() => navigate("/pharmacist/prescriptions")} className="text-xs text-red-400 hover:text-red-300 transition">View all →</button>
//         </div>
//         <div className="overflow-x-auto">
//           <table className="min-w-full text-sm">
//             <thead>
//               <tr className="border-b border-[#1e2d4a] text-gray-500 text-xs uppercase tracking-wider">
//                 <th className="px-4 py-3 text-left">Code</th>
//                 <th className="px-4 py-3 text-left">Patient</th>
//                 <th className="px-4 py-3 text-left">Doctor</th>
//                 <th className="px-4 py-3 text-left">Items</th>
//                 <th className="px-4 py-3 text-left">Action</th>
//               </tr>
//             </thead>
//             <tbody>
//               {loading ? (
//                 [...Array(3)].map((_, i) => (
//                   <tr key={i} className="border-b border-[#1e2d4a]">
//                     {[...Array(5)].map((_, j) => (
//                       <td key={j} className="px-4 py-3"><div className="h-3 bg-[#1e2d4a] rounded animate-pulse w-20" /></td>
//                     ))}
//                   </tr>
//                 ))
//               ) : prescriptions.length === 0 ? (
//                 <tr><td colSpan={5} className="text-center text-gray-500 py-10 text-sm">No pending prescriptions.</td></tr>
//               ) : (
//                 prescriptions.slice(0, 5).map((rx) => (
//                   <tr key={rx.prescription_code} className="border-b border-[#1e2d4a] hover:bg-[#111d35] transition-colors">
//                     <td className="px-4 py-3">
//                       <span className="font-mono text-xs text-red-400 bg-red-400/10 px-2 py-1 rounded">{rx.prescription_code}</span>
//                     </td>
//                     <td className="px-4 py-3 text-white font-medium">{rx.patient_name || "—"}</td>
//                     <td className="px-4 py-3 text-gray-400">Dr. {rx.doctor_name || "—"}</td>
//                     <td className="px-4 py-3 text-gray-400">{rx.items?.length || 0} item(s)</td>
//                     <td className="px-4 py-3">
//                       <button
//                         onClick={() => navigate(`/pharmacist/prescriptions/${rx.prescription_code}`)}
//                         className="text-xs text-red-400 hover:text-red-300 border border-red-400/30 px-3 py-1.5 rounded-lg transition"
//                       >
//                         Dispense
//                       </button>
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
//         {[
//           { label: "Manage Medicines", path: "/pharmacist/medicines", icon: "💊" },
//           { label: "Stock & Batches", path: "/pharmacist/stock", icon: "📦" },
//           { label: "View Bills", path: "/pharmacist/bills", icon: "🧾" },
//         ].map((item) => (
//           <button key={item.path} onClick={() => navigate(item.path)}
//             className="bg-[#0d1629] border border-[#1e2d4a] hover:border-red-400/40 rounded-xl p-5 text-left transition-all">
//             <p className="text-2xl mb-2">{item.icon}</p>
//             <p className="text-white font-medium text-sm">{item.label}</p>
//           </button>
//         ))}
//       </div>
//     </PharmacistLayout>
//   );
// };

// export default PharmacistDashboard;

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
  <div className="bg-white border border-[#bfe3cd] rounded-2xl p-6 shadow-sm">
    <div className="flex items-start justify-between">
      <div>
        <p className={`text-4xl font-bold ${color}`}>{value}</p>
        <p className="text-sm text-gray-600 mt-2">{label}</p>
      </div>
      <span className={`text-2xl ${color} opacity-80`}>{icon}</span>
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

  const pendingBills = bills.filter((b) => b.payment_status === "Pending").length;

  const name = user?.first_name
    ? `${user.first_name} ${user.last_name || ""}`.trim()
    : user?.username || "Pharmacist";

  return (
    <PharmacistLayout title="Dashboard">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">
          Welcome, <span className="text-[#15803d]">{name}</span> 💊
        </h2>
        <p className="text-gray-600 text-base mt-2">
          {new Date().toLocaleDateString("en-IN", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 mb-8">
        <StatCard
          label="Pending Prescriptions"
          value={loading ? "—" : prescriptions.length}
          color="text-amber-600"
          icon="📋"
        />
        <StatCard
          label="Total Medicines"
          value={loading ? "—" : medicines.length}
          color="text-[#15803d]"
          icon="💊"
        />
        <StatCard
          label="Pending Bills"
          value={loading ? "—" : pendingBills}
          color="text-orange-600"
          icon="🧾"
        />
      </div>

      {error && (
        <div className="mb-5 bg-red-50 border border-red-200 text-red-700 text-base px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {/* Incoming Prescriptions Table */}
      <div className="bg-white border border-[#bfe3cd] rounded-2xl overflow-hidden mb-8 shadow-sm">
        <div className="px-6 py-5 border-b border-[#d7eee0] flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Incoming Prescriptions
          </h3>
          <button
            onClick={() => navigate("/pharmacist/prescriptions")}
            className="text-sm text-[#15803d] hover:text-[#166534] font-medium transition"
          >
            View all →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-base">
            <thead>
              <tr className="bg-[#f7fbf8] border-b border-[#d7eee0] text-gray-600 text-sm uppercase tracking-wider">
                <th className="px-5 py-4 text-left">Code</th>
                <th className="px-5 py-4 text-left">Patient</th>
                <th className="px-5 py-4 text-left">Doctor</th>
                <th className="px-5 py-4 text-left">Items</th>
                <th className="px-5 py-4 text-left">Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i} className="border-b border-[#edf7f1]">
                    {[...Array(5)].map((_, j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="h-4 bg-[#edf7f1] rounded animate-pulse w-24" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : prescriptions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center text-gray-500 py-12 text-base">
                    No pending prescriptions.
                  </td>
                </tr>
              ) : (
                prescriptions.slice(0, 5).map((rx) => (
                  <tr
                    key={rx.prescription_code}
                    className="border-b border-[#edf7f1] hover:bg-[#f8fcf9] transition-colors"
                  >
                    <td className="px-5 py-4">
                      <span className="font-mono text-sm text-[#15803d] bg-[#e8f5ee] border border-[#cfe8d9] px-2.5 py-1 rounded-md">
                        {rx.prescription_code}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-900 font-medium text-base">
                      {rx.patient_name || "—"}
                    </td>
                    <td className="px-5 py-4 text-gray-600 text-base">
                      Dr. {rx.doctor_name || "—"}
                    </td>
                    <td className="px-5 py-4 text-gray-600 text-base">
                      {rx.items?.length || 0} item(s)
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() =>
                          navigate(`/pharmacist/prescriptions/${rx.prescription_code}`)
                        }
                        className="text-sm text-white bg-[#16a34a] hover:bg-[#15803d] px-4 py-2 rounded-xl transition font-medium"
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

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
        {[
          { label: "Manage Medicines", path: "/pharmacist/medicines", icon: "💊" },
          { label: "Stock & Batches", path: "/pharmacist/stock", icon: "📦" },
          { label: "View Bills", path: "/pharmacist/bills", icon: "🧾" },
        ].map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className="bg-white border border-[#bfe3cd] hover:border-[#86c8a3] hover:bg-[#f8fcf9] rounded-2xl p-6 text-left transition-all shadow-sm"
          >
            <p className="text-3xl mb-3">{item.icon}</p>
            <p className="text-gray-900 font-semibold text-lg">{item.label}</p>
          </button>
        ))}
      </div>
    </PharmacistLayout>
  );
};

export default PharmacistDashboard;