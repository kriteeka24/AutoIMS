import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:5000/api";

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    customers_count: 0,
    vehicles_count: 0,
    pending_requests: 0,
    active_jobs: 0,
    low_stock_items: 0,
    unpaid_total: 0,
    total_revenue: 0,
    top_employees: [],
  });
  const [loading, setLoading] = useState(true);

  // Handle auth errors
  const handleAuthError = (response) => {
    if (response.status === 401) {
      localStorage.removeItem("token");
      navigate("/login");
      return true;
    }
    return false;
  };

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      console.log("[DEBUG] Token exists:", !!token);
      if (!token) {
        console.log("[DEBUG] No token, redirecting to login");
        navigate("/login");
        return;
      }

      console.log("[DEBUG] Fetching dashboard from:", `${API_BASE}/dashboard`);
      const response = await fetch(`${API_BASE}/dashboard`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("[DEBUG] Response status:", response.status);

      if (handleAuthError(response)) return;

      if (response.ok) {
        const data = await response.json();
        console.log("[DEBUG] Dashboard API response:", data);
        console.log("[DEBUG] Stats received:", data.stats);
        if (data.stats) {
          setStats(data.stats);
          console.log(
            "[DEBUG] Stats set to state - customers:",
            data.stats.customers_count,
            "revenue:",
            data.stats.total_revenue,
          );
        } else {
          console.error("[DEBUG] No stats in response!");
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error(
          "[DEBUG] Dashboard API failed:",
          response.status,
          errorData,
        );
      }
    } catch (err) {
      console.error("[DEBUG] Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();

    // Refresh dashboard when window gains focus (e.g., after navigating back)
    const handleFocus = () => fetchDashboard();
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  // Format currency
  const formatCurrency = (amount) => {
    const num = parseFloat(amount) || 0;
    return `$${num.toFixed(2)}`;
  };

  // Get initials from name
  const getInitials = (name) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Get color for employee card
  const getEmployeeColor = (index) => {
    const colors = ["bg-blue-600", "bg-purple-600", "bg-green-600"];
    return colors[index % colors.length];
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-lg text-gray-500">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-extrabold text-indigo-700">Dashboard</h1>
        <p className="text-gray-600">
          Real-time inventory status, alerts, and recent activity
        </p>
        {/* Debug info - remove after testing */}
        <p className="text-xs text-gray-400 mt-1">
          Debug: Customers={stats.customers_count}, Revenue=
          {stats.total_revenue}, ActiveJobs={stats.active_jobs}
        </p>
      </div>

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-linear-to-r from-green-50 to-green-100 rounded-xl p-5 shadow border border-green-200">
          <p className="text-gray-600 text-sm font-medium">Total Revenue</p>
          <h2 className="text-2xl font-bold text-green-700">
            {formatCurrency(stats.total_revenue)}
          </h2>
          <p className="text-green-600 text-sm mt-1">All time paid</p>
        </div>

        <div className="bg-linear-to-r from-red-50 to-red-100 rounded-xl p-5 shadow border border-red-200">
          <p className="text-gray-600 text-sm font-medium">Low Stock Items</p>
          <h2 className="text-2xl font-bold text-red-700">
            {stats.low_stock_items || 0}
          </h2>
          <p className="text-red-600 text-sm mt-1">Requires attention</p>
        </div>

        <div className="bg-linear-to-r from-indigo-50 to-indigo-100 rounded-xl p-5 shadow border border-indigo-200">
          <p className="text-gray-600 text-sm font-medium">Active Jobs</p>
          <h2 className="text-2xl font-bold text-indigo-700">
            {stats.active_jobs || 0}
          </h2>
          <p className="text-indigo-600 text-sm mt-1">Currently running</p>
        </div>
      </div>

      {/* Main Metrics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Key Metrics Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Customer Metrics Card */}
            <div className="bg-white rounded-xl p-5 shadow border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <p className="text-gray-500 text-sm font-medium">Customers</p>
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600">👥</span>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-800">
                {stats.customers_count || 0}
              </h2>
              <p className="text-gray-400 text-xs mt-1">
                {stats.customers_count > 0
                  ? "Total customers"
                  : "No customers yet"}
              </p>
            </div>

            {/* Vehicle Metrics Card */}
            <div className="bg-white rounded-xl p-5 shadow border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <p className="text-gray-500 text-sm font-medium">Vehicles</p>
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-purple-600">🚗</span>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-800">
                {stats.vehicles_count || 0}
              </h2>
              <p className="text-gray-400 text-xs mt-1">
                {stats.vehicles_count > 0
                  ? "Total vehicles"
                  : "No vehicles in system"}
              </p>
            </div>

            {/* Pending Requests Card */}
            <div className="bg-white rounded-xl p-5 shadow border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <p className="text-gray-500 text-sm font-medium">
                  Pending Requests
                </p>
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <span className="text-yellow-600">⏳</span>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-800">
                {stats.pending_requests || 0}
              </h2>
              <p className="text-gray-400 text-xs mt-1">
                {stats.pending_requests > 0
                  ? "Awaiting action"
                  : "All requests processed"}
              </p>
            </div>

            {/* Unpaid Bills Card */}
            <div className="bg-white rounded-xl p-5 shadow border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <p className="text-gray-500 text-sm font-medium">
                  Unpaid Bills
                </p>
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <span className="text-red-600">💰</span>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-red-700">
                {formatCurrency(stats.unpaid_total)}
              </h2>
              <p className="text-gray-400 text-xs mt-1">
                {stats.unpaid_total > 0 ? "Outstanding" : "All bills paid"}
              </p>
            </div>
          </div>

          {/* Employee Performance Card */}
          <div className="bg-white rounded-xl p-6 shadow border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Top Employees
              </h3>
              <span className="text-blue-600 text-sm font-medium">
                By Rating
              </span>
            </div>

            <div className="space-y-4">
              {stats.top_employees && stats.top_employees.length > 0 ? (
                stats.top_employees.map((emp, index) => (
                  <div
                    key={emp.id}
                    className={`flex items-center justify-between p-3 ${index === 0 ? "bg-blue-50" : "hover:bg-gray-50"} rounded-lg transition-colors`}
                  >
                    <div className="flex items-center">
                      <div
                        className={`w-10 h-10 ${getEmployeeColor(index)} rounded-full flex items-center justify-center text-white font-bold`}
                      >
                        {getInitials(emp.name)}
                      </div>
                      <div className="ml-3">
                        <p className="font-medium text-gray-800">{emp.name}</p>
                        <p className="text-gray-500 text-sm">
                          {emp.position || "Staff"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-800">
                        {emp.jobs_done || 0} Jobs
                      </p>
                      <p className="text-green-600 text-sm">
                        {parseFloat(emp.rating || 0).toFixed(1)}★ Rating
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">
                  No employee data available
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Quick Actions */}
        <div className="space-y-6">
          {/* Quick Actions Card */}
          <div className="bg-white rounded-xl p-6 shadow border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                className="p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-center"
                onClick={() => navigate("/sidebar/service_requests")}
              >
                <span className="block text-blue-600 text-lg mb-1">+</span>
                <span className="text-sm font-medium text-blue-700">
                  Add Service Requests
                </span>
              </button>
              <button
                className="p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-center"
                onClick={() => navigate("/sidebar/employees")}
              >
                <span className="block text-green-600 text-lg mb-1">+</span>
                <span className="text-sm font-medium text-green-700">
                  Add Employee
                </span>
              </button>
              <button
                className="p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors text-center"
                onClick={() => navigate("/sidebar/inventory")}
              >
                <span className="block text-purple-600 text-lg mb-1">📦</span>
                <span className="text-sm font-medium text-purple-700">
                  Add Item
                </span>
              </button>
              <button
                className="p-3 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors text-center"
                onClick={() => navigate("/sidebar/billing")}
              >
                <span className="block text-indigo-600 text-lg mb-1">💰</span>
                <span className="text-sm font-medium text-indigo-700">
                  Billings
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
