import React, { useEffect, useState } from "react";
import api from "../../../api";

const INITIAL_STAFF = {
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
};

function getToday() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;

  return new Date(now.getTime() - offset)
    .toISOString()
    .split("T")[0];
}

function getErrorMessage(error) {
  const data = error?.response?.data;

  if (!data) {
    return error?.message || "Unable to save. Please try again.";
  }

  if (typeof data.detail === "string") {
    return data.detail;
  }

  if (typeof data.message === "string") {
    return data.message;
  }

  return JSON.stringify(data.errors || data);
}

function RoleModal({ record, onClose, onSaved, roleConfig }) {
  const isEdit = Boolean(record);

  const { role, endpoint, idKey, extraFields = [] } = roleConfig;

  const makeInitialForm = () => ({
    ...INITIAL_STAFF,
    joining_date: getToday(),
    ...Object.fromEntries(
      extraFields.map((field) => [
        field.name,
        field.default ?? "",
      ])
    ),
  });

  const [form, setForm] = useState(makeInitialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!record) {
      setForm(makeInitialForm());
      return;
    }

    const staff = record.staff || {};
    const user = staff.user || {};

    const extraValues = Object.fromEntries(
      extraFields.map((field) => [
        field.name,
        record[field.name] ?? field.default ?? "",
      ])
    );

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
      ...extraValues,
    });
  }, [record, roleConfig]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const buildStaffPayload = () => ({
    user: {
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      email: form.email.trim(),
      password: form.password,
    },
    role,
    phone: form.phone.trim(),
    salary: Number(form.salary),
    date_of_birth: form.date_of_birth,
    joining_date: form.joining_date,
    qualification: form.qualification.trim(),
    address: form.address.trim(),
  });

  const buildProfilePayload = () =>
    Object.fromEntries(
      extraFields.map((field) => [
        field.name,
        typeof form[field.name] === "string"
          ? form[field.name].trim()
          : form[field.name],
      ])
    );

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading) return;

    setError("");

    if (!isEdit) {
      if (
        !form.first_name.trim() ||
        !form.last_name.trim() ||
        !form.email.trim() ||
        !form.password ||
        !form.qualification.trim() ||
        !form.date_of_birth ||
        !form.joining_date ||
        form.salary === ""
      ) {
        setError("Please complete all required staff fields.");
        return;
      }

      if (
        !Number.isFinite(Number(form.salary)) ||
        Number(form.salary) < 0
      ) {
        setError("Please enter a valid salary.");
        return;
      }
    }

    const profilePayload = buildProfilePayload();

    setLoading(true);

    try {
      if (isEdit) {
        if (!record[idKey]) {
          throw new Error("Missing role profile ID.");
        }

        if (!record.staff?.id) {
          throw new Error(
            "This record has no linked staff account. " +
            "Please review it before editing."
          );
        }

        await api.patch(
          `${endpoint}${record[idKey]}/`,
          {
            staff: {
              role,
            },
            ...profilePayload,
          }
        );
      } else {
        await api.post(endpoint, {
          staff: buildStaffPayload(),
          ...profilePayload,
        });
      }

      onSaved();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-lg border border-gray-300 bg-white " +
    "px-3 py-2 text-sm text-gray-900 " +
    "focus:outline-none focus:border-blue-500";

  const labelClass = "block mb-1 text-sm font-medium text-gray-700";

  const staffFields = [
    { name: "first_name", label: "First Name", required: true },
    { name: "last_name", label: "Last Name", required: true },
    { name: "email", label: "Email", type: "email", required: true },
    { name: "password", label: "Password", type: "password", required: true },
    { name: "phone", label: "Phone" },
    { name: "salary", label: "Salary (₹)", type: "number", required: true },
    { name: "date_of_birth", label: "Date of Birth", type: "date", required: true },
    { name: "joining_date", label: "Joining Date", type: "date", required: true },
    {
      name: "qualification",
      label: "Qualification",
      required: true,
      placeholder: "Enter qualification",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEdit ? `Edit ${role}` : `Add ${role}`}
          </h2>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="text-2xl text-gray-500 hover:text-gray-900"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          {error && (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 break-words"
            >
              {error}
            </div>
          )}

          {!isEdit && (
            <>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-600">
                Staff Information
              </h3>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {staffFields.map((field) => (
                  <div key={field.name}>
                    <label
                      htmlFor={`role-${field.name}`}
                      className={labelClass}
                    >
                      {field.label}
                      {field.required ? " *" : ""}
                    </label>

                    <input
                      id={`role-${field.name}`}
                      name={field.name}
                      type={field.type || "text"}
                      value={form[field.name]}
                      onChange={handleChange}
                      required={field.required}
                      placeholder={field.placeholder || ""}
                      min={field.type === "number" ? "0" : undefined}
                      className={inputClass}
                    />
                  </div>
                ))}
              </div>

              <div>
                <label htmlFor="role-address" className={labelClass}>
                  Address
                </label>

                <textarea
                  id="role-address"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  rows={2}
                  className={inputClass}
                />
              </div>
            </>
          )}

          {isEdit && (
            <p className="rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-600">
              To change employee details such as name, phone, salary,
              qualification or password, use Staff Management.
            </p>
          )}

          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-600">
            {role} Details
          </h3>

          {extraFields.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {extraFields.map((field) => (
                <div key={field.name}>
                  <label
                    htmlFor={`extra-${field.name}`}
                    className={labelClass}
                  >
                    {field.label}
                  </label>

                  <input
                    id={`extra-${field.name}`}
                    name={field.name}
                    type={field.type || "text"}
                    value={form[field.name] ?? ""}
                    onChange={handleChange}
                    required={Boolean(field.required)}
                    placeholder={field.placeholder || ""}
                    className={inputClass}
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              No additional role-specific information is required.
            </p>
          )}

          <div className="flex flex-col-reverse justify-end gap-3 border-t pt-4 sm:flex-row">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-lg border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading
                ? "Saving..."
                : isEdit
                  ? "Save Changes"
                  : `Create ${role}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RoleModal;
// // import React, { useState, useEffect } from "react";
// // import API from "../../../api";

// // const today = new Date().toISOString().split("T")[0];
// // const formatDate = (d) => (d ? new Date(d).toISOString().split("T")[0] : "");

// // // ✨ GLASS INPUT STYLE
// // const inputCls =
// //   "w-full bg-white/70 backdrop-blur-md border border-white/40 rounded-lg px-3 py-2 text-sm text-[#1E293B] placeholder-gray-500 focus:outline-none focus:border-[#D4AF37] transition";

// // // ✨ FIELD WRAPPER
// // const Field = ({ label, children }) => (
// //   <div>
// //     <label className="block text-xs font-semibold text-[#1B4360] mb-1">
// //       {label}
// //     </label>
// //     {children}
// //   </div>
// // );

// // const RoleModal = ({ record, onClose, onSaved, roleConfig }) => {
// //   const { role, endpoint, idKey, extraFields = [] } = roleConfig;
// //   const isEdit = !!record;

// //   const extraDefaults = {};
// //   extraFields.forEach((f) => {
// //     extraDefaults[f.name] = f.default ?? "";
// //   });

// //   const [form, setForm] = useState({
// //     first_name: "",
// //     last_name: "",
// //     email: "",
// //     password: "",
// //     phone: "",
// //     salary: 10000,
// //     date_of_birth: "",
// //     joining_date: today,
// //     ...extraDefaults,
// //   });

// //   const [loading, setLoading] = useState(false);
// //   const [serverError, setServerError] = useState("");

// //   useEffect(() => {
// //     if (record) {
// //       const s = record.staff || {};
// //       const extra = {};
// //       extraFields.forEach((f) => {
// //         extra[f.name] = record[f.name] ?? f.default ?? "";
// //       });

// //       setForm({
// //         first_name: s.user?.first_name || "",
// //         last_name: s.user?.last_name || "",
// //         email: s.user?.email || "",
// //         password: "",
// //         phone: s.phone || "",
// //         salary: s.salary || 10000,
// //         date_of_birth: formatDate(s.date_of_birth),
// //         joining_date: formatDate(s.joining_date) || today,
// //         ...extra,
// //       });
// //     }
// //   }, [record]);

// //   const set = (name, value) =>
// //     setForm((p) => ({ ...p, [name]: value }));

// //   const buildPayload = () => {
// //     const extra = {};
// //     extraFields.forEach((f) => {
// //       extra[f.name] = form[f.name];
// //     });

// //     return {
// //       staff: {
// //         user: {
// //           first_name: form.first_name,
// //           last_name: form.last_name,
// //           email: form.email,
// //           ...(form.password ? { password: form.password } : {}),
// //         },
// //         role,
// //         phone: form.phone,
// //         salary: Number(form.salary),
// //         date_of_birth: form.date_of_birth || null,
// //         joining_date: form.joining_date || null,
// //       },
// //       ...extra,
// //     };
// //   };

// //   const handleSubmit = async (e) => {
// //     e.preventDefault();
// //     setLoading(true);
// //     setServerError("");

// //     try {
// //       const payload = buildPayload();

// //       if (isEdit) {
// //         await API.put(`${endpoint}${record[idKey]}/`, payload);
// //       } else {
// //         await API.post(endpoint, payload);
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
// //     <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-md flex items-center justify-center p-4">
// //       <div className="bg-white/70 backdrop-blur-xl border border-white/40 shadow-2xl rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

// //         {/* HEADER */}
// //         <div className="flex items-center justify-between px-6 py-5 border-b border-white/40">
// //           <div>
// //             <h2 className="text-lg font-bold text-[#1B4360]">
// //               {isEdit ? `Edit ${role}` : `Add New ${role}`}
// //             </h2>
// //             <p className="text-xs text-gray-500 mt-1">
// //               Role is fixed as {role}
// //             </p>
// //           </div>

// //           <button onClick={onClose} className="text-gray-500 hover:text-black">
// //             ✕
// //           </button>
// //         </div>

// //         {/* BODY */}
// //         <form onSubmit={handleSubmit} className="p-6 space-y-5">
// //           {serverError && (
// //             <div className="bg-red-100 border border-red-300 text-red-600 text-sm px-4 py-3 rounded-lg">
// //               {serverError}
// //             </div>
// //           )}

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
// //             <Field label="Date of Birth *">
// //               <input className={inputCls} type="date" value={form.date_of_birth} onChange={(e) => set("date_of_birth", e.target.value)} max={today} required />
// //             </Field>
// //             <Field label="Joining Date">
// //               <input className={inputCls} type="date" value={form.joining_date} onChange={(e) => set("joining_date", e.target.value)} max={today} />
// //             </Field>
// //           </div>

// //           {/* EXTRA FIELDS */}
// //           {extraFields.length > 0 && (
// //             <>
// //               <p className="text-xs text-[#1B4360] font-bold uppercase pt-2">
// //                 {role} Details
// //               </p>

// //               {extraFields.map((f) => (
// //                 <Field key={f.name} label={f.label}>
// //                   <input
// //                     className={inputCls}
// //                     type={f.type || "text"}
// //                     value={form[f.name]}
// //                     onChange={(e) => set(f.name, e.target.value)}
// //                   />
// //                 </Field>
// //               ))}
// //             </>
// //           )}

// //           {/* ACTIONS */}
// //           <div className="flex justify-end gap-3 pt-4">
// //             <button
// //               type="button"
// //               onClick={onClose}
// //               className="px-4 py-2 text-sm text-gray-600 hover:text-black"
// //             >
// //               Cancel
// //             </button>

// //             <button
// //               type="submit"
// //               disabled={loading}
// //               className="px-6 py-2 rounded-lg bg-[#D4AF37] text-[#1E293B] font-semibold hover:bg-[#F1D279] transition"
// //             >
// //               {loading ? "Saving..." : isEdit ? `Update ${role}` : `Create ${role}`}
// //             </button>
// //           </div>
// //         </form>
// //       </div>
// //     </div>
// //   );
// // };

// // export default RoleModal;

// import React, { useState, useEffect } from "react";
// import API from "../../../api";

// const today = new Date().toISOString().split("T")[0];
// const formatDate = (d) => (d ? new Date(d).toISOString().split("T")[0] : "");

// // ✨ CLEAN INPUT STYLE (NO GLASS)
// const inputCls =
//   "w-full border border-gray-300 rounded-lg px-4 py-3 text-base text-[#1E293B] placeholder-gray-400 focus:outline-none focus:border-[#1B4360]";

// // ✨ FIELD
// const Field = ({ label, children }) => (
//   <div>
//     <label className="block text-sm font-medium text-[#1B4360] mb-1">
//       {label}
//     </label>
//     {children}
//   </div>
// );

// const RoleModal = ({ record, onClose, onSaved, roleConfig }) => {
//   const { role, endpoint, idKey, extraFields = [] } = roleConfig;
//   const isEdit = !!record;

//   const extraDefaults = {};
//   extraFields.forEach((f) => {
//     extraDefaults[f.name] = f.default ?? "";
//   });

//   const [form, setForm] = useState({
//     first_name: "",
//     last_name: "",
//     email: "",
//     password: "",
//     phone: "",
//     salary: 10000,
//     date_of_birth: "",
//     joining_date: today,
//     ...extraDefaults,
//   });

//   const [loading, setLoading] = useState(false);
//   const [serverError, setServerError] = useState("");

//   useEffect(() => {
//     if (record) {
//       const s = record.staff || {};
//       const extra = {};
//       extraFields.forEach((f) => {
//         extra[f.name] = record[f.name] ?? f.default ?? "";
//       });

//       setForm({
//         first_name: s.user?.first_name || "",
//         last_name: s.user?.last_name || "",
//         email: s.user?.email || "",
//         password: "",
//         phone: s.phone || "",
//         salary: s.salary || 10000,
//         date_of_birth: formatDate(s.date_of_birth),
//         joining_date: formatDate(s.joining_date) || today,
//         ...extra,
//       });
//     }
//   }, [record]);

//   const set = (name, value) =>
//     setForm((p) => ({ ...p, [name]: value }));

//   const buildPayload = () => {
//     const extra = {};
//     extraFields.forEach((f) => {
//       extra[f.name] = form[f.name];
//     });

//     return {
//       staff: {
//         user: {
//           first_name: form.first_name,
//           last_name: form.last_name,
//           email: form.email,
//           ...(form.password ? { password: form.password } : {}),
//         },
//         role,
//         phone: form.phone,
//         salary: Number(form.salary),
//         date_of_birth: form.date_of_birth || null,
//         joining_date: form.joining_date || null,
//       },
//       ...extra,
//     };
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setServerError("");

//     try {
//       const payload = buildPayload();

//       if (isEdit) {
//         await API.put(`${endpoint}${record[idKey]}/`, payload);
//       } else {
//         await API.post(endpoint, payload);
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
//     <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">

//       {/* MODAL BOX */}
//       <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

//         {/* HEADER */}
//         <div className="flex items-center justify-between px-6 py-5 border-b">
//           <div>
//             <h2 className="text-xl font-bold text-[#1B4360]">
//               {isEdit ? `Edit ${role}` : `Add New ${role}`}
//             </h2>
//             <p className="text-sm text-gray-500">
//               Role: <span className="font-semibold">{role}</span>
//             </p>
//           </div>

//           <button
//             onClick={onClose}
//             className="text-gray-500 text-xl hover:text-black"
//           >
//             ✕
//           </button>
//         </div>

//         {/* FORM */}
//         <form onSubmit={handleSubmit} className="p-6 space-y-5 text-base">

//           {serverError && (
//             <div className="bg-red-100 border border-red-300 text-red-600 px-4 py-3 rounded-lg text-sm">
//               {serverError}
//             </div>
//           )}

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

//           <div className="grid grid-cols-2 gap-4">
//             <Field label="Date of Birth">
//               <input className={inputCls} type="date" value={form.date_of_birth} onChange={(e) => set("date_of_birth", e.target.value)} />
//             </Field>

//             <Field label="Joining Date">
//               <input className={inputCls} type="date" value={form.joining_date} onChange={(e) => set("joining_date", e.target.value)} />
//             </Field>
//           </div>

//           {/* EXTRA FIELDS */}
//           {extraFields.length > 0 && (
//             <>
//               <p className="text-sm font-semibold text-[#1B4360] pt-2">
//                 {role} Details
//               </p>

//               {extraFields.map((f) => (
//                 <Field key={f.name} label={f.label}>
//                   <input
//                     className={inputCls}
//                     type={f.type || "text"}
//                     value={form[f.name]}
//                     onChange={(e) => set(f.name, e.target.value)}
//                   />
//                 </Field>
//               ))}
//             </>
//           )}

//           {/* BUTTONS */}
//           <div className="flex justify-end gap-3 pt-4">
//             <button
//               type="button"
//               onClick={onClose}
//               className="px-5 py-2 text-gray-600 hover:text-black text-base"
//             >
//               Cancel
//             </button>

//             <button
//               type="submit"
//               disabled={loading}
//               className="px-6 py-2 bg-[#1B4360] text-white rounded-lg text-base font-semibold hover:bg-[#16324a] transition"
//             >
//               {loading ? "Saving..." : isEdit ? `Update ${role}` : `Create ${role}`}
//             </button>
//           </div>

//         </form>
//       </div>
//     </div>
//   );
// };

// export default RoleModal;