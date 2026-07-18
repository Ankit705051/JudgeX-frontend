import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { problemAPI, adminAPI } from "../services/api";

const emptyFormData = {
  title: "",
  slug: "",
  description: "",
  difficulty: "easy",
  constraints: "",
  timeLimit: 1,
  memoryLimit: 256,
  functionName: "solution",
  returnType: "int",
  parameters: [{ name: "", type: "" }],
  visibility: "public",
  tags: [],
  examples: [],
  codeTemplate: [],
  hints: "",
  solution: [],
};

const bulkTemplate = [
  {
    title: "Two Sum",
    slug: "two-sum",
    description: "Given an array of integers, find two numbers that add up to a target value.",
    difficulty: "easy",
    constraints: "1 <= nums.length <= 10^5",
    timeLimit: 1,
    memoryLimit: 256,
    functionName: "twoSum",
    returnType: "int[]",
    parameters: [
      { name: "nums", type: "int[]" },
      { name: "target", type: "int" },
    ],
    visibility: "public",
    tags: ["array", "hash-map"],
    examples: [
      { input: "[2,7,11,15], 9", output: "[0,1]", explanation: "2 + 7 = 9" },
    ],
    codeTemplate: [
      {
        language: "javascript",
        starterCode: "function twoSum(nums, target) {\n  \n}",
      },
    ],
    hints: "Use a map to track values you have seen.",
    solution: [
      {
        language: "javascript",
        solution: "function twoSum(nums, target) {\n  \n}",
      },
    ],
  },
];

const AdminProblems = () => {
  const navigate = useNavigate();
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState("single");
  const [editingProblem, setEditingProblem] = useState(null);
  const [formData, setFormData] = useState(emptyFormData);
  const [bulkJson, setBulkJson] = useState(JSON.stringify(bulkTemplate, null, 2));

  const fetchProblems = async () => {
    setLoading(true);
    try {
      const response = await problemAPI.getAllProblems({ limit: 100 });
      setProblems(response.data.data?.problems || response.data.data || []);
    } catch (error) {
      console.error("Error fetching problems:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void (async () => {
      await fetchProblems();
    })();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleParameterChange = (index, field, value) => {
    const newParameters = [...formData.parameters];
    if (!newParameters[index]) {
      newParameters[index] = {};
    }
    newParameters[index][field] = value;
    setFormData((prev) => ({ ...prev, parameters: newParameters }));
  };

  const addParameter = () => {
    setFormData((prev) => ({ ...prev, parameters: [...prev.parameters, { name: "", type: "" }] }));
  };

  const removeParameter = (index) => {
    setFormData((prev) => ({ ...prev, parameters: prev.parameters.filter((_, i) => i !== index) }));
  };

  const handleCodeTemplateChange = (index, field, value) => {
    const newCodeTemplates = [...formData.codeTemplate];
    if (!newCodeTemplates[index]) {
      newCodeTemplates[index] = {};
    }
    newCodeTemplates[index][field] = value;
    setFormData((prev) => ({ ...prev, codeTemplate: newCodeTemplates }));
  };

  const addCodeTemplates = () => {
    setFormData((prev) => ({ ...prev, codeTemplate: [...prev.codeTemplate, { language: "javascript", starterCode: "" }] }));
  };

  const removeCodeTemplate = (index) => {
    setFormData((prev) => ({ ...prev, codeTemplate: prev.codeTemplate.filter((_, i) => i !== index) }));
  };

  const handleSolutionChange = (index, field, value) => {
    const newSolutions = [...formData.solution];
    if (!newSolutions[index]) {
      newSolutions[index] = {};
    }
    newSolutions[index][field] = value;
    setFormData((prev) => ({ ...prev, solution: newSolutions }));
  };

  const addSolution = () => {
    setFormData((prev) => ({ ...prev, solution: [...prev.solution, { language: "javascript", solution: "" }] }));
  };

  const removeSolution = (index) => {
    setFormData((prev) => ({ ...prev, solution: prev.solution.filter((_, i) => i !== index) }));
  };

  const handleTagsChange = (e) => {
    const tags = e.target.value.split(",").map((tag) => tag.trim()).filter(Boolean);
    setFormData((prev) => ({ ...prev, tags }));
  };

  const handleExamplesChange = (index, field, value) => {
    const newExamples = [...formData.examples];
    if (!newExamples[index]) {
      newExamples[index] = {};
    }
    newExamples[index][field] = value;
    setFormData((prev) => ({ ...prev, examples: newExamples }));
  };

  const addExample = () => {
    setFormData((prev) => ({
      ...prev,
      examples: [...prev.examples, { input: "", output: "", explanation: "" }],
    }));
  };

  const removeExample = (index) => {
    setFormData((prev) => ({
      ...prev,
      examples: prev.examples.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formMode === "bulk") {
        const parsedProblems = JSON.parse(bulkJson);
        if (!Array.isArray(parsedProblems) || parsedProblems.length === 0) {
          throw new Error("Bulk import expects a non-empty JSON array.");
        }

        const payload = parsedProblems.map((problem) => ({
          ...problem,
          slug: problem.slug || problem.title?.toLowerCase().replace(/\s+/g, "-"),
          timeLimit: Number(problem.timeLimit),
          memoryLimit: Number(problem.memoryLimit),
        }));

        await adminAPI.bulkCreateProblems(payload);
        alert(`${payload.length} problems created successfully!`);
      } else {
        const submissionData = {
          ...formData,
          timeLimit: Number(formData.timeLimit),
          memoryLimit: Number(formData.memoryLimit),
          slug: formData.slug || formData.title.toLowerCase().replace(/\s+/g, "-"),
        };
        if (editingProblem) {
          await adminAPI.updateProblem(editingProblem._id, submissionData);
          alert("Problem updated successfully!");
        } else {
          await adminAPI.createProblem(submissionData);
          alert("Problem created successfully!");
        }
      }
      setShowForm(false);
      setEditingProblem(null);
      resetForm();
      fetchProblems();
    } catch (error) {
      console.error("Error saving problem:", error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to save problem";
      alert(`Error: ${errorMessage}`);
    }
  };

  const handleEdit = (problem) => {
    setFormMode("single");
    setEditingProblem(problem);
    setFormData({
      title: problem.title || "",
      slug: problem.slug || "",
      description: problem.description || "",
      difficulty: problem.difficulty || "easy",
      constraints: problem.constraints || "",
      timeLimit: problem.timeLimit || 1,
      memoryLimit: problem.memoryLimit || 256,
      functionName: problem.functionName || "solution",
      returnType: problem.returnType || "int",
      parameters: problem.parameters || [{ name: "", type: "" }],
      visibility: problem.visibility || "public",
      tags: problem.tags || [],
      examples: problem.examples || [],
      codeTemplate: problem.codeTemplate || [],
      hints: problem.hints || "",
      solution: problem.solution || [],
    });
    setShowForm(true);
  };

  const handleDelete = async (problemId) => {
    if (!window.confirm("Are you sure you want to delete this problem?")) return;
    try {
      await adminAPI.deleteProblem(problemId);
      alert("Problem deleted successfully!");
      fetchProblems();
    } catch (error) {
      console.error("Error deleting problem:", error);
      alert("Failed to delete problem");
    }
  };

  const resetForm = () => {
    setFormData(emptyFormData);
    setBulkJson(JSON.stringify(bulkTemplate, null, 2));
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingProblem(null);
    setFormMode("single");
    resetForm();
  };

  if (showForm) {
    return (
      <main className="min-h-screen bg-[#0f0f0f] text-zinc-100">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">
              {formMode === "bulk"
                ? "Bulk Import Problems"
                : editingProblem
                ? "Edit Problem"
                : "Create New Problem"}
            </h1>
            <button
              onClick={handleCancel}
              className="rounded border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:border-zinc-500"
            >
              Cancel
            </button>
          </div>

          {!editingProblem && (
            <div className="mb-6 inline-flex rounded border border-zinc-800 bg-[#111111] p-1">
              <button
                type="button"
                onClick={() => setFormMode("single")}
                className={`rounded px-4 py-2 text-sm font-medium transition ${
                  formMode === "single"
                    ? "bg-blue-600 text-white"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Single Create
              </button>
              <button
                type="button"
                onClick={() => setFormMode("bulk")}
                className={`rounded px-4 py-2 text-sm font-medium transition ${
                  formMode === "bulk"
                    ? "bg-blue-600 text-white"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Bulk Create
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {formMode === "bulk" ? (
              <div className="space-y-4">
                <div className="rounded border border-zinc-800 bg-[#111111] p-4 text-sm text-zinc-400">
                  Paste a JSON array of problem objects. Each item should match the backend create schema.
                  You can use the template below as a starting point.
                </div>
                <textarea
                  value={bulkJson}
                  onChange={(e) => setBulkJson(e.target.value)}
                  rows={24}
                  spellCheck="false"
                  className="w-full rounded border border-zinc-700 bg-[#171717] px-4 py-3 font-mono text-sm text-zinc-200 outline-none focus:border-zinc-500"
                />
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
                    Bulk Submit
                  </button>
                </div>
              </div>
            ) : (
              <>
            <div>
              <label className="block mb-2 text-sm font-medium">Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full rounded border border-zinc-700 bg-[#171717] px-4 py-2 text-zinc-200 outline-none focus:border-zinc-500"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium">Slug</label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                placeholder="Auto-generated from title if empty"
                className="w-full rounded border border-zinc-700 bg-[#171717] px-4 py-2 text-zinc-200 outline-none focus:border-zinc-500"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={6}
                className="w-full rounded border border-zinc-700 bg-[#171717] px-4 py-2 text-zinc-200 outline-none focus:border-zinc-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 text-sm font-medium">Difficulty</label>
                <select
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleInputChange}
                  className="w-full rounded border border-zinc-700 bg-[#171717] px-4 py-2 text-zinc-200 outline-none focus:border-zinc-500"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium">Visibility</label>
                <select
                  name="visibility"
                  value={formData.visibility}
                  onChange={handleInputChange}
                  className="w-full rounded border border-zinc-700 bg-[#171717] px-4 py-2 text-zinc-200 outline-none focus:border-zinc-500"
                >
                  <option value="public">Public</option>
                  <option value="contest">Contest Only</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 text-sm font-medium">Function Name</label>
                <input
                  type="text"
                  name="functionName"
                  value={formData.functionName}
                  onChange={handleInputChange}
                  className="w-full rounded border border-zinc-700 bg-[#171717] px-4 py-2 text-zinc-200 outline-none focus:border-zinc-500"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium">Return Type</label>
                <select
                  name="returnType"
                  value={formData.returnType}
                  onChange={handleInputChange}
                  className="w-full rounded border border-zinc-700 bg-[#171717] px-4 py-2 text-zinc-200 outline-none focus:border-zinc-500"
                >
                <option value="">Select type</option>

                {/* Primitive */}
                <option value="int">int</option>
                <option value="long">long</option>
                <option value="double">double</option>
                <option value="float">float</option>
                <option value="boolean">boolean</option>
                <option value="char">char</option>
                <option value="string">string</option>

                {/* 1D Arrays */}
                <option value="int[]">int[]</option>
                <option value="long[]">long[]</option>
                <option value="double[]">double[]</option>
                <option value="float[]">float[]</option>
                <option value="boolean[]">boolean[]</option>
                <option value="char[]">char[]</option>
                <option value="string[]">string[]</option>

                {/* 2D Arrays */}
                <option value="int[][]">int[][]</option>
                <option value="long[][]">long[][]</option>
                <option value="double[][]">double[][]</option>
                <option value="float[][]">float[][]</option>
                <option value="boolean[][]">boolean[][]</option>
                <option value="char[][]">char[][]</option>
                <option value="string[][]">string[][]</option>

                {/* Data Structures */}
                <option value="ListNode">ListNode</option>
                <option value="TreeNode">TreeNode</option>
                <option value="Graph">Graph</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 text-sm font-medium">Time Limit (seconds)</label>
                <input
                  type="number"
                  name="timeLimit"
                  value={formData.timeLimit}
                  onChange={handleInputChange}
                  className="w-full rounded border border-zinc-700 bg-[#171717] px-4 py-2 text-zinc-200 outline-none focus:border-zinc-500"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium">Memory Limit (MB)</label>
                <input
                  type="number"
                  name="memoryLimit"
                  value={formData.memoryLimit}
                  onChange={handleInputChange}
                  className="w-full rounded border border-zinc-700 bg-[#171717] px-4 py-2 text-zinc-200 outline-none focus:border-zinc-500"
                />
              </div>
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium">Constraints</label>
              <textarea
                name="constraints"
                value={formData.constraints}
                onChange={handleInputChange}
                required
                rows={4}
                className="w-full rounded border border-zinc-700 bg-[#171717] px-4 py-2 text-zinc-200 outline-none focus:border-zinc-500"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium">Parameters</label>
              {formData.parameters.map((param, index) => (
                <div key={index} className="mb-2 flex gap-2">
                  <input
                    type="text"
                    placeholder="Parameter name"
                    value={param.name}
                    onChange={(e) => handleParameterChange(index, "name", e.target.value)}
                    className="flex-1 rounded border border-zinc-700 bg-[#171717] px-3 py-2 text-sm text-zinc-200 outline-none focus:border-zinc-500"
                  />
                  <select
                    value={param.type}
                    onChange={(e) => handleParameterChange(index, "type", e.target.value)}
                    className="w-32 rounded border border-zinc-700 bg-[#171717] px-3 py-2 text-sm text-zinc-200 outline-none focus:border-zinc-500"
                  >
                  <option value="">Select type</option>

                    {/* Primitive */}
                    <option value="int">int</option>
                    <option value="long">long</option>
                    <option value="double">double</option>
                    <option value="float">float</option>
                    <option value="boolean">boolean</option>
                    <option value="char">char</option>
                    <option value="string">string</option>

                    {/* 1D Arrays */}
                    <option value="int[]">int[]</option>
                    <option value="long[]">long[]</option>
                    <option value="double[]">double[]</option>
                    <option value="float[]">float[]</option>
                    <option value="boolean[]">boolean[]</option>
                    <option value="char[]">char[]</option>
                    <option value="string[]">string[]</option>

                    {/* 2D Arrays */}
                    <option value="int[][]">int[][]</option>
                    <option value="long[][]">long[][]</option>
                    <option value="double[][]">double[][]</option>
                    <option value="float[][]">float[][]</option>
                    <option value="boolean[][]">boolean[][]</option>
                    <option value="char[][]">char[][]</option>
                    <option value="string[][]">string[][]</option>

                    {/* Data Structures */}
                    <option value="ListNode">ListNode</option>
                    <option value="TreeNode">TreeNode</option>
                    <option value="Graph">Graph</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => removeParameter(index)}
                    className="text-red-400 text-sm hover:text-red-300"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addParameter}
                className="text-sm text-blue-400 hover:text-blue-300"
              >
                + Add Parameter
              </button>
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium">Tags (comma-separated)</label>
              <input
                type="text"
                name="tags"
                value={formData.tags.join(", ")}
                onChange={handleTagsChange}
                placeholder="array, string, dynamic-programming"
                className="w-full rounded border border-zinc-700 bg-[#171717] px-4 py-2 text-zinc-200 outline-none focus:border-zinc-500"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium">Hints</label>
              <textarea
                name="hints"
                value={formData.hints}
                onChange={handleInputChange}
                rows={3}
                className="w-full rounded border border-zinc-700 bg-[#171717] px-4 py-2 text-zinc-200 outline-none focus:border-zinc-500"
                placeholder="Optional hints for users"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium">Examples</label>
              {formData.examples.map((example, index) => (
                <div key={index} className="mb-4 p-4 rounded border border-zinc-800 bg-[#171717]">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Example {index + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeExample(index)}
                      className="text-red-400 text-sm hover:text-red-300"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Input"
                      value={example.input}
                      onChange={(e) => handleExamplesChange(index, "input", e.target.value)}
                      className="w-full rounded border border-zinc-700 bg-[#111111] px-3 py-2 text-sm text-zinc-200 outline-none focus:border-zinc-500"
                    />
                    <input
                      type="text"
                      placeholder="Output"
                      value={example.output}
                      onChange={(e) => handleExamplesChange(index, "output", e.target.value)}
                      className="w-full rounded border border-zinc-700 bg-[#111111] px-3 py-2 text-sm text-zinc-200 outline-none focus:border-zinc-500"
                    />
                    <textarea
                      placeholder="Explanation (optional)"
                      value={example.explanation}
                      onChange={(e) => handleExamplesChange(index, "explanation", e.target.value)}
                      rows={2}
                      className="w-full rounded border border-zinc-700 bg-[#111111] px-3 py-2 text-sm text-zinc-200 outline-none focus:border-zinc-500"
                    />
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addExample}
                className="text-sm text-blue-400 hover:text-blue-300"
              >
                + Add Example
              </button>
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium">Code Templates</label>
              {formData.codeTemplate.map((template, index) => (
                <div key={index} className="mb-4 p-4 rounded border border-zinc-800 bg-[#171717]">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Template {index + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeCodeTemplate(index)}
                      className="text-red-400 text-sm hover:text-red-300"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="space-y-2">
                    <select
                      value={template.language}
                      onChange={(e) => handleCodeTemplateChange(index, "language", e.target.value)}
                      className="w-full rounded border border-zinc-700 bg-[#111111] px-3 py-2 text-sm text-zinc-200 outline-none focus:border-zinc-500"
                    >
                      <option value="javascript">JavaScript</option>
                      <option value="python">Python</option>
                      <option value="java">Java</option>
                      <option value="cpp">C++</option>
                    </select>
                    <textarea
                      placeholder="Starter code"
                      value={template.starterCode}
                      onChange={(e) => handleCodeTemplateChange(index, "starterCode", e.target.value)}
                      rows={6}
                      className="w-full rounded border border-zinc-700 bg-[#111111] px-3 py-2 text-sm text-zinc-200 outline-none focus:border-zinc-500 font-mono"
                    />
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addCodeTemplates}
                className="text-sm text-blue-400 hover:text-blue-300"
              >
                + Add Code Template
              </button>
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium">Solutions</label>
              {formData.solution.map((sol, index) => (
                <div key={index} className="mb-4 p-4 rounded border border-zinc-800 bg-[#171717]">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Solution {index + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeSolution(index)}
                      className="text-red-400 text-sm hover:text-red-300"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="space-y-2">
                    <select
                      value={sol.language}
                      onChange={(e) => handleSolutionChange(index, "language", e.target.value)}
                      className="w-full rounded border border-zinc-700 bg-[#111111] px-3 py-2 text-sm text-zinc-200 outline-none focus:border-zinc-500"
                    >
                      <option value="javascript">JavaScript</option>
                      <option value="python">Python</option>
                      <option value="java">Java</option>
                      <option value="cpp">C++</option>
                    </select>
                    <textarea
                      placeholder="Solution code"
                      value={sol.solution}
                      onChange={(e) => handleSolutionChange(index, "solution", e.target.value)}
                      rows={6}
                      className="w-full rounded border border-zinc-700 bg-[#111111] px-3 py-2 text-sm text-zinc-200 outline-none focus:border-zinc-500 font-mono"
                    />
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addSolution}
                className="text-sm text-blue-400 hover:text-blue-300"
              >
                + Add Solution
              </button>
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
                {editingProblem ? "Update Problem" : "Create Problem"}
              </button>
            </div>
              </>
            )}
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
              onClick={() => navigate("/admin")}
              className="text-zinc-400 hover:text-white mb-2 inline-block"
            >
              ← Back to Dashboard
            </button>
            <h1 className="text-2xl font-bold">Problem Management</h1>
          </div>
          <button
            onClick={() => {
              setEditingProblem(null);
              setFormMode("single");
              setShowForm(true);
            }}
            className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
          >
            + Create Problem
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="text-zinc-500">Loading problems...</div>
          </div>
        ) : problems.length > 0 ? (
          <div className="overflow-hidden rounded border border-zinc-800 bg-[#171717]">
            <table className="w-full">
              <thead className="bg-[#111111]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                    Difficulty
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                    Visibility
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                    Tags
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {problems.map((problem) => (
                  <tr key={problem._id} className="hover:bg-[#1f1f1f]">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-zinc-200">{problem.title}</div>
                      <div className="text-xs text-zinc-500">{problem.slug}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded px-2.5 py-0.5 text-xs font-medium ${
                          problem.difficulty === "easy"
                            ? "bg-green-500/10 text-green-400"
                            : problem.difficulty === "medium"
                            ? "bg-yellow-500/10 text-yellow-400"
                            : "bg-red-500/10 text-red-400"
                        }`}
                      >
                        {problem.difficulty}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded px-2.5 py-0.5 text-xs font-medium ${
                          problem.visibility === "public"
                            ? "bg-blue-500/10 text-blue-400"
                            : "bg-purple-500/10 text-purple-400"
                        }`}
                      >
                        {problem.visibility}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {problem.tags?.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="rounded bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(problem)}
                          className="text-blue-400 text-sm hover:text-blue-300"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => navigate(`/admin/testcases/${problem._id}`)}
                          className="text-green-400 text-sm hover:text-green-300"
                        >
                          Test Cases
                        </button>
                        <button
                          onClick={() => handleDelete(problem._id)}
                          className="text-red-400 text-sm hover:text-red-300"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-zinc-500">No problems found</div>
          </div>
        )}
      </div>
    </main>
  );
};

export default AdminProblems;
