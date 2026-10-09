import React from "react";
import { useNavigate, useParams } from "react-router-dom";

import ConsultationForm from "../components/consultationpage/ConsultationForm";
import { createConsultation } from "../api/doctorApi";

const CreateConsultationPage = () => {
  const navigate = useNavigate();
  const { appointmentId } = useParams();

  const handleSubmit = async (formData) => {
    try {
      const payload = {
        appointment: appointmentId,
        ...formData,
      };

      await createConsultation(payload);

      alert("Consultation Added ✅");

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
          Create Consultation
        </h1>

        <button
          type="button"
          onClick={() => navigate(-1)}
          className="shrink-0 px-3 py-2 text-sm bg-white/10 hover:bg-white/20 rounded-md transition"
        >
          ← Back
        </button>

      </div>

      {/* CONSULTATION FORM */}
      <div className="w-full min-w-0 max-w-5xl mx-auto bg-[#1e293b] border border-white/10 rounded-xl overflow-hidden">

        <ConsultationForm
          onSubmit={handleSubmit}
          onClose={() => navigate(-1)}
        />

      </div>

    </div>
  );
};

export default CreateConsultationPage;