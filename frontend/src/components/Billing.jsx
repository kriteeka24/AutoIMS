import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "http://localhost:5000";

const Billing = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [billList, setBillList] = useState([]);
  const [pendingJobs, setPendingJobs] = useState([]);
  const [selectedBill, setSelectedBill] = useState(null);
  const [selectedPendingJob, setSelectedPendingJob] = useState(null);
  const [billDetails, setBillDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper to handle 401 - redirect to login
  const handleAuthError = (response) => {
    if (response.status === 401) {
      localStorage.removeItem("token");
      navigate("/login");
      return true;
    }
    return false;
  };

  // Fetch all bills and pending jobs on component mount
  useEffect(() => {
    fetchBills();
    fetchPendingJobs();
  }, []);

  const fetchBills = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      const response = await fetch(`${API_BASE_URL}/api/billing`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (handleAuthError(response)) return;
      if (!response.ok) {
        throw new Error("Failed to fetch bills");
      }
      const data = await response.json();
      setBillList(data.bills || []);
    } catch (err) {
      console.error("Error fetching bills:", err);
      if (!err.message.includes("401")) {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingJobs = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const response = await fetch(
        `${API_BASE_URL}/api/jobs?pending_billing=true`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (handleAuthError(response)) return;
      if (!response.ok) {
        return;
      }
      const data = await response.json();
      setPendingJobs(data.jobs || []);
    } catch (err) {
      console.error("Error fetching pending jobs:", err);
    }
  };

  const handleCreateInvoice = async (job) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/billing/generate`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          job_id: job.job_id,
          tax_rate: 0.18, // 18% tax
        }),
      });

      if (handleAuthError(response)) return;
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to generate invoice");
      }

      const data = await response.json();

      // Remove from pending jobs
      setPendingJobs(pendingJobs.filter((j) => j.job_id !== job.job_id));

      // Refresh bills to include the new one
      await fetchBills();

      alert(`Invoice #${data.bill.bill_id} created successfully!`);
    } catch (err) {
      console.error("Error creating invoice:", err);
      alert(`Failed to create invoice: ${err.message}`);
    }
  };

  const filteredBills = billList.filter(
    (bill) =>
      (bill.customer_name?.toLowerCase() || "").includes(
        searchTerm.toLowerCase(),
      ) ||
      (bill.plate_no?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      bill.bill_id?.toString().includes(searchTerm),
  );

  const handleBillSelect = async (bill) => {
    setSelectedBill(bill);

    // Fetch detailed bill data including parts breakdown
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_BASE_URL}/api/billing/job/${bill.job_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (!response.ok) {
        throw new Error("Failed to fetch bill details");
      }
      const data = await response.json();
      setBillDetails(data.bill);
    } catch (err) {
      console.error("Error fetching bill details:", err);
      alert("Failed to load bill details");
    }
  };

  const handleMarkAsPaid = async () => {
    if (!selectedBill) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_BASE_URL}/api/billing/${selectedBill.bill_id}/pay`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to mark as paid");
      }

      const data = await response.json();

      // Update local state
      setBillList(
        billList.map((bill) =>
          bill.bill_id === selectedBill.bill_id
            ? { ...bill, payment_status: "Paid" }
            : bill,
        ),
      );
      setSelectedBill({ ...selectedBill, payment_status: "Paid" });
      if (billDetails) {
        setBillDetails({ ...billDetails, payment_status: "Paid" });
      }

      alert("Bill marked as paid successfully!");
    } catch (err) {
      console.error("Error marking bill as paid:", err);
      alert(`Failed to mark as paid: ${err.message}`);
    }
  };

  const printReceipt = () => {
    if (!billDetails) return;

    const printWindow = window.open("", "", "height=600,width=800");

    const partsTotal =
      billDetails.parts_used?.reduce(
        (sum, part) => sum + part.quantity_used * part.unit_price_at_time,
        0,
      ) || 0;

    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              width: 350px;
              margin: 0 auto;
              font-size: 14px;
            }
            .header {
              text-align: center;
              margin-bottom: 20px;
            }
            .items {
              margin-bottom: 20px;
            }
            .items div {
              display: flex;
              justify-content: space-between;
              margin-bottom: 5px;
            }
            hr {
              margin: 10px 0;
              border: 1px dashed #000;
            }
            .row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 5px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>AutoIMS</h2>
            <p>123 Service Center, KTM</p>
            <p>Tel: (000) 000-0000</p>
            <hr />
          </div>

          <p><strong>Invoice #:</strong> ${billDetails.bill_id}</p>
          <p><strong>Date:</strong> ${new Date(billDetails.bill_date).toLocaleDateString()}</p>
          
          <hr />

          <p><strong>Customer:</strong> ${billDetails.customer_name || "N/A"}</p>
          <p><strong>Phone:</strong> ${billDetails.customer_phone || "N/A"}</p>
          <p><strong>Vehicle:</strong> ${billDetails.brand || ""} ${billDetails.model || ""}</p>
          <p><strong>Plate No:</strong> ${billDetails.plate_no || "N/A"}</p>

          <hr />
          
          <div class="items">
            <h3>Parts Used:</h3>
            ${
              billDetails.parts_used
                ?.map(
                  (part) => `
              <div>
                <span>${part.part_name} (x${part.quantity_used})</span>
                <span>$${(part.quantity_used * part.unit_price_at_time).toFixed(2)}</span>
              </div>
            `,
                )
                .join("") || "<p>No parts used</p>"
            }
          </div>

          <hr />

          <div class="row">
            <strong>Parts Subtotal:</strong>
            <span>$${Number(billDetails.subtotal_parts || 0).toFixed(2)}</span>
          </div>

          <div class="row">
            <strong>Labor Charge:</strong>
            <span>$${Number(billDetails.subtotal_labor || 0).toFixed(2)}</span>
          </div>

          <div class="row">
            <strong>Tax:</strong>
            <span>$${Number(billDetails.tax || 0).toFixed(2)}</span>
          </div>

          <hr />

          <div class="row" style="margin-bottom: 15px;">
            <strong>Total:</strong>
            <span style="font-size: 18px; font-weight: bold;">$${Number(billDetails.total_amount || 0).toFixed(2)}</span>
          </div>

          <div class="row">
            <strong>Status:</strong>
            <span style="color: ${billDetails.payment_status === "Paid" ? "green" : "red"}; font-weight: bold;">
              ${billDetails.payment_status}
            </span>
          </div>

          <div style="text-align: center; margin-top: 20px;">
            <button onclick="window.print()" style="padding: 10px 20px; background-color: #4CAF50; color: white; border: none; cursor: pointer;">Print</button>
          </div>
          
          <hr />
          <p style="text-align: center; font-size: 12px; margin-top: 10px;">Thank you for using our Service!</p>
        </body>
      </html>
    `);

    printWindow.document.close();
  };

  if (loading) {
    return (
      <div className="p-5">
        <h1 className="text-4xl font-extrabold text-indigo-700 mb-5">
          Billing
        </h1>
        <div className="flex justify-center items-center h-64">
          <p className="text-lg text-gray-500">Loading bills...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-6">
      {/* Left Panel - Bill List */}
      <div className="flex-1">
        <h1 className="text-4xl font-extrabold text-indigo-700 mb-5">
          Billing
        </h1>

        {/* Search Bar */}
        <input
          type="text"
          placeholder="Search by Customer Name, Plate No, or Bill ID"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border border-stone-100 p-2 rounded-xl mb-4 w-full max-w-md bg-white hover:border-blue-300 focus:border-indigo-400 focus:outline-none transition duration-200"
        />

        {/* Awaiting Billing Section */}
        {pendingJobs.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-bold text-orange-600 mb-3 flex items-center gap-2">
              <span>⏳</span> Awaiting Billing ({pendingJobs.length})
            </h2>
            <ul className="space-y-3">
              {pendingJobs.map((job) => (
                <li
                  key={job.job_id}
                  className={`p-3 border-2 rounded-md bg-orange-50 border-orange-200 hover:border-orange-400 transition-all ${
                    selectedPendingJob?.job_id === job.job_id
                      ? "border-orange-500 scale-99"
                      : ""
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-bold text-md">
                        {job.customer_name || "Unknown Customer"}
                      </span>
                      <span className="text-gray-500 font-normal ml-2">
                        ({job.plate_no || "N/A"})
                      </span>
                      <p className="text-sm text-gray-600 mt-1">
                        {job.brand} {job.model} •{" "}
                        {job.service_type || "Service"}
                      </p>
                      <p className="text-sm text-gray-500">
                        Labor: ${Number(job.labor_charge || 0).toFixed(2)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleCreateInvoice(job)}
                      className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-semibold text-sm"
                    >
                      Create Invoice
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Existing Bills Section */}
        <h2 className="text-xl font-bold text-gray-700 mb-3">
          {pendingJobs.length > 0 ? "Generated Bills" : "All Bills"}
        </h2>

        {/* Bill List */}
        <ul className="space-y-4">
          {filteredBills.length === 0 ? (
            <p className="text-gray-500">No bills found</p>
          ) : (
            filteredBills.map((bill) => (
              <li
                key={bill.bill_id}
                className={`cursor-pointer p-3 border-3 rounded-md bg-white
                  ${selectedBill?.bill_id === bill.bill_id ? "border-indigo-400 scale-99" : "border-gray-300 hover:border-blue-300 hover:scale-101"}`}
                onClick={() => handleBillSelect(bill)}
              >
                <div className="flex justify-between">
                  <span className="font-bold text-md">
                    {bill.customer_name || "Unknown"}
                    <span className="text-gray-500 font-normal ml-2">
                      ({bill.plate_no || "N/A"})
                    </span>
                  </span>
                  <span className="text-gray-600 font-semibold">
                    ${Number(bill.total_amount || 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-sm text-gray-500">
                    Bill #{bill.bill_id} • {bill.service_type || "Service"}
                  </span>
                  <span
                    className={`text-sm font-semibold ${bill.payment_status === "Paid" ? "text-green-600" : "text-red-600"}`}
                  >
                    {bill.payment_status}
                  </span>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>

      {/* Right Panel - Bill Details */}
      {selectedBill && billDetails && (
        <div className="w-96 bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <h2 className="text-2xl font-bold text-indigo-700 mb-4">
            Bill Details
          </h2>

          {/* Customer & Vehicle Info */}
          <div className="mb-4">
            <h3 className="font-semibold text-gray-700 mb-2">Customer</h3>
            <p className="text-sm">{billDetails.customer_name || "N/A"}</p>
            <p className="text-sm text-gray-500">
              {billDetails.customer_phone || "N/A"}
            </p>
          </div>

          <div className="mb-4">
            <h3 className="font-semibold text-gray-700 mb-2">Vehicle</h3>
            <p className="text-sm">
              {billDetails.brand} {billDetails.model} ({billDetails.year})
            </p>
            <p className="text-sm text-gray-500">
              Plate: {billDetails.plate_no}
            </p>
          </div>

          {/* Parts Breakdown */}
          <div className="mb-4">
            <h3 className="font-semibold text-gray-700 mb-2">Parts Used</h3>
            {billDetails.parts_used?.length > 0 ? (
              <ul className="text-sm space-y-1">
                {billDetails.parts_used.map((part, index) => (
                  <li key={index} className="flex justify-between">
                    <span>
                      {part.part_name} x{part.quantity_used}
                    </span>
                    <span>
                      $
                      {(part.quantity_used * part.unit_price_at_time).toFixed(
                        2,
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">No parts used</p>
            )}
          </div>

          {/* Totals */}
          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Parts Subtotal:</span>
              <span>${Number(billDetails.subtotal_parts || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Labor Charge:</span>
              <span>${Number(billDetails.subtotal_labor || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Tax:</span>
              <span>${Number(billDetails.tax || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>Total:</span>
              <span>${Number(billDetails.total_amount || 0).toFixed(2)}</span>
            </div>
          </div>

          {/* Status */}
          <div className="mt-4 flex justify-between items-center">
            <span className="font-semibold">Status:</span>
            <span
              className={`px-3 py-1 rounded-full text-sm font-semibold ${
                billDetails.payment_status === "Paid"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {billDetails.payment_status}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex gap-3">
            {billDetails.payment_status !== "Paid" && (
              <button
                onClick={handleMarkAsPaid}
                className="flex-1 p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
              >
                Mark as Paid
              </button>
            )}
            <button
              onClick={printReceipt}
              className="flex-1 p-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 font-semibold"
            >
              Print Invoice
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Billing;
