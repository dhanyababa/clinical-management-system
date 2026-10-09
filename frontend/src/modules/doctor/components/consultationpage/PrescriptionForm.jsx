import React, { useEffect, useState } from "react";
import API from "../../../api";

const PrescriptionForm = ({ onSubmit, onClose }) => {
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

  // Fetch medicines from backend
  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        const res = await API.get("/api/doctor/medicines/");
        setMedicinesList(res.data);
      } catch (err) {
        console.error("Failed to load medicines");
      }
    };

    fetchMedicines();
  }, []);

  // Handle input change
  const handleChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  // Add new medicine
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

  // Remove medicine
  const removeRow = (index) => {
    const updated = items.filter((_, i) => i !== index);
    setItems(updated);
  };

  // Submit prescription
  const handleSubmit = () => {
    const valid = items.every(
      (item) =>
        item.medicine_name &&
        item.dosage &&
        item.frequency &&
        item.duration
    );

    if (!valid) {
      alert("Please fill all required fields");
      return;
    }

    const formattedItems = items.map((item) => ({
      ...item,
      medicine_name: Number(item.medicine_name),
    }));

    onSubmit(formattedItems);
  };

  return (
    <div className="w-full min-w-0 max-w-full bg-[#1e293b] border border-white/10 rounded-xl p-3 sm:p-4 lg:p-5 text-white mt-4">

      {/* Title */}
      <h2 className="text-lg sm:text-xl font-semibold mb-4 break-words">
        💊 Create Prescription
      </h2>

      {/* Medicine List */}
      <div className="space-y-4 max-h-[60vh] lg:max-h-[400px] overflow-y-auto overflow-x-hidden pr-1 sm:pr-2 min-w-0">

        {items.map((item, index) => (
          <div
            key={index}
            className="w-full min-w-0 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3 bg-[#334155] p-3 sm:p-4 rounded-lg"
          >

            {/* Medicine */}
            <div className="flex flex-col gap-1 min-w-0">
              <label className="text-xs text-gray-300">
                Medicine
              </label>

              <select
                className="w-full min-w-0 bg-[#1e293b] p-3 rounded-md text-base sm:text-sm outline-none focus:ring-2 focus:ring-blue-500"
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
            </div>

            {/* Dosage */}
            <div className="flex flex-col gap-1 min-w-0">
              <label className="text-xs text-gray-300">
                Dosage
              </label>

              <input
                type="text"
                placeholder="Dosage"
                className="w-full min-w-0 bg-[#1e293b] p-3 rounded-md text-base sm:text-sm outline-none focus:ring-2 focus:ring-blue-500"
                value={item.dosage}
                onChange={(e) =>
                  handleChange(
                    index,
                    "dosage",
                    e.target.value
                  )
                }
              />
            </div>

            {/* Frequency */}
            <div className="flex flex-col gap-1 min-w-0">
              <label className="text-xs text-gray-300">
                Frequency
              </label>

              <input
                type="text"
                placeholder="Frequency"
                className="w-full min-w-0 bg-[#1e293b] p-3 rounded-md text-base sm:text-sm outline-none focus:ring-2 focus:ring-blue-500"
                value={item.frequency}
                onChange={(e) =>
                  handleChange(
                    index,
                    "frequency",
                    e.target.value
                  )
                }
              />
            </div>

            {/* Duration */}
            <div className="flex flex-col gap-1 min-w-0">
              <label className="text-xs text-gray-300">
                Duration (Days)
              </label>

              <input
                type="number"
                placeholder="Days"
                className="w-full min-w-0 bg-[#1e293b] p-3 rounded-md text-base sm:text-sm outline-none focus:ring-2 focus:ring-blue-500"
                value={item.duration}
                onChange={(e) =>
                  handleChange(
                    index,
                    "duration",
                    e.target.value
                  )
                }
              />
            </div>

            {/* Instructions */}
            <div className="flex flex-col gap-1 min-w-0">
              <label className="text-xs text-gray-300">
                Instructions
              </label>

              <input
                type="text"
                placeholder="Instructions"
                className="w-full min-w-0 bg-[#1e293b] p-3 rounded-md text-base sm:text-sm outline-none focus:ring-2 focus:ring-blue-500"
                value={item.instructions}
                onChange={(e) =>
                  handleChange(
                    index,
                    "instructions",
                    e.target.value
                  )
                }
              />
            </div>

            {/* Remove Medicine */}
            <div className="col-span-full flex justify-end">
              <button
                type="button"
                onClick={() => removeRow(index)}
                className="text-red-400 hover:text-red-300 text-sm font-medium px-2 py-2 transition"
              >
                Remove
              </button>
            </div>

          </div>
        ))}

      </div>

      {/* Bottom Buttons */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mt-4">

        {/* Add Medicine */}
        <button
          type="button"
          onClick={addRow}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 px-4 py-3 rounded-md font-medium transition"
        >
          + Add Medicine
        </button>

        {/* Cancel and Save */}
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">

          <button
            type="button"
            onClick={onClose}
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

export default PrescriptionForm;