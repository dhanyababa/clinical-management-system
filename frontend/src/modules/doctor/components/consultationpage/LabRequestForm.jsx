import React, { useState, useEffect } from "react";
import { getLabTests } from "../../api/doctorApi";

const LabRequestForm = ({ onSubmit, onClose }) => {
  const [notes, setNotes] = useState("");
  const [selectedTests, setSelectedTests] = useState([]);
  const [testOptions, setTestOptions] = useState([]);

  // Fetch lab tests from API
  useEffect(() => {
    const fetchTests = async () => {
      try {
        const res = await getLabTests();

        const data = res.data || res;

        const formatted = data.map((test) => ({
          id: Number(test.test_id),
          name: test.test_name,
        }));

        setTestOptions(formatted);
      } catch (err) {
        console.error("Error fetching lab tests:", err);
      }
    };

    fetchTests();
  }, []);

  // Select or deselect a lab test
  const toggleTest = (id) => {
    if (selectedTests.includes(id)) {
      setSelectedTests(selectedTests.filter((t) => t !== id));
    } else {
      setSelectedTests([...selectedTests, id]);
    }
  };

  // Submit lab request
  const handleSubmit = () => {
    if (selectedTests.length === 0) {
      alert("Select at least one test");
      return;
    }

    onSubmit({
      notes,
      tests: selectedTests.map((id) => ({
        lab_test: Number(id),
      })),
    });
  };

  return (
    <div className="w-full min-w-0 max-w-full flex flex-col gap-4 p-3 sm:p-4 md:p-5 text-white">

      {/* Title */}
      <h2 className="text-lg sm:text-xl font-semibold break-words">
        Create Lab Request
      </h2>

      {/* Available Lab Tests */}
      <div className="flex flex-col gap-2 min-w-0">

        <label className="text-sm font-medium text-gray-300">
          Select Lab Tests
        </label>

        <div className="w-full min-w-0 max-h-[240px] sm:max-h-[300px] overflow-y-auto rounded-lg border border-white/10 bg-gray-800/50 p-2 sm:p-3">

          {testOptions.length === 0 ? (
            <p className="text-gray-400 text-sm p-2">
              Loading tests...
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">

              {testOptions.map((test) => (
                <label
                  key={test.id}
                  className="flex items-start gap-3 min-w-0 rounded-md p-3 bg-white/5 hover:bg-white/10 cursor-pointer transition"
                >
                  <input
                    type="checkbox"
                    checked={selectedTests.includes(test.id)}
                    onChange={() => toggleTest(test.id)}
                    className="mt-1 h-4 w-4 shrink-0 accent-cyan-500 cursor-pointer"
                  />

                  <span className="min-w-0 text-sm sm:text-base text-gray-200 break-words">
                    {test.name}
                  </span>
                </label>
              ))}

            </div>
          )}

        </div>
      </div>

      {/* Notes */}
      <div className="flex flex-col gap-2 min-w-0">

        <label className="text-sm font-medium text-gray-300">
          Notes / Instructions
        </label>

        <textarea
          placeholder="Notes"
          rows={4}
          className="w-full min-w-0 bg-gray-700 p-3 rounded-md text-base sm:text-sm resize-y outline-none focus:ring-2 focus:ring-cyan-500"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

      </div>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 mt-2">

        <button
          type="button"
          onClick={handleSubmit}
          className="w-full sm:flex-1 bg-cyan-500 hover:bg-cyan-600 py-3 px-4 rounded-md font-medium transition"
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

export default LabRequestForm;