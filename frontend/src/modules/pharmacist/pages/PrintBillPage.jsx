import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PharmacistLayout from "../components/PharmacistLayout";
import { getMedicineBillDetail } from "../api/pharmacistApi";

const PrintBillPage = () => {
  const { billId } = useParams();
  const navigate = useNavigate();

  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadBill = async () => {
      try {
        const res = await getMedicineBillDetail(billId);
        setBill(res.data || res);
      } catch {
        setError("Failed to load bill.");
      } finally {
        setLoading(false);
      }
    };

    loadBill();
  }, [billId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <PharmacistLayout title="Print Bill">
        <div className="py-16 text-center text-sm text-gray-400 sm:text-lg">
          Loading bill...
        </div>
      </PharmacistLayout>
    );
  }

  if (error || !bill) {
    return (
      <PharmacistLayout title="Print Bill">
        <div className="px-4 py-16 text-center text-sm text-red-400 sm:text-lg">
          {error || "Bill not found."}
        </div>
      </PharmacistLayout>
    );
  }

  return (
    <div className="min-h-screen bg-[#060d1a] px-3 py-5 sm:px-6 sm:py-8 print:min-h-0 print:bg-white print:p-0">

      {/* PRINT-SPECIFIC STYLES */}
      <style>
        {`
          @media print {
            @page {
              size: A4 landscape;
              margin: 10mm;
            }

            html,
            body,
            #root {
              background: white !important;
              margin: 0 !important;
              padding: 0 !important;
              width: 100% !important;
              min-width: 0 !important;
              overflow: visible !important;
            }

            body * {
              visibility: hidden !important;
            }

            #pharmacy-print-bill,
            #pharmacy-print-bill * {
              visibility: visible !important;
            }

            #pharmacy-print-bill {
              position: absolute !important;
              left: 0 !important;
              top: 0 !important;
              width: 100% !important;
              max-width: none !important;
              margin: 0 !important;
              padding: 0 !important;
              border: none !important;
              border-radius: 0 !important;
              box-shadow: none !important;
              background: white !important;
              color: black !important;
            }

            #pharmacy-print-bill .bill-scroll {
              overflow: visible !important;
              width: 100% !important;
            }

            #pharmacy-print-bill .bill-table {
              width: 100% !important;
              min-width: 0 !important;
              table-layout: fixed !important;
              font-size: 9px !important;
              border-collapse: collapse !important;
            }

            #pharmacy-print-bill .bill-table th,
            #pharmacy-print-bill .bill-table td {
              padding: 6px 5px !important;
              overflow-wrap: anywhere !important;
              word-break: normal !important;
            }

            #pharmacy-print-bill .bill-table th:nth-child(1) {
              width: 17%;
            }

            #pharmacy-print-bill .bill-table th:nth-child(2) {
              width: 10%;
            }

            #pharmacy-print-bill .bill-table th:nth-child(3) {
              width: 21%;
            }

            #pharmacy-print-bill .bill-table th:nth-child(4),
            #pharmacy-print-bill .bill-table th:nth-child(5),
            #pharmacy-print-bill .bill-table th:nth-child(6) {
              width: 8%;
            }

            #pharmacy-print-bill .bill-table th:nth-child(7),
            #pharmacy-print-bill .bill-table th:nth-child(8) {
              width: 10%;
            }

            #pharmacy-print-bill .bill-table thead {
              display: table-header-group;
            }

            #pharmacy-print-bill .bill-table tr {
              break-inside: avoid;
              page-break-inside: avoid;
            }

            #pharmacy-print-bill .bill-table td,
            #pharmacy-print-bill .bill-table th {
              border-color: #d1d5db !important;
            }

            #pharmacy-print-bill .bill-content {
              padding: 0 !important;
            }

            #pharmacy-print-bill .bill-summary {
              break-inside: avoid;
              page-break-inside: avoid;
            }

            #pharmacy-print-bill .bill-footer {
              break-inside: avoid;
              page-break-inside: avoid;
            }

            .print-actions {
              display: none !important;
            }
          }
        `}
      </style>

      {/* ===================================== */}
      {/* SCREEN ACTIONS */}
      {/* ===================================== */}

      <div className="print-actions mx-auto mb-6 flex w-full max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={() => navigate("/pharmacist/bills")}
          className="flex w-full items-center justify-center rounded-xl border border-[#26344c] bg-[#0d1629] px-4 py-3 text-sm text-gray-300 transition hover:bg-[#111d35] hover:text-white sm:w-auto sm:text-base"
        >
          ← Back to Bills
        </button>

        <button
          type="button"
          onClick={handlePrint}
          className="w-full rounded-xl bg-red-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-400 sm:w-auto sm:text-base"
        >
          Print / Save PDF
        </button>
      </div>

      {/* ===================================== */}
      {/* PRINTABLE BILL */}
      {/* ===================================== */}

      <div
        id="pharmacy-print-bill"
        className="mx-auto w-full max-w-5xl overflow-hidden rounded-xl border border-[#d1d5db] bg-white text-gray-900 shadow-xl print:overflow-visible print:rounded-none print:border-0 print:shadow-none"
      >
        <div className="bill-content p-4 sm:p-6 lg:p-8">

          {/* BILL HEADER */}

          <div className="mb-6 border-b border-gray-300 pb-5 text-center">
            <h1 className="mb-2 text-xl font-bold text-gray-900 sm:text-2xl">
              Clinic Pharmacy Bill
            </h1>

            {bill.payment_status === "Pending" && (
              <p className="mb-4 text-sm font-semibold text-red-600 sm:text-base">
                ⚠ UNPAID BILL
              </p>
            )}

            <p className="text-sm text-gray-600 sm:text-base">
              Patient Copy
            </p>
          </div>

          {/* ===================================== */}
          {/* BILL AND PATIENT DETAILS */}
          {/* ===================================== */}

          <div className="mb-6 grid grid-cols-1 gap-5 text-sm sm:grid-cols-2 sm:gap-6 sm:text-base print:grid-cols-2">
            <div className="min-w-0 space-y-2">
              <p className="break-words">
                <span className="font-semibold">
                  Bill No:
                </span>{" "}
                #{bill.bill_id}
              </p>

              <p className="break-words">
                <span className="font-semibold">
                  Prescription Code:
                </span>{" "}
                {bill.prescription_code || "—"}
              </p>

              <p className="break-words">
                <span className="font-semibold">
                  Bill Date:
                </span>{" "}
                {bill.created_at
                  ? new Date(bill.created_at).toLocaleDateString("en-IN")
                  : "—"}
              </p>

              <p className="break-words">
                <span className="font-semibold">
                  Dispense Date:
                </span>{" "}
                {bill.dispense_date
                  ? new Date(bill.dispense_date).toLocaleDateString("en-IN")
                  : "—"}
              </p>
            </div>

            <div className="min-w-0 space-y-2">
              <p className="break-words">
                <span className="font-semibold">
                  Patient:
                </span>{" "}
                {bill.patient_details?.full_name || "—"}
              </p>

              <p className="break-words">
                <span className="font-semibold">
                  Doctor:
                </span>{" "}
                {bill.doctor_name || "—"}
              </p>

              <p className="break-words">
                <span className="font-semibold">
                  Payment Status:
                </span>{" "}
                <span
                  className={
                    bill.payment_status === "Paid"
                      ? "font-semibold text-green-700"
                      : "font-semibold text-amber-700"
                  }
                >
                  {bill.payment_status}
                </span>
              </p>
            </div>
          </div>

          {/* ===================================== */}
          {/* OPTIONAL BILL NOTE */}
          {/* ===================================== */}

          {bill.bill_note ? (
            <div className="mb-5 break-words rounded-xl border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-800 sm:px-4 sm:text-base">
              {bill.bill_note}
            </div>
          ) : null}

          {/* ===================================== */}
          {/* MEDICINES TABLE */}
          {/* ===================================== */}

          <div className="bill-scroll mb-6 w-full max-w-full overflow-x-auto">
            <table className="bill-table w-full min-w-[900px] border-collapse border border-gray-300 text-xs sm:text-sm lg:text-base">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-3 py-3 text-left">
                    Medicine
                  </th>

                  <th className="border border-gray-300 px-3 py-3 text-left">
                    Dosage
                  </th>

                  <th className="border border-gray-300 px-3 py-3 text-left">
                    Instructions
                  </th>

                  <th className="border border-gray-300 px-3 py-3 text-center">
                    Prescribed
                  </th>

                  <th className="border border-gray-300 px-3 py-3 text-center">
                    Given
                  </th>

                  <th className="border border-gray-300 px-3 py-3 text-center">
                    Remaining
                  </th>

                  <th className="border border-gray-300 px-3 py-3 text-right">
                    Unit Price
                  </th>

                  <th className="border border-gray-300 px-3 py-3 text-right">
                    Line Total
                  </th>
                </tr>
              </thead>

              <tbody>
                {bill.items?.length ? (
                  bill.items.map((item, index) => (
                    <tr
                      key={index}
                      className="align-top"
                    >
                      <td className="border border-gray-200 px-3 py-3">
                        <p className="break-words font-medium text-gray-900">
                          {item.medicine_name}
                        </p>

                        {item.batch_numbers?.length ? (
                          <p className="mt-1 break-words text-xs text-gray-500 sm:text-sm">
                            Batch:{" "}
                            {item.batch_numbers.join(", ")}
                          </p>
                        ) : null}

                        {item.is_partial ? (
                          <p className="mt-1 text-xs font-medium text-red-600 sm:text-sm">
                            Partial Dispense
                          </p>
                        ) : null}
                      </td>

                      <td className="border border-gray-200 px-3 py-3">
                        {item.dosage || "—"}
                      </td>

                      <td className="border border-gray-200 px-3 py-3 break-words">
                        {item.instructions || "—"}
                      </td>

                      <td className="border border-gray-200 px-3 py-3 text-center">
                        {item.prescribed_quantity}
                      </td>

                      <td className="border border-gray-200 px-3 py-3 text-center">
                        {item.dispensed_quantity}
                      </td>

                      <td className="border border-gray-200 px-3 py-3 text-center">
                        {item.remaining_quantity}
                      </td>

                      <td className="border border-gray-200 px-3 py-3 text-right">
                        ₹
                        {parseFloat(
                          item.unit_price || 0
                        ).toFixed(2)}
                      </td>

                      <td className="border border-gray-200 px-3 py-3 text-right font-medium">
                        ₹
                        {parseFloat(
                          item.line_total || 0
                        ).toFixed(2)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={8}
                      className="border border-gray-200 px-3 py-8 text-center text-sm text-gray-500"
                    >
                      No items found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* ===================================== */}
          {/* PARTIAL DISPENSE NOTES */}
          {/* ===================================== */}

          {bill.items?.some(
            (item) => item.is_partial
          ) ? (
            <div className="mb-6">
              <h3 className="mb-2 text-base font-semibold text-red-700 sm:text-lg">
                Important Note
              </h3>

              <div className="space-y-2">
                {bill.items
                  .filter((item) => item.is_partial)
                  .map((item, index) => (
                    <p
                      key={index}
                      className="break-words text-sm text-red-700 sm:text-base"
                    >
                      • {item.note}
                    </p>
                  ))}
              </div>
            </div>
          ) : null}

          {/* ===================================== */}
          {/* BILL SUMMARY */}
          {/* ===================================== */}

          <div className="bill-summary ml-auto w-full max-w-sm space-y-3 border-t border-gray-300 pt-4 text-sm sm:text-base">
            <div className="flex items-center justify-between gap-3">
              <span>Subtotal</span>

              <span className="shrink-0">
                ₹
                {parseFloat(
                  bill.total_amount || 0
                ).toFixed(2)}
              </span>
            </div>

            <div className="flex items-center justify-between gap-3">
              <span>Discount</span>

              <span className="shrink-0">
                ₹
                {parseFloat(
                  bill.discount || 0
                ).toFixed(2)}
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-300 pt-3 text-lg font-bold sm:text-xl">
              <span>Final Amount</span>

              <span className="break-all text-green-700">
                ₹
                {parseFloat(
                  bill.final_amount || 0
                ).toFixed(2)}
              </span>
            </div>
          </div>

          {/* ===================================== */}
          {/* FOOTER */}
          {/* ===================================== */}

          <div className="bill-footer mt-10 text-center text-xs text-gray-500 sm:text-sm">
            Thank you. Please keep this bill for your records.
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintBillPage;