// import React, { useEffect, useState } from "react";
// import PharmacistLayout from "../components/PharmacistLayout";
// import {
//   getMedicines,
//   getBatches,
//   createBatch,
//   getStockLogs,
// } from "../api/pharmacistApi";

// // ─── STOCK & BATCHES PAGE ─────────────────────────────────────────────────────
// const StockPage = () => {
//   const [medicines, setMedicines] = useState([]);
//   const [batches, setBatches] = useState([]);
//   const [stockLogs, setStockLogs] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [activeTab, setActiveTab] = useState("batches"); // "batches" | "logs"

//   const [showModal, setShowModal] = useState(false);
//   const [submitting, setSubmitting] = useState(false);
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");
//   const [formError, setFormError] = useState("");

//   const [filterMedicine, setFilterMedicine] = useState("");
//   const [form, setForm] = useState({
//     medicine: "",
//     quantity: "",
//     expiry_date: "",
//   });

//   const fetchData = async () => {
//     setLoading(true);
//     try {
//       const [mRes, bRes, sRes] = await Promise.all([
//         getMedicines(),
//         getBatches(),
//         getStockLogs(),
//       ]);
//       setMedicines(mRes.results || mRes.data || []);
//       setBatches(bRes.results || bRes.data || []);
//       setStockLogs(sRes.results || sRes.data || []);
//     } catch {
//       setError("Failed to load stock data.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchData();
//   }, []);

//   const filteredBatches = filterMedicine
//     ? batches.filter(
//         (b) =>
//           b.medicine === parseInt(filterMedicine) ||
//           b.medicine_id === parseInt(filterMedicine)
//       )
//     : batches;

//   const openAddBatch = () => {
//     setForm({ medicine: "", quantity: "", expiry_date: "" });
//     setFormError("");
//     setShowModal(true);
//   };

//   const handleSubmit = async () => {
//     if (!form.medicine || !form.quantity || !form.expiry_date) {
//       setFormError("All fields are required.");
//       return;
//     }
//     setSubmitting(true);
//     setFormError("");
//     try {
//       await createBatch({
//         medicine: parseInt(form.medicine),
//         quantity: parseInt(form.quantity),
//         expiry_date: form.expiry_date,
//       });
//       setSuccess("Batch added successfully.");
//       setShowModal(false);
//       fetchData();
//     } catch (err) {
//       const msg = err?.response?.data
//         ? JSON.stringify(err.response.data)
//         : "Failed to add batch.";
//       setFormError(msg);
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const getExpiryStatus = (expiryDate) => {
//     const today = new Date();
//     const expiry = new Date(expiryDate);
//     const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
//     if (diffDays < 0) return { label: "Expired", cls: "text-red-400 bg-red-400/10 border-red-400/30" };
//     if (diffDays <= 30) return { label: "Expiring Soon", cls: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30" };
//     return { label: "Good", cls: "text-green-400 bg-green-400/10 border-green-400/30" };
//   };

//   const changeTypeBadge = (type) => {
//     if (type === "ADD") return "text-green-400 bg-green-400/10 border-green-400/30";
//     if (type === "DISPENSE") return "text-blue-400 bg-blue-400/10 border-blue-400/30";
//     return "text-red-400 bg-red-400/10 border-red-400/30";
//   };

//   return (
//     <PharmacistLayout title="Stock & Batches">
//       {/* Stats row */}
//       <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
//         {[
//           { label: "Total Medicines", value: medicines.length, color: "text-red-400", icon: "💊" },
//           { label: "Total Batches", value: batches.length, color: "text-blue-400", icon: "📦" },
//           {
//             label: "Low Stock Batches",
//             value: batches.filter((b) => b.quantity <= 10).length,
//             color: "text-yellow-400",
//             icon: "⚠️",
//           },
//           {
//             label: "Expired / Expiring",
//             value: batches.filter((b) => {
//               const d = Math.ceil((new Date(b.expiry_date) - new Date()) / (1000 * 60 * 60 * 24));
//               return d <= 30;
//             }).length,
//             color: "text-orange-400",
//             icon: "🗓️",
//           },
//         ].map((stat) => (
//           <div key={stat.label} className="bg-[#0d1629] border border-[#1e2d4a] rounded-xl p-4">
//             <div className="flex items-start justify-between">
//               <div>
//                 <p className={`text-2xl font-bold ${stat.color}`}>
//                   {loading ? "—" : stat.value}
//                 </p>
//                 <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
//               </div>
//               <span className="text-xl opacity-60">{stat.icon}</span>
//             </div>
//           </div>
//         ))}
//       </div>

//       {error && (
//         <div className="mb-4 bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg">
//           {error}
//         </div>
//       )}
//       {success && (
//         <div className="mb-4 bg-green-500/10 border border-green-500/30 text-green-400 text-sm px-4 py-3 rounded-lg">
//           {success}
//         </div>
//       )}

//       {/* Tabs */}
//       <div className="flex gap-2 mb-4">
//         {["batches", "logs"].map((tab) => (
//           <button
//             key={tab}
//             onClick={() => setActiveTab(tab)}
//             className={`px-4 py-2 rounded-xl text-sm font-medium transition capitalize ${
//               activeTab === tab
//                 ? "bg-red-500/20 text-red-400 border border-red-400/40"
//                 : "text-gray-400 hover:text-white border border-transparent hover:border-white/10"
//             }`}
//           >
//             {tab === "batches" ? "Batches" : "Stock Logs"}
//           </button>
//         ))}

//         <div className="ml-auto flex gap-3 items-center">
//           {activeTab === "batches" && (
//             <select
//               value={filterMedicine}
//               onChange={(e) => setFilterMedicine(e.target.value)}
//               className="bg-[#0d1629] border border-[#1e2d4a] text-white text-sm rounded-xl px-3 py-2 focus:border-red-400/50 outline-none"
//             >
//               <option value="">All Medicines</option>
//               {medicines.map((m) => (
//                 <option key={m.medicine_id} value={m.medicine_id}>
//                   {m.name}
//                 </option>
//               ))}
//             </select>
//           )}
//           {activeTab === "batches" && (
//             <button
//               onClick={openAddBatch}
//               className="bg-red-500 hover:bg-red-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition"
//             >
//               + Add Batch
//             </button>
//           )}
//         </div>
//       </div>

//       {/* Batches Tab */}
//       {activeTab === "batches" && (
//         <div className="bg-[#0d1629] border border-[#1e2d4a] rounded-xl overflow-hidden">
//           <div className="overflow-x-auto">
//             <table className="min-w-full text-sm">
//               <thead>
//                 <tr className="border-b border-[#1e2d4a] text-gray-500 text-xs uppercase tracking-wider">
//                   <th className="px-4 py-3 text-left">Batch #</th>
//                   <th className="px-4 py-3 text-left">Medicine</th>
//                   <th className="px-4 py-3 text-left">Quantity</th>
//                   <th className="px-4 py-3 text-left">Expiry Date</th>
//                   <th className="px-4 py-3 text-left">Status</th>
//                   <th className="px-4 py-3 text-left">Added On</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {loading ? (
//                   [...Array(5)].map((_, i) => (
//                     <tr key={i} className="border-b border-[#1e2d4a]">
//                       {[...Array(6)].map((_, j) => (
//                         <td key={j} className="px-4 py-3">
//                           <div className="h-3 bg-[#1e2d4a] rounded animate-pulse w-20" />
//                         </td>
//                       ))}
//                     </tr>
//                   ))
//                 ) : filteredBatches.length === 0 ? (
//                   <tr>
//                     <td colSpan={6} className="text-center text-gray-500 py-12 text-sm">
//                       No batches found.
//                     </td>
//                   </tr>
//                 ) : (
//                   filteredBatches.map((batch) => {
//                     const status = getExpiryStatus(batch.expiry_date);
//                     const medName =
//                       batch.medicine_name ||
//                       medicines.find((m) => m.medicine_id === batch.medicine)?.name ||
//                       `Medicine #${batch.medicine}`;
//                     return (
//                       <tr
//                         key={batch.batch_id}
//                         className="border-b border-[#1e2d4a] hover:bg-[#111d35] transition-colors"
//                       >
//                         <td className="px-4 py-3">
//                           <span className="font-mono text-xs text-red-400 bg-red-400/10 px-2 py-1 rounded">
//                             {batch.batch_number}
//                           </span>
//                         </td>
//                         <td className="px-4 py-3 text-white font-medium">{medName}</td>
//                         <td className="px-4 py-3">
//                           <span
//                             className={`font-semibold ${
//                               batch.quantity <= 10 ? "text-yellow-400" : "text-white"
//                             }`}
//                           >
//                             {batch.quantity}
//                           </span>
//                           {batch.quantity <= 10 && (
//                             <span className="ml-1 text-xs text-yellow-400">⚠️ Low</span>
//                           )}
//                         </td>
//                         <td className="px-4 py-3 text-gray-400">{batch.expiry_date}</td>
//                         <td className="px-4 py-3">
//                           <span
//                             className={`text-xs border px-2 py-1 rounded ${status.cls}`}
//                           >
//                             {status.label}
//                           </span>
//                         </td>
//                         <td className="px-4 py-3 text-gray-400 text-xs">
//                           {batch.created_at
//                             ? new Date(batch.created_at).toLocaleDateString("en-IN")
//                             : "—"}
//                         </td>
//                       </tr>
//                     );
//                   })
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       )}

//       {/* Stock Logs Tab */}
//       {activeTab === "logs" && (
//         <div className="bg-[#0d1629] border border-[#1e2d4a] rounded-xl overflow-hidden">
//           <div className="overflow-x-auto">
//             <table className="min-w-full text-sm">
//               <thead>
//                 <tr className="border-b border-[#1e2d4a] text-gray-500 text-xs uppercase tracking-wider">
//                   <th className="px-4 py-3 text-left">Log ID</th>
//                   <th className="px-4 py-3 text-left">Batch #</th>
//                   <th className="px-4 py-3 text-left">Type</th>
//                   <th className="px-4 py-3 text-left">Qty Changed</th>
//                   <th className="px-4 py-3 text-left">Date</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {loading ? (
//                   [...Array(5)].map((_, i) => (
//                     <tr key={i} className="border-b border-[#1e2d4a]">
//                       {[...Array(5)].map((_, j) => (
//                         <td key={j} className="px-4 py-3">
//                           <div className="h-3 bg-[#1e2d4a] rounded animate-pulse w-20" />
//                         </td>
//                       ))}
//                     </tr>
//                   ))
//                 ) : stockLogs.length === 0 ? (
//                   <tr>
//                     <td colSpan={5} className="text-center text-gray-500 py-12 text-sm">
//                       No stock logs yet.
//                     </td>
//                   </tr>
//                 ) : (
//                   stockLogs.map((log) => (
//                     <tr
//                       key={log.log_id}
//                       className="border-b border-[#1e2d4a] hover:bg-[#111d35] transition-colors"
//                     >
//                       <td className="px-4 py-3 text-gray-400 text-xs">#{log.log_id}</td>
//                       <td className="px-4 py-3">
//                         <span className="font-mono text-xs text-red-400 bg-red-400/10 px-2 py-1 rounded">
//                           {log.batch_number || `Batch #${log.batch}`}
//                         </span>
//                       </td>
//                       <td className="px-4 py-3">
//                         <span
//                           className={`text-xs border px-2 py-1 rounded ${changeTypeBadge(
//                             log.change_type
//                           )}`}
//                         >
//                           {log.change_type}
//                         </span>
//                       </td>
//                       <td className="px-4 py-3">
//                         <span
//                           className={`font-semibold ${
//                             log.quantity_changed > 0 ? "text-green-400" : "text-red-400"
//                           }`}
//                         >
//                           {log.quantity_changed > 0 ? "+" : ""}
//                           {log.quantity_changed}
//                         </span>
//                       </td>
//                       <td className="px-4 py-3 text-gray-400 text-xs">
//                         {log.created_at
//                           ? new Date(log.created_at).toLocaleString("en-IN")
//                           : "—"}
//                       </td>
//                     </tr>
//                   ))
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       )}

//       {/* Add Batch Modal */}
//       {showModal && (
//         <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
//           <div className="bg-[#0d1629] border border-[#1e2d4a] rounded-2xl p-6 w-full max-w-md">
//             <h3 className="text-white font-semibold text-lg mb-4">Add New Batch</h3>
//             {formError && (
//               <div className="mb-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs px-3 py-2 rounded-lg">
//                 {formError}
//               </div>
//             )}
//             <div className="space-y-3">
//               <div>
//                 <label className="text-xs text-gray-400 block mb-1">Medicine</label>
//                 <select
//                   value={form.medicine}
//                   onChange={(e) => setForm((p) => ({ ...p, medicine: e.target.value }))}
//                   className="w-full bg-[#060d1a] border border-[#1e2d4a] text-white text-sm rounded-lg px-3 py-2 focus:border-red-400/50 outline-none"
//                 >
//                   <option value="">-- Select Medicine --</option>
//                   {medicines.map((m) => (
//                     <option key={m.medicine_id} value={m.medicine_id}>
//                       {m.name}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//               <div>
//                 <label className="text-xs text-gray-400 block mb-1">Quantity</label>
//                 <input
//                   type="number"
//                   min={1}
//                   value={form.quantity}
//                   onChange={(e) => setForm((p) => ({ ...p, quantity: e.target.value }))}
//                   className="w-full bg-[#060d1a] border border-[#1e2d4a] text-white text-sm rounded-lg px-3 py-2 focus:border-red-400/50 outline-none"
//                 />
//               </div>
//               <div>
//                 <label className="text-xs text-gray-400 block mb-1">Expiry Date</label>
//                 <input
//                   type="date"
//                   value={form.expiry_date}
//                   onChange={(e) => setForm((p) => ({ ...p, expiry_date: e.target.value }))}
//                   className="w-full bg-[#060d1a] border border-[#1e2d4a] text-white text-sm rounded-lg px-3 py-2 focus:border-red-400/50 outline-none"
//                 />
//               </div>
//             </div>
//             <div className="flex gap-3 mt-5">
//               <button
//                 onClick={() => setShowModal(false)}
//                 className="flex-1 border border-[#1e2d4a] text-gray-400 hover:text-white py-2.5 rounded-xl text-sm transition"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleSubmit}
//                 disabled={submitting}
//                 className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white py-2.5 rounded-xl text-sm font-semibold transition"
//               >
//                 {submitting ? "Adding..." : "Add Batch"}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </PharmacistLayout>
//   );
// };

// export default StockPage;

import React, { useEffect, useState } from "react";
import PharmacistLayout from "../components/PharmacistLayout";
import {
  getMedicines,
  getBatches,
  createBatch,
  getStockLogs,
} from "../api/pharmacistApi";

// ─── STOCK & BATCHES PAGE ─────────────────────────────────────────────────────
const StockPage = () => {
  const [medicines, setMedicines] = useState([]);
  const [batches, setBatches] = useState([]);
  const [stockLogs, setStockLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("batches"); // "batches" | "logs"

  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formError, setFormError] = useState("");

  const [filterMedicine, setFilterMedicine] = useState("");
  const [form, setForm] = useState({
    medicine: "",
    quantity: "",
    expiry_date: "",
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [mRes, bRes, sRes] = await Promise.all([
        getMedicines(),
        getBatches(),
        getStockLogs(),
      ]);
      setMedicines(mRes.results || mRes.data || []);
      setBatches(bRes.results || bRes.data || []);
      setStockLogs(sRes.results || sRes.data || []);
    } catch {
      setError("Failed to load stock data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredBatches = filterMedicine
    ? batches.filter(
        (b) =>
          b.medicine === parseInt(filterMedicine) ||
          b.medicine_id === parseInt(filterMedicine)
      )
    : batches;

  const openAddBatch = () => {
    setForm({ medicine: "", quantity: "", expiry_date: "" });
    setFormError("");
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!form.medicine || !form.quantity || !form.expiry_date) {
      setFormError("All fields are required.");
      return;
    }
    setSubmitting(true);
    setFormError("");
    try {
      await createBatch({
        medicine: parseInt(form.medicine),
        quantity: parseInt(form.quantity),
        expiry_date: form.expiry_date,
      });
      setSuccess("Batch added successfully.");
      setShowModal(false);
      fetchData();
    } catch (err) {
      const msg = err?.response?.data
        ? JSON.stringify(err.response.data)
        : "Failed to add batch.";
      setFormError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const getExpiryStatus = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    if (diffDays < 0)
      return {
        label: "Expired",
        cls: "text-red-700 bg-red-50 border-red-200",
      };
    if (diffDays <= 30)
      return {
        label: "Expiring Soon",
        cls: "text-amber-700 bg-amber-50 border-amber-200",
      };
    return {
      label: "Good",
      cls: "text-green-700 bg-green-50 border-green-200",
    };
  };

  const changeTypeBadge = (type) => {
    if (type === "ADD") return "text-green-700 bg-green-50 border-green-200";
    if (type === "DISPENSE") return "text-blue-700 bg-blue-50 border-blue-200";
    return "text-red-700 bg-red-50 border-red-200";
  };

  return (
    <PharmacistLayout title="Stock & Batches">
      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-6">
        {[
          {
            label: "Total Medicines",
            value: medicines.length,
            color: "text-[#15803d]",
            icon: "💊",
          },
          {
            label: "Total Batches",
            value: batches.length,
            color: "text-blue-600",
            icon: "📦",
          },
          {
            label: "Low Stock Batches",
            value: batches.filter((b) => b.quantity <= 10).length,
            color: "text-amber-600",
            icon: "⚠️",
          },
          {
            label: "Expired / Expiring",
            value: batches.filter((b) => {
              const d = Math.ceil(
                (new Date(b.expiry_date) - new Date()) / (1000 * 60 * 60 * 24)
              );
              return d <= 30;
            }).length,
            color: "text-orange-600",
            icon: "🗓️",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white border-2 border-[#86c8a3] rounded-2xl p-5 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className={`text-3xl font-bold ${stat.color}`}>
                  {loading ? "—" : stat.value}
                </p>
                <p className="text-sm text-gray-600 mt-2">{stat.label}</p>
              </div>
              <span className="text-2xl opacity-70">{stat.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-base px-4 py-3 rounded-xl">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 text-base px-4 py-3 rounded-xl">
          {success}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {["batches", "logs"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 rounded-xl text-base font-medium transition capitalize ${
              activeTab === tab
                ? "bg-[#e8f5ee] text-[#15803d] border border-[#86c8a3]"
                : "bg-white text-gray-600 hover:text-[#15803d] border border-[#dbe7e2]"
            }`}
          >
            {tab === "batches" ? "Batches" : "Stock Logs"}
          </button>
        ))}

        <div className="ml-auto flex gap-3 items-center">
          {activeTab === "batches" && (
            <select
              value={filterMedicine}
              onChange={(e) => setFilterMedicine(e.target.value)}
              className="bg-white border border-[#dbe7e2] text-gray-800 text-base rounded-xl px-4 py-2.5 focus:border-[#86c8a3] outline-none"
            >
              <option value="">All Medicines</option>
              {medicines.map((m) => (
                <option key={m.medicine_id} value={m.medicine_id}>
                  {m.name}
                </option>
              ))}
            </select>
          )}
          {activeTab === "batches" && (
            <button
              onClick={openAddBatch}
              className="bg-[#16a34a] hover:bg-[#15803d] text-white text-base font-semibold px-4 py-2.5 rounded-xl transition"
            >
              + Add Batch
            </button>
          )}
        </div>
      </div>

      {/* Batches Tab */}
      {activeTab === "batches" && (
        <div className="bg-white border-2 border-[#86c8a3] rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-base">
              <thead>
                <tr className="bg-[#f7fbf8] border-b border-[#a7d8bb] text-gray-600 text-sm uppercase tracking-wider">
                  <th className="px-5 py-4 text-left">Batch #</th>
                  <th className="px-5 py-4 text-left">Medicine</th>
                  <th className="px-5 py-4 text-left">Quantity</th>
                  <th className="px-5 py-4 text-left">Expiry Date</th>
                  <th className="px-5 py-4 text-left">Status</th>
                  <th className="px-5 py-4 text-left">Added On</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="border-b border-[#d7eee0]">
                      {[...Array(6)].map((_, j) => (
                        <td key={j} className="px-5 py-4">
                          <div className="h-4 bg-[#edf7f1] rounded animate-pulse w-24" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : filteredBatches.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="text-center text-gray-500 py-14 text-base"
                    >
                      No batches found.
                    </td>
                  </tr>
                ) : (
                  filteredBatches.map((batch) => {
                    const status = getExpiryStatus(batch.expiry_date);
                    const medName =
                      batch.medicine_name ||
                      medicines.find((m) => m.medicine_id === batch.medicine)?.name ||
                      `Medicine #${batch.medicine}`;
                    return (
                      <tr
                        key={batch.batch_id}
                        className="border-b border-[#d7eee0] hover:bg-[#f8fcf9] transition-colors"
                      >
                        <td className="px-5 py-4">
                          <span className="font-mono text-sm text-[#15803d] bg-[#e8f5ee] border border-[#86c8a3] px-2.5 py-1 rounded-md">
                            {batch.batch_number}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-gray-900 font-medium">
                          {medName}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`font-semibold text-base ${
                              batch.quantity <= 10
                                ? "text-amber-700"
                                : "text-gray-900"
                            }`}
                          >
                            {batch.quantity}
                          </span>
                          {batch.quantity <= 10 && (
                            <span className="ml-1 text-sm text-amber-700">
                              ⚠️ Low
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-gray-600">
                          {batch.expiry_date}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`text-sm border px-2.5 py-1 rounded-full ${status.cls}`}
                          >
                            {status.label}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-gray-600 text-sm">
                          {batch.created_at
                            ? new Date(batch.created_at).toLocaleDateString("en-IN")
                            : "—"}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Stock Logs Tab */}
      {activeTab === "logs" && (
        <div className="bg-white border-2 border-[#86c8a3] rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-base">
              <thead>
                <tr className="bg-[#f7fbf8] border-b border-[#a7d8bb] text-gray-600 text-sm uppercase tracking-wider">
                  <th className="px-5 py-4 text-left">Log ID</th>
                  <th className="px-5 py-4 text-left">Batch #</th>
                  <th className="px-5 py-4 text-left">Type</th>
                  <th className="px-5 py-4 text-left">Qty Changed</th>
                  <th className="px-5 py-4 text-left">Date</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="border-b border-[#d7eee0]">
                      {[...Array(5)].map((_, j) => (
                        <td key={j} className="px-5 py-4">
                          <div className="h-4 bg-[#edf7f1] rounded animate-pulse w-24" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : stockLogs.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-center text-gray-500 py-14 text-base"
                    >
                      No stock logs yet.
                    </td>
                  </tr>
                ) : (
                  stockLogs.map((log) => (
                    <tr
                      key={log.log_id}
                      className="border-b border-[#d7eee0] hover:bg-[#f8fcf9] transition-colors"
                    >
                      <td className="px-5 py-4 text-gray-600 text-sm">
                        #{log.log_id}
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-mono text-sm text-[#15803d] bg-[#e8f5ee] border border-[#86c8a3] px-2.5 py-1 rounded-md">
                          {log.batch_number || `Batch #${log.batch}`}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`text-sm border px-2.5 py-1 rounded-full ${changeTypeBadge(
                            log.change_type
                          )}`}
                        >
                          {log.change_type}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`font-semibold text-base ${
                            log.quantity_changed > 0
                              ? "text-green-700"
                              : "text-red-700"
                          }`}
                        >
                          {log.quantity_changed > 0 ? "+" : ""}
                          {log.quantity_changed}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-gray-600 text-sm">
                        {log.created_at
                          ? new Date(log.created_at).toLocaleString("en-IN")
                          : "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Batch Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white border-2 border-[#86c8a3] rounded-2xl p-6 w-full max-w-md shadow-lg">
            <h3 className="text-gray-900 font-semibold text-xl mb-4">
              Add New Batch
            </h3>
            {formError && (
              <div className="mb-3 bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded-lg">
                {formError}
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-600 block mb-1">
                  Medicine
                </label>
                <select
                  value={form.medicine}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, medicine: e.target.value }))
                  }
                  className="w-full bg-white border border-[#dbe7e2] text-gray-800 text-base rounded-lg px-3 py-2.5 focus:border-[#86c8a3] outline-none"
                >
                  <option value="">-- Select Medicine --</option>
                  {medicines.map((m) => (
                    <option key={m.medicine_id} value={m.medicine_id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">
                  Quantity
                </label>
                <input
                  type="number"
                  min={1}
                  value={form.quantity}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, quantity: e.target.value }))
                  }
                  className="w-full bg-white border border-[#dbe7e2] text-gray-800 text-base rounded-lg px-3 py-2.5 focus:border-[#86c8a3] outline-none"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">
                  Expiry Date
                </label>
                <input
                  type="date"
                  value={form.expiry_date}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, expiry_date: e.target.value }))
                  }
                  className="w-full bg-white border border-[#dbe7e2] text-gray-800 text-base rounded-lg px-3 py-2.5 focus:border-[#86c8a3] outline-none"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 border border-[#dbe7e2] text-gray-600 hover:text-gray-900 py-3 rounded-xl text-base transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 bg-[#16a34a] hover:bg-[#15803d] disabled:opacity-50 text-white py-3 rounded-xl text-base font-semibold transition"
              >
                {submitting ? "Adding..." : "Add Batch"}
              </button>
            </div>
          </div>
        </div>
      )}
    </PharmacistLayout>
  );
};

export default StockPage;