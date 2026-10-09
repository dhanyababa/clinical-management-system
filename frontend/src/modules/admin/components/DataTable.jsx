import React from "react";

const DataTable = ({
  columns,
  data = [],
  onEdit,
  onToggleActive,
  loading,
  idKey = "id",
}) => {
  if (loading && data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 sm:py-20 text-gray-300">
        <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-sm">Loading data...</p>
      </div>
    );
  }

  if (!loading && data.length === 0) {
    return (
      <div className="text-center py-16 sm:py-20 text-gray-400">
        <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[#1e2d4a] flex items-center justify-center">
          🔍
        </div>

        <p className="text-sm">No records found</p>
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 overflow-hidden rounded-xl sm:rounded-2xl bg-[#0b1220] border border-[#1e2d4a] shadow-lg">

      <div
        className="w-full overflow-x-auto overscroll-x-contain"
        role="region"
        aria-label="Records table"
        tabIndex={0}
      >
        <table className="w-full min-w-max text-sm">

          {/* Header */}
          <thead className="bg-[#0f172a]">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className="px-3 sm:px-5 py-3 text-left text-xs font-semibold text-[#F1D279] uppercase tracking-wider whitespace-nowrap"
                >
                  {col.label}
                </th>
              ))}

              {(onEdit || onToggleActive) && (
                <th className="px-3 sm:px-5 py-3 text-right text-xs font-semibold text-[#F1D279] uppercase whitespace-nowrap">
                  Actions
                </th>
              )}
            </tr>
          </thead>

          {/* Body */}
          <tbody className="divide-y divide-[#1e2d4a] text-gray-200">

            {data.map((row, i) => (
              <tr
                key={row[idKey] ?? i}
                className="hover:bg-[#111827] transition"
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className="px-3 sm:px-5 py-3 whitespace-nowrap"
                  >
                    {col.render
                      ? col.render(row)
                      : row[col.key] ?? "—"}
                  </td>
                ))}

                {(onEdit || onToggleActive) && (
                  <td className="px-3 sm:px-5 py-3 text-right whitespace-nowrap">

                    <div className="flex items-center justify-end gap-2">

                      {onEdit && (
                        <button
                          type="button"
                          onClick={() => onEdit(row)}
                          className="px-3 py-1.5 text-xs rounded-md bg-[#D4AF37] text-[#0b1220] font-medium hover:opacity-90 transition"
                        >
                          Edit
                        </button>
                      )}

                      {onToggleActive && (
                        <button
                          type="button"
                          onClick={() => onToggleActive(row)}
                          className={`px-3 py-1.5 text-xs rounded-md font-medium transition ${
                            row.is_active
                              ? "bg-red-500 text-white hover:bg-red-600"
                              : "bg-green-500 text-white hover:bg-green-600"
                          }`}
                        >
                          {row.is_active ? "Deactivate" : "Activate"}
                        </button>
                      )}

                    </div>
                  </td>
                )}
              </tr>
            ))}

          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;