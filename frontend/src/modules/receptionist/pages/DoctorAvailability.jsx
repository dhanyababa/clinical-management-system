import React, { useEffect, useState } from "react";

import ReceptionLayout from "../components/ReceptionLayout";

import {
  getDoctorAvailability,
  getDoctors,
  createDoctorAvailability,
  deleteDoctorAvailability,
} from "../api/receptionApi";

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

const fmt12 = (t) => {
  if (!t) return "";

  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";

  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${ampm}`;
};

const today = new Date().toISOString().split("T")[0];

// ─────────────────────────────────────────────
// ADD SLOT MODAL
// ─────────────────────────────────────────────

const AddSlotModal = ({ doctors, onClose, onSaved }) => {
  const [form, setForm] = useState({
    doctor: "",
    available_date: "",
    start_time: "",
    end_time: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const inputCls = (f) =>
    `w-full min-w-0 max-w-full bg-[#060d1a] border ${
      errors[f] ? "border-red-500" : "border-[#1e2d4a]"
    } rounded-lg px-3 sm:px-4 py-2.5 text-base sm:text-sm text-white focus:outline-none focus:border-emerald-400 transition`;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
    setServerError("");
  };

  const validate = () => {
    const e = {};

    if (!form.doctor) e.doctor = "Required";
    if (!form.available_date) e.available_date = "Required";
    if (!form.start_time) e.start_time = "Required";
    if (!form.end_time) e.end_time = "Required";

    if (
      form.start_time &&
      form.end_time &&
      form.start_time >= form.end_time
    ) {
      e.end_time = "End time must be after start time";
    }

    return e;
  };

  const handleSubmit = async () => {
    const e = validate();

    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }

    setLoading(true);

    try {
      await createDoctorAvailability({
        doctor: parseInt(form.doctor),
        available_date: form.available_date,
        start_time: form.start_time,
        end_time: form.end_time,
      });

      onSaved();
    } catch (err) {
      const data = err?.response?.data;

      if (typeof data === "object") {
        const fe = {};

        Object.entries(data).forEach(([k, v]) => {
          fe[k] = Array.isArray(v) ? v[0] : v;
        });

        if (fe.non_field_errors) {
          setServerError(fe.non_field_errors);
          delete fe.non_field_errors;
        }

        setErrors(fe);
      } else {
        setServerError("Failed to add availability slot.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-2 sm:p-4">

      <div className="w-full min-w-0 max-w-md max-h-[90dvh] flex flex-col bg-[#0d1629] border border-[#1e2d4a] rounded-2xl shadow-2xl">

        {/* Header */}
        <div className="flex items-start justify-between gap-3 px-3 sm:px-6 py-4 sm:py-5 border-b border-[#1e2d4a] shrink-0">

          <div className="min-w-0">
            <h2 className="text-base font-semibold text-white">
              Add Availability Slot
            </h2>

            <p className="text-xs text-gray-400 mt-1 break-words">
              Set when a doctor is available for appointments
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="shrink-0 text-gray-500 hover:text-white transition text-xl"
          >
            ✕
          </button>

        </div>

        {/* Scrollable Body */}
        <div className="p-3 sm:p-6 space-y-4 min-w-0 overflow-y-auto flex-1">

          {serverError && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-3 sm:px-4 py-3 rounded-lg break-words">
              {serverError}
            </div>
          )}

          {/* Doctor */}
          <div className="min-w-0">

            <label className="text-xs text-gray-400 mb-1 block">
              Doctor *
            </label>

            <select
              name="doctor"
              value={form.doctor}
              onChange={handleChange}
              className={inputCls("doctor")}
            >
              <option value="">Select Doctor</option>

              {doctors.map((d) => {
                const name = d.staff?.user
                  ? `${d.staff.user.first_name} ${d.staff.user.last_name}`.trim()
                  : `Doctor #${d.doctor_id}`;

                return (
                  <option
                    key={d.doctor_id}
                    value={d.doctor_id}
                  >
                    Dr. {name} — {d.specialization}
                  </option>
                );
              })}
            </select>

            {errors.doctor && (
              <p className="text-red-400 text-xs mt-1">
                {errors.doctor}
              </p>
            )}

          </div>

          {/* Date */}
          <div className="min-w-0">

            <label className="text-xs text-gray-400 mb-1 block">
              Available Date *
            </label>

            <input
              type="date"
              name="available_date"
              min={today}
              value={form.available_date}
              onChange={handleChange}
              className={inputCls("available_date")}
            />

            {errors.available_date && (
              <p className="text-red-400 text-xs mt-1">
                {errors.available_date}
              </p>
            )}

          </div>

          {/* Start and End Times */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <div className="min-w-0">

              <label className="text-xs text-gray-400 mb-1 block">
                Start Time *
              </label>

              <input
                type="time"
                name="start_time"
                value={form.start_time}
                onChange={handleChange}
                className={inputCls("start_time")}
              />

              {errors.start_time && (
                <p className="text-red-400 text-xs mt-1">
                  {errors.start_time}
                </p>
              )}

            </div>

            <div className="min-w-0">

              <label className="text-xs text-gray-400 mb-1 block">
                End Time *
              </label>

              <input
                type="time"
                name="end_time"
                value={form.end_time}
                onChange={handleChange}
                className={inputCls("end_time")}
              />

              {errors.end_time && (
                <p className="text-red-400 text-xs mt-1">
                  {errors.end_time}
                </p>
              )}

            </div>

          </div>

          {/* Slot Preview */}
          {form.start_time &&
            form.end_time &&
            form.start_time < form.end_time && (
              <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg px-3 sm:px-4 py-3 flex flex-wrap items-center gap-2">

                <span className="text-emerald-400 text-sm">
                  🕐
                </span>

                <span className="text-emerald-300 text-xs">
                  {fmt12(form.start_time)} –{" "}
                  {fmt12(form.end_time)}
                </span>

                {form.available_date && (
                  <span className="text-gray-400 text-xs">
                    on{" "}
                    {new Date(
                      form.available_date + "T00:00:00"
                    ).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                )}

              </div>
            )}

        </div>

        {/* Footer */}
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 px-3 sm:px-6 py-4 sm:py-5 border-t border-[#1e2d4a] shrink-0">

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 text-sm text-gray-400 hover:text-white border border-[#1e2d4a] rounded-lg transition"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="w-full sm:w-auto justify-center px-5 py-2.5 text-sm font-semibold bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg transition disabled:opacity-50 flex items-center gap-2"
          >
            {loading && (
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}

            {loading ? "Saving..." : "Add Slot"}
          </button>

        </div>

      </div>

    </div>
  );
};

// ─────────────────────────────────────────────
// SLOT ROW
// ─────────────────────────────────────────────

const SlotRow = ({ slot, doctorMap, onDelete, deleting }) => {
  const doc = doctorMap[slot.doctor];

  const name = doc?.staff?.user
    ? `${doc.staff.user.first_name} ${doc.staff.user.last_name}`.trim()
    : slot.doctor_name || `Doctor #${slot.doctor}`;

  const spec = doc?.specialization || "—";

  return (
    <tr className="border-b border-[#1e2d4a] hover:bg-[#111d35] transition-colors">

      <td className="px-4 py-3">
        <p className="text-white text-sm font-medium">
          Dr. {name}
        </p>

        <p className="text-emerald-400 text-xs">
          {spec}
        </p>
      </td>

      <td className="px-4 py-3 text-gray-300 text-sm whitespace-nowrap">
        {new Date(
          slot.available_date + "T00:00:00"
        ).toLocaleDateString("en-IN", {
          weekday: "short",
          day: "numeric",
          month: "short",
          year: "numeric",
        })}
      </td>

      <td className="px-4 py-3">
        <span className="inline-block whitespace-nowrap bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-mono px-3 py-1.5 rounded-lg">
          {fmt12(slot.start_time)} –{" "}
          {fmt12(slot.end_time)}
        </span>
      </td>

      <td className="px-4 py-3">
        <button
          type="button"
          onClick={() => onDelete(slot.availability_id)}
          disabled={deleting === slot.availability_id}
          className="whitespace-nowrap text-xs text-red-400 hover:text-red-300 border border-red-400/30 hover:border-red-400/60 px-3 py-2 rounded-lg transition disabled:opacity-40"
        >
          {deleting === slot.availability_id
            ? "Removing…"
            : "Remove"}
        </button>
      </td>

    </tr>
  );
};

// ─────────────────────────────────────────────
// SKELETON ROWS
// ─────────────────────────────────────────────

const SkeletonRows = () =>
  [...Array(5)].map((_, i) => (
    <tr
      key={i}
      className="border-b border-[#1e2d4a]"
    >
      {[...Array(4)].map((_, j) => (
        <td key={j} className="px-4 py-4">
          <div className="h-3 bg-[#1e2d4a] rounded animate-pulse w-24" />
        </td>
      ))}
    </tr>
  ));

// ─────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────

const DoctorAvailability = () => {
  const [slots, setSlots] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [doctorMap, setDoctorMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(null);

  // Filters
  const [filterDoctor, setFilterDoctor] = useState("");
  const [filterDate, setFilterDate] = useState("");

  const fetchAll = async () => {
    setLoading(true);
    setError("");

    try {
      const [slotsRes, doctorsRes] = await Promise.all([
        getDoctorAvailability(),
        getDoctors(),
      ]);

      const rawSlots = slotsRes.data || [];
      const rawDoctors = doctorsRes.data || [];

      const map = {};

      rawDoctors.forEach((d) => {
        map[d.doctor_id] = d;
      });

      setSlots(rawSlots);
      setDoctors(rawDoctors);
      setDoctorMap(map);
    } catch {
      setError("Failed to load availability data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this availability slot?")) {
      return;
    }

    setDeleting(id);

    try {
      await deleteDoctorAvailability(id);

      setSlots((prev) =>
        prev.filter((s) => s.availability_id !== id)
      );
    } catch {
      alert("Failed to remove slot. Please try again.");
    } finally {
      setDeleting(null);
    }
  };

  // Apply filters
  const filteredSlots = slots.filter((s) => {
    if (
      filterDoctor &&
      String(s.doctor) !== String(filterDoctor)
    ) {
      return false;
    }

    if (
      filterDate &&
      s.available_date !== filterDate
    ) {
      return false;
    }

    return true;
  });

  // Sort: upcoming first
  const sortedSlots = [...filteredSlots].sort((a, b) => {
    const d = a.available_date.localeCompare(b.available_date);

    if (d !== 0) return d;

    return a.start_time.localeCompare(b.start_time);
  });

  const selectCls =
    "w-full sm:w-auto min-w-0 max-w-full bg-[#060d1a] border border-[#1e2d4a] rounded-lg px-3 py-2.5 text-base sm:text-sm text-white focus:outline-none focus:border-emerald-400 transition";

  return (
    <ReceptionLayout title="Doctor Availability">

      <div className="w-full min-w-0">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">

          <div className="min-w-0">
            <h2 className="text-white font-semibold text-lg sm:text-xl break-words">
              Manage Doctor Availability
            </h2>

            <p className="text-gray-400 text-xs sm:text-sm mt-1 break-words">
              Add or remove the time slots when each doctor
              is available for appointments.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="flex w-full sm:w-auto items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold rounded-lg transition shrink-0"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className="w-4 h-4"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>

            Add Slot
          </button>

        </div>

        {/* Statistics */}
        {!loading && (
          <div className="grid grid-cols-1 min-[400px]:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">

            {[
              {
                label: "Total Slots",
                value: slots.length,
                color: "text-white",
              },
              {
                label: "Doctors Covered",
                value: new Set(
                  slots.map((s) => s.doctor)
                ).size,
                color: "text-emerald-400",
              },
              {
                label: "Filtered Results",
                value: sortedSlots.length,
                color: "text-blue-400",
              },
            ].map((s) => (
              <div
                key={s.label}
                className="min-w-0 bg-[#0d1629] border border-[#1e2d4a] rounded-xl p-3 sm:p-4 text-center"
              >
                <p
                  className={`text-xl sm:text-2xl font-bold ${s.color}`}
                >
                  {s.value}
                </p>

                <p className="text-xs text-gray-400 mt-1 break-words">
                  {s.label}
                </p>
              </div>
            ))}

          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 mb-4 min-w-0">

          <select
            value={filterDoctor}
            onChange={(e) =>
              setFilterDoctor(e.target.value)
            }
            className={selectCls}
          >
            <option value="">All Doctors</option>

            {doctors.map((d) => {
              const name = d.staff?.user
                ? `${d.staff.user.first_name} ${d.staff.user.last_name}`.trim()
                : `Doctor #${d.doctor_id}`;

              return (
                <option
                  key={d.doctor_id}
                  value={d.doctor_id}
                >
                  Dr. {name}
                </option>
              );
            })}
          </select>

          <input
            type="date"
            value={filterDate}
            onChange={(e) =>
              setFilterDate(e.target.value)
            }
            className={selectCls}
          />

          {(filterDoctor || filterDate) && (
            <button
              type="button"
              onClick={() => {
                setFilterDoctor("");
                setFilterDate("");
              }}
              className="w-full sm:w-auto text-xs text-gray-400 hover:text-white px-3 py-2.5 border border-[#1e2d4a] rounded-lg transition"
            >
              Clear filters
            </button>
          )}

        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-3 sm:px-4 py-3 rounded-lg break-words">
            {error}
          </div>
        )}

        {/* Availability Table */}
        <div className="w-full min-w-0 bg-[#0d1629] border border-[#1e2d4a] rounded-xl overflow-hidden">

          <div className="px-3 sm:px-5 py-4 border-b border-[#1e2d4a]">
            <h3 className="text-sm font-semibold text-white">
              Availability Slots{" "}
              <span className="text-gray-400 font-normal">
                ({sortedSlots.length} result
                {sortedSlots.length !== 1 ? "s" : ""})
              </span>
            </h3>
          </div>

          {/* Horizontal Scroll on Small Screens */}
          <div className="w-full max-w-full overflow-x-auto">

            <table className="min-w-[650px] w-full text-sm">

              <thead>
                <tr className="border-b border-[#1e2d4a] text-gray-500 text-xs uppercase tracking-wider">

                  <th className="px-4 py-3 text-left">
                    Doctor
                  </th>

                  <th className="px-4 py-3 text-left">
                    Date
                  </th>

                  <th className="px-4 py-3 text-left">
                    Time Slot
                  </th>

                  <th className="px-4 py-3 text-left">
                    Action
                  </th>

                </tr>
              </thead>

              <tbody>

                {loading ? (
                  <SkeletonRows />
                ) : sortedSlots.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="text-center py-16 text-gray-500 px-4"
                    >
                      <div className="text-3xl mb-2">
                        📅
                      </div>

                      <p className="text-sm">
                        No availability slots found.
                      </p>

                      <p className="text-xs mt-1 text-gray-500">
                        {filterDoctor || filterDate
                          ? "Try clearing filters."
                          : 'Click "Add Slot" to set doctor availability.'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  sortedSlots.map((slot) => (
                    <SlotRow
                      key={slot.availability_id}
                      slot={slot}
                      doctorMap={doctorMap}
                      onDelete={handleDelete}
                      deleting={deleting}
                    />
                  ))
                )}

              </tbody>

            </table>

          </div>

        </div>

        {/* Add Slot Modal */}
        {modalOpen && (
          <AddSlotModal
            doctors={doctors}
            onClose={() => setModalOpen(false)}
            onSaved={() => {
              setModalOpen(false);
              fetchAll();
            }}
          />
        )}

      </div>

    </ReceptionLayout>
  );
};

export default DoctorAvailability;