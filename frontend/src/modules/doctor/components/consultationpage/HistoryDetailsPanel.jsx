import React from "react";

const HistoryDetailsPanel = ({
  activeTab,
  consultations = [],
  prescriptions = [],
  previousLabResults = [],
}) => {

  // Use previous lab results passed from ConsultationPage
  const labResults = previousLabResults;

  return (
    <div className="w-full min-w-0 h-full flex flex-col bg-[#1e293b] border border-white/10 rounded-xl p-3 sm:p-4 lg:p-5 text-white">

      {/* Dynamic Title */}
      <h2 className="text-base sm:text-lg font-semibold mb-4 break-words">
        {activeTab === "consultations" && "Previous Consultations"}
        {activeTab === "prescriptions" && "Previous Prescriptions"}
        {activeTab === "lab" && "Previous Lab Results"}
      </h2>

      {/* Scroll Area */}
      <div className="flex-1 min-h-0 min-w-0 overflow-y-auto pr-1 space-y-4 text-sm sm:text-base">

        {/* PREVIOUS CONSULTATIONS */}
        {activeTab === "consultations" &&
          (consultations.length === 0 ? (
            <p className="text-gray-400">
              No previous consultations
            </p>
          ) : (
            consultations.map((item) => (
              <div
                key={item.consultation_code}
                className="bg-white/10 hover:bg-white/15 transition p-3 sm:p-4 rounded-lg min-w-0"
              >

                {/* Diagnosis */}
                <p className="mb-1 break-words">
                  <span className="text-gray-300">
                    Diagnosis:{" "}
                  </span>

                  <span className="text-blue-400 font-semibold">
                    {item.diagnosis}
                  </span>
                </p>

                {/* Symptoms */}
                <p className="mb-1 break-words">
                  <span className="text-gray-300">
                    Symptoms:{" "}
                  </span>

                  <span className="text-blue-400">
                    {item.symptoms}
                  </span>
                </p>

                {/* Vitals */}
                <p className="mb-1 break-words">
                  <span className="text-gray-300">
                    Vitals:{" "}
                  </span>

                  <span className="text-blue-400">
                    {item.vitals}
                  </span>
                </p>

                {/* Advice */}
                <p className="mb-1 break-words">
                  <span className="text-gray-300">
                    Advice:{" "}
                  </span>

                  <span className="text-blue-400">
                    {item.advice || "N/A"}
                  </span>
                </p>

                {/* Date */}
                <p className="text-xs text-gray-300 mt-2">
                  {new Date(item.created_at).toLocaleDateString("en-GB")}
                </p>

              </div>
            ))
          ))}

        {/* PREVIOUS PRESCRIPTIONS */}
        {activeTab === "prescriptions" &&
          (prescriptions.length === 0 ? (
            <p className="text-gray-400">
              No prescriptions found
            </p>
          ) : (
            prescriptions.map((pres) => (
              <div
                key={pres.prescription_code}
                className="bg-[#2a3648] border border-white/10 hover:bg-white/5 transition p-3 sm:p-4 rounded-lg min-w-0"
              >

                {/* Prescription Header */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-3 mb-2">

                  <p className="text-gray-200 font-semibold break-all min-w-0">
                    {pres.prescription_code}
                  </p>

                  <p className="text-xs text-gray-300 shrink-0">
                    {pres.created_at
                      ? new Date(pres.created_at).toLocaleDateString("en-GB")
                      : "No Date"}
                  </p>

                </div>

                {/* Medicines */}
                <div className="space-y-2">

                  {pres.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-white/5 p-2 rounded-md min-w-0"
                    >

                      <p className="text-blue-300 font-medium text-sm break-words">
                        {item.medicine_display}
                      </p>

                      <p className="text-xs text-gray-300 break-words">
                        {item.dosage} • {item.frequency} • {item.duration} days
                      </p>

                      {item.instructions && (
                        <p className="text-xs text-gray-400 italic break-words">
                          {item.instructions}
                        </p>
                      )}

                    </div>
                  ))}

                </div>

              </div>
            ))
          ))}

        {/* PREVIOUS LAB RESULTS */}
        {activeTab === "lab" &&
          (labResults.length === 0 ? (
            <p className="text-gray-400">
              No lab history
            </p>
          ) : (
            labResults.map((item) => (
              <div
                key={item.result_id}
                className="bg-[#2a3648] p-3 rounded-md border border-white/10 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 min-w-0"
              >

                {/* Test Information */}
                <div className="flex flex-col min-w-0">

                  <p className="text-blue-300 font-medium text-sm break-words">
                    {item.test_name}
                  </p>

                  <p className="text-white text-sm break-words">
                    {item.result_value}

                    <span
                      className={`ml-2 text-xs font-medium ${
                        item.is_critical
                          ? "text-red-400"
                          : "text-green-400"
                      }`}
                    >
                      ({item.is_critical ? "Critical" : "Normal"})
                    </span>
                  </p>

                  {item.remarks && (
                    <p className="text-xs text-gray-400 mt-1 italic break-words">
                      {item.remarks}
                    </p>
                  )}

                </div>

                {/* Result Date */}
                <span className="text-xs text-gray-300 whitespace-nowrap shrink-0">
                  {new Date(item.created_at).toLocaleDateString("en-GB")}
                </span>

              </div>
            ))
          ))}

      </div>
    </div>
  );
};

export default HistoryDetailsPanel;