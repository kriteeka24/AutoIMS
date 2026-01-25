import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Signup = () => {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, username, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Signup failed");
      }

      // Redirect to login page after successful signup
      navigate("/login");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] w-full bg-stone-200 flex items-center justify-center p-6 caret-transparent ">
      <div className="w-full max-w-md bg-stone-300 rounded-2xl shadow-xl p-8 md:p-10">
        {/* Logo */}
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

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full name"
              placeholder="John Cena"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              label="Username"
              placeholder="John"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <Input
            label="Email Address"
            type="email"
            placeholder="john@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 rounded-xl bg-indigo-700 py-3 text-sm font-semibold cursor-pointer tracking-wide text-white shadow-lg transition hover:-translate-y-0.5 disabled:opacity-50"
          >
            {loading ? "Creating account..." : "CREATE AN ACCOUNT"}
          </button>
        </form>

        <p className="mt-6 text-xs text-slate-500 text-center">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-blue-600 font-semibold cursor-pointer hover:underline"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

const Input = ({ label, type = "text", placeholder, value, onChange }) => {
  return (
    <div>
      <label className="block mb-1.5 text-xs font-semibold text-slate-500">
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full h-11 rounded-xl border border-indigo-100 bg-indigo-50/60 px-4 text-sm text-slate-800 outline-none transition focus:border-indigo-300 focus:shadow-md caret-black"
      />
    </div>
  );
};

export default Signup;
