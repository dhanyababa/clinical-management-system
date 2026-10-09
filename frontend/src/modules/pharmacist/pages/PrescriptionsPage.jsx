import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PharmacistLayout from "../components/PharmacistLayout";

import {
  getIncomingPrescriptions,
  getPrescriptionDetail,
  getBatches,
  createDispense,
  createMedicineBill,
} from "../api/pharmacistApi";

// ============================================================
// SHARED STYLES
// ============================================================

const cardClass =
  "min-w-0 rounded-xl border border-[#1e2d4a] bg-[#0d1629]";

const inputClass =
  "w-full min-w-0 rounded-lg border border-[#26344c] bg-[#060d1a] px-3 py-2.5 text-sm text-white outline-none transition focus:border-red-400";

// ============================================================
// PRESCRIPTIONS LIST
// ============================================================

export const PrescriptionsPage = () => {
  const navigate = useNavigate();

  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getIncomingPrescriptions()
      .then((res) =>
        setPrescriptions(res.data?.data || res.data || [])
      )
      .catch(() =>
        setError("Failed to load prescriptions.")
      )
      .finally(() => setLoading(false));
  }, []);

  return (
    <PharmacistLayout title="Incoming Prescriptions">
      <div className="w-full min-w-0">
        <div className="mb-5">
          <p className="text-sm sm:text-base text-gray-400">
            {prescriptions.length} prescription(s) waiting for
            dispense
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-3 text-sm text-red-300 break-words sm:px-4">
            {error}
          </div>
        )}

        <div className={`${cardClass} overflow-hidden`}>
          <div className="w-full max-w-full overflow-x-auto">
            <table className="w-full min-w-[850px] text-sm">
              <thead>
                <tr className="border-b border-[#1e2d4a] bg-[#101c30] text-xs uppercase tracking-wider text-gray-400">
                  <th className="px-5 py-4 text-left">
                    Rx Code
                  </th>
                  <th className="px-5 py-4 text-left">
                    Patient
                  </th>
                  <th className="px-5 py-4 text-left">
                    Doctor
                  </th>
                  <th className="px-5 py-4 text-left">
                    Medicines
                  </th>
                  <th className="px-5 py-4 text-left">
                    Status
                  </th>
                  <th className="px-5 py-4 text-left">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  [...Array(4)].map((_, i) => (
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
                ) : prescriptions.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-14 text-center text-sm text-gray-400"
                    >
                      No pending prescriptions to dispense.
                    </td>
                  </tr>
                ) : (
                  prescriptions.map((rx) => (
                    <tr
                      key={rx.prescription_code}
                      className="border-b border-[#1e2d4a] transition-colors hover:bg-[#111d35]"
                    >
                      <td className="px-5 py-4">
                        <span className="inline-block whitespace-nowrap rounded-md border border-red-400/20 bg-red-400/10 px-2.5 py-1 font-mono text-xs text-red-300">
                          {rx.prescription_code}
                        </span>
                      </td>

                      <td className="px-5 py-4 font-medium text-white">
                        {rx.patient_name || "—"}
                      </td>

                      <td className="px-5 py-4 text-gray-300">
                        Dr. {rx.doctor_name || "—"}
                      </td>

                      <td className="max-w-[280px] px-5 py-4 text-gray-300">
                        <span className="block truncate">
                          {rx.items
                            ?.map((i) => i.medicine_name)
                            .join(", ") || "—"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span className="inline-block whitespace-nowrap rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-1 text-xs text-amber-300">
                          {rx.status || "Sent"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/pharmacist/prescriptions/${rx.prescription_code}`
                            )
                          }
                          className="whitespace-nowrap rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-400"
                        >
                          Dispense →
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PharmacistLayout>
  );
};

// ============================================================
// DISPENSING HELPERS
// ============================================================

const MAX_DISCOUNT_PERCENT = 50;
const MAX_DISPENSE_DAYS = 30;

const getPrescribedQty = (item) => {
  const freqMatch = item.frequency?.match(/\d+/);
  const freq = freqMatch
    ? parseInt(freqMatch[0], 10)
    : 1;

  const duration = parseInt(item.duration, 10) || 1;
  const allowedDuration = Math.min(
    duration,
    MAX_DISPENSE_DAYS
  );

  return freq * allowedDuration;
};

const getAllowedDuration = (item) => {
  const duration = parseInt(item.duration, 10) || 1;
  return Math.min(duration, MAX_DISPENSE_DAYS);
};

const isDurationLimited = (item) => {
  const duration = parseInt(item.duration, 10) || 1;
  return duration > MAX_DISPENSE_DAYS;
};

// ============================================================
// DISPENSE PAGE
// ============================================================

export const DispensePage = () => {
  const { prescriptionCode } = useParams();
  const navigate = useNavigate();

  const [rx, setRx] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [discountError, setDiscountError] = useState("");
  const [success, setSuccess] = useState("");

  const [discount, setDiscount] = useState(0);
  const [discountInput, setDiscountInput] = useState("0");

  const [availableBatches, setAvailableBatches] =
    useState({});

  const [dispenseQty, setDispenseQty] = useState({});

  // ----------------------------------------------------------
  // LOAD PRESCRIPTION AND VALID BATCHES
  // ----------------------------------------------------------

  useEffect(() => {
    getPrescriptionDetail(prescriptionCode)
      .then(async (res) => {
        const data = res.data?.data ?? res.data;
        setRx(data);

        if (data.items) {
          const batchMap = {};
          const qtyMap = {};

          const today = new Date();
          today.setHours(0, 0, 0, 0);

          await Promise.all(
            data.items.map(async (item) => {
              const medId = item.medicine_id;

              try {
                const bRes = await getBatches(medId);

                const allBatches =
                  bRes.results ||
                  bRes.data ||
                  bRes ||
                  [];

                const valid = allBatches.filter((b) => {
                  const expiry = new Date(b.expiry_date);
                  expiry.setHours(0, 0, 0, 0);

                  return (
                    b.quantity > 0 &&
                    expiry >= today
                  );
                });

                batchMap[medId] = valid;
                qtyMap[medId] = {};

                valid.forEach((b) => {
                  qtyMap[medId][b.batch_id] = 0;
                });
              } catch {
                batchMap[medId] = [];
                qtyMap[medId] = {};
              }
            })
          );

          setAvailableBatches(batchMap);
          setDispenseQty(qtyMap);
        }
      })
      .catch(() =>
        setError(
          "Prescription not found or already dispensed."
        )
      )
      .finally(() => setLoading(false));
  }, [prescriptionCode]);

  // ----------------------------------------------------------
  // QUANTITY MANAGEMENT
  // ----------------------------------------------------------

  const handleQtyChange = (
    medId,
    batchId,
    rawValue
  ) => {
    const batch = (
      availableBatches[medId] || []
    ).find((b) => b.batch_id === batchId);

    if (!batch) return;

    const parsed = parseInt(rawValue, 10);

    const value = isNaN(parsed)
      ? 0
      : Math.max(
          0,
          Math.min(parsed, batch.quantity)
        );

    setDispenseQty((prev) => ({
      ...prev,
      [medId]: {
        ...prev[medId],
        [batchId]: value,
      },
    }));
  };

  const getAllocatedQty = (medId) => {
    return Object.values(
      dispenseQty[medId] || {}
    ).reduce((s, v) => s + (v || 0), 0);
  };

  const getTotalAvailableQty = (medId) => {
    return (
      availableBatches[medId] || []
    ).reduce(
      (sum, batch) =>
        sum + (batch.quantity || 0),
      0
    );
  };

  const getMedicineLineTotal = (medId) => {
    const batches =
      availableBatches[medId] || [];

    const qMap = dispenseQty[medId] || {};

    return batches.reduce(
      (s, b) =>
        s +
        (qMap[b.batch_id] || 0) *
          parseFloat(b.medicine_price || 0),
      0
    );
  };

  const calcSubtotal = () => {
    if (!rx?.items) return 0;

    return rx.items.reduce(
      (sum, item) =>
        sum +
        getMedicineLineTotal(item.medicine_id),
      0
    );
  };

  // ----------------------------------------------------------
  // DISCOUNT VALIDATION
  // ----------------------------------------------------------

  const maxAllowedDiscount = (subtotal) =>
    parseFloat(
      (
        (subtotal * MAX_DISCOUNT_PERCENT) /
        100
      ).toFixed(2)
    );

  const handleDiscountChange = (rawValue) => {
    setDiscountInput(rawValue);

    const parsed = parseFloat(rawValue);
    const subtotal = calcSubtotal();

    if (
      rawValue === "" ||
      isNaN(parsed) ||
      parsed < 0
    ) {
      setDiscount(0);
      setDiscountError("");
      return;
    }

    const maxDisc =
      maxAllowedDiscount(subtotal);

    if (parsed > maxDisc) {
      setDiscountError(
        `Discount cannot exceed ${MAX_DISCOUNT_PERCENT}% of the subtotal. Maximum allowed: ₹${maxDisc.toFixed(
          2
        )}`
      );
      setDiscount(parsed);
    } else {
      setDiscountError("");
      setDiscount(parsed);
    }
  };

  const isDiscountValid = () => {
    const subtotal = calcSubtotal();

    if (discount < 0) return false;

    if (
      discount >
      maxAllowedDiscount(subtotal)
    ) {
      return false;
    }

    return true;
  };

  // ----------------------------------------------------------
  // QUANTITY VALIDATION
  // ----------------------------------------------------------

  const getQtyIssues = () => {
    if (!rx?.items) return [];

    const issues = [];

    for (const item of rx.items) {
      const medId = item.medicine_id;
      const batches =
        availableBatches[medId] || [];

      if (batches.length === 0) continue;

      const required =
        getPrescribedQty(item);

      const allocated =
        getAllocatedQty(medId);

      const totalAvailable =
        getTotalAvailableQty(medId);

      if (allocated === 0) {
        issues.push(
          `${item.medicine_name}: no quantity entered`
        );
        continue;
      }

      if (allocated > required) {
        issues.push(
          `${item.medicine_name}: over-allocated by ${
            allocated - required
          } (max ${required})`
        );
        continue;
      }

      if (
        totalAvailable >= required &&
        allocated < required
      ) {
        issues.push(
          `${item.medicine_name}: ${allocated}/${required} — need ${
            required - allocated
          } more`
        );
        continue;
      }

      if (
        totalAvailable < required &&
        allocated < totalAvailable
      ) {
        issues.push(
          `${item.medicine_name}: only ${totalAvailable} available, allocate all available stock`
        );
        continue;
      }
    }

    return issues;
  };

  // ----------------------------------------------------------
  // DISPENSE AND CREATE BILL
  // ----------------------------------------------------------

  const handleDispense = async () => {
    if (!rx) return;

    const qtyIssues = getQtyIssues();

    if (qtyIssues.length > 0) {
      setError(qtyIssues.join(" · "));
      return;
    }

    if (!isDiscountValid()) {
      const subtotal = calcSubtotal();
      const maxDisc =
        maxAllowedDiscount(subtotal);

      setDiscountError(
        `Discount cannot exceed ${MAX_DISCOUNT_PERCENT}% of the subtotal. Maximum allowed: ₹${maxDisc.toFixed(
          2
        )}`
      );

      setError(
        "Please fix the discount amount before dispensing."
      );

      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    const items = [];

    for (const item of rx.items) {
      const medId = item.medicine_id;
      const batches =
        availableBatches[medId] || [];
      const qMap =
        dispenseQty[medId] || {};

      batches.forEach((b) => {
        const qty =
          qMap[b.batch_id] || 0;

        if (qty > 0) {
          items.push({
            batch: b.batch_id,
            quantity: qty,
          });
        }
      });
    }

    if (items.length === 0) {
      setError(
        "No medicines selected for dispensing."
      );
      setSubmitting(false);
      return;
    }

    try {
      const dispenseRes =
        await createDispense({
          prescription:
            rx.prescription_id || rx.id,
          items,
        });

      const dispenseData =
        dispenseRes.data?.data ??
        dispenseRes.data ??
        dispenseRes;

      const dispenseId =
        dispenseData.dispense_id;

      const totalAmount = parseFloat(
        dispenseData.total_amount
      );

      const finalDiscount = Math.min(
        discount,
        maxAllowedDiscount(totalAmount)
      );

      try {
        await createMedicineBill({
          dispense: dispenseId,
          total_amount: totalAmount,
          discount: finalDiscount,
          payment_status: "Pending",
        });

        setSuccess(
          "✓ Dispensed successfully! Bill created."
        );

        setTimeout(
          () =>
            navigate(
              "/pharmacist/prescriptions"
            ),
          2000
        );
      } catch (billErr) {
        console.log(
          "Bill create error:",
          billErr?.response?.data
        );

        const d =
          billErr?.response?.data;

        const billMsg =
          d?.non_field_errors?.[0] ||
          d?.detail ||
          (typeof d === "object"
            ? JSON.stringify(d)
            : null) ||
          "Bill creation failed.";

        setError(
          `Medicines were dispensed (ID: ${dispenseId}) but bill creation failed: ${billMsg}. ` +
            `Please go to Bills page and create the bill manually for Dispense #${dispenseId}.`
        );

        setSubmitting(false);
      }
    } catch (err) {
      console.log(
        "Dispense create error full:",
        err?.response?.data
      );

      console.log(
        "Dispense non_field_errors:",
        err?.response?.data?.non_field_errors
      );

      console.log(
        "Dispense first error:",
        err?.response?.data
          ?.non_field_errors?.[0]
      );

      const d = err?.response?.data;

      const rawMsg =
        d?.non_field_errors?.[0] ||
        (Array.isArray(d?.items)
          ? d.items
              .map((e) =>
                typeof e === "string"
                  ? e
                  : JSON.stringify(e)
              )
              .join(", ")
          : null) ||
        d?.detail ||
        (typeof d === "object"
          ? JSON.stringify(d)
          : null) ||
        "Failed to dispense.";

      let msg = rawMsg;

      if (
        rawMsg
          ?.toLowerCase()
          .includes("consultation bill") &&
        rawMsg
          ?.toLowerCase()
          .includes("not yet paid")
      ) {
        msg =
          "Consultation bill not paid. Please ask reception to clear the bill before dispensing medicines.";
      }

      setError(msg);
      setSubmitting(false);
    }
  };

  // ----------------------------------------------------------
  // LOADING
  // ----------------------------------------------------------

  if (loading) {
    return (
      <PharmacistLayout title="Dispense Medicines">
        <div className="flex items-center justify-center py-20 sm:py-24">
          <p className="animate-pulse text-sm sm:text-lg text-gray-400">
            Loading prescription...
          </p>
        </div>
      </PharmacistLayout>
    );
  }

  // ----------------------------------------------------------
  // PRESCRIPTION NOT FOUND
  // ----------------------------------------------------------

  if (!rx) {
    return (
      <PharmacistLayout title="Dispense Medicines">
        <div className="px-4 py-16 text-center sm:py-24">
          <p className="mb-4 text-lg text-red-400">
            Prescription not found
          </p>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/pharmacist/prescriptions"
              )
            }
            className="text-sm sm:text-base text-gray-400 transition hover:text-white"
          >
            ← Back
          </button>
        </div>
      </PharmacistLayout>
    );
  }

  // ----------------------------------------------------------
  // DERIVED VALUES
  // ----------------------------------------------------------

  const qtyIssues = getQtyIssues();
  const subtotal = calcSubtotal();
  const maxDisc =
    maxAllowedDiscount(subtotal);

  const discountOk = isDiscountValid();

  const canSubmit =
    qtyIssues.length === 0 &&
    discountOk;

  const finalTotal = Math.max(
    subtotal -
      (discountOk ? discount : 0),
    0
  );

  // ----------------------------------------------------------
  // MAIN UI
  // ----------------------------------------------------------

  return (
    <PharmacistLayout title="Dispense Medicines">
      <div className="w-full min-w-0">

        {/* Back navigation */}
        <button
          type="button"
          onClick={() =>
            navigate(
              "/pharmacist/prescriptions"
            )
          }
          className="mb-5 flex items-center gap-1 text-sm text-gray-400 transition hover:text-red-300 sm:text-base"
        >
          ← Back to Prescriptions
        </button>

        {/* Error */}
        {error && (
          <div className="mb-4 rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-3 text-sm text-red-300 break-words sm:px-4">
            {error}
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="mb-4 rounded-xl border border-green-400/30 bg-green-400/10 px-3 py-3 text-sm text-green-300 break-words sm:px-4">
            {success}
          </div>
        )}

        <div className="grid min-w-0 grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-3">

          {/* ================================================= */}
          {/* LEFT PANEL */}
          {/* ================================================= */}

          <div className="min-w-0 space-y-4 sm:space-y-5 xl:col-span-2">

            {/* Prescription details */}
            <div className={`${cardClass} p-3 sm:p-5 lg:p-6`}>
              <div className="mb-4 flex flex-col items-start justify-between gap-3 min-[400px]:flex-row min-[400px]:items-center">
                <h3 className="text-lg font-semibold text-white sm:text-xl">
                  Prescription Details
                </h3>

                <span className="inline-block max-w-full break-all rounded-md border border-red-400/20 bg-red-400/10 px-2.5 py-1 font-mono text-xs text-red-300 sm:text-sm">
                  {rx.prescription_code}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2 sm:text-base">
                <div className="min-w-0">
                  <p className="mb-1 text-xs text-gray-500 sm:text-sm">
                    Patient
                  </p>
                  <p className="break-words text-gray-100">
                    {rx.patient_name || "—"}
                  </p>
                </div>

                <div className="min-w-0">
                  <p className="mb-1 text-xs text-gray-500 sm:text-sm">
                    Doctor
                  </p>
                  <p className="break-words text-gray-100">
                    Dr. {rx.doctor_name || "—"}
                  </p>
                </div>

                {rx.diagnosis && (
                  <div className="min-w-0 sm:col-span-2">
                    <p className="mb-1 text-xs text-gray-500 sm:text-sm">
                      Diagnosis
                    </p>
                    <p className="break-words text-gray-100">
                      {rx.diagnosis}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* ================================================= */}
            {/* PRESCRIBED MEDICINES */}
            {/* ================================================= */}

            {rx.items?.map((item) => {
              const medId = item.medicine_id;
              const batches =
                availableBatches[medId] || [];
              const qMap =
                dispenseQty[medId] || {};

              const required =
                getPrescribedQty(item);

              const allocated =
                getAllocatedQty(medId);

              const totalAvailable =
                getTotalAvailableQty(medId);

              const remaining =
                required - allocated;

              const pct = Math.min(
                (allocated / required) * 100,
                100
              );

              const stockInsufficient =
                totalAvailable < required;

              const fullyAllocatedForCurrentStock =
                stockInsufficient
                  ? allocated === totalAvailable
                  : allocated === required;

              const statusText =
                allocated === 0
                  ? "Nothing entered yet"
                  : allocated > required
                  ? `⚠ Over-allocated by ${
                      allocated - required
                    }`
                  : stockInsufficient
                  ? allocated === totalAvailable
                    ? `✓ Partial dispense: ${allocated}/${required} (all available stock allocated)`
                    : `${allocated} allocated · ${
                        totalAvailable - allocated
                      } more available`
                  : allocated === required
                  ? "✓ Fully allocated"
                  : `${allocated} allocated · ${remaining} more needed`;

              const statusColor =
                allocated === 0
                  ? "text-gray-400"
                  : allocated > required
                  ? "text-red-400"
                  : fullyAllocatedForCurrentStock
                  ? "text-green-400"
                  : "text-amber-400";

              const barColor =
                allocated > required
                  ? "bg-red-500"
                  : fullyAllocatedForCurrentStock
                  ? "bg-green-500"
                  : "bg-amber-500";

              return (
                <div
                  key={medId}
                  className={`${cardClass} overflow-hidden`}
                >

                  {/* Medicine header */}
                  <div className="flex flex-col items-start justify-between gap-4 border-b border-[#1e2d4a] px-3 py-4 min-[400px]:flex-row sm:px-5">
                    <div className="min-w-0 flex-1">
                      <p className="break-words text-base font-semibold text-white sm:text-lg">
                        {item.medicine_name}
                      </p>

                      <p className="mt-1 break-words text-xs text-gray-400 sm:text-sm">
                        {item.dosage} ·{" "}
                        {item.frequency} ·{" "}
                        {item.duration} day prescription
                      </p>

                      {isDurationLimited(item) && (
                        <p className="mt-2 text-xs text-amber-400 sm:text-sm">
                          Only 30 days can be dispensed now.
                          Quantity is limited to{" "}
                          {getAllowedDuration(item)} days.
                        </p>
                      )}

                      {item.instructions && (
                        <p className="mt-2 break-words text-xs text-gray-400 sm:text-sm">
                          ℹ {item.instructions}
                        </p>
                      )}
                    </div>

                    <div className="shrink-0 text-left min-[400px]:text-right">
                      <p className="text-xs text-gray-400 sm:text-sm">
                        {isDurationLimited(item)
                          ? "Allowed Now"
                          : "Prescribed"}
                      </p>

                      <p className="mt-1 text-2xl font-bold leading-none text-red-400 sm:text-3xl">
                        {required}
                      </p>

                      <p className="mt-1 text-xs text-gray-400 sm:text-sm">
                        {isDurationLimited(item)
                          ? "max 30 days"
                          : "units"}
                      </p>
                    </div>
                  </div>

                  {/* Allocation progress */}
                  <div className="border-b border-[#1e2d4a] px-3 py-4 sm:px-5">
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm">
                      <span className={`${statusColor} break-words`}>
                        {statusText}
                      </span>

                      <span className="shrink-0 font-mono text-gray-400">
                        {allocated} / {required}
                      </span>
                    </div>

                    <div className="h-2.5 overflow-hidden rounded-full bg-[#1e2d4a]">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${barColor}`}
                        style={{
                          width: `${pct}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Batch selection */}
                  {batches.length === 0 ? (
                    <div className="px-3 py-5 sm:px-5">
                      <div className="rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-3 text-xs text-red-300 sm:px-4 sm:text-sm">
                        ⚠ No available stock for this
                        medicine — all batches are expired
                        or out of stock.
                      </div>
                    </div>
                  ) : (
                    <div className="w-full max-w-full overflow-x-auto">

                      {/* Batch headings */}
                      <div className="grid min-w-[620px] grid-cols-12 gap-2 border-b border-[#1e2d4a] bg-[#101c30] px-4 py-3 text-xs uppercase tracking-wider text-gray-400 sm:px-5">
                        <div className="col-span-3">
                          Batch #
                        </div>
                        <div className="col-span-3">
                          Expiry
                        </div>
                        <div className="col-span-2 text-center">
                          In Stock
                        </div>
                        <div className="col-span-2 text-right">
                          Price/unit
                        </div>
                        <div className="col-span-2 text-right">
                          Qty ↓
                        </div>
                      </div>

                      {/* Batch rows */}
                      {batches.map((batch) => {
                        const qty =
                          qMap[batch.batch_id] || 0;

                        const lineTotal =
                          qty *
                          parseFloat(
                            batch.medicine_price || 0
                          );

                        const isActive = qty > 0;

                        return (
                          <div
                            key={batch.batch_id}
                            className={`grid min-w-[620px] grid-cols-12 items-center gap-2 border-b border-[#1e2d4a] px-4 py-4 transition-colors last:border-0 sm:px-5 ${
                              isActive
                                ? "bg-red-400/5"
                                : "hover:bg-[#111d35]"
                            }`}
                          >
                            <div className="col-span-3 min-w-0">
                              <span
                                className={`inline-block max-w-full break-all rounded-md border px-2.5 py-1 font-mono text-xs ${
                                  isActive
                                    ? "border-red-400/30 bg-red-400/10 text-red-300"
                                    : "border-[#26344c] bg-[#101c30] text-gray-300"
                                }`}
                              >
                                {batch.batch_number}
                              </span>
                            </div>

                            <div className="col-span-3 text-xs text-gray-400 sm:text-sm">
                              {batch.expiry_date}
                            </div>

                            <div className="col-span-2 text-center">
                              <span
                                className={`text-sm font-semibold ${
                                  batch.quantity <= 10
                                    ? "text-amber-400"
                                    : "text-white"
                                }`}
                              >
                                {batch.quantity}
                              </span>

                              {batch.quantity <= 10 && (
                                <span className="ml-1 text-xs text-amber-400">
                                  ⚠
                                </span>
                              )}
                            </div>

                            <div className="col-span-2 text-right text-xs text-gray-300 sm:text-sm">
                              ₹
                              {parseFloat(
                                batch.medicine_price || 0
                              ).toFixed(2)}
                            </div>

                            <div className="col-span-2 flex flex-col items-end gap-1">
                              <input
                                type="number"
                                min={0}
                                max={batch.quantity}
                                value={
                                  qty === 0 ? "" : qty
                                }
                                placeholder="0"
                                onChange={(e) =>
                                  handleQtyChange(
                                    medId,
                                    batch.batch_id,
                                    e.target.value
                                  )
                                }
                                className={`w-20 max-w-full rounded-lg border px-2 py-2 text-center text-sm outline-none transition-colors ${
                                  isActive
                                    ? "border-red-400/40 bg-[#16253a] text-white"
                                    : "border-[#26344c] bg-[#060d1a] text-white focus:border-red-400"
                                }`}
                              />

                              {isActive && (
                                <span className="text-xs font-medium text-green-400">
                                  ₹{lineTotal.toFixed(2)}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}

                      {/* Batch subtotal */}
                      {allocated > 0 && (
                        <div className="flex min-w-[620px] items-center justify-between gap-3 border-t border-[#1e2d4a] bg-[#101c30] px-4 py-3 text-xs sm:px-5 sm:text-sm">
                          <span className="text-gray-400">
                            Using{" "}
                            {
                              batches.filter(
                                (b) =>
                                  (qMap[b.batch_id] || 0) >
                                  0
                              ).length
                            }{" "}
                            of {batches.length} batch(es)
                          </span>

                          <span className="shrink-0 font-semibold text-white">
                            ₹
                            {getMedicineLineTotal(
                              medId
                            ).toFixed(2)}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Quantity validation issues */}
            {qtyIssues.length > 0 && (
              <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 p-3 sm:p-5">
                <p className="mb-2 text-sm font-semibold text-amber-300">
                  ⚠ Fix before dispensing:
                </p>

                <ul className="space-y-1">
                  {qtyIssues.map((issue, i) => (
                    <li
                      key={i}
                      className="flex gap-2 text-xs text-amber-200 sm:text-sm"
                    >
                      <span>•</span>
                      <span className="min-w-0 break-words">
                        {issue}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* ================================================= */}
          {/* RIGHT PANEL — BILL SUMMARY */}
          {/* ================================================= */}

          <div className="min-w-0">
            <div
              className={`${cardClass} space-y-5 p-4 sm:p-5 xl:sticky xl:top-24`}
            >
              <h3 className="text-lg font-semibold text-white">
                Bill Summary
              </h3>

              {/* Bill items */}
              <div className="space-y-3">
                {rx.items?.map((item) => {
                  const medId =
                    item.medicine_id;

                  const required =
                    getPrescribedQty(item);

                  const allocated =
                    getAllocatedQty(medId);

                  const lineTotal =
                    getMedicineLineTotal(medId);

                  return (
                    <div
                      key={medId}
                      className="flex min-w-0 items-center justify-between gap-3 text-sm"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="break-words text-gray-200">
                          {item.medicine_name}
                        </p>

                        {isDurationLimited(item) && (
                          <p className="mt-0.5 text-xs text-amber-400">
                            Limited to 30 days
                          </p>
                        )}

                        <p
                          className={`mt-1 text-xs ${
                            (() => {
                              const totalAvailable =
                                getTotalAvailableQty(
                                  medId
                                );

                              const stockInsufficient =
                                totalAvailable <
                                required;

                              const ok =
                                stockInsufficient
                                  ? allocated ===
                                    totalAvailable
                                  : allocated ===
                                    required;

                              return allocated === 0
                                ? "text-gray-400"
                                : allocated > required
                                ? "text-red-400"
                                : ok
                                ? "text-green-400"
                                : "text-amber-400";
                            })()
                          }`}
                        >
                          {allocated}/{required} units
                        </p>
                      </div>

                      <span className="shrink-0 font-medium text-white">
                        {lineTotal > 0
                          ? `₹${lineTotal.toFixed(2)}`
                          : "—"}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Totals */}
              <div className="space-y-4 border-t border-[#1e2d4a] pt-4 text-sm sm:text-base">

                {/* Subtotal */}
                <div className="flex items-center justify-between gap-3">
                  <span className="text-gray-400">
                    Subtotal
                  </span>

                  <span className="font-medium text-white">
                    ₹{subtotal.toFixed(2)}
                  </span>
                </div>

                {/* Discount */}
                <div className="space-y-2">
                  <div className="flex flex-col gap-3 min-[400px]:flex-row min-[400px]:items-center min-[400px]:justify-between">
                    <div className="min-w-0">
                      <span className="text-sm text-gray-300">
                        Discount (₹)
                      </span>

                      <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                        Max {MAX_DISCOUNT_PERCENT}%
                        — up to ₹{maxDisc.toFixed(2)}
                      </p>
                    </div>

                    <input
                      type="number"
                      min={0}
                      max={maxDisc}
                      value={discountInput}
                      onChange={(e) =>
                        handleDiscountChange(
                          e.target.value
                        )
                      }
                      className={`w-full min-[400px]:w-28 shrink-0 rounded-lg border px-3 py-2 text-right text-sm outline-none transition-colors ${
                        discountError
                          ? "border-red-400/40 bg-red-500/10 text-red-300"
                          : "border-[#26344c] bg-[#060d1a] text-white focus:border-red-400"
                      }`}
                    />
                  </div>

                  {discountError && (
                    <div className="rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-3">
                      <p className="break-words text-xs text-red-300 sm:text-sm">
                        {discountError}
                      </p>

                      <p className="mt-1 text-xs font-medium text-red-400 sm:text-sm">
                        Please enter ₹
                        {maxDisc.toFixed(2)} or less.
                      </p>
                    </div>
                  )}

                  {!discountError &&
                    discount > 0 &&
                    subtotal > 0 && (
                      <p className="text-right text-xs text-green-400 sm:text-sm">
                        {(
                          (discount / subtotal) *
                          100
                        ).toFixed(1)}
                        % discount applied
                      </p>
                    )}
                </div>

                {/* Final total */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#1e2d4a] pt-4">
                  <span className="font-semibold text-white">
                    Total
                  </span>

                  <span
                    className={`text-xl font-bold sm:text-2xl ${
                      discountError
                        ? "text-gray-400"
                        : "text-red-400"
                    }`}
                  >
                    ₹
                    {discountError
                      ? subtotal.toFixed(2)
                      : finalTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Confirm button */}
              <button
                type="button"
                onClick={handleDispense}
                disabled={
                  submitting || !canSubmit
                }
                className="w-full rounded-xl bg-red-500 px-3 py-3.5 text-sm font-semibold text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:bg-[#26344c] disabled:text-gray-500 sm:text-base"
              >
                {submitting
                  ? "Processing..."
                  : "Confirm Dispense & Create Bill"}
              </button>

              {!canSubmit && (
                <p className="text-center text-xs text-amber-400 sm:text-sm">
                  {discountError
                    ? "⚠ Fix discount to proceed"
                    : "⚠ Resolve issues to proceed"}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </PharmacistLayout>
  );
};

// 841