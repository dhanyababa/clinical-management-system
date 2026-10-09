import React from "react";
import { FaUser, FaPhone, FaClock } from "react-icons/fa";

const PatientInfoCard = ({ patient, appointment }) => {
  if (!patient || !appointment) return null;

  return (
    <div className="w-full min-w-0 h-full flex flex-col bg-[#1e293b] border border-white/10 rounded-xl p-3 sm:p-4 lg:p-5 text-white">

      {/* Title */}
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <FaUser className="text-blue-400" />
        Patient Info
      </h2>

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col text-sm sm:text-base">

        <div className="flex flex-col gap-3">

          {/* Name */}
          <div className="flex justify-between gap-3 min-w-0">
            <span className="text-gray-400 shrink-0">Name</span>

            <span className="font-medium text-right break-words min-w-0">
              {patient.first_name} {patient.last_name}
            </span>
          </div>

          {/* Gender / Age */}
          <div className="flex justify-between gap-3 min-w-0">
            <span className="text-gray-400 shrink-0">
              Gender / Age
            </span>

            <span className="text-right min-w-0 break-words">
              {patient.gender} / {patient.age}
            </span>
          </div>

          {/* Phone */}
          <div className="flex justify-between items-center gap-3 min-w-0">
            <span className="text-gray-400 flex items-center gap-1 shrink-0">
              <FaPhone className="text-xs opacity-70" />
              Phone
            </span>

            <span className="text-right break-all min-w-0">
              {patient.phone}
            </span>
          </div>

          {/* Blood */}
          <div className="flex justify-between gap-3 min-w-0">
            <span className="text-gray-400 shrink-0">Blood</span>

            <span className="text-right">
              {patient.blood_group || "N/A"}
            </span>
          </div>

          {/* Token */}
          <div className="flex justify-between gap-3 min-w-0">
            <span className="text-gray-400 shrink-0">Token</span>

            <span className="text-right">
              {appointment.token_number}
            </span>
          </div>

          {/* Time */}
          <div className="flex justify-between items-center gap-3 min-w-0">
            <span className="text-gray-400 flex items-center gap-1 shrink-0">
              <FaClock className="text-xs opacity-70" />
              Time
            </span>

            <span className="text-right break-words min-w-0">
              {appointment.appointment_time}
            </span>
          </div>

          {/* Status */}
          <div className="flex justify-between items-center gap-3 pt-2 min-w-0">
            <span className="text-gray-400 shrink-0">
              Status
            </span>

            <span
              className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                appointment.status === "Completed"
                  ? "bg-green-500/20 text-green-300"
                  : "bg-yellow-500/20 text-yellow-300"
              }`}
            >
              {appointment.status}
            </span>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PatientInfoCard;