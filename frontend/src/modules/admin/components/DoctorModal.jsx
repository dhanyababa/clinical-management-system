import React, { useEffect, useState } from "react";
import api from "../../../api";

const INITIAL_FORM = {
  first_name: "",
  last_name: "",
  email: "",
  password: "",
  phone: "",
  salary: "",
  date_of_birth: "",
  joining_date: "",
  qualification: "",
  address: "",
  specialization: "",
  consultation_fee: "500",
  experience_years: "1",
};

const getToday = () => {
  const date = new Date();
  const offset = date.getTimezoneOffset() * 60000;

  return new Date(date.getTime() - offset)
    .toISOString()
    .split("T")[0];
};

const getErrorMessage = (error) => {
  console.error("Doctor API Error:", error);

  if (!error.response) {
    return error.message || "Cannot connect to the backend.";
  }

  const data = error.response.data;

  if (typeof data === "string") {
    return data;
  }

  if (data?.detail) {
    return String(data.detail);
  }

  if (data?.errors) {
    return JSON.stringify(data.errors);
  }

  if (data && typeof data === "object") {
    return JSON.stringify(data);
  }

  return `Request failed with status ${error.response.status}`;
};

function DoctorModal({ doctor, onClose, onSaved }) {
  const isEdit = Boolean(doctor);

  const [form, setForm] = useState({
    ...INITIAL_FORM,
    joining_date: getToday(),
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!doctor) {
      setForm({
        ...INITIAL_FORM,
        joining_date: getToday(),
      });
      return;
    }

    const staff = doctor.staff || {};
    const user = staff.user || {};

    setForm({
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      email: user.email || "",
      password: "",
      phone: staff.phone || "",
      salary: staff.salary ?? "",
      date_of_birth: staff.date_of_birth || "",
      joining_date: staff.joining_date || "",
      qualification: staff.qualification || "",
      address: staff.address || "",
      specialization: doctor.specialization || "",
      consultation_fee: doctor.consultation_fee ?? "500",
      experience_years: doctor.experience_years ?? "1",
    });
  }, [doctor]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const buildStaffPayload = () => {
    const user = {
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      email: form.email.trim(),
    };

    if (form.password.trim()) {
      user.password = form.password;
    }

    return {
      user,
      role: "Doctor",
      phone: form.phone.trim(),
      salary: Number(form.salary),
      date_of_birth: form.date_of_birth,
      joining_date: form.joining_date,
      qualification: form.qualification.trim(),
      address: form.address.trim(),
    };
  };

  const buildDoctorPayload = () => ({
    specialization: form.specialization.trim(),
    consultation_fee: Number(form.consultation_fee),
    experience_years: Number(form.experience_years),
  });

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading) return;

    setError("");

    if (!isEdit && !form.password.trim()) {
      setError("Password is required for a new doctor.");
      return;
    }

    if (
      !form.first_name.trim() ||
      !form.last_name.trim() ||
      !form.email.trim() ||
      !form.qualification.trim() ||
      !form.specialization.trim()
    ) {
      setError("Please complete all required fields.");
      return;
    }

    if (
      form.salary === "" ||
      !Number.isFinite(Number(form.salary)) ||
      Number(form.salary) < 0 ||
      form.consultation_fee === "" ||
      !Number.isFinite(Number(form.consultation_fee)) ||
      Number(form.consultation_fee) < 0 ||
      form.experience_years === "" ||
      !Number.isInteger(Number(form.experience_years)) ||
      Number(form.experience_years) < 0
    ) {
      setError("Please enter valid salary, fee and experience values.");
      return;
    }

    setLoading(true);

    try {
      const staffPayload = buildStaffPayload();
      const doctorPayload = buildDoctorPayload();

      if (isEdit) {
        if (!doctor.staff?.id) {
          throw new Error(
            "This doctor has no linked staff account."
          );
        }

        await api.patch(
          `/api/administration/doctor/${doctor.doctor_id}/`,
          {
            staff: staffPayload,
            ...doctorPayload,
          }
        );
      } else {
        await api.post(
          "/api/administration/doctor/",
          {
            staff: staffPayload,
            ...doctorPayload,
          }
        );
      }
      onSaved();
    } catch (err) {
      setError(
        err.message?.includes("no linked staff")
          ? err.message
          : getErrorMessage(err)
      );
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full bg-[#0d1629] border border-[#1e2d4a] " +
    "rounded-lg px-3 py-2 text-sm text-white " +
    "focus:outline-none focus:border-[#a78bfa]";

  const labelClass =
    "block text-sm text-gray-300 mb-1";

  const fields = [
    { name: "first_name", label: "First Name", required: true },
    { name: "last_name", label: "Last Name", required: true },
    { name: "email", label: "Email", type: "email", required: true },
    {
      name: "password",
      label: isEdit ? "New Password (optional)" : "Password",
      type: "password",
      required: !isEdit,
    },
    { name: "phone", label: "Phone", required: true },
    { name: "salary", label: "Salary (₹)", type: "number", required: true },
    {
      name: "date_of_birth",
      label: "Date of Birth",
      type: "date",
      required: true,
    },
    {
      name: "joining_date",
      label: "Joining Date",
      type: "date",
      required: true,
    },
    {
      name: "qualification",
      label: "Qualification",
      required: true,
      placeholder: "e.g. MBBS",
    },
    {
      name: "specialization",
      label: "Specialization",
      required: true,
      placeholder: "e.g. Cardiology",
    },
    {
      name: "consultation_fee",
      label: "Consultation Fee (₹)",
      type: "number",
      required: true,
    },
    {
      name: "experience_years",
      label: "Experience (years)",
      type: "number",
      required: true,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#101b30] border border-[#1e2d4a] rounded-2xl shadow-2xl">
        <div className="sticky top-0 bg-[#101b30] border-b border-[#1e2d4a] px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-white">
            {isEdit ? "Edit Doctor" : "Add Doctor"}
          </h2>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-white text-2xl"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm break-words">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {fields.map((field) => (
              <div key={field.name}>
                <label
                  htmlFor={`doctor-${field.name}`}
                  className={labelClass}
                >
                  {field.label}
                  {field.required ? " *" : ""}
                </label>

                <input
                  id={`doctor-${field.name}`}
                  name={field.name}
                  type={field.type || "text"}
                  value={form[field.name]}
                  onChange={handleChange}
                  required={field.required}
                  placeholder={field.placeholder || ""}
                  min={
                    field.type === "number" ? "0" : undefined
                  }
                  step={
                    field.name === "experience_years"
                      ? "1"
                      : field.type === "number"
                        ? "0.01"
                        : undefined
                  }
                  className={inputClass}
                />
              </div>
            ))}
          </div>

          <div>
            <label htmlFor="doctor-address" className={labelClass}>
              Address
            </label>

            <textarea
              id="doctor-address"
              name="address"
              value={form.address}
              onChange={handleChange}
              rows={3}
              className={inputClass}
            />
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-3 border-t border-[#1e2d4a]">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2 rounded-lg border border-[#1e2d4a] text-gray-300 hover:bg-white/5"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-lg bg-[#a78bfa] text-[#060d1a] font-semibold hover:bg-[#c4b5fd] disabled:opacity-50"
            >
              {loading
                ? "Saving..."
                : isEdit
                  ? "Save Changes"
                  : "Create Doctor"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default DoctorModal;
// // import React, { useState, useEffect } from "react";
// // import API from "../../../api";

// // const today = new Date().toISOString().split("T")[0];
// // const formatDate = (d) => (d ? new Date(d).toISOString().split("T")[0] : "");

// // // 🌟 GLASS INPUT STYLE
// // const inputCls =
// //   "w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-300 focus:outline-none focus:border-[#D4AF37] transition";

// // // 🌟 FIELD COMPONENT
// // const Field = ({ label, children }) => (
// //   <div>
// //     <label className="block text-xs font-medium text-gray-300 mb-1">{label}</label>
// //     {children}
// //   </div>
// // );

// // const SPECIALIZATIONS = [
// //   "General", "Cardiology", "Neurology", "Orthopedics", "Pediatrics",
// //   "Dermatology", "Gynecology", "Ophthalmology", "ENT", "Psychiatry",
// //   "Radiology", "Oncology", "Nephrology", "Gastroenterology", "Endocrinology"
// // ];

// // const DoctorModal = ({ doctor, onClose, onSaved }) => {
// //   const isEdit = !!doctor;

// //   const [form, setForm] = useState({
// //     first_name: "",
// //     last_name: "",
// //     email: "",
// //     password: "",
// //     phone: "",
// //     salary: 10000,
// //     date_of_birth: "",
// //     joining_date: today,

// //     // Doctor specific
// //     specialization: "General",
// //     consultation_fee: 500,
// //     experience_years: 1,
// //   });

// //   const [loading, setLoading] = useState(false);
// //   const [serverError, setServerError] = useState("");

// //   useEffect(() => {
// //     if (doctor) {
// //       const s = doctor.staff || {};
// //       setForm({
// //         first_name: s.user?.first_name || "",
// //         last_name: s.user?.last_name || "",
// //         email: s.user?.email || "",
// //         password: "",
// //         phone: s.phone || "",
// //         salary: s.salary || 10000,
// //         date_of_birth: formatDate(s.date_of_birth),
// //         joining_date: formatDate(s.joining_date) || today,

// //         specialization: doctor.specialization || "General",
// //         consultation_fee: doctor.consultation_fee || 500,
// //         experience_years: doctor.experience_years || 1,
// //       });
// //     }
// //   }, [doctor]);

// //   const set = (name, value) => {
// //     setForm((p) => ({ ...p, [name]: value }));
// //   };

// //   const buildPayload = () => ({
// //     staff: {
// //       user: {
// //         first_name: form.first_name,
// //         last_name: form.last_name,
// //         email: form.email,
// //         ...(form.password ? { password: form.password } : {}),
// //       },
// //       role: "Doctor",
// //       phone: form.phone,
// //       salary: Number(form.salary),
// //       date_of_birth: form.date_of_birth || null,
// //       joining_date: form.joining_date || null,
// //     },
// //     specialization: form.specialization,
// //     consultation_fee: Number(form.consultation_fee),
// //     experience_years: Number(form.experience_years),
// //   });

// //   const handleSubmit = async (e) => {
// //     e.preventDefault();
// //     setLoading(true);
// //     setServerError("");

// //     try {
// //       const payload = buildPayload();

// //       if (isEdit) {
// //         await API.put(`/api/administration/doctor/${doctor.doctor_id}/`, payload);
// //       } else {
// //         await API.post("/api/administration/doctor/", payload);
// //       }

// //       onSaved();
// //       onClose();
// //     } catch (err) {
// //       const data = err.response?.data;
// //       setServerError(data?.detail || JSON.stringify(data) || "Failed to save");
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   return (
// //     <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-lg flex items-center justify-center p-4">
// //       <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">

// //         {/* HEADER */}
// //         <div className="flex items-center justify-between px-6 py-5 border-b border-white/20">
// //           <div>
// //             <h2 className="text-lg font-semibold text-[#F1D279]">
// //               {isEdit ? "Edit Doctor" : "Add New Doctor"}
// //             </h2>
// //             <p className="text-xs text-gray-300 mt-0.5">Role is fixed as Doctor</p>
// //           </div>

// //           <button onClick={onClose} className="text-gray-400 hover:text-white transition">
// //             <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
// //               <path d="M18 6 6 18M6 6l12 12" />
// //             </svg>
// //           </button>
// //         </div>

// //         {/* FORM */}
// //         <form onSubmit={handleSubmit} className="p-6 space-y-5">

// //           {serverError && (
// //             <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg">
// //               {serverError}
// //             </div>
// //           )}

// //           {/* PERSONAL */}
// //           <p className="text-xs text-[#F1D279] uppercase tracking-wider font-semibold">
// //             Personal Info
// //           </p>

// //           <div className="grid grid-cols-2 gap-4">
// //             <Field label="First Name *">
// //               <input className={inputCls} value={form.first_name} onChange={(e) => set("first_name", e.target.value)} required />
// //             </Field>

// //             <Field label="Last Name *">
// //               <input className={inputCls} value={form.last_name} onChange={(e) => set("last_name", e.target.value)} required />
// //             </Field>
// //           </div>

// //           <div className="grid grid-cols-2 gap-4">
// //             <Field label="Email *">
// //               <input className={inputCls} type="email" value={form.email} onChange={(e) => set("email", e.target.value)} required />
// //             </Field>

// //             <Field label={isEdit ? "New Password" : "Password *"}>
// //               <input className={inputCls} type="password" value={form.password} onChange={(e) => set("password", e.target.value)} {...(!isEdit && { required: true })} />
// //             </Field>
// //           </div>

// //           <div className="grid grid-cols-2 gap-4">
// //             <Field label="Phone *">
// //               <input className={inputCls} value={form.phone} onChange={(e) => set("phone", e.target.value)} required />
// //             </Field>

// //             <Field label="Salary (₹)">
// //               <input className={inputCls} type="number" value={form.salary} onChange={(e) => set("salary", e.target.value)} />
// //             </Field>
// //           </div>

// //           <div className="grid grid-cols-2 gap-4">
// //             <Field label="Date of Birth">
// //               <input className={inputCls} type="date" max={today} value={form.date_of_birth} onChange={(e) => set("date_of_birth", e.target.value)} />
// //             </Field>

// //             <Field label="Joining Date">
// //               <input className={inputCls} type="date" value={form.joining_date} onChange={(e) => set("joining_date", e.target.value)} />
// //             </Field>
// //           </div>

// //           {/* DOCTOR */}
// //           <p className="text-xs text-[#F1D279] uppercase tracking-wider font-semibold pt-2">
// //             Doctor Details
// //           </p>

// //           <div className="grid grid-cols-2 gap-4">
// //             <Field label="Specialization">
// //               <select className={inputCls} value={form.specialization} onChange={(e) => set("specialization", e.target.value)}>
// //                 {SPECIALIZATIONS.map((s) => <option key={s} value={s}>{s}</option>)}
// //               </select>
// //             </Field>

// //             <Field label="Consultation Fee (₹)">
// //               <input className={inputCls} type="number" value={form.consultation_fee} onChange={(e) => set("consultation_fee", e.target.value)} />
// //             </Field>
// //           </div>

// //           <Field label="Experience (Years)">
// //             <input className={inputCls} type="number" value={form.experience_years} onChange={(e) => set("experience_years", e.target.value)} />
// //           </Field>

// //           {/* BUTTONS */}
// //           <div className="flex justify-end gap-3 pt-2">
// //             <button
// //               type="button"
// //               onClick={onClose}
// //               className="px-5 py-2.5 text-sm rounded-lg border border-white/20 text-gray-300 hover:text-white transition"
// //             >
// //               Cancel
// //             </button>

// //             <button
// //               type="submit"
// //               disabled={loading}
// //               className="px-5 py-2.5 text-sm rounded-lg bg-[#D4AF37] text-[#1B4360] font-semibold hover:bg-[#F1D279] transition"
// //             >
// //               {loading ? "Saving..." : isEdit ? "Update Doctor" : "Create Doctor"}
// //             </button>
// //           </div>

// //         </form>
// //       </div>
// //     </div>
// //   );
// // };

// // export default DoctorModal;


// import React, { useState, useEffect } from "react";
// import API from "../../../api";

// const today = new Date().toISOString().split("T")[0];
// const formatDate = (d) => (d ? new Date(d).toISOString().split("T")[0] : "");

// const inputCls =
//   "w-full bg-[#020617] border border-[#1e2d4a] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] transition";

// const Field = ({ label, children }) => (
//   <div>
//     <label className="block text-xs font-medium text-gray-300 mb-1">
//       {label}
//     </label>
//     {children}
//   </div>
// );

// const SPECIALIZATIONS = [
//   "General", "Cardiology", "Neurology", "Orthopedics", "Pediatrics",
//   "Dermatology", "Gynecology", "Ophthalmology", "ENT", "Psychiatry",
//   "Radiology", "Oncology", "Nephrology", "Gastroenterology", "Endocrinology"
// ];

// const DoctorModal = ({ doctor, onClose, onSaved }) => {
//   const isEdit = !!doctor;

//   const [form, setForm] = useState({
//     first_name: "",
//     last_name: "",
//     email: "",
//     password: "",
//     phone: "",
//     salary: 10000,
//     date_of_birth: "",
//     joining_date: today,
//     specialization: "General",
//     consultation_fee: 500,
//     experience_years: 1,
//   });

//   const [loading, setLoading] = useState(false);
//   const [serverError, setServerError] = useState("");

//   useEffect(() => {
//     if (doctor) {
//       const s = doctor.staff || {};
//       setForm({
//         first_name: s.user?.first_name || "",
//         last_name: s.user?.last_name || "",
//         email: s.user?.email || "",
//         password: "",
//         phone: s.phone || "",
//         salary: s.salary || 10000,
//         date_of_birth: formatDate(s.date_of_birth),
//         joining_date: formatDate(s.joining_date) || today,
//         specialization: doctor.specialization || "General",
//         consultation_fee: doctor.consultation_fee || 500,
//         experience_years: doctor.experience_years || 1,
//       });
//     }
//   }, [doctor]);

//   const set = (name, value) => {
//     setForm((p) => ({ ...p, [name]: value }));
//   };

//   const buildPayload = () => ({
//     staff: {
//       user: {
//         first_name: form.first_name,
//         last_name: form.last_name,
//         email: form.email,
//         ...(form.password ? { password: form.password } : {}),
//       },
//       role: "Doctor",
//       phone: form.phone,
//       salary: Number(form.salary),
//       date_of_birth: form.date_of_birth || null,
//       joining_date: form.joining_date || null,
//     },
//     specialization: form.specialization,
//     consultation_fee: Number(form.consultation_fee),
//     experience_years: Number(form.experience_years),
//   });

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setServerError("");

//     try {
//       const payload = buildPayload();

//       if (isEdit) {
//         await API.put(`/api/administration/doctor/${doctor.doctor_id}/`, payload);
//       } else {
//         await API.post("/api/administration/doctor/", payload);
//       }

//       onSaved();
//       onClose();
//     } catch (err) {
//       const data = err.response?.data;
//       setServerError(data?.detail || JSON.stringify(data) || "Failed to save");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">

//       <div className="bg-[#020617] border border-[#1e2d4a] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">

//         {/* HEADER */}
//         <div className="flex items-center justify-between px-6 py-5 border-b border-[#1e2d4a]">
//           <div>
//             <h2 className="text-lg font-semibold text-[#F1D279]">
//               {isEdit ? "Edit Doctor" : "Add New Doctor"}
//             </h2>
//             <p className="text-xs text-gray-400 mt-1">
//               Role: Doctor
//             </p>
//           </div>

//           <button onClick={onClose} className="text-gray-400 hover:text-white">
//             ✕
//           </button>
//         </div>

//         {/* FORM */}
//         <form onSubmit={handleSubmit} className="p-6 space-y-5">

//           {serverError && (
//             <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg">
//               {serverError}
//             </div>
//           )}

//           {/* PERSONAL */}
//           <p className="text-xs text-[#F1D279] font-semibold uppercase tracking-wider">
//             Personal Info
//           </p>

//           <div className="grid grid-cols-2 gap-4">
//             <Field label="First Name *">
//               <input className={inputCls} value={form.first_name} onChange={(e) => set("first_name", e.target.value)} required />
//             </Field>

//             <Field label="Last Name *">
//               <input className={inputCls} value={form.last_name} onChange={(e) => set("last_name", e.target.value)} required />
//             </Field>
//           </div>

//           <div className="grid grid-cols-2 gap-4">
//             <Field label="Email *">
//               <input className={inputCls} type="email" value={form.email} onChange={(e) => set("email", e.target.value)} required />
//             </Field>

//             <Field label={isEdit ? "New Password" : "Password *"}>
//               <input className={inputCls} type="password" value={form.password} onChange={(e) => set("password", e.target.value)} {...(!isEdit && { required: true })} />
//             </Field>
//           </div>

//           <div className="grid grid-cols-2 gap-4">
//             <Field label="Phone *">
//               <input className={inputCls} value={form.phone} onChange={(e) => set("phone", e.target.value)} required />
//             </Field>

//             <Field label="Salary (₹)">
//               <input className={inputCls} type="number" value={form.salary} onChange={(e) => set("salary", e.target.value)} />
//             </Field>
//           </div>

//           {/* DOCTOR */}
//           <p className="text-xs text-[#F1D279] font-semibold uppercase tracking-wider pt-2">
//             Doctor Details
//           </p>

//           <div className="grid grid-cols-2 gap-4">
//             <Field label="Specialization">
//               <select className={inputCls} value={form.specialization} onChange={(e) => set("specialization", e.target.value)}>
//                 {SPECIALIZATIONS.map((s) => (
//                   <option key={s} value={s}>{s}</option>
//                 ))}
//               </select>
//             </Field>

//             <Field label="Consultation Fee (₹)">
//               <input className={inputCls} type="number" value={form.consultation_fee} onChange={(e) => set("consultation_fee", e.target.value)} />
//             </Field>
//           </div>

//           <Field label="Experience (Years)">
//             <input className={inputCls} type="number" value={form.experience_years} onChange={(e) => set("experience_years", e.target.value)} />
//           </Field>

//           {/* BUTTONS */}
//           <div className="flex justify-end gap-3 pt-2">

//             <button
//               type="button"
//               onClick={onClose}
//               className="px-5 py-2.5 text-sm rounded-lg border border-[#1e2d4a] text-gray-300 hover:text-white"
//             >
//               Cancel
//             </button>

//             <button
//               type="submit"
//               disabled={loading}
//               className="px-5 py-2.5 text-sm rounded-lg bg-[#D4AF37] text-[#020617] font-semibold hover:bg-[#F1D279] transition"
//             >
//               {loading ? "Saving..." : isEdit ? "Update Doctor" : "Create Doctor"}
//             </button>

//           </div>

//         </form>

//       </div>
//     </div>
//   );
// };

// export default DoctorModal;