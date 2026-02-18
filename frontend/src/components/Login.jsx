import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:5000/api";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      // Store token and navigate to dashboard
      localStorage.setItem("token", data.token);
      navigate("/sidebar/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] w-full bg-stone-200 flex items-center justify-center p-6 caret-transparent ">
      <div className="w-full max-w-md bg-stone-300 rounded-2xl shadow-xl p-8 md:p-10">
        <div className="flex items-center mb-6">
          <img src="/autoims.png" alt="AutoIMS Logo" className="w-16 h-16" />
          <span className="text-2xl font-bold text-gray-900">AutoIMS</span>
        </div>

        <p className="mt-1 text-sm text-gray-700 font-semibold">
          Manage your Services.
        </p>

        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form className="mt-6 text-gray-700 space-y-4" onSubmit={handleSubmit}>
          <Input
            label="Username"
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="flex justify-center gap-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 rounded-full bg-indigo-700 py-3 text-sm font-semibold tracking-wide cursor-pointer text-white shadow-lg transition hover:-translate-y-0.5 disabled:opacity-50"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </div>
          <div className="text-right text-sm mt-2 text-indigo-700 font-medium cursor-pointer hover:underline">
            Forgot Password?
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-700 mt-4">
            <div className="flex-1 h-px bg-gray-400" />
            or
            <div className="flex-1 h-px bg-gray-400" />
          </div>
        </form>

        <p className="mt-6 text-sm text-gray-700 text-center">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="text-indigo-700 font-semibold cursor-pointer hover:underline"
          >
            Create New!
          </Link>
        </p>
      </div>
    </div>
  );
};

const Input = ({ label, type = "text", placeholder, value, onChange }) => {
  return (
    <div className="select-text">
      <label className="block mb-1.5 text-xs font-semibold text-gray-500">
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        autoComplete="off"
        className="w-full h-11 rounded-lg border border-blue-300 px-4 text-sm text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 caret-black"
      />
    </div>
  );
};

export default Login;
