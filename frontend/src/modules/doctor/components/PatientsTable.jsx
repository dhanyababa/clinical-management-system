
import React from "react";
import { FaUser, FaClock } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const PatientsTable = ({ appointments = [] }) => {
  const navigate = useNavigate();

  return (
    <section className="mt-2 w-full min-w-0 max-w-full rounded-xl bg-[#1e293b] border border-white/10 overflow-hidden">

      {/* Title */}
      <div className="px-4 sm:px-5 py-3">
        <h2 className="text-white text-base sm:text-lg md:text-xl font-semibold flex items-center gap-2">
          📅 TODAY APPOINTMENTS
        </h2>

        <p className="text-xs text-gray-400 mt-1 sm:hidden">
          Swipe sideways to view all columns
        </p>
      </div>

      {/* Scrollable Table */}
      <div className="w-full min-w-0 px-2 sm:px-4 md:px-5 pb-4 sm:pb-6">
        <div
          className="w-full max-w-full overflow-x-auto overflow-y-auto rounded-lg overscroll-x-contain"
          role="region"
          aria-label="Patient appointments table"
          tabIndex={0}
        >
          <table className="min-w-[760px] w-full text-sm">

            <thead className="sticky top-0 z-10">
              <tr className="bg-blue-200 text-gray-800 text-sm md:text-base border-b border-gray-300 shadow-sm">
                <th className="p-3 text-left whitespace-nowrap">
                  Token
                </th>
                <th className="p-3 text-left whitespace-nowrap">
                  Patient Name
                </th>
                <th className="p-3 text-left whitespace-nowrap">
                  Time
                </th>
                <th className="p-3 text-left whitespace-nowrap">
                  Reason
                </th>
                <th className="p-3 text-left whitespace-nowrap">
                  Status
                </th>
                <th className="p-3 text-center whitespace-nowrap">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="text-white text-sm md:text-base">
              {appointments.length > 0 ? (
                appointments.map((item, index) => {
                  const rowStyle =
                    index % 2 === 0
                      ? "bg-blue-500/10"
                      : "bg-green-500/10";

                  return (
                    <tr
                      key={item.appointment_id}
                      className={`${rowStyle} border-b border-white/5 hover:bg-blue-500/10 transition-all duration-200`}
                    >
                      <td className="p-3 font-medium whitespace-nowrap">
                        {item.token_number}
                      </td>

                      <td className="p-3 min-w-[170px]">
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 shrink-0 bg-white/20 rounded-full flex items-center justify-center">
                            <FaUser className="text-xs" />
                          </span>

                          <span>
                            {item.patient?.first_name}{" "}
                            {item.patient?.last_name}
                          </span>
                        </div>
                      </td>

                      <td className="p-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <FaClock className="text-xs opacity-80 shrink-0" />
                          {item.appointment_time}
                        </div>
                      </td>

                      <td className="p-3 max-w-[220px]">
                        <span
                          className="block truncate"
                          title={item.reason || ""}
                        >
                          {item.reason}
                        </span>
                      </td>

                      <td className="p-3">
                        <span
                          className={`inline-flex whitespace-nowrap px-2 py-0.5 rounded-full text-xs md:text-sm font-medium ${
                            item.status === "Completed"
                              ? "bg-green-500/20 text-green-300"
                              : item.status === "Pending" ||
                                  item.status === "Scheduled"
                                ? "bg-red-500/20 text-red-300"
                                : "bg-red-500/20 text-red-300"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>

                      <td className="p-3 text-center">
                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/doctor/consultation/${item.appointment_id}`
                            )
                          }
                          disabled={item.status === "Completed"}
                          className={`px-3 py-2 md:px-4 rounded-full bg-gradient-to-r from-blue-200 to-cyan-200 text-gray-800 font-medium text-xs md:text-sm hover:scale-105 hover:shadow-lg active:scale-95 transition duration-200 whitespace-nowrap ${
                            item.status === "Completed"
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }`}
                        >
                          Consult
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center p-5 text-white/60 text-sm"
                  >
                    No patients today
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default PatientsTable;
