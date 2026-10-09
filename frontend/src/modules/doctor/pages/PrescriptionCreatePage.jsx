import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { createPrescription } from "../api/doctorApi";
import { useAuth } from "../../../context/AuthContext";
import API from "../../../api";

const PrescriptionCreatePage = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [consultationId, setConsultationId] = useState(null);
  const [medicinesList, setMedicinesList] = useState([]);

  const [items, setItems] = useState([
    {
      medicine_name: "",
      dosage: "",
      frequency: "",
      duration: "",
      instructions: "",
    },
  ]);

  const [errors, setErrors] = useState([]);

  useEffect(() => {
    const id = localStorage.getItem("consultationId");
    if (id) setConsultationId(id);
  }, []);

  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        const res = await API.get("/api/doctor/medicines/");
        setMedicinesList(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Failed to fetch medicines");
      }
    };

    fetchMedicines();
  }, []);

  const handleChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);

    if (errors[index] && errors[index][field]) {
      const updatedErrors = [...errors];
      updatedErrors[index] = {
        ...updatedErrors[index],
        [field]: null,
      };
      setErrors(updatedErrors);
    }
  };

  const addRow = () => {
    setItems([
      ...items,
      {
        medicine_name: "",
        dosage: "",
        frequency: "",
        duration: "",
        instructions: "",
      },
    ]);
  };

  const removeRow = (index) => {
    const updated = items.filter((_, i) => i !== index);
    setItems(updated);

    const updatedErrors = errors.filter((_, i) => i !== index);
    setErrors(updatedErrors);
  };

  const handleSubmit = async () => {
    try {
      let hasError = false;

      const newErrors = items.map((item) => {
        let errs = {};

        if (!item.medicine_name) {
          errs.medicine_name = "Select medicine";
          hasError = true;
        }

        if (!item.dosage.trim()) {
          errs.dosage = "Enter dosage";
          hasError = true;
        } else {
          const dosageRegex = /^[0-9]+(mg|ml|tablet)$/i;

          if (!dosageRegex.test(item.dosage.replace(/\s/g, ""))) {
            errs.dosage = "Must be like 500mg / 5ml / 1tablet";
            hasError = true;
          }
        }

        if (!["1", "2", "3"].includes(item.frequency)) {
          errs.frequency = "Select frequency 1, 2 or 3";
          hasError = true;
        }

        if (!item.duration || item.duration <= 0) {
          errs.duration = "Enter valid number of days";
          hasError = true;
        }

        return errs;
      });

      if (hasError) {
        setErrors(newErrors);
        return;
      }

      setErrors([]);

      const formattedItems = items.map((item) => ({
        medicine_name: parseInt(item.medicine_name, 10),
        dosage: item.dosage,
        frequency:
          item.frequency === "1"
            ? "1 time/day"
            : `${item.frequency} times/day`,
        duration: parseInt(item.duration, 10),
        instructions: item.instructions,
      }));

      const payload = {
        consultation: consultationId,
        doctor: user.doctor_id,
        items: formattedItems,
      };

      await createPrescription(payload);

      alert("Prescription created successfully");
      navigate(`/doctor/consultation/${appointmentId}`);

    } catch (err) {
      alert(err);
    }
  };

  return (
    <div className="w-full min-w-0 min-h-screen bg-gradient-to-br from-[#020617] via-[#020617] to-[#0f172a] text-white p-3 sm:p-4 lg:p-5">

      {/* TITLE + BACK BUTTON */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">

        <h2 className="text-lg sm:text-xl font-semibold break-words">
          💊 Create Prescription
        </h2>

        <button
          type="button"
          onClick={() => navigate(-1)}
          className="shrink-0 px-3 py-2 text-sm bg-white/10 hover:bg-white/20 rounded-md transition"
        >
          ← Back
        </button>

      </div>

      {/* MEDICINE ROWS */}
      <div className="space-y-4 min-w-0">

        {items.map((item, index) => (
          <div
            key={index}
            className="w-full min-w-0 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3 lg:gap-4 bg-[#1e293b] p-3 sm:p-4 rounded-lg relative"
          >

            {/* MEDICINE */}
            <div className="flex flex-col gap-1 min-w-0">

              <label className="text-xs text-gray-400">
                Medicine
              </label>

              <select
                className="w-full min-w-0 bg-[#020617] p-3 rounded-md text-base sm:text-sm outline-none focus:ring-2 focus:ring-blue-500"
                value={item.medicine_name}
                onChange={(e) =>
                  handleChange(
                    index,
                    "medicine_name",
                    e.target.value
                  )
                }
              >
                <option value="">Select Medicine</option>

                {medicinesList.map((med, idx) => {
                  const medId = med.medicine_id || med.id;

                  return (
                    <option key={medId || idx} value={medId}>
                      {med.name}
                    </option>
                  );
                })}
              </select>

              {errors[index]?.medicine_name && (
                <span className="text-red-400 text-xs break-words">
                  {errors[index].medicine_name}
                </span>
              )}

            </div>

            {/* DOSAGE */}
            <div className="flex flex-col gap-1 min-w-0">

              <label className="text-xs text-gray-400">
                Dosage
              </label>

              <input
                type="text"
                placeholder="500mg / 5ml / 1tablet"
                className="w-full min-w-0 bg-[#020617] p-3 rounded-md text-base sm:text-sm outline-none focus:ring-2 focus:ring-blue-500"
                value={item.dosage}
                onChange={(e) =>
                  handleChange(index, "dosage", e.target.value)
                }
              />

              {errors[index]?.dosage && (
                <span className="text-red-400 text-xs break-words">
                  {errors[index].dosage}
                </span>
              )}

            </div>

            {/* FREQUENCY */}
            <div className="flex flex-col gap-1 min-w-0">

              <label className="text-xs text-gray-400">
                Frequency
              </label>

              <select
                className="w-full min-w-0 bg-[#020617] p-3 rounded-md text-base sm:text-sm outline-none focus:ring-2 focus:ring-blue-500"
                value={item.frequency}
                onChange={(e) =>
                  handleChange(index, "frequency", e.target.value)
                }
              >
                <option value="">Frequency</option>
                <option value="1">1 time/day</option>
                <option value="2">2 times/day</option>
                <option value="3">3 times/day</option>
              </select>

              {errors[index]?.frequency && (
                <span className="text-red-400 text-xs break-words">
                  {errors[index].frequency}
                </span>
              )}

            </div>

            {/* DURATION */}
            <div className="flex flex-col gap-1 min-w-0">

              <label className="text-xs text-gray-400">
                Duration (Days)
              </label>

              <input
                type="number"
                placeholder="Days"
                className="w-full min-w-0 bg-[#020617] p-3 rounded-md text-base sm:text-sm outline-none focus:ring-2 focus:ring-blue-500"
                value={item.duration}
                onChange={(e) =>
                  handleChange(index, "duration", e.target.value)
                }
              />

              {errors[index]?.duration && (
                <span className="text-red-400 text-xs break-words">
                  {errors[index].duration}
                </span>
              )}

            </div>

            {/* INSTRUCTIONS */}
            <div className="flex flex-col gap-1 min-w-0">

              <label className="text-xs text-gray-400">
                Instructions (Optional)
              </label>

              <input
                type="text"
                placeholder="Instructions"
                className="w-full min-w-0 bg-[#020617] p-3 rounded-md text-base sm:text-sm outline-none focus:ring-2 focus:ring-blue-500"
                value={item.instructions}
                onChange={(e) =>
                  handleChange(index, "instructions", e.target.value)
                }
              />

            </div>

            {/* REMOVE */}
            <div className="col-span-full flex justify-end">
              <button
                type="button"
                onClick={() => removeRow(index)}
                className="text-red-400 hover:text-red-300 text-sm px-2 py-2 transition"
              >
                Remove
              </button>
            </div>

          </div>
        ))}

      </div>

      {/* BOTTOM ACTION BUTTONS */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-5">

        <button
          type="button"
          onClick={addRow}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 px-4 py-3 rounded-md font-medium transition"
        >
          + Add Medicine
        </button>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto bg-gray-500 hover:bg-gray-600 px-5 py-3 rounded-md font-medium transition"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            className="w-full sm:w-auto bg-green-600 hover:bg-green-700 px-5 py-3 rounded-md font-medium transition"
          >
            Save
          </button>

        </div>

      </div>

    </div>
  );
};

export default PrescriptionCreatePage;