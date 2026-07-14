import { Navigate, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Problems from './Pages/Problems.jsx';
import Problem from './Pages/Problem.jsx';
import Contests from './Pages/Contests.jsx';
import Contest from './Pages/Contest.jsx';
import Discuss from './Pages/Discuss.jsx';
import Submissions from './Pages/Submissions.jsx';
import Admin from './Pages/Admin.jsx';
import AdminProblems from './Pages/AdminProblems.jsx';
import AdminTestCases from './Pages/AdminTestCases.jsx';
import AdminContests from './Pages/AdminContests.jsx';
import CreateAdmin from './Pages/CreateAdmin.jsx';
import UserManagement from './Pages/UserManagement.jsx';
import Interview from './Pages/Interview.jsx';
import Pricing from './Pages/Pricing.jsx';
import Login from './components/Login.jsx';
import Register from './components/Register.jsx';
import Profile from './Pages/Profile.jsx';
import ForgotPassword from './Pages/ForgotPassword.jsx';
import './App.css';
import Home from './Pages/Home.jsx';

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/problems" element={<Problems />} />
        <Route path="/problem/:slug" element={<Problem />} />
        <Route path="/contests" element={<Contests />} />
        <Route path="/contest/:id" element={<Contest />} />
        <Route path="/contest/:contestId/problem/:slug" element={<Problem />} />
        <Route path="/discuss" element={<Discuss />} />
        <Route path="/discuss/problem/:problemId" element={<Discuss />} />
        <Route path="/submissions" element={<Submissions />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/create" element={<CreateAdmin />} />
        <Route path="/admin/users" element={<UserManagement />} />
        <Route path="/admin/problems" element={<AdminProblems />} />
        <Route path="/admin/testcases/:problemId" element={<AdminTestCases />} />
        <Route path="/admin/contests" element={<AdminContests />} />
        <Route path="/interview" element={<Interview />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
