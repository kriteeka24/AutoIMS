import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:5000/api";

const Service_request = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [editRequestData, setEditRequestData] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [newRequest, setNewRequest] = useState({
    customerName: "",
    phone: "",
    email: "",
    address: "",
    plateNo: "",
    vehicleBrand: "",
    vehicleModel: "",
    vehicleYear: "",
    vehicleColor: "",
    serviceType: "",
    problemNote: "",
    priority: "Normal",
    assignedEmployeeId: "",
  });

  // Get JWT token
  const getAuthToken = () => localStorage.getItem("token");

  // Helper to handle 401 - redirect to login
  const handleAuthError = (response) => {
    if (response.status === 401) {
      localStorage.removeItem("token");
      navigate("/login");
      return true;
    }
    return false;
  };

  // Fetch all service requests with employee info
  const fetchRequests = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      if (!token) {
        navigate("/login");
        return;
      }
      const response = await fetch(
        `${API_BASE}/service-requests?include_employees=true`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (handleAuthError(response)) return;

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch service requests");
      }

      const data = await response.json();
      setRequests(data.requests || []);
    } catch (err) {
      console.error("Failed to fetch service requests:", err);
      // Don't show auth errors
      if (
        !err.message.includes("401") &&
        !err.message.includes("Employee not found")
      ) {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch all employees for assignment dropdown
  const fetchEmployees = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;
      const response = await fetch(`${API_BASE}/employees`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (handleAuthError(response)) return;
      if (!response.ok) return;
      const data = await response.json();
      setEmployees(data.employees || []);
    } catch (err) {
      console.error("Failed to fetch employees:", err);
    }
  };

  useEffect(() => {
    fetchRequests();
    fetchEmployees();
  }, []);

  // Handle form input changes
  const handleNewRequestChange = (e) => {
    const { name, value } = e.target;
    setNewRequest((prev) => ({ ...prev, [name]: value }));
  };

  // Add new service request
  const handleAddRequest = async (e) => {
    e.preventDefault();
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE}/service-requests`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customer: {
            name: newRequest.customerName,
            phone: newRequest.phone,
            email: newRequest.email,
            address: newRequest.address,
          },
          vehicle: {
            plate_no: newRequest.plateNo,
            brand: newRequest.vehicleBrand,
            model: newRequest.vehicleModel,
            year: parseInt(newRequest.vehicleYear) || new Date().getFullYear(),
            color: newRequest.vehicleColor || "Unknown",
          },
          service_type: newRequest.serviceType,
          problem_note: newRequest.problemNote,
          priority: newRequest.priority,
          assigned_employee_id: newRequest.assignedEmployeeId || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create service request");
      }

      // Refresh list
      await fetchRequests();
      setShowAddPopup(false);
      setNewRequest({
        customerName: "",
        phone: "",
        email: "",
        address: "",
        plateNo: "",
        vehicleBrand: "",
        vehicleModel: "",
        vehicleYear: "",
        vehicleColor: "",
        serviceType: "",
        problemNote: "",
        priority: "Normal",
        assignedEmployeeId: "",
      });
    } catch (err) {
      console.error("Failed to add service request:", err);
      alert(err.message);
    }
  };

  // Open edit popup
  const handleEditRequest = (req) => {
    setEditRequestData({ ...req, labor_charge: "" });
    setShowEditPopup(true);
  };

  const handleEditPopupClose = () => {
    setShowEditPopup(false);
    setEditRequestData(null);
  };

  const handleEditRequestChange = (e) => {
    const { name, value } = e.target;
    setEditRequestData((prev) => ({ ...prev, [name]: value }));
  };

  // Submit edit
  const handleEditPopupSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = getAuthToken();

      // Build request body
      const requestBody = {
        service_type: editRequestData.service_type,
        problem_note: editRequestData.problem_note,
        priority: editRequestData.priority,
        status: editRequestData.status,
      };

      // Include labor_charge if status is Completed
      if (editRequestData.status === "Completed") {
        requestBody.labor_charge =
          parseFloat(editRequestData.labor_charge) || 0;
      }

      const response = await fetch(
        `${API_BASE}/service-requests/${editRequestData.request_id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update service request");
      }

      const data = await response.json();

      // If a bill was generated, show success message
      if (data.bill) {
        alert(
          `Service completed! Bill #${data.bill.bill_id} generated. Total: ₹${data.bill.total_amount}`,
        );
      }

      await fetchRequests();
      handleEditPopupClose();
    } catch (err) {
      console.error("Failed to update service request:", err);
      alert(err.message);
    }
  };

  // Delete service request
  const handleDeleteRequest = async (requestId) => {
    if (
      window.confirm("Are you sure you want to delete this service request?")
    ) {
      try {
        const token = getAuthToken();
        const response = await fetch(
          `${API_BASE}/service-requests/${requestId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || "Failed to delete service request",
          );
        }

        await fetchRequests();
      } catch (err) {
        console.error("Failed to delete service request:", err);
        alert(err.message);
      }
    }
  };

  // Filter requests by search term
  const filteredRequests = requests.filter(
    (req) =>
      (req.customer_name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      String(req.request_id).includes(searchTerm) ||
      (req.plate_no || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (req.service_type || "").toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="w-full max-w-full mx-auto p-6">
        <h1 className="text-4xl font-extrabold text-indigo-700 mb-5">
          Service Requests
        </h1>
        <div className="flex justify-center items-center h-64">
          <p className="text-lg text-gray-500">Loading service requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full mx-auto p-6">
      <h1 className="text-4xl font-extrabold text-indigo-700 mb-5">
        Service Requests
      </h1>

      <div className="flex justify-between items-center mb-6">
        <input
          type="text"
          placeholder="Search by Customer, Request ID, Plate No, or Service Type"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border border-stone-300 p-2 rounded-xl w-full max-w-md bg-white hover:border-blue-300 focus:border-indigo-400 focus:outline-none transition duration-200"
        />
        <button
          className="p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors text-center ml-6"
          onClick={() => {
            fetchEmployees(); // Refresh employees list to avoid stale data
            setShowAddPopup(true);
          }}
        >
          <span className="block text-purple-600 text-lg mb-1">➕</span>
          <span className="text-sm font-medium text-purple-700">
            Add Service Request
          </span>
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full w-full table-auto bg-white shadow-md rounded-lg">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Request ID</th>
              <th className="p-3 text-left">Customer</th>
              <th className="p-3 text-left">Vehicle</th>
              <th className="p-3 text-left">Service Type</th>
              <th className="p-3 text-left">Assigned Employee</th>
              <th className="p-3 text-left">Priority</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRequests.length === 0 ? (
              <tr>
                <td colSpan="9" className="p-4 text-center text-gray-500">
                  No service requests found
                </td>
              </tr>
            ) : (
              filteredRequests.map((req) => (
                <tr
                  key={req.request_id}
                  className="border-t border-gray-300 hover:bg-gray-50"
                >
                  <td className="p-3 font-mono text-sm">{req.request_id}</td>
                  <td className="p-3">
                    <span className="block font-semibold">
                      {req.customer_name}
                    </span>
                    <span className="block text-xs text-gray-500">
                      ID: {req.customer_id} | {req.customer_phone}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="block font-semibold">
                      {req.vehicle_brand} {req.vehicle_model}
                    </span>
                    <span className="block text-xs text-gray-500">
                      {req.plate_no}
                    </span>
                  </td>
                  <td className="p-3">{req.service_type}</td>
                  <td className="p-3">
                    {req.assigned_employee_name ? (
                      <>
                        <span className="block font-semibold">
                          {req.assigned_employee_name}
                        </span>
                        <span className="block text-xs text-gray-500">
                          {req.assigned_employee_position}
                        </span>
                      </>
                    ) : (
                      <span className="text-gray-400 italic">Not assigned</span>
                    )}
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        req.priority === "High"
                          ? "bg-red-100 text-red-700"
                          : req.priority === "Low"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {req.priority}
                    </span>
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        req.status === "Completed"
                          ? "bg-green-100 text-green-700"
                          : req.status === "In Progress"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {req.status}
                    </span>
                  </td>
                  <td className="p-3 text-center flex gap-2 justify-center">
                    <button
                      onClick={() => handleEditRequest(req)}
                      className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteRequest(req.request_id)}
                      className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Service Request Popup */}
      {showAddPopup && (
        <div className="fixed inset-0 flex items-start justify-center z-50 bg-black/30 overflow-y-auto py-8">
          <form
            className="flex flex-col space-y-4 bg-white p-8 rounded-3xl shadow-xl relative w-full max-w-2xl mx-4 my-auto"
            onSubmit={handleAddRequest}
          >
            <button
              className="absolute top-3 right-3 text-2xl text-gray-500 hover:text-gray-700"
              onClick={() => setShowAddPopup(false)}
              type="button"
            >
              ❌
            </button>
            <h2 className="text-2xl font-bold text-center mb-2">
              Add Service Request
            </h2>

            {/* Customer Info Section */}
            <div className="border-b pb-4">
              <h3 className="text-lg font-semibold text-gray-700 mb-3">
                Customer Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 font-medium block text-sm">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="customerName"
                    value={newRequest.customerName}
                    onChange={handleNewRequestChange}
                    required
                    className="p-2 border border-gray-300 rounded-lg w-full focus:border-indigo-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 font-medium block text-sm">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="phone"
                    value={newRequest.phone}
                    onChange={handleNewRequestChange}
                    required
                    className="p-2 border border-gray-300 rounded-lg w-full focus:border-indigo-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 font-medium block text-sm">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="email"
                    type="email"
                    value={newRequest.email}
                    onChange={handleNewRequestChange}
                    required
                    className="p-2 border border-gray-300 rounded-lg w-full focus:border-indigo-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 font-medium block text-sm">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="address"
                    value={newRequest.address}
                    onChange={handleNewRequestChange}
                    required
                    className="p-2 border border-gray-300 rounded-lg w-full focus:border-indigo-400 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Vehicle Info Section */}
            <div className="border-b pb-4">
              <h3 className="text-lg font-semibold text-gray-700 mb-3">
                Vehicle Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 font-medium block text-sm">
                    Plate No <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="plateNo"
                    value={newRequest.plateNo}
                    onChange={handleNewRequestChange}
                    required
                    placeholder="ABC-1234"
                    className="p-2 border border-gray-300 rounded-lg w-full focus:border-indigo-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 font-medium block text-sm">
                    Brand <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="vehicleBrand"
                    value={newRequest.vehicleBrand}
                    onChange={handleNewRequestChange}
                    required
                    placeholder="Toyota"
                    className="p-2 border border-gray-300 rounded-lg w-full focus:border-indigo-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 font-medium block text-sm">
                    Model <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="vehicleModel"
                    value={newRequest.vehicleModel}
                    onChange={handleNewRequestChange}
                    required
                    placeholder="Corolla"
                    className="p-2 border border-gray-300 rounded-lg w-full focus:border-indigo-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 font-medium block text-sm">Year</label>
                  <input
                    name="vehicleYear"
                    type="number"
                    value={newRequest.vehicleYear}
                    onChange={handleNewRequestChange}
                    placeholder="2023"
                    className="p-2 border border-gray-300 rounded-lg w-full focus:border-indigo-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 font-medium block text-sm">
                    Color
                  </label>
                  <input
                    name="vehicleColor"
                    value={newRequest.vehicleColor}
                    onChange={handleNewRequestChange}
                    placeholder="White"
                    className="p-2 border border-gray-300 rounded-lg w-full focus:border-indigo-400 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Service Info Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-3">
                Service Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 font-medium block text-sm">
                    Service Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="serviceType"
                    value={newRequest.serviceType}
                    onChange={handleNewRequestChange}
                    required
                    className="p-2 border border-gray-300 rounded-lg w-full focus:border-indigo-400 focus:outline-none"
                  >
                    <option value="">Select service type</option>
                    <option value="Engine Repair">Engine Repair</option>
                    <option value="Brake Service">Brake Service</option>
                    <option value="Oil Change">Oil Change</option>
                    <option value="Tire Service">Tire Service</option>
                    <option value="Electrical">Electrical</option>
                    <option value="AC Service">AC Service</option>
                    <option value="General Maintenance">
                      General Maintenance
                    </option>
                    <option value="Body Work">Body Work</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 font-medium block text-sm">
                    Priority
                  </label>
                  <select
                    name="priority"
                    value={newRequest.priority}
                    onChange={handleNewRequestChange}
                    className="p-2 border border-gray-300 rounded-lg w-full focus:border-indigo-400 focus:outline-none"
                  >
                    <option value="Low">Low</option>
                    <option value="Normal">Normal</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 font-medium block text-sm">
                    Assigned Employee <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="assignedEmployeeId"
                    value={newRequest.assignedEmployeeId}
                    onChange={handleNewRequestChange}
                    required
                    className="p-2 border border-gray-300 rounded-lg w-full focus:border-indigo-400 focus:outline-none"
                  >
                    <option value="">
                      Select employee ({employees.length} available)
                    </option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} ({emp.position})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1 font-medium block text-sm">
                    Problem Description
                  </label>
                  <textarea
                    name="problemNote"
                    value={newRequest.problemNote}
                    onChange={handleNewRequestChange}
                    rows={3}
                    placeholder="Describe the problem..."
                    className="p-2 border border-gray-300 rounded-lg w-full focus:border-indigo-400 focus:outline-none resize-none"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition mt-4"
            >
              Create Service Request
            </button>
          </form>
        </div>
      )}

      {/* Edit Service Request Popup */}
      {showEditPopup && editRequestData && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/30">
          <form
            className="flex flex-col space-y-4 bg-white p-8 rounded-3xl shadow-xl relative w-full max-w-md mx-4"
            onSubmit={handleEditPopupSubmit}
          >
            <button
              className="absolute top-3 right-3 text-2xl text-gray-500 hover:text-gray-700"
              onClick={handleEditPopupClose}
              type="button"
            >
              ❌
            </button>
            <h2 className="text-2xl font-bold text-center mb-2">
              Edit Service Request #{editRequestData.request_id}
            </h2>

            <div className="bg-gray-50 p-3 rounded-lg mb-2">
              <p className="text-sm text-gray-600">
                <strong>Customer:</strong> {editRequestData.customer_name}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Vehicle:</strong> {editRequestData.vehicle_brand}{" "}
                {editRequestData.vehicle_model} ({editRequestData.plate_no})
              </p>
            </div>

            <div>
              <label className="mb-1 font-medium block text-sm">
                Service Type
              </label>
              <select
                name="service_type"
                value={editRequestData.service_type || ""}
                onChange={handleEditRequestChange}
                className="p-2 border border-gray-300 rounded-lg w-full focus:border-indigo-400 focus:outline-none"
              >
                <option value="Engine Repair">Engine Repair</option>
                <option value="Brake Service">Brake Service</option>
                <option value="Oil Change">Oil Change</option>
                <option value="Tire Service">Tire Service</option>
                <option value="Electrical">Electrical</option>
                <option value="AC Service">AC Service</option>
                <option value="General Maintenance">General Maintenance</option>
                <option value="Body Work">Body Work</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="mb-1 font-medium block text-sm">
                Problem Note
              </label>
              <textarea
                name="problem_note"
                value={editRequestData.problem_note || ""}
                onChange={handleEditRequestChange}
                rows={3}
                className="p-2 border border-gray-300 rounded-lg w-full focus:border-indigo-400 focus:outline-none resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 font-medium block text-sm">
                  Priority
                </label>
                <select
                  name="priority"
                  value={editRequestData.priority || "Normal"}
                  onChange={handleEditRequestChange}
                  className="p-2 border border-gray-300 rounded-lg w-full focus:border-indigo-400 focus:outline-none"
                >
                  <option value="Low">Low</option>
                  <option value="Normal">Normal</option>
                  <option value="High">High</option>
                </select>
              </div>
              <div>
                <label className="mb-1 font-medium block text-sm">Status</label>
                <select
                  name="status"
                  value={editRequestData.status || "Pending"}
                  onChange={handleEditRequestChange}
                  className="p-2 border border-gray-300 rounded-lg w-full focus:border-indigo-400 focus:outline-none"
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Labor Charge - Only shown when status is Completed */}
            {editRequestData.status === "Completed" && (
              <div>
                <label className="mb-1 font-medium block text-sm">
                  Labor Charge (₹){" "}
                  <span className="text-gray-500 text-xs">(for billing)</span>
                </label>
                <input
                  type="number"
                  name="labor_charge"
                  value={editRequestData.labor_charge || ""}
                  onChange={handleEditRequestChange}
                  placeholder="Enter labor charge amount"
                  min="0"
                  step="0.01"
                  className="p-2 border border-gray-300 rounded-lg w-full focus:border-indigo-400 focus:outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Parts cost will be calculated automatically from inventory
                  usage.
                </p>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition mt-4"
            >
              Save Changes
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Service_request;
