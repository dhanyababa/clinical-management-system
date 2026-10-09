import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PharmacistLayout from "../components/PharmacistLayout";

import {
  getMedicineBills,
  getMedicineBillDetail,
  updateMedicineBill,
} from "../api/pharmacistApi";

const BillsPage = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [filter, setFilter] = useState("all");
  const [markingPaid, setMarkingPaid] = useState(null);
  const [selectedBill, setSelectedBill] = useState(null);
  const [dateFilter, setDateFilter] = useState("all");
  const [search, setSearch] = useState("");

  const navigate = useNavigate();

  // ==============================
  // FETCH BILLS
  // ==============================

  const fetchBills = () => {
    setLoading(true);

    getMedicineBills()
      .then((res) => setBills(res.results || res.data || []))
      .catch(() => setError("Failed to load bills."))
      .finally(() => setLoading(false));
  };

  const handleViewBill = async (bill) => {
    setError("");

    try {
      const res = await getMedicineBillDetail(bill.bill_id);
      const fullBill = res.data || res;
      setSelectedBill(fullBill);
    } catch (err) {
      setError("Failed to load bill details.");
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

  // ==============================
  // DATE FILTER HELPERS
  // ==============================

  const isToday = (dateString) => {
    if (!dateString) return false;

    const d = new Date(dateString);
    const today = new Date();

    return d.toDateString() === today.toDateString();
  };

  const isYesterday = (dateString) => {
    if (!dateString) return false;

    const d = new Date(dateString);
    const yesterday = new Date();

    yesterday.setDate(yesterday.getDate() - 1);

    return d.toDateString() === yesterday.toDateString();
  };

  const isThisWeek = (dateString) => {
    if (!dateString) return false;

    const d = new Date(dateString);
    const now = new Date();

    const startOfWeek = new Date(now);
    startOfWeek.setHours(0, 0, 0, 0);
    startOfWeek.setDate(now.getDate() - now.getDay());

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    return d >= startOfWeek && d < endOfWeek;
  };

  // ==============================
  // FILTER BILLS
  // ==============================

  const filteredBills = bills.filter((bill) => {
    const paymentMatch =
      filter === "all" ? true : bill.payment_status === filter;

    const dateMatch =
      dateFilter === "all"
        ? true
        : dateFilter === "today"
        ? isToday(bill.created_at)
        : dateFilter === "yesterday"
        ? isYesterday(bill.created_at)
        : dateFilter === "week"
        ? isThisWeek(bill.created_at)
        : true;

    const patientName =
      bill.patient_details?.full_name?.toLowerCase() || "";

    const dispenseId = String(
      bill.dispense || bill.dispense_id || ""
    ).toLowerCase();

    const billId = String(bill.bill_id || "").toLowerCase();

    const q = search.trim().toLowerCase();

    const searchMatch =
      !q ||
      patientName.includes(q) ||
      dispenseId.includes(q) ||
      billId.includes(q);

    return paymentMatch && dateMatch && searchMatch;
  });

  // ==============================
  // REVENUE CALCULATIONS
  // ==============================

  const totalRevenue = bills
    .filter((b) => b.payment_status === "Paid")
    .reduce(
      (sum, b) => sum + parseFloat(b.final_amount || 0),
      0
    );

  const pendingRevenue = bills
    .filter((b) => b.payment_status === "Pending")
    .reduce(
      (sum, b) => sum + parseFloat(b.final_amount || 0),
      0
    );

  // ==============================
  // MARK BILL AS PAID
  // ==============================

  const handleMarkPaid = async (bill) => {
    setMarkingPaid(bill.bill_id);
    setError("");
    setSuccess("");

    try {
      const res = await updateMedicineBill(bill.bill_id, {
        ...bill,
        payment_status: "Paid",
      });

      setSuccess(`Bill #${bill.bill_id} marked as paid.`);
      fetchBills();

      if (selectedBill?.bill_id === bill.bill_id) {
        setSelectedBill(res.data || res);
      }
    } catch (err) {
      const msg = err?.response?.data
        ? JSON.stringify(err.response.data)
        : "Failed to update bill.";

      setError(msg);
    } finally {
      setMarkingPaid(null);
    }
  };

  return (
    <PharmacistLayout title="Medicine Bills">
      <div className="w-full min-w-0">

        {/* ============================== */}
        {/* STATISTICS */}
        {/* ============================== */}

        <div className="mb-6 grid grid-cols-1 gap-4 min-[400px]:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: "Total Bills",
              value: bills.length,
              valueClass: "text-white",
              icon: "🧾",
            },
            {
              label: "Pending Bills",
              value: bills.filter(
                (b) => b.payment_status === "Pending"
              ).length,
              valueClass: "text-amber-400",
              icon: "⏳",
            },
            {
              label: "Pending Amount",
              value: `₹${pendingRevenue.toFixed(2)}`,
              valueClass: "text-orange-400",
              icon: "💰",
            },
            {
              label: "Total Collected",
              value: `₹${totalRevenue.toFixed(2)}`,
              valueClass: "text-green-400",
              icon: "✅",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="min-w-0 rounded-xl border border-[#1e2d4a] bg-[#0d1629] p-4 transition-colors hover:border-[#344766] sm:p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p
                    className={`break-words text-2xl font-bold sm:text-3xl ${stat.valueClass}`}
                  >
                    {loading ? "—" : stat.value}
                  </p>

                  <p className="mt-2 text-xs text-gray-400 sm:text-sm">
                    {stat.label}
                  </p>
                </div>

                <span
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/5 text-xl"
                  aria-hidden="true"
                >
                  {stat.icon}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* ============================== */}
        {/* MESSAGES */}
        {/* ============================== */}

        {error && (
          <div className="mb-4 break-words rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 break-words rounded-xl border border-green-400/30 bg-green-400/10 px-4 py-3 text-sm text-green-300">
            {success}
          </div>
        )}

        {/* ============================== */}
        {/* PAYMENT FILTER TABS */}
        {/* ============================== */}

        <div className="mb-4 flex flex-wrap gap-2">
          {[
            { key: "all", label: "All" },
            { key: "Pending", label: "Pending" },
            { key: "Paid", label: "Paid" },
          ].map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
                filter === key
                  ? "border-red-400/40 bg-red-400/15 text-red-300"
                  : "border-[#26344c] bg-[#0d1629] text-gray-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              {label}

              <span className="ml-2 text-xs opacity-70">
                (
                {key === "all"
                  ? bills.length
                  : bills.filter(
                      (b) => b.payment_status === key
                    ).length}
                )
              </span>
            </button>
          ))}
        </div>

        {/* ============================== */}
        {/* SEARCH AND DATE FILTER */}
        {/* ============================== */}

        <div className="mb-5 flex min-w-0 flex-col gap-3 md:flex-row">
          <input
            type="text"
            placeholder="Search by patient name, bill id, or dispense id..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full min-w-0 flex-1 rounded-xl border border-[#26344c] bg-[#0d1629] px-4 py-3 text-sm text-white placeholder:text-gray-500 outline-none transition focus:border-red-400 sm:text-base"
          />

          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full rounded-xl border border-[#26344c] bg-[#0d1629] px-4 py-3 text-sm text-white outline-none transition focus:border-red-400 md:w-48 sm:text-base"
          >
            <option value="all">All Dates</option>
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="week">This Week</option>
          </select>
        </div>

        {/* ============================== */}
        {/* TABLE AND DETAIL PANEL */}
        {/* ============================== */}

        <div className="flex min-w-0 flex-col gap-6 xl:flex-row xl:items-start">

          {/* BILLS TABLE */}

          <div
            className={`min-w-0 overflow-hidden rounded-xl border border-[#1e2d4a] bg-[#0d1629] ${
              selectedBill ? "w-full xl:flex-1" : "w-full"
            }`}
          >
            <div className="w-full max-w-full overflow-x-auto">
              <table className="w-full min-w-[1100px] text-sm">
                <thead>
                  <tr className="border-b border-[#1e2d4a] bg-[#101c30] text-xs uppercase tracking-wider text-gray-400">
                    <th className="px-4 py-4 text-left">Bill #</th>
                    <th className="px-4 py-4 text-left">Dispense #</th>
                    <th className="px-4 py-4 text-left">Patient</th>
                    <th className="px-4 py-4 text-left">Total</th>
                    <th className="px-4 py-4 text-left">Discount</th>
                    <th className="px-4 py-4 text-left">Final</th>
                    <th className="px-4 py-4 text-left">Status</th>
                    <th className="px-4 py-4 text-left">Date</th>
                    <th className="px-4 py-4 text-left">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    [...Array(5)].map((_, i) => (
                      <tr
                        key={i}
                        className="border-b border-[#1e2d4a]"
                      >
                        {[...Array(9)].map((_, j) => (
                          <td key={j} className="px-4 py-4">
                            <div className="h-3 w-16 animate-pulse rounded bg-[#1e2d4a]" />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : filteredBills.length === 0 ? (
                    <tr>
                      <td
                        colSpan={9}
                        className="px-4 py-14 text-center text-sm text-gray-400"
                      >
                        No bills found.
                      </td>
                    </tr>
                  ) : (
                    filteredBills.map((bill) => (
                      <tr
                        key={bill.bill_id}
                        onClick={() =>
                          selectedBill?.bill_id === bill.bill_id
                            ? setSelectedBill(null)
                            : handleViewBill(bill)
                        }
                        className={`cursor-pointer border-b border-[#1e2d4a] transition-colors ${
                          selectedBill?.bill_id === bill.bill_id
                            ? "bg-red-400/10"
                            : "hover:bg-[#111d35]"
                        }`}
                      >
                        <td className="px-4 py-4">
                          <span className="inline-block whitespace-nowrap rounded-md border border-red-400/20 bg-red-400/10 px-2.5 py-1 font-mono text-xs text-red-300">
                            #{bill.bill_id}
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-4 py-4 text-gray-400">
                          #{bill.dispense || bill.dispense_id}
                        </td>

                        <td className="px-4 py-4 font-medium text-white">
                          {bill.patient_details?.full_name || "—"}
                        </td>

                        <td className="whitespace-nowrap px-4 py-4 text-gray-300">
                          ₹{parseFloat(bill.total_amount || 0).toFixed(2)}
                        </td>

                        <td className="whitespace-nowrap px-4 py-4 text-gray-400">
                          {parseFloat(bill.discount || 0) > 0
                            ? `₹${parseFloat(bill.discount).toFixed(2)}`
                            : "—"}
                        </td>

                        <td className="whitespace-nowrap px-4 py-4 font-semibold text-white">
                          ₹{parseFloat(bill.final_amount || 0).toFixed(2)}
                        </td>

                        <td className="px-4 py-4">
                          <span
                            className={`inline-block whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-medium ${
                              bill.payment_status === "Paid"
                                ? "border-green-400/30 bg-green-400/10 text-green-300"
                                : "border-amber-400/30 bg-amber-400/10 text-amber-300"
                            }`}
                          >
                            {bill.payment_status}
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-4 py-4 text-gray-400">
                          {bill.created_at
                            ? new Date(
                                bill.created_at
                              ).toLocaleDateString("en-IN")
                            : "—"}
                        </td>

                        <td
                          className="px-4 py-4"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => handleViewBill(bill)}
                              className="rounded-lg border border-[#344766] bg-white/5 px-3 py-2 text-xs text-gray-200 transition hover:bg-white/10"
                            >
                              View
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                navigate(
                                  `/pharmacist/bills/${bill.bill_id}/print`
                                )
                              }
                              className="rounded-lg border border-[#344766] bg-white/5 px-3 py-2 text-xs text-gray-200 transition hover:bg-white/10"
                            >
                              Print
                            </button>

                            {bill.payment_status === "Pending" ? (
                              <button
                                type="button"
                                onClick={() => handleMarkPaid(bill)}
                                disabled={markingPaid === bill.bill_id}
                                className="rounded-lg bg-red-500 px-3 py-2 text-xs font-medium text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {markingPaid === bill.bill_id
                                  ? "Updating..."
                                  : "Mark Paid"}
                              </button>
                            ) : (
                              <span className="rounded-lg border border-green-400/30 bg-green-400/10 px-3 py-2 text-xs text-green-300">
                                ✓ Paid
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ============================== */}
          {/* BILL DETAIL PANEL */}
          {/* ============================== */}

          {selectedBill && (
            <div className="w-full min-w-0 shrink-0 xl:w-80 2xl:w-96">
              <div className="rounded-xl border border-[#1e2d4a] bg-[#0d1629] p-4 sm:p-5 xl:sticky xl:top-24">

                {/* HEADER */}

                <div className="mb-5 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-lg font-semibold text-white">
                      Bill Details
                    </h3>

                    <p className="mt-1 text-sm text-gray-400">
                      Bill #{selectedBill.bill_id}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedBill(null)}
                    className="shrink-0 rounded-lg px-2 py-1 text-sm text-gray-400 transition hover:bg-white/10 hover:text-white"
                    aria-label="Close bill details"
                  >
                    ✕
                  </button>
                </div>

                {/* BASIC INFORMATION */}

                <div className="mb-5 grid grid-cols-1 gap-4 min-[400px]:grid-cols-2">
                  <div className="min-w-0">
                    <p className="mb-1 text-xs text-gray-500">
                      Patient
                    </p>
                    <p className="break-words text-sm font-medium text-white">
                      {selectedBill.patient_details?.full_name || "—"}
                    </p>
                  </div>

                  <div className="min-w-0">
                    <p className="mb-1 text-xs text-gray-500">
                      Doctor
                    </p>
                    <p className="break-words text-sm font-medium text-white">
                      {selectedBill.doctor_name || "—"}
                    </p>
                  </div>

                  <div className="min-w-0">
                    <p className="mb-1 text-xs text-gray-500">
                      Prescription
                    </p>
                    <p className="break-words text-sm font-medium text-white">
                      {selectedBill.prescription_code || "—"}
                    </p>
                  </div>

                  <div className="min-w-0">
                    <p className="mb-1 text-xs text-gray-500">
                      Status
                    </p>
                    <p
                      className={`text-sm font-medium ${
                        selectedBill.payment_status === "Paid"
                          ? "text-green-400"
                          : "text-amber-400"
                      }`}
                    >
                      {selectedBill.payment_status}
                    </p>
                  </div>
                </div>

                {/* MEDICINES */}

                <div className="mb-5 space-y-3">
                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    Medicines
                  </p>

                  {selectedBill.items?.map((item, idx) => (
                    <div
                      key={idx}
                      className="min-w-0 rounded-xl border border-[#26344c] bg-[#101c30] p-3.5"
                    >
                      <p className="break-words text-sm font-medium text-white">
                        {item.medicine_name}
                      </p>

                      <p className="mt-1 text-sm text-gray-400">
                        Prescribed: {item.prescribed_quantity} | Given:{" "}
                        {item.dispensed_quantity}
                      </p>

                      {item.remaining_quantity > 0 && (
                        <p className="mt-1 text-sm text-amber-400">
                          Remaining: {item.remaining_quantity}
                        </p>
                      )}

                      {item.is_partial && (
                        <p className="mt-1 break-words text-sm text-red-400">
                          {item.note}
                        </p>
                      )}

                      <p className="mt-2 text-sm text-gray-400">
                        ₹{parseFloat(item.line_total || 0).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                {/* TOTALS */}

                <div className="space-y-2.5 border-t border-[#26344c] pt-4 text-sm">
                  <div className="flex justify-between gap-3">
                    <span className="text-gray-400">
                      Subtotal
                    </span>
                    <span className="font-medium text-white">
                      ₹{selectedBill.total_amount}
                    </span>
                  </div>

                  <div className="flex justify-between gap-3">
                    <span className="text-gray-400">
                      Discount
                    </span>
                    <span className="font-medium text-white">
                      ₹{selectedBill.discount}
                    </span>
                  </div>

                  <div className="flex justify-between gap-3 border-t border-[#26344c] pt-3 font-semibold">
                    <span className="text-white">
                      Final
                    </span>
                    <span className="break-all text-base text-red-300">
                      ₹{selectedBill.final_amount}
                    </span>
                  </div>
                </div>

                {/* PAYMENT ACTION */}

                {selectedBill.payment_status === "Pending" ? (
                  <button
                    type="button"
                    onClick={() => handleMarkPaid(selectedBill)}
                    disabled={
                      markingPaid === selectedBill.bill_id
                    }
                    className="mt-5 w-full rounded-xl bg-red-500 py-3 text-sm font-medium text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {markingPaid === selectedBill.bill_id
                      ? "Updating..."
                      : "Mark as Paid"}
                  </button>
                ) : (
                  <div className="mt-5 rounded-xl border border-green-400/30 bg-green-400/10 py-3 text-center text-sm text-green-300">
                    ✓ Already Paid
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </PharmacistLayout>
  );
};

export default BillsPage;