import React from "react";
import { useNavigate, useParams } from "react-router-dom";

import LabRequestForm from "../components/consultationpage/LabRequestForm";
import { createLabRequest } from "../api/doctorApi";
import { useAuth } from "../../../context/AuthContext";

const CreateLabRequestPage = () => {
  const navigate = useNavigate();
  const { appointmentId } = useParams();
  const { user } = useAuth();

  // Consultation ID from localStorage
  const consultationId = Number(
    localStorage.getItem("consultationId")
  );

  // Doctor ID from AuthContext
  const doctorId = user?.doctor_id;

  const handleSubmit = async (data) => {
    try {
      // Safety checks
      if (!consultationId) {
        alert("Consultation ID missing. Go back and try again.");
        return;
      }

      if (!doctorId) {
        alert("Doctor ID missing. Please login again.");
        return;
      }

      const payload = {
        consultation: consultationId,
        doctor: doctorId,
        ...data,
      };

      console.log("Final Payload:", payload);

      await createLabRequest(payload);

      alert("Lab Request Created ✅");

      navigate(`/doctor/consultation/${appointmentId}`);
    } catch (err) {
      alert(err);
    }
  };

  return (
    <div className="w-full min-w-0 min-h-screen bg-gradient-to-br from-[#020617] via-[#020617] to-[#0f172a] p-3 sm:p-4 lg:p-5 text-white">

      {/* TITLE + BACK BUTTON */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 sm:mb-5">

        <h1 className="text-lg sm:text-xl md:text-2xl font-semibold break-words">
          Lab Request
        </h1>

        <button
          type="button"
          onClick={() => navigate(-1)}
          className="shrink-0 px-3 py-2 text-sm bg-white/10 hover:bg-white/20 rounded-md transition"
        >
          ← Back
        </button>

      </div>

      {/* LAB REQUEST FORM */}
      <div className="w-full min-w-0 max-w-5xl mx-auto bg-[#1e293b] border border-white/10 rounded-xl overflow-hidden">

        <LabRequestForm
          onSubmit={handleSubmit}
          onClose={() => navigate(-1)}
        />

      </div>

    </div>
  );
};

export default CreateLabRequestPage;