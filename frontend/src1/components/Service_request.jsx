import React, { useState } from 'react';
import { usePopupTrigger } from "./PopupTriggerContext";

const Service_request = () => {
  const initialRequests = [
    {
      customerId: 'CUST001',
      customerName: 'John Doe',
      phone: '1234567890',
      email: 'john@example.com',
      address: '123 Main St',
      vehicleModel: 'Toyota Corolla',
      vehicleType: 'Sedan',
      vehicleBrand: 'Toyota',
      problem: 'Engine noise',
      employees: [
        { employeeId: 'EMP001', employeeName: 'Mike Johnson' },
      ],
      assignment: 'Engine check',
    },
    {
      customerId: 'CUST002',
      customerName: 'Jane Smith',
      phone: '9876543210',
      email: 'jane@example.com',
      address: '456 Oak Ave',
      vehicleModel: 'Honda Civic',
      vehicleType: 'Sedan',
      vehicleBrand: 'Honda',
      problem: 'Brake issue',
      employees: [
        { employeeId: 'EMP002', employeeName: 'Lucy Lee' },
      ],
      assignment: 'Brake replacement',
    },
  ];

  const employeeList = [
    { employeeId: 'EMP001', employeeName: 'Mike Johnson' },
    { employeeId: 'EMP002', employeeName: 'Lucy Lee' },
    { employeeId: 'EMP003', employeeName: 'Jane Smith' },
    { employeeId: 'EMP004', employeeName: 'Sam Brown' },
    { employeeId: 'EMP005', employeeName: 'John Doe' },
  ];

  const [requests, setRequests] = useState(initialRequests);
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [editRequestData, setEditRequestData] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { triggers } = usePopupTrigger();

  const [newRequest, setNewRequest] = useState({
    customerId: '',
    customerName: '',
    phone: '',
    email: '',
    address: '',
    vehicleModel: '',
    vehicleType: '',
    vehicleBrand: '',
    problem: '',
    employees: [],
    assignment: '',
  });

  const handleAddRequest = (e) => {
    e.preventDefault();
    setRequests([...requests, newRequest]);
    setShowAddPopup(false);
    setNewRequest({
      customerId: '', customerName: '', phone: '', email: '', address: '', vehicleModel: '', vehicleType: '', vehicleBrand: '', problem: '', employees: [], assignment: '',
    });
  };

  const handleNewRequestChange = (e) => {
    const { name, value } = e.target;
    setNewRequest((prev) => ({ ...prev, [name]: value }));
  };

  const handleEmployeeSelect = (e) => {
    const value = e.target.value;
    const found = employeeList.find(emp => emp.employeeId === value || emp.employeeName === value);
    if (found && !newRequest.employees.some(emp => emp.employeeId === found.employeeId)) {
      setNewRequest(prev => ({ ...prev, employees: [...prev.employees, found] }));
    }
  };

  const handleRemoveEmployee = (empId) => {
    setNewRequest(prev => ({ ...prev, employees: prev.employees.filter(emp => emp.employeeId !== empId) }));
  };

  const handleEditRequest = (req) => {
    setEditRequestData({ ...req });
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
  const handleEditPopupSubmit = (e) => {
    e.preventDefault();
    setRequests(requests.map((req, idx) =>
      idx === editRequestData.idx ? { ...editRequestData } : req
    ));
    handleEditPopupClose();
  };

  const handleEditEmployeeSelect = (e) => {
    const value = e.target.value;
    const found = employeeList.find(emp => emp.employeeId === value || emp.employeeName === value);
    if (found && !editRequestData.employees.some(emp => emp.employeeId === found.employeeId)) {
      setEditRequestData(prev => ({ ...prev, employees: [...prev.employees, found] }));
    }
  };

  const handleEditRemoveEmployee = (empId) => {
    setEditRequestData(prev => ({ ...prev, employees: prev.employees.filter(emp => emp.employeeId !== empId) }));
  };

  const handleDeleteRequest = (idx) => {
    if (window.confirm('Are you sure you want to delete this service request?')) {
      setRequests(requests.filter((_, i) => i !== idx));
    }
  };

  const filteredRequests = requests.filter(
    (req) =>
      req.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.customerId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  React.useEffect(() => {
    if (triggers.serviceRequest) setShowAddPopup(true);
  }, [triggers.serviceRequest]);

  return (
    <div className="w-full max-w-full mx-auto p-6">
      <h1 className="text-4xl font-extrabold text-indigo-700 mb-5">Service Requests</h1>
      <div className="flex justify-between items-center mb-6">
        <input
          type="text"
          placeholder="Search by Customer Name or ID"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border border-stone-300 p-2 rounded-xl w-full max-w-md bg-white hover:border-blue-300 focus:border-indigo-400 focus:outline-none transition duration-200"
        />
        <button
          className="p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors text-center ml-6"
          onClick={() => setShowAddPopup(true)}
        >
          <span className="block text-purple-600 text-lg mb-1">➕</span>
          <span className="text-sm font-medium text-purple-700">Add Service Request</span>
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full w-full table-auto bg-white shadow-md rounded-lg">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Customer Name</th>
              <th className="p-3 text-left">Customer ID</th>
              <th className="p-3 text-left">Employees</th>
              <th className="p-3 text-left">Vehicle</th>
              <th className="p-3 text-left">Problem</th>
              <th className="p-3 text-left">Assignment</th>
              <th className="p-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredRequests.map((req, idx) => (
              <tr key={idx} className="border-t border-gray-300">
                <td className="p-3">{req.customerName}</td>
                <td className="p-3">{req.customerId}</td>
                <td className="p-3">
                  {req.employees && req.employees.length > 0 ? req.employees.map(emp => (
                    <span key={emp.employeeId} className="block font-semibold">{emp.employeeName} <span className="text-xs text-gray-500">({emp.employeeId})</span></span>
                  )) : <span className="text-gray-400">-</span>}
                </td>
                <td className="p-3">
                  <span className="block font-semibold">{req.vehicleModel}</span>
                  <span className="block text-xs text-gray-500">{req.vehicleId || req.vehicleModel}</span>
                </td>
                <td className="p-3">{req.problem}</td>
                <td className="p-3">{req.assignment}</td>
                <td className="p-3 text-center flex gap-2 justify-center">
                  <button
                    onClick={() => handleEditRequest({ ...req, idx })}
                    className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteRequest(idx)}
                    className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showAddPopup && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <form
            className="flex flex-col space-y-6 bg-white p-10 rounded-3xl shadow-xl relative w-full max-w-lg"
            onSubmit={handleAddRequest}
          >
            <button
              className="absolute top-3 right-3 text-2xl text-gray-500 hover:text-gray-700"
              onClick={() => setShowAddPopup(false)}
              type="button"
            >
              ❌
            </button>
            <div className="flex flex-col items-center space-y-6 mb-4">
              <h2 className="text-3xl font-bold text-center">Add Service Request</h2>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <div className="flex-1">
                <label className="mb-1 font-medium block">Customer ID <span className="text-red-500">*</span></label>
                <input name="customerId" value={newRequest.customerId} onChange={handleNewRequestChange} required className="p-2 border border-gray-300 rounded-xl w-full" />
              </div>
              <div className="flex-1">
                <label className="mb-1 font-medium block">Customer Name <span className="text-red-500">*</span></label>
                <input name="customerName" value={newRequest.customerName} onChange={handleNewRequestChange} required className="p-2 border border-gray-300 rounded-xl w-full" />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <div className="flex-1">
                <label className="mb-1 font-medium block">Phone <span className="text-red-500">*</span></label>
                <input name="phone" value={newRequest.phone} onChange={handleNewRequestChange} required className="p-2 border border-gray-300 rounded-xl w-full" />
              </div>
              <div className="flex-1">
                <label className="mb-1 font-medium block">Email <span className="text-red-500">*</span></label>
                <input name="email" value={newRequest.email} onChange={handleNewRequestChange} required className="p-2 border border-gray-300 rounded-xl w-full" />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <div className="flex-1">
                <label className="mb-1 font-medium block">Address <span className="text-red-500">*</span></label>
                <input name="address" value={newRequest.address} onChange={handleNewRequestChange} required className="p-2 border border-gray-300 rounded-xl w-full" />
              </div>
              <div className="flex-1">
                <label className="mb-1 font-medium block">Vehicle Model <span className="text-red-500">*</span></label>
                <input name="vehicleModel" value={newRequest.vehicleModel} onChange={handleNewRequestChange} required className="p-2 border border-gray-300 rounded-xl w-full" />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <div className="flex-1">
                <label className="mb-1 font-medium block">Vehicle Type <span className="text-red-500">*</span></label>
                <input name="vehicleType" value={newRequest.vehicleType} onChange={handleNewRequestChange} required className="p-2 border border-gray-300 rounded-xl w-full" />
              </div>
              <div className="flex-1">
                <label className="mb-1 font-medium block">Vehicle Brand <span className="text-red-500">*</span></label>
                <input name="vehicleBrand" value={newRequest.vehicleBrand} onChange={handleNewRequestChange} required className="p-2 border border-gray-300 rounded-xl w-full" />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <div className="flex-1">
                <label className="mb-1 font-medium block">Problem <span className="text-red-500">*</span></label>
                <input name="problem" value={newRequest.problem} onChange={handleNewRequestChange} required className="p-2 border border-gray-300 rounded-xl w-full" />
              </div>
              <div className="flex-1">
                <label className="mb-1 font-medium block">Employees <span className="text-red-500">*</span></label>
                <input
                  list="employee-list"
                  placeholder="Type employee name or ID"
                  onBlur={e => { e.target.value = ''; }}
                  onKeyDown={e => { if (e.key === 'Enter') { handleEmployeeSelect(e); e.preventDefault(); } }}
                  onChange={handleEmployeeSelect}
                  className="p-2 border border-gray-300 rounded-xl w-full"
                />
                <datalist id="employee-list">
                  {employeeList.map(emp => (
                    <option key={emp.employeeId} value={emp.employeeId}>{emp.employeeName}</option>
                  ))}
                  {employeeList.map(emp => (
                    <option key={emp.employeeName} value={emp.employeeName}>{emp.employeeId}</option>
                  ))}
                </datalist>
                <div className="flex flex-wrap gap-2 mt-2">
                  {newRequest.employees.map(emp => (
                    <span key={emp.employeeId} className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full text-xs flex items-center">
                      {emp.employeeName} ({emp.employeeId})
                      <button type="button" className="ml-1 text-red-500" onClick={() => handleRemoveEmployee(emp.employeeId)}>×</button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <div className="flex-1">
                <label className="mb-1 font-medium block">Assignment <span className="text-red-500">*</span></label>
                <input name="assignment" value={newRequest.assignment} onChange={handleNewRequestChange} required className="p-2 border border-gray-300 rounded-xl w-full" />
              </div>
            </div>
            <button
              type="submit"
              className="bg-gray-800 text-white font-bold py-2 rounded-2xl hover:bg-gray-900 transition mt-2"
            >
              Add Service Request
            </button>
          </form>
        </div>
      )}
      {showEditPopup && editRequestData && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <form
            className="flex flex-col space-y-6 bg-white p-10 rounded-3xl shadow-xl relative w-full max-w-lg"
            onSubmit={handleEditPopupSubmit}
          >
            <button
              className="absolute top-3 right-3 text-2xl text-gray-500 hover:text-gray-700"
              onClick={handleEditPopupClose}
              type="button"
            >
              ❌
            </button>
            <div className="flex flex-col items-center space-y-6 mb-4">
              <h2 className="text-3xl font-bold text-center">Edit Service Request</h2>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <div className="flex-1">
                <label className="mb-1 font-medium block">Customer ID <span className="text-red-500">*</span></label>
                <input name="customerId" value={editRequestData.customerId} onChange={handleEditRequestChange} required className="p-2 border border-gray-300 rounded-xl w-full" />
              </div>
              <div className="flex-1">
                <label className="mb-1 font-medium block">Customer Name <span className="text-red-500">*</span></label>
                <input name="customerName" value={editRequestData.customerName} onChange={handleEditRequestChange} required className="p-2 border border-gray-300 rounded-xl w-full" />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <div className="flex-1">
                <label className="mb-1 font-medium block">Phone <span className="text-red-500">*</span></label>
                <input name="phone" value={editRequestData.phone} onChange={handleEditRequestChange} required className="p-2 border border-gray-300 rounded-xl w-full" />
              </div>
              <div className="flex-1">
                <label className="mb-1 font-medium block">Email <span className="text-red-500">*</span></label>
                <input name="email" value={editRequestData.email} onChange={handleEditRequestChange} required className="p-2 border border-gray-300 rounded-xl w-full" />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <div className="flex-1">
                <label className="mb-1 font-medium block">Address <span className="text-red-500">*</span></label>
                <input name="address" value={editRequestData.address} onChange={handleEditRequestChange} required className="p-2 border border-gray-300 rounded-xl w-full" />
              </div>
              <div className="flex-1">
                <label className="mb-1 font-medium block">Vehicle Model <span className="text-red-500">*</span></label>
                <input name="vehicleModel" value={editRequestData.vehicleModel} onChange={handleEditRequestChange} required className="p-2 border border-gray-300 rounded-xl w-full" />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <div className="flex-1">
                <label className="mb-1 font-medium block">Vehicle Type <span className="text-red-500">*</span></label>
                <input name="vehicleType" value={editRequestData.vehicleType} onChange={handleEditRequestChange} required className="p-2 border border-gray-300 rounded-xl w-full" />
              </div>
              <div className="flex-1">
                <label className="mb-1 font-medium block">Vehicle Brand <span className="text-red-500">*</span></label>
                <input name="vehicleBrand" value={editRequestData.vehicleBrand} onChange={handleEditRequestChange} required className="p-2 border border-gray-300 rounded-xl w-full" />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <div className="flex-1">
                <label className="mb-1 font-medium block">Problem <span className="text-red-500">*</span></label>
                <input name="problem" value={editRequestData.problem} onChange={handleEditRequestChange} required className="p-2 border border-gray-300 rounded-xl w-full" />
              </div>
              <div className="flex-1">
                <label className="mb-1 font-medium block">Employees <span className="text-red-500">*</span></label>
                <input
                  list="employee-list-edit"
                  placeholder="Type employee name or ID"
                  onBlur={e => { e.target.value = ''; }}
                  onKeyDown={e => { if (e.key === 'Enter') { handleEditEmployeeSelect(e); e.preventDefault(); } }}
                  onChange={handleEditEmployeeSelect}
                  className="p-2 border border-gray-300 rounded-xl w-full"
                />
                <datalist id="employee-list-edit">
                  {employeeList.map(emp => (
                    <option key={emp.employeeId} value={emp.employeeId}>{emp.employeeName}</option>
                  ))}
                  {employeeList.map(emp => (
                    <option key={emp.employeeName} value={emp.employeeName}>{emp.employeeId}</option>
                  ))}
                </datalist>
                <div className="flex flex-wrap gap-2 mt-2">
                  {editRequestData && editRequestData.employees && editRequestData.employees.map(emp => (
                    <span key={emp.employeeId} className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full text-xs flex items-center">
                      {emp.employeeName} ({emp.employeeId})
                      <button type="button" className="ml-1 text-red-500" onClick={() => handleEditRemoveEmployee(emp.employeeId)}>×</button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <div className="flex-1">
                <label className="mb-1 font-medium block">Assignment <span className="text-red-500">*</span></label>
                <input name="assignment" value={editRequestData.assignment} onChange={handleEditRequestChange} required className="p-2 border border-gray-300 rounded-xl w-full" />
              </div>
            </div>
            <button
              type="submit"
              className="bg-blue-800 text-white font-bold py-2 rounded-2xl hover:bg-blue-900 transition mt-2"
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