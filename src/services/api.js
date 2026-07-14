import axios from "axios";

const API_BASE_URL = "https://judgex-rw01.onrender.com/api/v1";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthPage = ["/login", "/register"].includes(window.location.pathname);
    if (error.response?.status === 401 && !isAuthPage) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  logout: () => api.post("/auth/logout"),
  getUser: () => api.get("/auth/user"),
  verify: (verificationToken) =>
    api.get(`/auth/verify/${verificationToken}`),
  forgotPassword: (data) =>
    api.post("/auth/forgot-password", data),
  resetPassword: (token, data) =>
    api.post(`/auth/reset-password/${token}`, data),
  updateUser: (data) =>
    api.put("/auth/user", data),
};

export const adminAuthApi = {
  createAdmin: (data) =>
    api.post("/auth/admin", data),

  deactivateAdmin: (id) =>
    api.patch(`/auth/admin/deactivate/${id}`),

  activateAdmin: (id) =>
    api.patch(`/auth/admin/activate/${id}`),

  getAllUsers: () =>
    api.get("/auth/users"),

  deactivateUser: (id) =>
    api.patch(`/auth/users/deactivate/${id}`),

  activateUser: (id) =>
    api.patch(`/auth/users/activate/${id}`),
};

export const discussionAPI = {
  getAllDiscussions: (params) => api.get("/discussion/", { params }),
  getMyDiscussions: (params) => api.get("/discussion/my", { params }),
  getSingleDiscussion: (discussionId) => api.get(`/discussion/single/${discussionId}`),
  getProblemDiscussions: (problemId, params) => api.get(`/discussion/problem/${problemId}`, { params }),
  createDiscussion: (problemId, data) => api.post(`/discussion/problem/${problemId}`, data),
  updateDiscussion: (discussionId, data) => api.put(`/discussion/${discussionId}`, data),
  deleteDiscussion: (discussionId) => api.delete(`/discussion/${discussionId}`),
  pinDiscussion: (discussionId, data) => api.patch(`/discussion/${discussionId}/pin`, data),
  voteDiscussion: (discussionId, data) => api.patch(`/discussion/${discussionId}/vote`, data),
  createReply: (discussionId, data) => api.post(`/discussion/${discussionId}/replies`, data),
  getReplies: (discussionId) => api.get(`/discussion/${discussionId}/replies`),
  updateReply: (discussionId, replyId, data) => api.put(`/discussion/${discussionId}/replies/${replyId}`, data),
  deleteReply: (discussionId, replyId) => api.delete(`/discussion/${discussionId}/replies/${replyId}`),
  acceptReply: (discussionId, replyId) => api.patch(`/discussion/${discussionId}/replies/${replyId}/accept`),
  voteReply: (discussionId, replyId, data) => api.patch(`/discussion/${discussionId}/replies/${replyId}/vote`, data),
};

export const problemAPI = {
  getProblemBySlug: (slug) => api.get(`/problem/${slug}`),
  getAllProblems: (params) => api.get("/problem/all", { params }),
  createProblem: (data) => api.post("/problem/create", data),
  updateProblem: (id, data) => api.patch(`/problem/${id}`, data),
  deleteProblem: (id) => api.delete(`/problem/${id}`),
};

export const contestAPI = {
  getAllContests: (params) => api.get("/contest/all", { params }),
  getContestById: (id) => api.get(`/contest/${id}`),
  createContest: (data) => api.post("/contest/create", data),
  updateContest: (id, data) => api.put(`/contest/${id}`, data),
  deleteContest: (id) => api.delete(`/contest/${id}`),
};

export const contestParticipantAPI = {
  registerForContest: (contestId) => api.post(`/contestRegister/${contestId}/register`),
  unregisterFromContest: (contestId) => api.delete(`/contestRegister/${contestId}/register`),
  getMyParticipation: (contestId) => api.get(`/contestRegister/${contestId}/my-participations`),
  getLeaderboard: (contestId, params) => api.get(`/contestRegister/${contestId}/leaderboard`, { params }),
  getMyRank: (contestId) => api.get(`/contestRegister/${contestId}/getRank`),
  getContestParticipants: (contestId, params) => api.get(`/contestRegister/${contestId}/participants`, { params }),
};

export const submissionAPI = {
  submitCode: (data) => api.post("/submission/submit", data),
  getSubmissionById: (id) => api.get(`/submission/${id}`),
  getMySubmissions: (params) => api.get("/submission/my-submissions", { params }),
};

export const contestSubmissionAPI = {
  submitContestProblem: (contestId, problemId, data) => api.post(`/contestSubmission/${contestId}/${problemId}/submit`, data),
  getMyContestSubmissions: (contestId, params) => api.get(`/contestSubmission/${contestId}/Mysubmissions`, { params }),
  getContestSubmissionDetails: (submissionId) => api.get(`/contestSubmission/${submissionId}/submissionDetails`),
};

export const testCaseAPI = {
  getProblemTestCases: (problemId) => api.get(`/testCase/problem/${problemId}`),
  createTestCase: (problemId, data) => api.post(`/testCase/problem/${problemId}`, data),
  getAdminTestCases: (problemId) => api.get(`/testCase/problem/${problemId}`),
  updateTestCase: (id, data) => api.put(`/testCase/${id}`, data),
  deleteTestCase: (id) => api.delete(`/testCase/${id}`),
};

export const adminAPI = {
  createProblem: (data) => api.post("/problem/create", data),
  updateProblem: (id, data) => api.patch(`/problem/${id}`, data),
  deleteProblem: (id) => api.delete(`/problem/${id}`),
};

export const contestProblemAPI = {
  addProblemToContest: (contestId, data) => api.post(`/contestProblem/${contestId}/problems`, data),
  getContestProblems: (contestId, params) => api.get(`/contestProblem/${contestId}/problems`, { params }),
  updateContestProblem: (contestId, problemId, data) => api.put(`/contestProblem/${contestId}/problems/${problemId}`, data),
  removeProblemFromContest: (contestId, problemId) => api.delete(`/contestProblem/${contestId}/problems/${problemId}`),
};

export default api;
