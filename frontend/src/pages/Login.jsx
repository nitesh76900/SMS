// components/Login.jsx
import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import kids from "../assets/images/kids.avif";
import AuthService from "../services/authService";
import ProfileService from "../services/profileService";
import { setUser } from "../store/slices/userSlice";
import { useToast } from "../context/ToastContext";

function LoginPage() {
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Admin");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const showToast = useToast();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const loginResponse = await AuthService.login(loginId, password);

      if (loginResponse.message === "Login successfully!") {
        try {
          const profileResponse = await ProfileService.getProfile();
          dispatch(setUser(profileResponse.user));
          showToast("Login successful", "success");
          navigate("/dashboard");
        } catch (profileError) {
          showToast("Failed to fetch user profile", "error");
          console.error("Profile fetch error:", profileError);
        }
      }
    } catch (error) {
      showToast(error.message || "Login failed", "error");
      setError(error.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    showToast(`Switched to ${newRole} login`, "info");
    // Set default login IDs based on role
    switch (newRole) {
      case "Admin":
        setLoginId("A001");
        break;
      case "Teacher":
        setLoginId("T001");
        break;
      case "Student":
        setLoginId("S001");
        break;
      case "Parent":
        setLoginId("P001");
        break;
      default:
        setLoginId("");
    }
    setPassword("password123"); // Default password for demo
  };

  return (
    <div className="flex h-screen w-screen">
      {/* Left Side - Form Section */}
      <div className="flex flex-col justify-center items-center w-full md:w-1/2 bg-gray-50">
        <div className="w-full max-w-md bg-white shadow-lg p-6 mx-auto">
          {/* Logo and Title */}
          <div className="flex items-center justify-center mb-8">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold ml-3 text-blue-600">
              Login Portal
            </h1>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label
                className="block text-gray-700 font-medium mb-1"
                htmlFor="loginId"
              >
                Login ID
              </label>
              <input
                type="text"
                id="loginId"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="Enter your login ID"
                required
                disabled={loading}
              />
            </div>
            <div>
              <label
                className="block text-gray-700 font-medium mb-1"
                htmlFor="password"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="Enter your password"
                required
                disabled={loading}
              />
            </div>

            {error && (
              <div className="text-red-500 text-sm text-center">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 text-white font-semibold py-2 rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition"
            >
              {loading ? "Logging in..." : "Log in"}
            </button>
          </form>

          {/* Login As Options */}
          <div className="mt-8">
            <p className="text-gray-500 mb-2 text-center">Login As</p>
            <div className="flex flex-wrap justify-center gap-2">
              {["Admin", "Teacher", "Parent", "Student"].map((roleOption) => (
                <button
                  key={roleOption}
                  onClick={() => handleRoleChange(roleOption)}
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition duration-200 ${
                    role === roleOption
                      ? "bg-green-500 text-white shadow-md"
                      : "border-green-500 text-green-500 hover:bg-green-500 hover:text-white"
                  }`}
                >
                  {roleOption}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Image Section */}
      <div
        className="hidden md:block w-1/2 h-full bg-cover bg-center"
        style={{
          backgroundImage: `url(${kids})`,
        }}
      />
    </div>
  );
}

export default LoginPage;
