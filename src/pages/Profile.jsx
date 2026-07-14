import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";
import { User, Mail, Shield, Calendar, Camera, Lock, Edit2, Save, X, CheckCircle, AlertCircle } from "lucide-react";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [editMode, setEditMode] = useState(false);

  // Profile update form
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });

  // Password change form
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Avatar upload
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  // UI states
  const [updating, setUpdating] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    setLoading(true);
    try {
      const response = await authAPI.getUser();
      setUser(response.data.data.user);
      setFormData({
        name: response.data.data.user.name || "",
        email: response.data.data.user.email || "",
      });
      setAvatarPreview(response.data.data.user.avatar || null);
    } catch (error) {
      console.error("Error fetching user:", error);
      showMessage("error", "Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 3000);
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      if (avatarFile) {
        // Handle avatar upload with FormData
        const uploadFormData = new FormData();
        uploadFormData.append("avatar", avatarFile);
        uploadFormData.append("name", formData.name);
        uploadFormData.append("email", formData.email);

        // Use axios directly for multipart/form-data
        const axios = (await import("axios")).default;
        const token = localStorage.getItem("token");
        
       await axios.put(
          `${import.meta.env.VITE_API_URL}/api/v1/auth/user`,
          uploadFormData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            withCredentials: true,
          }
        );
      } else {
        // Regular update without avatar
        await authAPI.updateUser(formData);
      }
      
      await fetchUser();
      setEditMode(false);
      showMessage("success", "Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      showMessage("error", error.response?.data?.message || "Failed to update profile");
    } finally {
      setUpdating(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showMessage("error", "Passwords do not match");
      return;
    }

    setChangingPassword(true);
    try {
      await authAPI.updateUser({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      showMessage("success", "Password changed successfully");
    } catch (error) {
      console.error("Error changing password:", error);
      showMessage("error", error.response?.data?.message || "Failed to change password");
    } finally {
      setChangingPassword(false);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showMessage("error", "File size must be less than 2MB");
        return;
      }
      if (!file.type.startsWith("image/")) {
        showMessage("error", "File must be an image");
        return;
      }
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070913] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-yellow-500 mx-auto mb-4" />
          <div className="text-zinc-400 text-sm">Loading profile...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#070913] text-white flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <div className="text-zinc-400 text-sm">Failed to load profile</div>
          <button
            onClick={() => navigate("/")}
            className="mt-4 text-yellow-500 hover:text-yellow-400"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070913] text-zinc-100 font-sans relative selection:bg-yellow-500/30">
      {/* Background Glows */}
      <div className="absolute top-0 right-10 h-[400px] w-[400px] rounded-full bg-blue-500/5 blur-[100px] pointer-events-none" />
      <div className="absolute top-1/3 left-10 h-[400px] w-[400px] rounded-full bg-yellow-500/3 blur-[100px] pointer-events-none" />

      <div className="relative max-w-4xl mx-auto px-4 py-8 sm:px-6">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="mb-6 text-zinc-500 hover:text-white flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider transition-colors"
          >
            <span>← Back</span>
          </button>
          <h1 className="text-3xl font-bold text-white">My Profile</h1>
          <p className="mt-2 text-zinc-400">Manage your account settings and preferences</p>
        </div>

        {/* Message Alert */}
        {message.text && (
          <div className={`mb-6 rounded-lg p-4 ${
            message.type === "success" 
              ? "bg-green-500/10 border border-green-500/20 text-green-400" 
              : "bg-red-500/10 border border-red-500/20 text-red-400"
          }`}>
            <div className="flex items-center gap-2">
              {message.type === "success" ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              <span className="text-sm">{message.text}</span>
            </div>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Avatar Section */}
            <div className="bg-[#0f111e]/60 rounded-2xl border border-zinc-800 p-6 backdrop-blur text-center">
              <div className="relative inline-block mb-4">
                <div className="h-24 w-24 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-800 flex items-center justify-center text-3xl font-bold text-zinc-300 border-4 border-zinc-800 overflow-hidden">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar" className="h-full w-full object-cover" />
                  ) : (
                    <span>{user.name?.charAt(0).toUpperCase() || user.userName?.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <label className="absolute bottom-0 right-0 bg-yellow-500 hover:bg-yellow-400 text-black p-2 rounded-full cursor-pointer transition-colors">
                  <Camera className="h-4 w-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              </div>
              <h3 className="font-bold text-white text-lg">{user.name}</h3>
              <p className="text-zinc-500 text-sm">@{user.userName}</p>
              <div className="mt-3 flex items-center justify-center gap-2">
                {user.verified ? (
                  <span className="text-green-400 text-xs flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Verified
                  </span>
                ) : (
                  <span className="text-yellow-400 text-xs flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Unverified
                  </span>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-[#0f111e]/60 rounded-2xl border border-zinc-800 p-6 backdrop-blur">
              <h3 className="font-bold text-white text-sm mb-4">Account Info</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Shield className="h-4 w-4 text-zinc-500" />
                  <span className="text-zinc-400">Role:</span>
                  <span className="text-white capitalize">{user.role}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-zinc-500" />
                  <span className="text-zinc-400">Joined:</span>
                  <span className="text-white">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {user.lastLogin && (
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="h-4 w-4 text-zinc-500" />
                    <span className="text-zinc-400">Last Login:</span>
                    <span className="text-white">
                      {new Date(user.lastLogin).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="bg-[#0f111e]/60 rounded-2xl border border-zinc-800 p-6 backdrop-blur">
            {/* Tabs */}
            <div className="flex border-b border-zinc-800 mb-6">
              {["overview", "security"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-3 text-sm font-semibold transition-colors border-b-2 ${
                    activeTab === tab
                      ? "border-yellow-500 text-yellow-500"
                      : "border-transparent text-zinc-400 hover:text-white"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">Profile Information</h2>
                  {!editMode && (
                    <button
                      onClick={() => setEditMode(true)}
                      className="flex items-center gap-2 text-sm text-yellow-500 hover:text-yellow-400 transition-colors"
                    >
                      <Edit2 className="h-4 w-4" />
                      Edit Profile
                    </button>
                  )}
                </div>

                {editMode ? (
                  <form onSubmit={handleProfileUpdate} className="space-y-4">
                    <div>
                      <label className="block mb-2 text-sm font-medium text-zinc-400">Full Name</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full rounded-lg border border-zinc-700 bg-[#171717] px-4 py-3 text-zinc-200 outline-none focus:border-yellow-500 transition-colors"
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <label className="block mb-2 text-sm font-medium text-zinc-400">Email Address</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full rounded-lg border border-zinc-700 bg-[#171717] px-4 py-3 text-zinc-200 outline-none focus:border-yellow-500 transition-colors"
                        placeholder="Enter your email"
                      />
                    </div>
                    <div className="flex gap-3 pt-4">
                      <button
                        type="submit"
                        disabled={updating}
                        className="flex-1 bg-yellow-500 hover:bg-yellow-350 text-black py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {updating ? "Saving..." : <><Save className="h-4 w-4" /> Save Changes</>}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditMode(false);
                          setFormData({
                            name: user.name || "",
                            email: user.email || "",
                          });
                          setAvatarPreview(user.avatar || null);
                          setAvatarFile(null);
                        }}
                        className="px-6 py-3 rounded-lg border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-600 transition-colors flex items-center gap-2"
                      >
                        <X className="h-4 w-4" />
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 rounded-lg bg-[#080a15] border border-zinc-800">
                      <User className="h-5 w-5 text-zinc-500" />
                      <div>
                        <p className="text-xs text-zinc-500 uppercase tracking-wider">Username</p>
                        <p className="text-white font-medium">{user.userName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 rounded-lg bg-[#080a15] border border-zinc-800">
                      <Mail className="h-5 w-5 text-zinc-500" />
                      <div>
                        <p className="text-xs text-zinc-500 uppercase tracking-wider">Email</p>
                        <p className="text-white font-medium">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 rounded-lg bg-[#080a15] border border-zinc-800">
                      <User className="h-5 w-5 text-zinc-500" />
                      <div>
                        <p className="text-xs text-zinc-500 uppercase tracking-wider">Full Name</p>
                        <p className="text-white font-medium">{user.name}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
              <div>
                <h2 className="text-xl font-bold text-white mb-6">Change Password</h2>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-zinc-400">Current Password</label>
                    <input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      className="w-full rounded-lg border border-zinc-700 bg-[#171717] px-4 py-3 text-zinc-200 outline-none focus:border-yellow-500 transition-colors"
                      placeholder="Enter current password"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium text-zinc-400">New Password</label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className="w-full rounded-lg border border-zinc-700 bg-[#171717] px-4 py-3 text-zinc-200 outline-none focus:border-yellow-500 transition-colors"
                      placeholder="Enter new password"
                      required
                    />
                    <p className="text-xs text-zinc-500 mt-1">
                      Must be at least 8 characters with uppercase, lowercase, number, and special character
                    </p>
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium text-zinc-400">Confirm New Password</label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      className="w-full rounded-lg border border-zinc-700 bg-[#171717] px-4 py-3 text-zinc-200 outline-none focus:border-yellow-500 transition-colors"
                      placeholder="Confirm new password"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={changingPassword}
                    className="w-full bg-yellow-500 hover:bg-yellow-400 text-black py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {changingPassword ? "Changing..." : <><Lock className="h-4 w-4" /> Change Password</>}
                  </button>
                </form>

                <div className="mt-8 pt-6 border-t border-zinc-800">
                  <h3 className="text-lg font-bold text-white mb-4">Forgot Password?</h3>
                  <p className="text-zinc-400 text-sm mb-4">
                    If you've forgotten your password, you can request a reset link via email.
                  </p>
                  <button
                    onClick={() => navigate("/forgot-password")}
                    className="text-yellow-500 hover:text-yellow-400 text-sm font-medium"
                  >
                    Request Password Reset →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
