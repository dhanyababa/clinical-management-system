import React, { useEffect, useState } from "react";
import PharmacistLayout from "../components/PharmacistLayout";

import {
  getMedicines,
  getBatches,
  createBatch,
  getStockLogs,
} from "../api/pharmacistApi";

// ============================================================
// STOCK & BATCHES PAGE
// ============================================================

const StockPage = () => {
  const [medicines, setMedicines] = useState([]);
  const [batches, setBatches] = useState([]);
  const [stockLogs, setStockLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("batches");

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

  // ============================================================
  // FETCH DATA
  // ============================================================

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

  // ============================================================
  // FILTER BATCHES
  // ============================================================

  const filteredBatches = filterMedicine
    ? batches.filter(
        (b) =>
          b.medicine === parseInt(filterMedicine) ||
          b.medicine_id === parseInt(filterMedicine)
      )
    : batches;

  // ============================================================
  // ADD BATCH
  // ============================================================

  const openAddBatch = () => {
    setForm({
      medicine: "",
      quantity: "",
      expiry_date: "",
    });

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

  // ============================================================
  // EXPIRY STATUS
  // ============================================================

  const getExpiryStatus = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);

    const diffDays = Math.ceil(
      (expiry - today) / (1000 * 60 * 60 * 24)
    );

    if (diffDays < 0) {
      return {
        label: "Expired",
        cls: "text-red-300 bg-red-500/10 border-red-400/30",
      };
    }

    if (diffDays <= 30) {
      return {
        label: "Expiring Soon",
        cls: "text-amber-300 bg-amber-400/10 border-amber-400/30",
      };
    }

    return {
      label: "Good",
      cls: "text-green-300 bg-green-400/10 border-green-400/30",
    };
  };

  // ============================================================
  // STOCK LOG BADGE
  // ============================================================

  const changeTypeBadge = (type) => {
    if (type === "ADD") {
      return "text-green-300 bg-green-400/10 border-green-400/30";
    }

    if (type === "DISPENSE") {
      return "text-blue-300 bg-blue-400/10 border-blue-400/30";
    }

    return "text-red-300 bg-red-500/10 border-red-400/30";
  };

  return (
    <PharmacistLayout title="Stock & Batches">
      <div className="w-full min-w-0">

        {/* ================================================= */}
        {/* STATISTICS */}
        {/* ================================================= */}

        <div className="mb-6 grid grid-cols-1 gap-3 min-[400px]:grid-cols-2 lg:grid-cols-4 sm:gap-5">
          {[
            {
              label: "Total Medicines",
              value: medicines.length,
              color: "text-red-400",
              icon: "💊",
            },
            {
              label: "Total Batches",
              value: batches.length,
              color: "text-cyan-400",
              icon: "📦",
            },
            {
              label: "Low Stock Batches",
              value: batches.filter((b) => b.quantity <= 10).length,
              color: "text-amber-400",
              icon: "⚠️",
            },
            {
              label: "Expired / Expiring",
              value: batches.filter((b) => {
                const d = Math.ceil(
                  (new Date(b.expiry_date) - new Date()) /
                    (1000 * 60 * 60 * 24)
                );

                return d <= 30;
              }).length,
              color: "text-orange-400",
              icon: "🗓️",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="min-w-0 rounded-xl border border-[#1e2d4a] bg-[#0d1629] p-4 transition-colors hover:border-[#344766] sm:p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p
                    className={`break-words text-3xl font-bold sm:text-4xl ${stat.color}`}
                  >
                    {loading ? "—" : stat.value}
                  </p>

                  <p className="mt-2 text-xs text-gray-400 sm:text-sm">
                    {stat.label}
                  </p>
                </div>

                <span
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/5 text-2xl"
                  aria-hidden="true"
                >
                  {stat.icon}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* ================================================= */}
        {/* ERROR AND SUCCESS MESSAGES */}
        {/* ================================================= */}

        {error && (
          <div className="mb-4 break-words rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-3 text-sm text-red-300 sm:px-4">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 break-words rounded-xl border border-green-400/30 bg-green-400/10 px-3 py-3 text-sm text-green-300 sm:px-4">
            {success}
          </div>
        )}

        {/* ================================================= */}
        {/* TABS AND ACTIONS */}
        {/* ================================================= */}

        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {["batches", "logs"].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`rounded-xl border px-4 py-2.5 text-sm font-medium capitalize transition sm:text-base ${
                  activeTab === tab
                    ? "border-red-400/40 bg-red-400/15 text-red-300"
                    : "border-[#26344c] bg-[#0d1629] text-gray-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                {tab === "batches" ? "Batches" : "Stock Logs"}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {activeTab === "batches" && (
              <select
                value={filterMedicine}
                onChange={(e) => setFilterMedicine(e.target.value)}
                className="w-full min-w-0 rounded-xl border border-[#26344c] bg-[#0d1629] px-4 py-2.5 text-sm text-white outline-none transition focus:border-red-400 sm:w-56 sm:text-base"
              >
                <option value="">All Medicines</option>

                {medicines.map((m) => (
                  <option
                    key={m.medicine_id}
                    value={m.medicine_id}
                  >
                    {m.name}
                  </option>
                ))}
              </select>
            )}

            {activeTab === "batches" && (
              <button
                type="button"
                onClick={openAddBatch}
                className="w-full shrink-0 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-400 sm:w-auto sm:text-base"
              >
                + Add Batch
              </button>
            )}
          </div>
        </div>

        {/* ================================================= */}
        {/* BATCHES TAB */}
        {/* ================================================= */}

        {activeTab === "batches" && (
          <div className="w-full min-w-0 overflow-hidden rounded-xl border border-[#1e2d4a] bg-[#0d1629]">
            <div className="w-full max-w-full overflow-x-auto">
              <table className="w-full min-w-[850px] text-sm">
                <thead>
                  <tr className="border-b border-[#1e2d4a] bg-[#101c30] text-xs uppercase tracking-wider text-gray-400">
                    <th className="px-5 py-4 text-left">
                      Batch #
                    </th>
                    <th className="px-5 py-4 text-left">
                      Medicine
                    </th>
                    <th className="px-5 py-4 text-left">
                      Quantity
                    </th>
                    <th className="px-5 py-4 text-left">
                      Expiry Date
                    </th>
                    <th className="px-5 py-4 text-left">
                      Status
                    </th>
                    <th className="px-5 py-4 text-left">
                      Added On
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    [...Array(5)].map((_, i) => (
                      <tr
                        key={i}
                        className="border-b border-[#1e2d4a]"
                      >
                        {[...Array(6)].map((_, j) => (
                          <td
                            key={j}
                            className="px-5 py-4"
                          >
                            <div className="h-4 w-24 animate-pulse rounded bg-[#1e2d4a]" />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : filteredBatches.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-14 text-center text-sm text-gray-400"
                      >
                        No batches found.
                      </td>
                    </tr>
                  ) : (
                    filteredBatches.map((batch) => {
                      const status = getExpiryStatus(
                        batch.expiry_date
                      );

                      const medName =
                        batch.medicine_name ||
                        medicines.find(
                          (m) =>
                            m.medicine_id === batch.medicine
                        )?.name ||
                        `Medicine #${batch.medicine}`;

                      return (
                        <tr
                          key={batch.batch_id}
                          className="border-b border-[#1e2d4a] transition-colors hover:bg-[#111d35]"
                        >
                          <td className="px-5 py-4">
                            <span className="inline-block whitespace-nowrap rounded-md border border-red-400/20 bg-red-400/10 px-2.5 py-1 font-mono text-xs text-red-300">
                              {batch.batch_number}
                            </span>
                          </td>

                          <td className="px-5 py-4 font-medium text-white">
                            {medName}
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`font-semibold ${
                                batch.quantity <= 10
                                  ? "text-amber-400"
                                  : "text-white"
                              }`}
                            >
                              {batch.quantity}
                            </span>

                            {batch.quantity <= 10 && (
                              <span className="ml-1 text-xs text-amber-400">
                                ⚠️ Low
                              </span>
                            )}
                          </td>

                          <td className="whitespace-nowrap px-5 py-4 text-gray-300">
                            {batch.expiry_date}
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`inline-block whitespace-nowrap rounded-full border px-2.5 py-1 text-xs ${status.cls}`}
                            >
                              {status.label}
                            </span>
                          </td>

                          <td className="whitespace-nowrap px-5 py-4 text-xs text-gray-400">
                            {batch.created_at
                              ? new Date(
                                  batch.created_at
                                ).toLocaleDateString("en-IN")
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

        {/* ================================================= */}
        {/* STOCK LOGS TAB */}
        {/* ================================================= */}

        {activeTab === "logs" && (
          <div className="w-full min-w-0 overflow-hidden rounded-xl border border-[#1e2d4a] bg-[#0d1629]">
            <div className="w-full max-w-full overflow-x-auto">
              <table className="w-full min-w-[750px] text-sm">
                <thead>
                  <tr className="border-b border-[#1e2d4a] bg-[#101c30] text-xs uppercase tracking-wider text-gray-400">
                    <th className="px-5 py-4 text-left">
                      Log ID
                    </th>
                    <th className="px-5 py-4 text-left">
                      Batch #
                    </th>
                    <th className="px-5 py-4 text-left">
                      Type
                    </th>
                    <th className="px-5 py-4 text-left">
                      Qty Changed
                    </th>
                    <th className="px-5 py-4 text-left">
                      Date
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    [...Array(5)].map((_, i) => (
                      <tr
                        key={i}
                        className="border-b border-[#1e2d4a]"
                      >
                        {[...Array(5)].map((_, j) => (
                          <td
                            key={j}
                            className="px-5 py-4"
                          >
                            <div className="h-4 w-24 animate-pulse rounded bg-[#1e2d4a]" />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : stockLogs.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-14 text-center text-sm text-gray-400"
                      >
                        No stock logs yet.
                      </td>
                    </tr>
                  ) : (
                    stockLogs.map((log) => (
                      <tr
                        key={log.log_id}
                        className="border-b border-[#1e2d4a] transition-colors hover:bg-[#111d35]"
                      >
                        <td className="px-5 py-4 text-xs text-gray-400">
                          #{log.log_id}
                        </td>

                        <td className="px-5 py-4">
                          <span className="inline-block whitespace-nowrap rounded-md border border-red-400/20 bg-red-400/10 px-2.5 py-1 font-mono text-xs text-red-300">
                            {log.batch_number ||
                              `Batch #${log.batch}`}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-block whitespace-nowrap rounded-full border px-2.5 py-1 text-xs ${changeTypeBadge(
                              log.change_type
                            )}`}
                          >
                            {log.change_type}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`font-semibold ${
                              log.quantity_changed > 0
                                ? "text-green-400"
                                : "text-red-400"
                            }`}
                          >
                            {log.quantity_changed > 0
                              ? "+"
                              : ""}
                            {log.quantity_changed}
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-xs text-gray-400">
                          {log.created_at
                            ? new Date(
                                log.created_at
                              ).toLocaleString("en-IN")
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

        {/* ================================================= */}
        {/* ADD BATCH MODAL */}
        {/* ================================================= */}

        {showModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 px-3 py-4 backdrop-blur-sm sm:px-5">
            <div
              className="max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-2xl border border-[#26344c] bg-[#101b2e] p-4 shadow-2xl sm:p-6"
              role="dialog"
              aria-modal="true"
              aria-label="Add New Batch"
            >
              <h3 className="mb-4 text-lg font-semibold text-white sm:text-xl">
                Add New Batch
              </h3>

              {formError && (
                <div className="mb-3 break-words rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                  {formError}
                </div>
              )}

              <div className="space-y-4">
                {/* Medicine */}
                <div>
                  <label className="mb-1 block text-sm text-gray-300">
                    Medicine
                  </label>

                  <select
                    value={form.medicine}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        medicine: e.target.value,
                      }))
                    }
                    className="w-full min-w-0 rounded-lg border border-[#26344c] bg-[#060d1a] px-3 py-2.5 text-sm text-white outline-none transition focus:border-red-400 sm:text-base"
                  >
                    <option value="">
                      -- Select Medicine --
                    </option>

                    {medicines.map((m) => (
                      <option
                        key={m.medicine_id}
                        value={m.medicine_id}
                      >
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Quantity */}
                <div>
                  <label className="mb-1 block text-sm text-gray-300">
                    Quantity
                  </label>

                  <input
                    type="number"
                    min={1}
                    value={form.quantity}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        quantity: e.target.value,
                      }))
                    }
                    className="w-full min-w-0 rounded-lg border border-[#26344c] bg-[#060d1a] px-3 py-2.5 text-sm text-white outline-none transition focus:border-red-400 sm:text-base"
                  />
                </div>

                {/* Expiry date */}
                <div>
                  <label className="mb-1 block text-sm text-gray-300">
                    Expiry Date
                  </label>

                  <input
                    type="date"
                    value={form.expiry_date}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        expiry_date: e.target.value,
                      }))
                    }
                    className="w-full min-w-0 rounded-lg border border-[#26344c] bg-[#060d1a] px-3 py-2.5 text-sm text-white outline-none transition focus:border-red-400 sm:text-base"
                  />
                </div>
              </div>

              {/* Modal buttons */}
              <div className="mt-5 flex flex-col gap-3 min-[400px]:flex-row">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="w-full rounded-xl border border-[#26344c] px-4 py-3 text-sm text-gray-300 transition hover:bg-white/5 hover:text-white min-[400px]:flex-1 sm:text-base"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full rounded-xl bg-red-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-50 min-[400px]:flex-1 sm:text-base"
                >
                  {submitting ? "Adding..." : "Add Batch"}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </PharmacistLayout>
  );
};

export default StockPage;