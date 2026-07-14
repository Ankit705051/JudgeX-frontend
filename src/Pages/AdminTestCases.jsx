import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { testCaseAPI, problemAPI } from "../services/api";

const AdminTestCases = () => {
  const navigate = useNavigate();
  const { problemId } = useParams();
  const [testCases, setTestCases] = useState([]);
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTestCase, setEditingTestCase] = useState(null);
  const [formData, setFormData] = useState({
    input: "",
    output: "",
    explanation: "",
    isHidden: false,
  });

  useEffect(() => {
    fetchProblem();
    fetchTestCases();
  }, [problemId]);

  const fetchProblem = async () => {
    try {
      const response = await problemAPI.getAllProblems({ limit: 100 });
      const problems = response.data.data?.problems || response.data.data || [];
      const foundProblem = problems.find((p) => p._id === problemId);
      setProblem(foundProblem);
    } catch (error) {
      console.error("Error fetching problem:", error);
    }
  };

  const fetchTestCases = async () => {
    setLoading(true);
    try {
      const response = await testCaseAPI.getAdminTestCases(problemId);
      setTestCases(response.data.data || []);
    } catch (error) {
      console.error("Error fetching test cases:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTestCase) {
        await testCaseAPI.updateTestCase(editingTestCase._id, formData);
        alert("Test case updated successfully!");
      } else {
        await testCaseAPI.createTestCase(problemId, formData);
        alert("Test case created successfully!");
      }
      setShowForm(false);
      setEditingTestCase(null);
      resetForm();
      fetchTestCases();
    } catch (error) {
      console.error("Error saving test case:", error);
      alert("Failed to save test case");
    }
  };

  const handleEdit = (testCase) => {
    setEditingTestCase(testCase);
    setFormData({
      input: testCase.input || "",
      output: testCase.output || "",
      explanation: testCase.explanation || "",
      isHidden: testCase.isHidden || false,
    });
    setShowForm(true);
  };

  const handleDelete = async (testCaseId) => {
    if (!window.confirm("Are you sure you want to delete this test case?")) return;
    try {
      await testCaseAPI.deleteTestCase(testCaseId);
      alert("Test case deleted successfully!");
      fetchTestCases();
    } catch (error) {
      console.error("Error deleting test case:", error);
      alert("Failed to delete test case");
    }
  };

  const resetForm = () => {
    setFormData({
      input: "",
      output: "",
      explanation: "",
      isHidden: false,
    });
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingTestCase(null);
    resetForm();
  };

  if (showForm) {
    return (
      <main className="min-h-screen bg-[#0f0f0f] text-zinc-100">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">
              {editingTestCase ? "Edit Test Case" : "Create New Test Case"}
            </h1>
            <button
              onClick={handleCancel}
              className="rounded border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:border-zinc-500"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block mb-2 text-sm font-medium">Input</label>
              <textarea
                name="input"
                value={formData.input}
                onChange={handleInputChange}
                required
                rows={4}
                className="w-full rounded border border-zinc-700 bg-[#171717] px-4 py-2 text-zinc-200 outline-none focus:border-zinc-500 font-mono text-sm"
                placeholder="Enter test input..."
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium">Expected Output</label>
              <textarea
                name="output"
                value={formData.output}
                onChange={handleInputChange}
                required
                rows={4}
                className="w-full rounded border border-zinc-700 bg-[#171717] px-4 py-2 text-zinc-200 outline-none focus:border-zinc-500 font-mono text-sm"
                placeholder="Enter expected output..."
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium">Explanation (optional)</label>
              <textarea
                name="explanation"
                value={formData.explanation}
                onChange={handleInputChange}
                rows={2}
                className="w-full rounded border border-zinc-700 bg-[#171717] px-4 py-2 text-zinc-200 outline-none focus:border-zinc-500 text-sm"
                placeholder="Enter explanation for this test case..."
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                name="isHidden"
                id="isHidden"
                checked={formData.isHidden}
                onChange={handleInputChange}
                className="rounded border-zinc-700 bg-[#171717]"
              />
              <label htmlFor="isHidden" className="text-sm text-zinc-300">
                Hidden test case (not visible to users)
              </label>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCancel}
                className="rounded border border-zinc-700 px-6 py-2 text-sm font-medium text-zinc-300 hover:border-zinc-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-500"
              >
                {editingTestCase ? "Update Test Case" : "Create Test Case"}
              </button>
            </div>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0f0f0f] text-zinc-100">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <button
              onClick={() => navigate("/admin/problems")}
              className="text-zinc-400 hover:text-white mb-2 inline-block"
            >
              ← Back to Problems
            </button>
            <h1 className="text-2xl font-bold">Test Case Management</h1>
            {problem && (
              <p className="text-zinc-400 mt-1">Problem: {problem.title}</p>
            )}
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
          >
            + Add Test Case
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="text-zinc-500">Loading test cases...</div>
          </div>
        ) : testCases.length > 0 ? (
          <div className="space-y-4">
            {testCases.map((testCase) => (
              <div
                key={testCase._id}
                className="rounded border border-zinc-800 bg-[#171717] p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {testCase.isHidden && (
                      <span className="rounded bg-purple-600 px-2 py-0.5 text-xs font-medium">
                        Hidden
                      </span>
                    )}
                    <span className="text-sm text-zinc-500">ID: {testCase._id}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(testCase)}
                      className="text-blue-400 text-sm hover:text-blue-300"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(testCase._id)}
                      className="text-red-400 text-sm hover:text-red-300"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 text-xs font-medium text-zinc-500">Input</label>
                    <pre className="rounded bg-[#111111] p-3 text-sm text-zinc-300 font-mono overflow-x-auto">
                      {testCase.input}
                    </pre>
                  </div>
                  <div>
                    <label className="block mb-1 text-xs font-medium text-zinc-500">Expected Output</label>
                    <pre className="rounded bg-[#111111] p-3 text-sm text-zinc-300 font-mono overflow-x-auto">
                      {testCase.output}
                    </pre>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-zinc-500">No test cases found for this problem</div>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 rounded bg-zinc-800 px-6 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-700"
            >
              Add First Test Case
            </button>
          </div>
        )}
      </div>
    </main>
  );
};

export default AdminTestCases;
