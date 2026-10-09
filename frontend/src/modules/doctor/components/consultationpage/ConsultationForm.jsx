import React, { useState } from "react";

const ConsultationForm = ({ onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    symptoms: "",
    diagnosis: "",
    advice: "",
  });

  // Vitals
  const [vitals, setVitals] = useState({
    bp: "",
    pulse: "",
    temperature: "",
    spo2: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });

    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  // Validation
  const validateForm = () => {
    const { symptoms, diagnosis } = formData;
    const { bp, pulse, temperature, spo2 } = vitals;

    const textOnlyRegex = /^[A-Za-z\s.,-]+$/;
    let newErrors = {};

    if (!symptoms.trim() || symptoms.length < 5)
      newErrors.symptoms = "Symptoms must be at least 5 characters";
    else if (!textOnlyRegex.test(symptoms))
      newErrors.symptoms = "Symptoms should not contain numbers";

    if (!diagnosis.trim() || diagnosis.length < 3)
      newErrors.diagnosis = "Diagnosis must be at least 3 characters";
    else if (!textOnlyRegex.test(diagnosis))
      newErrors.diagnosis = "Diagnosis should not contain numbers";

    // BP validation
    if (!bp) {
      newErrors.bp = "BP is required";
    } else {
      const bpRegex = /^\d{2,3}\/\d{2,3}$/;

      if (!bpRegex.test(bp)) {
        newErrors.bp = "BP must be in format 120/80";
      } else {
        const [sys, dia] = bp.split("/").map(Number);

        if (sys < 70 || sys > 200)
          newErrors.bp = "Systolic BP must be between 70–200";
        else if (dia < 40 || dia > 120)
          newErrors.bp = "Diastolic BP must be between 40–120";
      }
    }

    // Other vitals
    const pul = Number(pulse);
    const temp = Number(temperature);
    const sp = Number(spo2);

    if (!pul || pul < 40 || pul > 180)
      newErrors.pulse = "Pulse must be between 40–180 bpm";

    if (!temp || temp < 90 || temp > 110)
      newErrors.temperature = "Temperature must be between 90–110 °F";

    if (!sp || sp < 50 || sp > 100)
      newErrors.spo2 = "SpO2 must be between 50–100%";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    const vitalsString =
      `BP: ${vitals.bp} mmHg | ` +
      `Pulse: ${vitals.pulse} bpm | ` +
      `Temperature: ${vitals.temperature} °F | ` +
      `SpO2: ${vitals.spo2}%`;

    onSubmit({
      ...formData,
      vitals: vitalsString,
    });
  };

  return (
    <div className="w-full min-w-0 max-w-full flex flex-col gap-4 p-3 sm:p-4 md:p-5 text-white">

      {/* Title */}
      <h3 className="text-lg sm:text-xl font-semibold break-words">
        Add Consultation
      </h3>

      {/* Symptoms */}
      <div className="flex flex-col gap-1 min-w-0">
        <label className="text-sm font-medium text-gray-300">
          Symptoms
        </label>

        <textarea
          placeholder="Symptoms"
          rows={3}
          className="w-full min-w-0 bg-gray-700 p-3 rounded-md text-base sm:text-sm resize-y outline-none focus:ring-2 focus:ring-blue-500"
          onChange={(e) =>
            handleChange("symptoms", e.target.value)
          }
        />

        {errors.symptoms && (
          <p className="text-red-400 text-xs break-words">
            {errors.symptoms}
          </p>
        )}
      </div>

      {/* Diagnosis */}
      <div className="flex flex-col gap-1 min-w-0">
        <label className="text-sm font-medium text-gray-300">
          Diagnosis
        </label>

        <textarea
          placeholder="Diagnosis"
          rows={3}
          className="w-full min-w-0 bg-gray-700 p-3 rounded-md text-base sm:text-sm resize-y outline-none focus:ring-2 focus:ring-blue-500"
          onChange={(e) =>
            handleChange("diagnosis", e.target.value)
          }
        />

        {errors.diagnosis && (
          <p className="text-red-400 text-xs break-words">
            {errors.diagnosis}
          </p>
        )}
      </div>

      {/* Vitals */}
      <div className="w-full min-w-0 bg-gray-800 p-3 sm:p-4 rounded-lg flex flex-col gap-3">

        <p className="text-sm font-semibold text-gray-300">
          Vitals
        </p>

        {/* Responsive vitals grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 min-w-0">

          {/* BP */}
          <div className="flex flex-col gap-1 min-w-0">
            <label className="text-xs text-gray-400">
              BP (mmHg)
            </label>

            <input
              type="text"
              placeholder="e.g. 120/80"
              className="w-full min-w-0 bg-gray-700 p-3 rounded-md text-base sm:text-sm outline-none focus:ring-2 focus:ring-blue-500"
              value={vitals.bp}
              onChange={(e) => {
                setVitals({ ...vitals, bp: e.target.value });

                if (errors.bp)
                  setErrors({ ...errors, bp: null });
              }}
            />

            {errors.bp && (
              <p className="text-red-400 text-xs break-words">
                {errors.bp}
              </p>
            )}
          </div>

          {/* Pulse */}
          <div className="flex flex-col gap-1 min-w-0">
            <label className="text-xs text-gray-400">
              Pulse (bpm)
            </label>

            <input
              type="number"
              placeholder="Pulse"
              className="w-full min-w-0 bg-gray-700 p-3 rounded-md text-base sm:text-sm outline-none focus:ring-2 focus:ring-blue-500"
              value={vitals.pulse}
              onChange={(e) => {
                setVitals({
                  ...vitals,
                  pulse: e.target.value,
                });

                if (errors.pulse)
                  setErrors({ ...errors, pulse: null });
              }}
            />

            {errors.pulse && (
              <p className="text-red-400 text-xs break-words">
                {errors.pulse}
              </p>
            )}
          </div>

          {/* Temperature */}
          <div className="flex flex-col gap-1 min-w-0">
            <label className="text-xs text-gray-400">
              Temperature (°F)
            </label>

            <input
              type="number"
              placeholder="Temperature"
              className="w-full min-w-0 bg-gray-700 p-3 rounded-md text-base sm:text-sm outline-none focus:ring-2 focus:ring-blue-500"
              value={vitals.temperature}
              onChange={(e) => {
                setVitals({
                  ...vitals,
                  temperature: e.target.value,
                });

                if (errors.temperature)
                  setErrors({
                    ...errors,
                    temperature: null,
                  });
              }}
            />

            {errors.temperature && (
              <p className="text-red-400 text-xs break-words">
                {errors.temperature}
              </p>
            )}
          </div>

          {/* SpO2 */}
          <div className="flex flex-col gap-1 min-w-0">
            <label className="text-xs text-gray-400">
              SpO2 (%)
            </label>

            <input
              type="number"
              placeholder="SpO2"
              className="w-full min-w-0 bg-gray-700 p-3 rounded-md text-base sm:text-sm outline-none focus:ring-2 focus:ring-blue-500"
              value={vitals.spo2}
              onChange={(e) => {
                setVitals({
                  ...vitals,
                  spo2: e.target.value,
                });

                if (errors.spo2)
                  setErrors({ ...errors, spo2: null });
              }}
            />

            {errors.spo2 && (
              <p className="text-red-400 text-xs break-words">
                {errors.spo2}
              </p>
            )}
          </div>

        </div>
      </div>

      {/* Advice */}
      <div className="flex flex-col gap-1 min-w-0">
        <label className="text-sm font-medium text-gray-300">
          Advice
        </label>

        <textarea
          placeholder="Advice"
          rows={3}
          className="w-full min-w-0 bg-gray-700 p-3 rounded-md text-base sm:text-sm resize-y outline-none focus:ring-2 focus:ring-blue-500"
          onChange={(e) =>
            handleChange("advice", e.target.value)
          }
        />
      </div>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 mt-2">

        <button
          type="button"
          onClick={handleSubmit}
          className="w-full sm:flex-1 bg-green-500 hover:bg-green-600 py-3 px-4 rounded-md font-medium transition"
        >
          Submit
        </button>

        <button
          type="button"
          onClick={onClose}
          className="w-full sm:flex-1 bg-gray-500 hover:bg-gray-600 py-3 px-4 rounded-md font-medium transition"
        >
          Cancel
        </button>

      </div>

    </div>
  );
};

export default ConsultationForm;