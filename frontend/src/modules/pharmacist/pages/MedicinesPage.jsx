import React, { useEffect, useState } from "react";
import PharmacistLayout from "../components/PharmacistLayout";
import {
  getMedicines,
  createMedicine,
  updateMedicine,
  deleteMedicine,
} from "../api/pharmacistApi";

const MedicinesPage = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingMed, setEditingMed] = useState(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    unit: "",
    price: "",
  });
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchMedicines = (q = "") => {
    setLoading(true);
    getMedicines(q)
      .then((res) => setMedicines(res.results || res.data || []))
      .catch(() => setError("Failed to load medicines."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    fetchMedicines(e.target.value);
  };

  const openAdd = () => {
    setEditingMed(null);
    setForm({
      name: "",
      description: "",
      unit: "",
      price: "",
    });
    setFormError("");
    setShowModal(true);
  };

  const openEdit = (med) => {
    setEditingMed(med);
    setForm({
      name: med.name,
      description: med.description || "",
      unit: med.unit || "",
      price: med.price,
    });
    setFormError("");
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.price) {
      setFormError("Name and price are required.");
      return;
    }

    setSubmitting(true);
    setFormError("");

    try {
      if (editingMed) {
        await updateMedicine(editingMed.medicine_id, form);
        setSuccess("Medicine updated.");
      } else {
        await createMedicine(form);
        setSuccess("Medicine added.");
      }

      setShowModal(false);
      fetchMedicines(search);
    } catch (err) {
      const msg = err?.response?.data
        ? JSON.stringify(err.response.data)
        : "Failed to save.";

      setFormError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this medicine?")) return;

    try {
      await deleteMedicine(id);
      setSuccess("Medicine deleted.");
      fetchMedicines(search);
    } catch (error) {
        setError(
          error?.response?.data?.message ||
          error?.response?.data?.detail ||
          "Failed to delete."
        );
      }
  };

  return (
    <PharmacistLayout title="Medicines">
      <div className="w-full min-w-0">

        {/* ============================= */}
        {/* TOP BAR */}
        {/* ============================= */}

        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <input
            type="text"
            placeholder="Search medicines..."
            value={search}
            onChange={handleSearch}
            className="
              w-full min-w-0
              rounded-xl
              border border-[#26344c]
              bg-[#0d1629]
              px-4 py-3
              text-sm sm:text-base text-white
              placeholder:text-gray-500
              outline-none
              transition
              focus:border-red-400
              sm:max-w-sm
            "
          />

          <button
            type="button"
            onClick={openAdd}
            className="
              w-full shrink-0 sm:w-auto
              rounded-xl
              bg-red-500
              px-5 py-3
              text-sm sm:text-base
              font-medium text-white
              transition
              hover:bg-red-400
            "
          >
            + Add Medicine
          </button>
        </div>

        {/* ============================= */}
        {/* ERROR / SUCCESS MESSAGES */}
        {/* ============================= */}

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

        {/* ============================= */}
        {/* MEDICINES TABLE */}
        {/* ============================= */}

        <div className="w-full min-w-0 overflow-hidden rounded-xl border border-[#1e2d4a] bg-[#0d1629]">
          <div className="w-full max-w-full overflow-x-auto">
            <table className="w-full min-w-[800px] text-sm sm:text-base">
              <thead>
                <tr className="border-b border-[#1e2d4a] bg-[#101c30] text-xs uppercase tracking-wider text-gray-400 sm:text-sm">
                  <th className="px-4 py-4 text-left sm:px-5">
                    Name
                  </th>

                  <th className="px-4 py-4 text-left sm:px-5">
                    Unit
                  </th>

                  <th className="px-4 py-4 text-left sm:px-5">
                    Price (₹)
                  </th>

                  <th className="px-4 py-4 text-left sm:px-5">
                    Description
                  </th>

                  <th className="px-4 py-4 text-left sm:px-5">
                    Actions
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
                          className="px-4 py-4 sm:px-5"
                        >
                          <div className="h-4 w-24 animate-pulse rounded bg-[#1e2d4a]" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : medicines.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-14 text-center text-sm text-gray-400 sm:text-base"
                    >
                      No medicines found.
                    </td>
                  </tr>
                ) : (
                  medicines.map((med) => (
                    <tr
                      key={med.medicine_id}
                      className="border-b border-[#1e2d4a] transition-colors hover:bg-[#111d35]"
                    >
                      <td className="px-4 py-4 font-semibold text-white sm:px-5">
                        {med.name}
                      </td>

                      <td className="px-4 py-4 text-gray-300 sm:px-5">
                        {med.unit || "—"}
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 font-semibold text-red-300 sm:px-5">
                        ₹{med.price}
                      </td>

                      <td className="max-w-xs truncate px-4 py-4 text-gray-400 sm:px-5">
                        {med.description || "—"}
                      </td>

                      <td className="px-4 py-4 sm:px-5">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openEdit(med)}
                            className="
                              rounded-lg
                              border border-red-400/30
                              bg-red-400/10
                              px-3 py-2
                              text-xs sm:text-sm
                              text-red-300
                              transition
                              hover:bg-red-400/20
                            "
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(med.medicine_id)
                            }
                            className="
                              rounded-lg
                              border border-red-500/30
                              bg-red-500/10
                              px-3 py-2
                              text-xs sm:text-sm
                              text-red-400
                              transition
                              hover:bg-red-500/20
                            "
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ============================= */}
        {/* ADD / EDIT MEDICINE MODAL */}
        {/* ============================= */}

        {showModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 px-3 py-4 backdrop-blur-sm sm:px-5">
            <div
              className="
                w-full max-w-md
                max-h-[90dvh] overflow-y-auto
                rounded-2xl
                border border-[#26344c]
                bg-[#101b2e]
                p-4 sm:p-6
                shadow-2xl
              "
              role="dialog"
              aria-modal="true"
              aria-label={
                editingMed ? "Edit Medicine" : "Add Medicine"
              }
            >
              <h3 className="mb-5 text-lg font-semibold text-white sm:text-xl">
                {editingMed ? "Edit Medicine" : "Add Medicine"}
              </h3>

              {formError && (
                <div className="mb-4 break-words rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                  {formError}
                </div>
              )}

              <div className="space-y-4">
                {[
                  {
                    key: "name",
                    label: "Medicine Name",
                    type: "text",
                  },
                  {
                    key: "unit",
                    label: "Unit",
                    type: "text",
                  },
                  {
                    key: "price",
                    label: "Price (₹)",
                    type: "number",
                  },
                  {
                    key: "description",
                    label: "Description",
                    type: "text",
                  },
                ].map(({ key, label, type }) => (
                  <div key={key} className="min-w-0">
                    <label className="mb-1 block text-sm text-gray-300">
                      {label}
                    </label>

                    <input
                      type={type}
                      value={form[key]}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          [key]: e.target.value,
                        }))
                      }
                      className="
                        w-full min-w-0
                        rounded-lg
                        border border-[#26344c]
                        bg-[#060d1a]
                        px-3 py-2.5
                        text-sm sm:text-base
                        text-white
                        outline-none
                        transition
                        focus:border-red-400
                      "
                    />
                  </div>
                ))}
              </div>

              {/* Modal actions */}
              <div className="mt-6 flex flex-col gap-3 min-[400px]:flex-row">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="
                    w-full min-[400px]:flex-1
                    rounded-xl
                    border border-[#26344c]
                    px-4 py-3
                    text-sm sm:text-base
                    text-gray-300
                    transition
                    hover:bg-white/5
                    hover:text-white
                  "
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="
                    w-full min-[400px]:flex-1
                    rounded-xl
                    bg-red-500
                    px-4 py-3
                    text-sm sm:text-base
                    font-medium text-white
                    transition
                    hover:bg-red-400
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  {submitting ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </PharmacistLayout>
  );
};

export default MedicinesPage;